/**
 * Axiom Virtual Container
 * Manages virtual file system and storage
 */

class VMContainer {
    constructor() {
        this.fileSystem = new Map();
        this.currentDirectory = '/root';
        this.rootDirectory = '/';
        this.storageKey = 'axiom_fs';
        this.compression = null;
    }

    async initialize() {
        // Initialize compression module
        if (typeof FSCompression !== 'undefined') {
            this.compression = new FSCompression();
        }
        
        // Load file system from localStorage
        this.loadFromStorage();
        
        // Initialize default directory structure if empty
        if (this.fileSystem.size === 0) {
            this.initializeDefaultFS();
        }
        
        return true;
    }

    initializeDefaultFS() {
        // Create default directory structure
        const directories = [
            '/',
            '/root',
            '/home',
            '/bin',
            '/etc',
            '/var',
            '/tmp',
            '/usr',
            '/usr/bin',
            '/usr/local',
            '/dev'
        ];

        for (const dir of directories) {
            this.createDirectory(dir, true);
        }

        // Create some default files
        this.writeFile('/etc/hostname', 'axiom');
        this.writeFile('/etc/os-release', 'Axiom OS v1.0.0\nDosX Processor A10\n');
        this.writeFile('/root/.profile', '# Axiom shell profile\nPS1="root@axiom:~$ "\n');
        
        this.saveToStorage();
    }

    createDirectory(path, skipSave = false, depth = 0) {
        // Prevent infinite recursion or extremely deep paths
        if (depth > 100) {
            throw new Error('Directory depth limit exceeded (max 100 levels)');
        }
        
        const normalizedPath = this.normalizePath(path);
        
        if (this.fileSystem.has(normalizedPath)) {
            const entry = this.fileSystem.get(normalizedPath);
            if (entry.type === 'directory') {
                return true;
            }
            throw new Error(`Path exists and is not a directory: ${path}`);
        }

        // Check directory limit
        if (this.fileSystem.size > 10000) {
            throw new Error('Maximum number of files/directories reached (10000)');
        }

        // Create parent directories if needed
        const parentPath = this.getParentPath(normalizedPath);
        if (parentPath !== normalizedPath && parentPath !== '/') {
            this.createDirectory(parentPath, true, depth + 1);
        }

        this.fileSystem.set(normalizedPath, {
            type: 'directory',
            created: Date.now(),
            modified: Date.now(),
            permissions: 'drwxr-xr-x',
            owner: 'root',
            group: 'root',
            children: []
        });

        if (!skipSave) {
            this.saveToStorage();
        }
        
        return true;
    }

    removeDirectory(path) {
        const normalizedPath = this.normalizePath(path);
        
        if (!this.fileSystem.has(normalizedPath)) {
            throw new Error(`Directory not found: ${path}`);
        }

        const entry = this.fileSystem.get(normalizedPath);
        if (entry.type !== 'directory') {
            throw new Error(`Not a directory: ${path}`);
        }

        // Check if directory is empty
        const children = this.listDirectory(normalizedPath);
        if (children.length > 0) {
            throw new Error(`Directory not empty: ${path}`);
        }

        this.fileSystem.delete(normalizedPath);
        this.saveToStorage();
        return true;
    }

    writeFile(path, content, append = false) {
        const normalizedPath = this.normalizePath(path);
        const parentPath = this.getParentPath(normalizedPath);

        // Ensure parent directory exists
        if (!this.fileSystem.has(parentPath)) {
            this.createDirectory(parentPath, true);
        }

        let fileContent = String(content || '');
        if (append && this.fileSystem.has(normalizedPath)) {
            const existing = this.fileSystem.get(normalizedPath);
            if (existing.type === 'file') {
                fileContent = existing.content + fileContent;
            }
        }

        // Check file size limit (1MB per file)
        const maxFileSize = 1024 * 1024;
        if (fileContent.length > maxFileSize) {
            throw new Error(`File size exceeds limit (${maxFileSize} bytes)`);
        }

        // Check storage quota before writing
        const stats = this.getStorageStats();
        const estimatedSize = new Blob([JSON.stringify({
            fileSystem: Array.from(this.fileSystem.entries()),
            currentDirectory: this.currentDirectory
        })]).size;
        
        if (estimatedSize > stats.total * 0.9) {
            throw new Error('Storage quota exceeded (90% full)');
        }

        this.fileSystem.set(normalizedPath, {
            type: 'file',
            content: fileContent,
            created: this.fileSystem.has(normalizedPath) 
                ? this.fileSystem.get(normalizedPath).created 
                : Date.now(),
            modified: Date.now(),
            size: fileContent.length,
            permissions: '-rw-r--r--',
            owner: 'root',
            group: 'root'
        });

        this.saveToStorage();
        return true;
    }

    readFile(path) {
        const normalizedPath = this.normalizePath(path);
        
        if (!this.fileSystem.has(normalizedPath)) {
            throw new Error(`File not found: ${path}`);
        }

        const entry = this.fileSystem.get(normalizedPath);
        if (entry.type !== 'file') {
            throw new Error(`Not a file: ${path}`);
        }

        return entry.content;
    }

    deleteFile(path) {
        const normalizedPath = this.normalizePath(path);
        
        if (!this.fileSystem.has(normalizedPath)) {
            throw new Error(`File not found: ${path}`);
        }

        const entry = this.fileSystem.get(normalizedPath);
        if (entry.type !== 'file') {
            throw new Error(`Not a file: ${path}`);
        }

        this.fileSystem.delete(normalizedPath);
        this.saveToStorage();
        return true;
    }

    exists(path) {
        const normalizedPath = this.normalizePath(path);
        return this.fileSystem.has(normalizedPath);
    }

