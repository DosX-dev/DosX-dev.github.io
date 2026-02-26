/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/app.toolbox.nav.js
   — Загрузка сайтов, навигация, дропдаун
   ──────────────────────────────────────────────── */

function loadSite(index) {
    if (index < 0 || index >= TANDEM_SITES.length) return;

    currentIndex    = index;
    const site      = TANDEM_SITES[index];
    const isHome    = site.id === 0;

    syncUrl(site.id);

    // Прогресс
    loader.classList.remove('hidden');
    startProgress();

    // Анимация смены заголовка
    triggerInfoAnimation(() => {
        titleEl.textContent = site.title;
        descEl.textContent  = site.description;
        const nonHomePos   = TANDEM_SITES.filter((s, i) => s.id !== 0 && i <= index).length;
        const nonHomeTotal = TANDEM_SITES.filter(s => s.id !== 0).length;
        counterEl.textContent = `${nonHomePos} / ${nonHomeTotal}`;
    });

    // Кнопки навигации
    btnPrev.disabled = (index === 0);
    btnNext.disabled = (index === TANDEM_SITES.length - 1);

    // Кнопки действий — недоступны на главной
    openBtn.classList.toggle('disabled', isHome);
    copyBtn.classList.toggle('disabled', isHome);
    phoneToggle.classList.toggle('disabled', isHome);
    counterEl.style.display = isHome ? 'none' : '';

    if (/^https?:\/\//i.test(site.path)) {
        openBtn.href = site.path;
    } else if (site.id !== undefined && site.id > 0) {
        openBtn.href = 'no-toolbox-viewer/?render-mode=fullscreen&project-id=' + site.id;
    } else {
        const m = site.path.match(/works\/([^\/]+)\//);
        openBtn.href = m ? 'no-toolbox-viewer/?render-mode=fullscreen&project-name=' + m[1] : site.path;
    }

    // Синхронизация мобильного модала
    amOpenBtn.href = openBtn.href;
    amOpenBtn.classList.toggle('am-action--disabled', isHome);
    amCopyBtn.classList.toggle('am-action--disabled', isHome);
    amSiteName.textContent = site.title;

    // Phone-режим: отключаем на главной, восстанавливаем при уходе с неё
    if (isHome) {
        phonePrevWasActive = document.body.classList.contains('phone-preview');
        if (phonePrevWasActive) {
            document.body.classList.remove('phone-preview');
            phoneToggle.classList.remove('active');
            clearFramePhoneStyles();
        }
    } else if (phonePrevWasActive) {
        document.body.classList.add('phone-preview');
        phoneToggle.classList.add('active');
        phonePrevWasActive = false;
        applyPhoneFormat();
    }

    updateDropdownState(index);
    reloadFrame(site.path);
}

function navigate(direction) {
    const next = currentIndex + direction;
    if (next >= 0 && next < TANDEM_SITES.length) loadSite(next);
}

function selectSite(idx) {
    loadSite(parseInt(idx, 10));
}

function syncUrl(siteId) {
    const url = new URL(location.href);
    siteId === 0
        ? url.searchParams.delete('project-id')
        : url.searchParams.set('project-id', siteId);
    history.replaceState(null, '', url);
}

function triggerInfoAnimation(cb) {
    infoBlock.classList.remove('info-animate');
    cb();
    void infoBlock.offsetWidth;
    infoBlock.classList.add('info-animate');
}

/* ─── Дропдаун ─── */
function toggleDropdown() {
    const trigger = document.getElementById('select-trigger');
    dropdownEl.classList.toggle('open');
    trigger.classList.toggle('active');
}

function closeDropdown() {
    const trigger = document.getElementById('select-trigger');
    dropdownEl.classList.remove('open');
    trigger.classList.remove('active');
}

function updateDropdownState(index) {
    selectLabel.textContent = TANDEM_SITES[index].title;
    document.querySelectorAll('.dropdown-item').forEach((el, i) =>
        el.classList.toggle('active', i === index));
}
