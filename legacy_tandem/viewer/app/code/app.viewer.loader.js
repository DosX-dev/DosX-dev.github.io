/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/app.viewer.loader.js
   — Прогрессбар и обработка загрузки контейнера
   ──────────────────────────────────────────────── */

function startProgress() {
    App.state.currentProgress = 0;
    clearInterval(App.state.progressTimer);
    App.UI.progressBar.style.transition = 'none';
    App.UI.progressBar.style.width = '0%';
    App.UI.loaderLabel.textContent = 'Загрузка ресурсов...';
    void App.UI.progressBar.offsetWidth;

    App.state.progressTimer = setInterval(() => {
        const rem = 88 - App.state.currentProgress;
        App.state.currentProgress = Math.min(88, App.state.currentProgress + Math.max(0.4, rem * 0.09));
        App.UI.progressBar.style.transition = 'width 0.35s ease';
        App.UI.progressBar.style.width = App.state.currentProgress + '%';
        if (App.state.currentProgress >= 88) clearInterval(App.state.progressTimer);
    }, 280);
}

function finishProgress() {
    clearInterval(App.state.progressTimer);
    App.UI.progressBar.style.transition = 'width 0.22s ease';
    App.UI.progressBar.style.width = '100%';
    App.UI.loaderLabel.textContent = 'Подготовка контента...';
    setTimeout(() => {
        App.UI.loader.classList.add('hidden');
        App.UI.frame.classList.remove('loading');
        setTimeout(() => {
            App.UI.progressBar.style.transition = 'none';
            App.UI.progressBar.style.width = '0%';
        }, 350);
    }, 220);
}

/* ── Событие загрузки iframe ── */
App.UI.frame.addEventListener('load', () => {
    if (!App.state.isRealLoad) return;
    App.state.isRealLoad = false;
    finishProgress();
    if (App.state.onFrameLoadCallback) {
        const cb = App.state.onFrameLoadCallback;
        App.state.onFrameLoadCallback = null;
        cb();
    }
});
