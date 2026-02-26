/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/app.toolbox.events.js
   — Глобальные события: клавиатура, ресайз, тултипы
   ──────────────────────────────────────────────── */

/* ── Закрытие дропдауна при переходе фокуса в iframe ── */
window.addEventListener('blur', () => {
    if (dropdownEl.classList.contains('open')) closeDropdown();
});

/* ── Клавиатурная навигация (← →) ── */
document.addEventListener('keydown', e => {
    if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
});

/* ── Пересчёт геометрии phone-режима при ресайзе/зуме ── */
window.addEventListener('resize', () => {
    if (!document.body.classList.contains('phone-preview')) return;
    if (window.innerWidth < 900) {
        document.body.classList.remove('phone-preview');
        phoneToggle.classList.remove('active');
        localStorage.setItem('app.viewer.mobileMode', 'false');
        clearFramePhoneStyles();
    } else {
        applyPhoneFormat();
    }
});

/* ── Кастомные тултипы ── */
(function () {
    const tip = document.getElementById('tip');
    const margin = 8;

    function show(el) {
        tip.textContent = el.dataset.tip;
        tip.classList.add('visible');
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        tip.style.top = (rect.bottom + 10) + 'px';
        tip.style.left = cx + 'px';
        const tw = tip.offsetWidth;
        tip.style.left = Math.min(
            Math.max(cx, margin + tw / 2),
            window.innerWidth - margin - tw / 2
        ) + 'px';
    }

    function hide() { tip.classList.remove('visible'); }

    document.querySelectorAll('[data-tip]').forEach(el => {
        el.addEventListener('mouseenter', () => show(el));
        el.addEventListener('mouseleave', hide);
        el.addEventListener('mousedown', hide);
    });
})();
