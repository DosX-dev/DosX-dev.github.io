/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/no-toolbox-viewer/index.init.js
   — Точка входа: определяет режим и запускает загрузку
   ──────────────────────────────────────────────── */

if (projectId !== null) {
    loadById(parseInt(projectId, 10));
} else if (projectName && /^[a-zA-Z0-9_-]+$/.test(projectName)) {
    loadFrame('../works/' + projectName);
} else {
    showError();
}
