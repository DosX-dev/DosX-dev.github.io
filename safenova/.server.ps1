# Tandem Local Dev Server
# Run: right-click -> "Run with PowerShell"  |  or: .\._server.ps1
# Requirements: Windows only, no external dependencies

# UTF-8 output so Cyrillic paths and special chars display correctly in console
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding           = [System.Text.Encoding]::UTF8

# ── Config ────────────────────────────────────────────────────
$PREFERRED_PORT = 7777
$PORT_RANGE_MIN = 3000
$PORT_RANGE_MAX = 9999
$PORT_MAX_TRIES = 20
$root           = $PSScriptRoot.TrimEnd('\') + '\'

# ── MIME types ────────────────────────────────────────────────
$mime = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".mjs"   = "application/javascript; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".svg"   = "image/svg+xml"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".gif"   = "image/gif"
    ".webp"  = "image/webp"
    ".ico"   = "image/x-icon"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"   = "font/ttf"
    ".otf"   = "font/otf"
    ".mp4"   = "video/mp4"
    ".webm"  = "video/webm"
    ".txt"   = "text/plain; charset=utf-8"
    ".xml"   = "application/xml; charset=utf-8"
}

# ── Port availability check ───────────────────────────────────
# Uses TcpListener to probe the port BEFORE passing it to HttpListener.
# This avoids the misleading generic "Access Denied" exception from HttpListener.
function Test-PortFree([int]$p) {
    try {
        $tcp = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $p)
        $tcp.Start()
        $tcp.Stop()
        return $true
    } catch {
        return $false
    }
}

# ── Port selection ────────────────────────────────────────────
# 1. Try preferred port first.
# 2. Fall back to random ports in range until one is free.
$port = $null

if (Test-PortFree $PREFERRED_PORT) {
    $port = $PREFERRED_PORT
} else {
    Write-Host ""
    Write-Host "  Port $PREFERRED_PORT is busy, picking a random one..." -ForegroundColor DarkYellow

    $rng  = [System.Random]::new()
    for ($i = 0; $i -lt $PORT_MAX_TRIES; $i++) {
        $candidate = $rng.Next($PORT_RANGE_MIN, $PORT_RANGE_MAX + 1)
        if (Test-PortFree $candidate) {
            $port = $candidate
            break
        }
    }
}

if ($null -eq $port) {
    Write-Host ""
    Write-Host "  [!] Could not find a free port after $PORT_MAX_TRIES attempts." -ForegroundColor Red
    Write-Host "      Range: $PORT_RANGE_MIN-$PORT_RANGE_MAX" -ForegroundColor Red
    Write-Host ""
    Read-Host "  Press Enter to exit"
    exit 1
}

# ── Start listener ────────────────────────────────────────────
$prefix   = "http://localhost:$port/"
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host ""
    Write-Host "  [!] Failed to bind on port $port." -ForegroundColor Red
    Write-Host "      $_" -ForegroundColor Red
    Write-Host ""
    Read-Host "  Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "  Tandem Sites - Dev Server" -ForegroundColor Cyan
Write-Host "  http://localhost:$port" -ForegroundColor Cyan
Write-Host "  Root: $root" -ForegroundColor Cyan
Write-Host "  Stop: Ctrl+C" -ForegroundColor Cyan
Write-Host ""

Start-Process $prefix

# ── Request loop ──────────────────────────────────────────────
try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()

        # Per-request isolation — one bad request never crashes the loop
        try {
            $req  = $ctx.Request
            $resp = $ctx.Response

            $ts      = Get-Date -Format "HH:mm:ss"
            $method  = $req.HttpMethod.ToUpper()
            $urlPath = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
            $relPath = $urlPath.TrimStart('/')

            # ── Security: block path traversal ──────────────
            # Resolve to absolute path and verify it stays inside $root
            $resolved = [System.IO.Path]::GetFullPath((Join-Path $root $relPath))
            if (-not $resolved.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
                $resp.StatusCode = 403
                $body = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
                $resp.ContentType     = "text/plain; charset=utf-8"
                $resp.ContentLength64 = $body.Length
                $resp.OutputStream.Write($body, 0, $body.Length)
                $resp.OutputStream.Close()
                Write-Host "  [$ts]  403  $urlPath  [traversal blocked]" -ForegroundColor Red
                continue
            }

            $filePath = $resolved

            # ── Directory: redirect to trailing slash ────────
            if ((Test-Path $filePath -PathType Container) -and -not $urlPath.EndsWith('/')) {
                $qs       = $req.Url.Query   # сохраняем query string (?2, ?project-id=2, ...)
                $location = $urlPath + '/' + $qs
                $resp.StatusCode = 301
                $resp.Headers.Add('Location', $location)
                $resp.ContentLength64 = 0
                $resp.OutputStream.Close()
                Write-Host "  [$ts]  301  $urlPath -> $location" -ForegroundColor DarkYellow
                continue
            }

            # ── Directory: serve index.html or index.htm ────
            if (Test-Path $filePath -PathType Container) {
                $indexFile = $null
                foreach ($filename in @("index.html", "index.htm")) {
                    $candidate = Join-Path $filePath $filename
                    if (Test-Path $candidate -PathType Leaf) {
                        $indexFile = $candidate
                        break
                    }
                }
                if ($indexFile) {
                    $filePath = $indexFile
                } else {
                    # Directory exists but no index file found — treat as 404
                    $filePath = $null
                }
            }

            # ── Serve file (GET / HEAD) ──────────────────────
            if (Test-Path $filePath -PathType Leaf) {
                $ext         = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
                $bytes       = [System.IO.File]::ReadAllBytes($filePath)

                $resp.StatusCode      = 200
                $resp.ContentType     = $contentType
                $resp.ContentLength64 = $bytes.Length
                # Cache-Control: no-cache — browser always revalidates; avoids stale files during dev
                $resp.Headers.Add('Cache-Control', 'no-cache')

                # HEAD — headers only, no body
                if ($method -ne 'HEAD') {
                    $resp.OutputStream.Write($bytes, 0, $bytes.Length)
                }

                $label = if ($method -eq 'HEAD') { "HEAD" } else { " GET" }
                Write-Host "  [$ts]  200  $label  $urlPath" -ForegroundColor Green

            # ── 404 ─────────────────────────────────────────
            } else {
                $notFoundPage = $null
                foreach ($filename in @("404.html", "404.htm")) {
                    $candidate = Join-Path $root $filename
                    if (Test-Path $candidate -PathType Leaf) {
                        $notFoundPage = $candidate
                        break
                    }
                }

                if ($notFoundPage) {
                    $body = [System.IO.File]::ReadAllBytes($notFoundPage)
                    $resp.ContentType = "text/html; charset=utf-8"
                } else {
                    $body = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found: $urlPath")
                    $resp.ContentType = "text/plain; charset=utf-8"
                }

                $resp.StatusCode      = 404
                $resp.ContentLength64 = $body.Length
                if ($method -ne 'HEAD') {
                    $resp.OutputStream.Write($body, 0, $body.Length)
                }

                Write-Host "  [$ts]  404  $urlPath" -ForegroundColor DarkGray
            }

        } catch {
            # Swallow per-request errors so the server keeps running
            Write-Host "  [!] Request error: $_" -ForegroundColor Red
        } finally {
            # Always close — prevents hanging connections
            try { $ctx.Response.OutputStream.Close() } catch {}
        }
    }
} finally {
    $listener.Stop()
    Write-Host ""
    Write-Host "  Server stopped." -ForegroundColor Yellow
    Write-Host ""
}
