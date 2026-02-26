/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/no-toolbox-viewer/index.loader.js
   — Показ ошибки, подстановка iframe, загрузка БД
   ──────────────────────────────────────────────── */

/** Показать экран ошибки и убрать iframe */
function showError() {
    document.getElementById('error-screen').classList.add('visible');
    document.getElementById('project-frame')?.remove();
}

/** Подставить src в iframe */
function loadFrame(src) {
    const frame = document.getElementById('project-frame');
    if (!frame) return;
    frame.src = src;
    frame.addEventListener('error', showError, { once: true });
}

/** Загрузить проект по числовому id — требует index.db.js */
function loadById(id) {
    if (isNaN(id) || id <= 0) { showError(); return; }

    const script = document.createElement('script');
    script.src = '../index.db.js';
    script.onload = () => {
        if (typeof TANDEM_SITES === 'undefined') { showError(); return; }
        const site = TANDEM_SITES.find(s => s.id === id) ?? null;
        if (!site) { showError(); return; }
        loadFrame('../' + site.path);
    };
    script.onerror = showError;
    document.head.appendChild(script);
}
