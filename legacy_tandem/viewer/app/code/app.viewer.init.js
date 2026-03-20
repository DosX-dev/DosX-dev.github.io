/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/app.viewer.init.js
   — Инициализация приложения
   ──────────────────────────────────────────────── */

function init() {
    if (!TANDEM_SITES || TANDEM_SITES.length === 0) {
        App.UI.titleEl.textContent = 'Нет добавленных проектов';
        App.UI.descEl.textContent = 'База данных пуста.';
        App.UI.loader.classList.add('hidden');
        return;
    }

    // Функция экранирования
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Строим кастомный дропдаун
    TANDEM_SITES.forEach((site, idx) => {
        const item = document.createElement('div'), escapedTitle = escapeHtml(site.title), escapedDesc = escapeHtml(site.description);
        item.className = 'dropdown-item';
        item.dataset.idx = idx;
        item.innerHTML = `
      ${site.id > 0
                ? `<span class="di-num">${site.id}</span>`
                : '<span class="di-num di-num--home"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></span>'}
      <div class="di-text">
        <span class="di-title">${escapedTitle}</span>
        <span class="di-desc">${escapedDesc}</span>
      </div>
    `;
        item.addEventListener('click', () => {
            closeDropdown();
            selectSite(idx);
        });
        App.UI.dropdownEl.appendChild(item);
    });

    // Закрываем дропдаун при клике вне него
    document.addEventListener('click', e => {
        if (!App.UI.selectWrap.contains(e.target)) closeDropdown();
    });

    // Блокируем действия на неактивных кнопках
    App.UI.openBtn.addEventListener('click', e => { if (App.UI.openBtn.classList.contains('disabled')) e.preventDefault(); });
    App.UI.copyBtn.addEventListener('click', () => { if (!App.UI.copyBtn.classList.contains('disabled')) copyLink(); });
    App.UI.phoneToggle.addEventListener('click', () => { if (!App.UI.phoneToggle.classList.contains('disabled')) togglePhonePreview(); });

    // Мобильное модальное окно действий
    App.UI.mobileActionsBtn.addEventListener('click', openActionsModal);
    App.UI.amCopyBtn.addEventListener('click', () => { if (!App.UI.amCopyBtn.classList.contains('am-action--disabled')) copyLink(); });
    App.UI.amOpenBtn.addEventListener('click', e => {
        if (App.UI.amOpenBtn.classList.contains('am-action--disabled')) e.preventDefault();
        else closeActionsModal();
    });

    // Восстанавливаем формат и инициализируем боковые панели
    const savedFormat = localStorage.getItem('app.viewer.format');
    if (savedFormat && PHONE_FORMATS.some(f => f.id === savedFormat)) App.state.currentFormatId = savedFormat;
    initPhonePanels();

    // Восстанавливаем phone-режим из localStorage
    if (localStorage.getItem('app.viewer.mobileMode') === 'true') {
        if (window.innerWidth >= 900) {
            document.body.classList.add('phone-preview');
            App.UI.phoneToggle.classList.add('active');
            applyPhoneFormat();
        } else {
            localStorage.setItem('app.viewer.mobileMode', 'false');
        }
    }

    // Читаем project-id из URL и открываем нужный сайт
    const urlId = new URLSearchParams(location.search).get('project-id');
    const foundIdx = urlId !== null ? TANDEM_SITES.findIndex(s => s.id === parseInt(urlId, 10)) : -1;
    const startIdx = foundIdx !== -1 ? foundIdx : 0;
    loadSite(Math.max(0, startIdx));
}

/* ── Запуск ── */
init();

/* ── Плавное появление панели после загрузки шрифтов ── */
document.fonts.ready.then(() => {
    const panelEl = document.getElementById('panel');
    panelEl.style.opacity = '';
    panelEl.classList.add('panel--ready');
});