    getFile(path) {
        const normalizedPath = this.normalizePath(path);
        return this.fileSystem.get(normalizedPath);
    }

    listDirectory(path) {
        const normalizedPath = this.normalizePath(path);
        
        if (!this.fileSystem.has(normalizedPath)) {
            throw new Error(`Directory not found: ${path}`);
        }

        const entry = this.fileSystem.get(normalizedPath);
        if (entry.type !== 'directory') {
            throw new Error(`Not a directory: ${path}`);
        }

        const children = [];
        const pathPrefix = normalizedPath === '/' ? '/' : normalizedPath + '/';
        
        for (const [entryPath, entryData] of this.fileSystem.entries()) {
            if (entryPath.startsWith(pathPrefix) && entryPath !== normalizedPath) {
                const relativePath = entryPath.substring(pathPrefix.length);
                if (!relativePath.includes('/')) {
                    children.push({
                        name: relativePath,
                        path: entryPath,
                        type: entryData.type,
                        size: entryData.size || 0,
                        modified: entryData.modified,
                        permissions: entryData.permissions,
                        owner: entryData.owner
                    });
                }
            }
        }

        return children;
    }

    changeDirectory(path) {
        const normalizedPath = this.normalizePath(path);
        
        if (!this.fileSystem.has(normalizedPath)) {
            throw new Error(`Directory not found: ${path}`);
        }

        const entry = this.fileSystem.get(normalizedPath);
        if (entry.type !== 'directory') {
            throw new Error(`Not a directory: ${path}`);
        }

        this.currentDirectory = normalizedPath;
        
        // Update environment
        if (window.axiomEnv) {
            window.axiomEnv.updatePWD(normalizedPath);
        }
        
        return normalizedPath;
    }

    getCurrentDirectory() {
        return this.currentDirectory;
    }

    normalizePath(path) {
        // Handle relative paths
        if (!path.startsWith('/')) {
            path = this.currentDirectory + '/' + path;
        }

        // Handle . and ..
        const parts = path.split('/').filter(p => p.length > 0);
        const normalized = [];

        for (const part of parts) {
            if (part === '.') {
                continue;
            } else if (part === '..') {
                if (normalized.length > 0) {
                    normalized.pop();
                }
            } else {
                normalized.push(part);
            }
        }

        return normalized.length === 0 ? '/' : '/' + normalized.join('/');
    }

    getParentPath(path) {
        const normalized = this.normalizePath(path);
        if (normalized === '/') {
            return '/';
        }
        
        const lastSlash = normalized.lastIndexOf('/');
        return lastSlash === 0 ? '/' : normalized.substring(0, lastSlash);
    }

    getBaseName(path) {
        const normalized = this.normalizePath(path);
        if (normalized === '/') {
            return '/';
        }
        
        const lastSlash = normalized.lastIndexOf('/');
        return normalized.substring(lastSlash + 1);
    }

    copyFile(sourcePath, destPath) {
        const content = this.readFile(sourcePath);
        this.writeFile(destPath, content);
        return true;
    }

    moveFile(sourcePath, destPath) {
        this.copyFile(sourcePath, destPath);
        this.deleteFile(sourcePath);
        return true;
    }

    saveToStorage() {
        try {
            const data = {
                fileSystem: Array.from(this.fileSystem.entries()),
                currentDirectory: this.currentDirectory
            };
            
            let serialized = JSON.stringify(data);
            
            // Apply compression if available
            if (this.compression) {
                serialized = this.compression.compress(serialized);
            }
            
            // Check if data exceeds quota
            if (serialized.length > 4.5 * 1024 * 1024) {
                throw new Error('File system too large to save (max 4.5MB)');
            }
            
            localStorage.setItem(this.storageKey, serialized);
        } catch (e) {
            console.error('Failed to save file system:', e);
            if (e.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded. Please delete some files.');
            }
            throw e;
        }
    }

    loadFromStorage() {
        try {
            let stored = localStorage.getItem(this.storageKey);
            if (stored) {
                // Try to parse as JSON first (uncompressed data)
                let data;
                try {
                    data = JSON.parse(stored);
                } catch (jsonError) {
                    // If it starts with our marker, decompress
                    if (stored.startsWith('__COMPRESSED__') && this.compression) {
                        const decompressed = this.compression.decompress(stored);
                        data = JSON.parse(decompressed);
                    } else {
                        // Corrupted or old format - clear and start fresh
                        console.warn('Corrupted file system data, resetting to default');
                        localStorage.removeItem(this.storageKey);
                        return;
                    }
                }
                
                this.fileSystem = new Map(data.fileSystem);
                this.currentDirectory = data.currentDirectory || '/root';
            }
        } catch (e) {
            console.error('Failed to load file system:', e);
            // Reset to default if corrupted
            localStorage.removeItem(this.storageKey);
            this.fileSystem.clear();
        }
    }

    clearStorage() {
        this.fileSystem.clear();
        this.currentDirectory = '/root';
        localStorage.removeItem(this.storageKey);
        this.initializeDefaultFS();
    }

    getStorageStats() {
        const stored = localStorage.getItem(this.storageKey) || '';
        const used = new Blob([stored]).size;
        const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
        
        const stats = {
            used,
            total,
            free: total - used,
            usedPercent: (used / total * 100).toFixed(2),
            compressed: !!this.compression
        };
        
        // Add compression stats if available
        if (this.compression) {
            const compressionStats = this.compression.getStats();
            stats.compressionRatio = compressionStats.lastCompressionRatio;
            stats.algorithm = compressionStats.algorithm;
        }
        
        return stats;
    }
}

// Export for global access
window.VMContainer = VMContainer;
