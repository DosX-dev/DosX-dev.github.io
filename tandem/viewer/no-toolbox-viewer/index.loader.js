/* Файл устарел — перенесён в app/code/no-toolbox-viewer/ (index.state.js, index.loader.js, index.init.js) */

const params = new URLSearchParams(location.search);
const renderMode = params.get('render-mode');
const projectId = params.get('project-id');
const projectName = (params.get('project-name') ?? '').trim();

/* ── Если режим не fullscreen — редиректим на главный вьювер ── */
if (renderMode !== 'fullscreen') {
    const redir = new URLSearchParams();
    if (projectId !== null) redir.set('project-id', projectId);
    location.replace('../?' + redir.toString());
}

/* ── Показать экран ошибки и убрать iframe ── */
function showError() {
    document.getElementById('error-screen').classList.add('visible');
    document.getElementById('project-frame')?.remove();
}

/* ── Подставить src в iframe ── */
function loadFrame(src) {
    const frame = document.getElementById('project-frame');
    if (!frame) return;
    frame.src = src;
    frame.addEventListener('error', showError, { once: true });
}

/* ── Загрузка по project-id: нужна БД ── */
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

/* ── Точка входа ── */
if (projectId !== null) {
    loadById(parseInt(projectId, 10));
} else if (projectName && /^[a-zA-Z0-9_-]+$/.test(projectName)) {
    loadFrame('../works/' + projectName + '/');
} else {
    showError();
}
