/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/app.toolbox.modal.js
   — Модальное окно действий, копирование, свайп
   ──────────────────────────────────────────────── */

function copyLink() {
    navigator.clipboard.writeText(location.href).then(() => {
        clearTimeout(copyTimer);
        copyBtn.classList.add('copied');
        amCopyBtn.classList.add('copied');
        copyTimer = setTimeout(() => {
            copyBtn.classList.remove('copied');
            amCopyBtn.classList.remove('copied');
            closeActionsModal();
        }, 1600);
    });
}

function openActionsModal() {
    document.getElementById('actions-modal').classList.add('open');
}

function closeActionsModal() {
    document.getElementById('actions-modal').classList.remove('open');
}

/* ── Свайп вниз для закрытия шторки ── */
(function () {
    const sheet = document.querySelector('.am-sheet');
    if (!sheet) return;

    const THRESHOLD = 80;  // px — минимум для закрытия
    const VELOCITY  = 0.4; // px/ms — закрыть по скорости даже при малом сдвиге

    let startY = 0, lastY = 0, lastT = 0, dragging = false;

    sheet.addEventListener('touchstart', e => {
        // Разрешаем свайп только если контент шторки в самом верху
        if (sheet.scrollTop > 0) return;
        startY   = e.touches[0].clientY;
        lastY    = startY;
        lastT    = Date.now();
        dragging = true;
        sheet.style.transition = 'none';
    }, { passive: true });

    sheet.addEventListener('touchmove', e => {
        if (!dragging) return;
        const dy = e.touches[0].clientY - startY;
        if (dy < 0) { sheet.style.transform = ''; return; } // вверх — не трогаем
        sheet.style.transform = `translateY(${dy}px)`;
        lastY = e.touches[0].clientY;
        lastT = Date.now();
    }, { passive: true });

    sheet.addEventListener('touchend', () => {
        if (!dragging) return;
        dragging = false;
        sheet.style.transition = '';

        const dy       = lastY - startY;
        const velocity = dy / Math.max(Date.now() - lastT, 1);

        if (dy >= THRESHOLD || velocity >= VELOCITY) {
            // Закрываем: сдвигаем вниз анимацией CSS, затем убираем класс
            sheet.style.transform = `translateY(100%)`;
            sheet.addEventListener('transitionend', () => {
                sheet.style.transform = '';
                closeActionsModal();
            }, { once: true });
        } else {
            // Возвращаем на место
            sheet.style.transform = '';
        }
    });
})();
