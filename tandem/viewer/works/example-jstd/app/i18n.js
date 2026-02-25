/* ══════════════════════════════════════════════════
   JSTD.AI  —  i18n  (RU / EN)
   Works on: index.html · download/ · 404.html
══════════════════════════════════════════════════ */
(function() {

    /* ─────────────────────────────────────────────
       TRANSLATION DICTIONARIES
       T.ru is NOT stored here — it is built automatically
       from the original DOM text at init time (see snapshotRu).
    ───────────────────────────────────────────── */
    const T = {

        /* ── ENGLISH ──────────────────────────────── */
        en: {
            __title_index: 'JSTD.AI — Neural JavaScript Threat Detection',
            __title_download: 'Download — JSTD.AI',
            __title_404: '404 — JSTD.AI',

            /* NAV */
            'nav.how': 'How it works',
            'nav.algorithms': 'Algorithms',
            'nav.docs': 'Documentation',
            'nav.testimonials': 'Testimonials',
            'nav.try': 'Try it',
            'nav.home': 'Home',

            /* HERO */
            'hero.badge': 'Neural Analysis Engine v3.1 — Active',
            'hero.headline_html': 'Code vulnerabilities detected before<br />they <span class="cracked-word" data-text="explode">explode</span>',
            'hero.sub': 'Proprietary neural network model <strong>50→30→1</strong> analyzes any JavaScript for obfuscation, malicious constructs, and embedded malware in milliseconds. Runs on low-end hardware. No cloud required.',
            'hero.cta_primary': 'Start analysis',
            'hero.cta_secondary': 'How it works',
            'hero.stat1': 'Detection accuracy',
            'hero.stat2': 'model parameters',
            'hero.stat3': 'code features',
            'hero.stat4': 'no GPU',

            /* MARQUEE */
            'mq.obfusc': 'Obfuscation',
            'mq.cookie': 'Cookie stealing',
            'mq.eval': 'eval() injections',
            'mq.keylog': 'Keyloggers',
            'mq.miners': 'Hidden miners',
            'mq.xss': 'XSS vectors',

            /* HOW IT WORKS */
            'hiw.label': 'How it works',
            'hiw.title_html': 'The neural network sees<br />what humans miss',
            'hiw.desc': 'JSTD.AI uses a three-stage analysis pipeline: feature extraction → neural network → heuristic rules. Each stage amplifies the next — the final score requires consensus from all three.',
            'hiw.s1_h3': 'File upload',
            'hiw.s1_p': 'The JS file is read as plain text in full. No cloud transfer — everything stays local. Supports minified, obfuscated, and multi-line code of any size.',
            'hiw.s2_h3': '50 feature extraction',
            'hiw.s2_p': 'Normalized metrics: frequency of dangerous constructs, Shannon entropy, obfuscation level, Base64 density, comment ratio, and much more.',
            'hiw.s3_h3': 'Neural network 50→30→1',
            'hiw.s3_p': '1561 trained parameters. MLP architecture with ReLU activation. Trained on 210 labeled examples. Accuracy — 99.7%. Runs without GPU in &lt;1 ms.',
            'hiw.s4_h3': 'Heuristic rules',
            'hiw.s4_p': '42 threat patterns including combined scenarios. Detects cookie-stealing signatures, keyloggers, iframe injection, and obfuscation chains.',

            /* ALGORITHMS */
            'algo.label': 'Algorithms',
            'algo.title_html': 'Architecture that leaves<br />no chance',
            'algo.nn_label': 'Neural network topology',
            'algo.nn_p': 'Multi-layer perceptron with forward error propagation. Adaptive learning rate decreases from 0.015 to 0.008 over 300 epochs.',
            'algo.nn_in_html': 'Input<br />layer',
            'algo.nn_hid_html': 'Hidden<br />layer',
            'algo.nn_out_html': 'Output<br />layer',
            'algo.nn_in_sub': '50 neurons',
            'algo.nn_hid_sub': '30 neurons',
            'algo.nn_out_sub': '1 neuron',
            'algo.p_in_lbl': 'Input → Hidden',
            'algo.p_in_val': '1 500 weights',
            'algo.p_hid_lbl': 'Hidden → Output',
            'algo.p_hid_val': '30 weights',
            'algo.p_bias_lbl': 'Biases',
            'algo.p_bias_val': '31 parameters',
            'algo.p_tot_lbl': 'TOTAL',
            'algo.p_tot_val': '1 561 parameters',
            'algo.p_weights': 'weights',
            'algo.p_params': 'parameters',

            'algo.feat_label': 'Feature extraction',
            'algo.feat_h3': '50 code metrics',
            'algo.feat_p': 'Each feature is normalized relative to file length for accurate comparison of files of different sizes.',
            'algo.feat_entropy': 'Entropy',
            'algo.feat_obfusc': 'Obfusc.',

            'algo.ent_label': 'Shannon entropy',
            'algo.ent_h3': 'Chaos is a signal',
            'algo.ent_p': 'Character randomness is a direct indicator of obfuscation. Legitimate code is predictable. Malware is not.',
            'algo.ent_v1': 'H=0.0',
            'algo.ent_v2': 'H=3.3',
            'algo.ent_v3': 'H=4.1',
            'algo.ent_v4': 'H=5.8',
            'algo.ent_v5': 'H=7.9',

            'algo.thr_label': 'Threat classification',
            'algo.thr_h3': '5 risk levels',
            'algo.thr_p': 'The final score is a weighted combination of the neural network score and heuristic triggers. No single component makes the decision alone.',
            'algo.lv_safe': 'Legitimate code. No threats detected.',
            'algo.lv_low': 'Minor suspicious constructs.',
            'algo.lv_med': 'Requires review. Possible violations.',
            'algo.lv_high': 'High probability of malicious activity.',
            'algo.lv_crit': 'DO NOT RUN. Multiple triggers fired.',

            'algo.sc_label': 'Final score',
            'algo.sc_h3': 'Weighted formula',
            'algo.sc_p': 'The final threat score is not simply the neural network output. It is a consensus of three independent components with dynamic weights.',
            'algo.sc_nn': 'Neural net',
            'algo.sc_heur': 'Heuristics',
            'algo.sc_ent': 'Entropy',
            'algo.sc_tot': 'Total',
            'algo.sc_note': 'Weights are recalculated automatically when no heuristic triggers are present',

            'algo.ob_label': 'Obfuscation detection',
            'algo.ob_h3': 'Patterns that hide',
            'algo.ob_hex_t': 'Hex escaping',
            'algo.ob_hex_d': 'Strings encoded with hex escape sequences',
            'algo.ob_arr_d': 'Strings split into indexed arrays',
            'algo.ob_b64_t': 'Base64 chains',
            'algo.ob_b64_d': 'Multi-level decoding before execution',
            'algo.ob_fn_d': 'Dynamic creation and execution of functions from strings',
            'algo.ob_pp_d': 'Modification of base prototype chains',
            'algo.ob_sm_d': 'Strings in timers and event listeners used as code',

            /* SHOWCASE */
            'show.label': 'Real threats',
            'show.title_html': 'Code that <span class="highlight-slash">kills</span><br /> security in 3 lines',
            'show.i1': 'Session theft',
            'show.i2': 'Full obfuscation',
            'show.i3': 'Hidden iframe',

            /* TESTIMONIALS */
            'test.label': 'Testimonials',
            'test.h2': 'Trusted by professionals',
            'test.desc': 'Companies use JSTD.AI as the first line of defense before passing code between departments and contractors.',
            'test.prev': 'Previous',
            'test.next': 'Next',
            'test.t1_text': '"We run a marketplace and regularly receive JS widgets from third-party vendors. Before JSTD.AI, every file had to be read manually — or trusted blindly. After one incident with an embedded keylogger in a partner\'s widget, we made scanning mandatory. JSTD.AI does in 2 seconds what used to take an hour of review."',
            'test.t1_av': 'AK',
            'test.t1_nm': 'Andrew Klimov',
            'test.t1_rl': 'CTO, RetailEdge Platform',
            'test.t1_tg': 'E-commerce / SaaS',
            'test.t2_text': '"Our security team uses JSTD.AI to pre-screen source code from freelancers before it reaches the architect review. In the first month the system flagged 4 files with real threats — one turned out to be a full backdoor with a WebSocket channel. We would have missed it without this tool."',
            'test.t2_av': 'MV',
            'test.t2_nm': 'Maria Voronova',
            'test.t2_rl': 'Head of Security, FinStream Bank',
            'test.t2_tg': 'Fintech / Banking',
            'test.t3_text': '"We\'re an outsourcing studio — we receive finished code from 12+ contractors monthly. JSTD.AI is integrated into our Slack bot: a dev drops in a file, the bot responds in 3 seconds with the threat level. We caught prototype pollution in npm scripts twice — the contractor had \'accidentally\' bundled it with a production dependency."',
            'test.t3_av': 'DS',
            'test.t3_nm': 'Dmitry Savelyev',
            'test.t3_rl': 'Tech Lead, CodeBridge Agency',
            'test.t3_tg': 'Outsourcing / Development',
            'test.t4_text': '"We run JSTD.AI as a CI/CD step before deploying to the staging server. Integration took 20 minutes. Now if a PR contains anything with eval() + Base64 — the pipeline fails automatically and the PR won\'t merge. Developers have become much more careful with dependencies."',
            'test.t4_av': 'EP',
            'test.t4_nm': 'Elena Petukhova',
            'test.t4_rl': 'DevOps Engineer, LogiCore Systems',
            'test.t4_tg': 'DevOps / CI-CD',
            'test.t5_text': '"A government contract requires certification of delivered software. JSTD.AI generates an HTML report detailing every detected pattern — this has become part of our document package for the client. No longer need a separate pentest for a basic audit of JS components."',
            'test.t5_av': 'IR',
            'test.t5_nm': 'Igor Ryazantsev',
            'test.t5_rl': 'Information Security Auditor, GovTech Solutions',
            'test.t5_tg': 'Gov sector / Security audit',
            'test.t6_text': '"We switched to JSTD.AI after npm audit missed an obfuscated stealer in a transitive dependency. JSTD caught it in a second — eval inside an encoded string that standard linters considered valid code. Since then it\'s been a mandatory step before every release."',
            'test.t6_av': 'NB',
            'test.t6_nm': 'Nikita Belousov',
            'test.t6_rl': 'Senior Frontend Engineer, CloudStack Labs',
            'test.t6_tg': 'Cloud services / Frontend',

            /* DOCS */
            'docs.label': 'Documentation',
            'docs.h2_html': 'Everything you need<br />to get started',
            'docs.desc': 'JSTD.AI requires no configuration or technical expertise. Upload a file — get a result. Below is the full interface reference and data interpretation guide.',
            'docs.qs1_t': 'Load JS files',
            'docs.qs1_p': 'Click <code>Load file(s)…</code> and select one or more <code>.js</code> files. Minified, obfuscated, and multi-line code of any size is supported.',
            'docs.qs2_t': 'Wait for analysis',
            'docs.qs2_p': 'The neural engine processes each file in <code>&lt;&thinsp;1&thinsp;ms</code>. Results appear instantly in the <em>Analysis results</em> panel. Multiple files are analyzed in parallel.',
            'docs.qs3_t': 'Review the report',
            'docs.qs3_p': 'Click a row in the table to open the <em>Threat Details</em> panel with three tabs. Export a full HTML report using the <code>Save as HTML report</code> button if needed.',
            'docs.c1_h3': 'Code viewer',
            'docs.c1_p': 'Displays the source code of the selected file with syntax highlighting. Comments, strings, keywords, and dangerous constructs are color-coded. The file can be scrolled — no size limit.',
            'docs.c1_hint': 'Select a file in the table on the right — the code updates automatically',
            'docs.c2_h3': 'Results table',
            'docs.c2_p': 'Each row represents one file. Columns: <strong>File Name</strong>, <strong>Threat Level</strong> (color label), <strong>Score</strong> (final score in percent). Rows are clickable — they open details in the bottom panel.',
            'docs.c3_lbl': 'Tab — Threat details',
            'docs.c3_p': 'Final verdict for the file. Shows the threat level, three independent scores, and a text summary. Displays the number of violations found and the final recommendation.',
            'docs.c4_p': 'List of triggered heuristic rules. Each rule contains a name, severity in percent, and a brief attack description. Rules are ranked by descending severity.',
            'docs.c5_p': 'Raw metrics extracted from the code. A table of 50 features: Feature (name), Count (absolute value), Description (what it means). Used for manual audit and understanding the neural network\'s decision.',
            'docs.c6_lbl': 'Side panel',
            'docs.c6_p': 'Live engine status monitoring. Updated every 500&thinsp;ms. All data is local — nothing is transmitted anywhere.',
            'docs.faq_title': 'Frequently asked questions',
            'docs.faq1_q': 'Is it safe to pass my code to the program?',
            'docs.faq1_a': 'JSTD.AI works completely offline. Code never leaves your computer under any circumstances — no cloud APIs, telemetry, or outbound connections. All analysis is performed locally in process memory.',
            'docs.faq2_q': 'Why does safe code with <code>fetch()</code> get a non-zero score?',
            'docs.faq2_a': 'The neural network assesses threat probability statistically. The presence of <code>fetch()</code>, <code>XMLHttpRequest</code>, or <code>localStorage</code> on its own is not a threat — but it raises the base score. The final classification considers a combination of features: a single <code>fetch()</code> without a dangerous context will yield a SAFE or LOW level.',
            'docs.faq3_q': 'What does "Obfuscation" mean if the code was written by hand?',
            'docs.faq3_a': 'The "Obfuscation level" feature is not a flag indicating a run through an obfuscator — it is a metric of code characteristics: long strings without spaces, high entropy, hex literals, minimal comments. Minified bundles (webpack, esbuild) will have a non-zero level — this is normal and is factored into the final score calculation.',
            'docs.faq4_q': 'What does the HTML report contain?',
            'docs.faq4_a': 'The HTML report includes: a header with date and analyst name, a summary table for all files, a detailed breakdown for each file (Summary + Triggered Rules + Detected Features), source code, and an analysis timestamp. The file is self-contained — no internet required to view it.',
            'docs.faq5_q': 'Can minified files be analyzed?',
            'docs.faq5_a': 'Yes. The neural network was trained on minified code examples. Features are extracted independently of formatting. Minification itself raises the obfuscation feature, but does not affect the final classification — without dangerous patterns the file will receive SAFE or LOW.',

            /* CTA */
            'cta.label': 'Security starts here',
            'cta.title_html': 'Every JS file is<br /> a potential<br /> <span class="cracked-word cracked-word--lg" data-text="hole">hole</span>',
            'cta.p': 'JSTD.AI runs completely offline on Windows. No internet required. No GPU needed. Installation takes a minute — your first analysis will be done within three...',
            'cta.btn_primary': 'Download JSTD.AI',
            'cta.btn_ghost': 'Documentation',
            'cta.spec3': '<1 MB executable file',
            'cta.spec4': 'No internet required',

            /* FOOTER */
            'footer.brand_p': 'Proprietary neural threat detection system<br />for JavaScript code.',
            'footer.copy_html': '© 2026 JSTD.AI. All rights reserved.<br />Proprietary development. Neural model is patented.',
            'footer.copy_short': '© 2026 JSTD.AI. All rights reserved.',
            'footer.col1_title': 'Product',
            'footer.col1_1': 'Download',
            'footer.col1_2': 'Documentation',
            'footer.col1_4': 'License',
            'footer.col2_title': 'Company',
            'footer.col2_1': 'About',
            'footer.col2_2': 'Blog',
            'footer.col2_3': 'Press',
            'footer.col2_4': 'Contact',
            'footer.col3_title': 'Security',
            'footer.col3_1': 'Responsible disclosure',
            'footer.col3_2': 'Privacy policy',
            'footer.col3_4': 'CVE database',

            /* DOWNLOAD PAGE */
            'dl.label': 'INITIALIZING DOWNLOAD',
            'dl.title_html': 'Thanks for&nbsp;downloading<em>!</em>',
            'dl.sub': 'The file <strong>jstd-ai.zip</strong> will automatically download to your computer in a few seconds. If nothing happens — use the direct link below.',
            'dl.cd_before': 'Download starts in',
            'dl.cd_after': 'sec…',
            'dl.tl1': '  ↳ verifying signature…',
            'dl.tl2': '  ✓ signature valid · SHA-256 match',
            'dl.tl3': '  ↳ transferring file to browser…',
            'dl.tl4': '  ✓ download started',
            'dl.manual_q': 'Download not started?',
            'dl.manual_lnk': 'Click here',
            'dl.spec3': '<1 MB executable file',
            'dl.spec4': 'No internet',

            /* 404 PAGE */
            'e404.hint': 'click 4 times',
            'e404.label': 'RESOURCE NOT FOUND — STATUS 404',
            'e404.title_html': 'Neural network couldn\'t find<br />the requested resource',
            'e404.desc_html': 'Our scanner processed the request in <code>&lt;&thinsp;1ms</code>, but the specified URL is not in the index. The page may have been moved or never existed.',
            'e404.btn_home': 'Home',
            'e404.btn_docs': 'Documentation',
            'e404.term_ok': '  ✓ threat_score: 0.00 (clean)',
            'e404.term_err1': '  ✗ HTTP 404 — resource not found',
            'e404.term_err2': '  ✗ no alternatives found',
            'e404.ee_title_html': 'Oh, what are<br />we <em>looking for?</em>',
            'e404.ee_r1_lbl': 'Threat type',
            'e404.ee_r1_val': 'Unbridled curiosity',
            'e404.ee_r2_lbl': 'Attack vector',
            'e404.ee_r3_lbl': 'Risk level',
            'e404.ee_foot': 'Recommendation: ',
            'e404.ee_foot_sp': 'go back to the home page and don\'t touch the 404.',
            'e404.ee_close': 'Close',
        }
    };

    /* ─────────────────────────────────────────────
       SNAPSHOT RUSSIAN FROM DOM
       Reads every translatable element's current
       text/html (the HTML default is Russian) and
       stores it as T.ru — called once before the
       first applyLang() so RU restores original DOM.
    ───────────────────────────────────────────── */
    function snapshotRu() {
        var ru = {};
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            ru[el.getAttribute('data-i18n')] = el.textContent;
        });
        document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
            ru[el.getAttribute('data-i18n-html')] = el.innerHTML;
        });
        document.querySelectorAll('[data-i18n-label]').forEach(function(el) {
            var lbl = el.getAttribute('aria-label');
            if (lbl) ru[el.getAttribute('data-i18n-label')] = lbl;
        });
        var path = window.location.pathname;
        var titleKey = path.indexOf('/download') !== -1 ? '__title_download' :
            (path.indexOf('/404') !== -1 || document.querySelector('.page-404')) ? '__title_404' :
            '__title_index';
        ru[titleKey] = document.title;
        T.ru = ru;
    }

    /* ─────────────────────────────────────────────
       DETECT LANGUAGE
    ───────────────────────────────────────────── */
    function detectLang() {
        const saved = localStorage.getItem('jstd_lang');
        if (saved === 'ru' || saved === 'en') return saved;
        const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
        return nav.startsWith('ru') ? 'ru' : 'en';
    }

    /* ─────────────────────────────────────────────
       APPLY LANGUAGE
    ───────────────────────────────────────────── */
    function applyLang(lang) {
        const dict = T[lang];
        if (!dict) return;

        /* textContent replacements */
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            var key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) el.textContent = dict[key];
        });

        /* innerHTML replacements (for nodes containing HTML tags) */
        document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
            var key = el.getAttribute('data-i18n-html');
            if (dict[key] !== undefined) el.innerHTML = dict[key];
        });

        /* re-inject .crack-line spans lost during innerHTML swap */
        document.querySelectorAll('.cracked-word').forEach(function(el) {
            if (!el.querySelector('.crack-line')) {
                var line = document.createElement('span');
                line.className = 'crack-line';
                el.appendChild(line);
            }
        });

        /* aria-label replacements */
        document.querySelectorAll('[data-i18n-label]').forEach(function(el) {
            var key = el.getAttribute('data-i18n-label');
            if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
        });

        /* page title */
        var titleKey = null;
        var path = window.location.pathname;
        if (path.indexOf('/download') !== -1) titleKey = '__title_download';
        else if (path.indexOf('/404') !== -1 || document.querySelector('.page-404')) titleKey = '__title_404';
        else titleKey = '__title_index';
        if (titleKey && dict[titleKey]) document.title = dict[titleKey];

        /* html[lang] attribute */
        document.documentElement.lang = lang;

        /* switcher active state */
        document.querySelectorAll('[data-lang-switch]').forEach(function(btn) {
            btn.classList.toggle('lang-btn--active', btn.getAttribute('data-lang-switch') === lang);
        });

        /* persist */
        localStorage.setItem('jstd_lang', lang);
        window.__jstd_lang = lang;

        /* reveal page (FOUC prevention — set by inline head script) */
        document.documentElement.classList.remove('lang-loading');
    }

    /* ─────────────────────────────────────────────
       INIT
    ───────────────────────────────────────────── */
    function init() {
        snapshotRu();

        /* wire switcher buttons */
        document.querySelectorAll('[data-lang-switch]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                applyLang(btn.getAttribute('data-lang-switch'));
            });
        });

        applyLang(detectLang());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* public API */
    window.setLang = applyLang;

})();