/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/app.viewer.loader.js
   — Прогрессбар и обработка загрузки контейнера
   ──────────────────────────────────────────────── */

function startProgress() {
    currentProgress = 0;
    clearInterval(progressTimer);
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    loaderLabel.textContent = 'Загрузка ресурсов...';
    void progressBar.offsetWidth;

    progressTimer = setInterval(() => {
        const rem = 88 - currentProgress;
        currentProgress = Math.min(88, currentProgress + Math.max(0.4, rem * 0.09));
        progressBar.style.transition = 'width 0.35s ease';
        progressBar.style.width = currentProgress + '%';
        if (currentProgress >= 88) clearInterval(progressTimer);
    }, 280);
}

function finishProgress() {
    clearInterval(progressTimer);
    progressBar.style.transition = 'width 0.22s ease';
    progressBar.style.width = '100%';
    loaderLabel.textContent = 'Подготовка контента...';
    setTimeout(() => {
        loader.classList.add('hidden');
        frame.classList.remove('loading');
        setTimeout(() => {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
        }, 350);
    }, 220);
}

/* ── Событие загрузки iframe ── */
frame.addEventListener('load', () => {
    if (!isRealLoad) return;
    isRealLoad = false;
    finishProgress();
    if (onFrameLoadCallback) {
        const cb = onFrameLoadCallback;
        onFrameLoadCallback = null;
        cb();
    }
});
