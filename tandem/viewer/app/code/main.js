/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/main.js
   ──────────────────────────────────────────────── */

/* ── Состояние ── */
let currentIndex = 0;
let currentProgress = 0;
let progressTimer = null;
let isRealLoad = false;
let phonePrevWasActive = false;
let onFrameLoadCallback = null; // вызывается один раз после следующей реальной загрузки
let currentFormatId = 'std';
let copyTimer = null;

/* ── DOM-элементы ── */
const
    frame = document.getElementById('viewer-frame'),
    loader = document.getElementById('loader'),
    progressBar = document.getElementById('progress-bar'),
    loaderLabel = document.getElementById('loader-label'),
    titleEl = document.getElementById('site-title'),
    descEl = document.getElementById('site-description'),
    counterEl = document.getElementById('site-counter'),
    openBtn = document.getElementById('open-btn'),
    copyBtn = document.getElementById('copy-btn'),
    phoneToggle = document.getElementById('phone-toggle'),
    btnPrev = document.getElementById('btn-prev'),
    btnNext = document.getElementById('btn-next'),
    infoBlock = document.getElementById('site-info'),
    dropdownEl = document.getElementById('site-dropdown'),
    selectLabel = document.getElementById('select-label'),
    selectWrap = document.getElementById('site-select-wrap'),
    ppLeft = document.getElementById('pp-left'),
    ppRight = document.getElementById('pp-right');

/* ════════════════════════════════════════════════
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ════════════════════════════════════════════════ */

/** Высота панели из CSS-переменной */
function getPanelH() {
    return parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--panel-h')) || 64;
}

/** Сброс инлайн-стилей геометрии iframe (выход из phone-режима) */
function clearFramePhoneStyles() {
    frame.style.width = '';
    frame.style.height = '';
    frame.style.transform = '';
    frame.style.transformOrigin = '';
    frame.style.left = '';
    frame.style.top = '';
    frame.style.bottom = '';
}

/**
 * Мгновенно скрыть iframe без transition-мигания,
 * затем через двойной rAF сменить src и начать реальную загрузку.
 */
function reloadFrame(src) {
    frame.style.transition = 'none';
    frame.classList.add('loading');
    void frame.offsetWidth;
    frame.style.transition = '';
    isRealLoad = false;
    frame.src = '';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            isRealLoad = true;
            frame.src = src;
        });
    });
}

/** Единый масштаб для phone-режима (не зависит от зума браузера) */
function calcPhoneScale() {
    const availH = window.innerHeight - getPanelH() - 48;
    const REF = 926; // самый высокий формат (Plus / Max)
    return Math.min(
        (window.screen.availHeight * 0.72) / REF, // стабильная база — физический экран
        (availH * 0.98) / REF  // страховочный потолок по вьюпорту
    );
}

/* ════════════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ
   ════════════════════════════════════════════════ */

/* ── Инициализация ── */
function init() {
    if (!TANDEM_SITES || TANDEM_SITES.length === 0) {
        titleEl.textContent = 'Нет добавленных проектов';
        descEl.textContent = 'База данных пуста.';
        loader.classList.add('hidden');
        return;
    }

    // Строим кастомный дропдаун
    TANDEM_SITES.forEach((site, idx) => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.dataset.idx = idx;
        item.innerHTML = `
      ${site.id > 0 ? `<span class="di-num">${site.id}</span>` : '<span class="di-num di-num--home"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></span>'}
      <div class="di-text">
        <span class="di-title">${site.title}</span>
        <span class="di-desc">${site.description}</span>
      </div>
    `;
        item.addEventListener('click', () => {
            closeDropdown();
            selectSite(idx);
        });
        dropdownEl.appendChild(item);
    });

    // Закрываем дропдаун при клике вне него
    document.addEventListener('click', e => {
        if (!selectWrap.contains(e.target)) closeDropdown();
    });

    // Блокируем действия на неактивных кнопках
    openBtn.addEventListener('click', e => { if (openBtn.classList.contains('disabled')) e.preventDefault(); });
    copyBtn.addEventListener('click', () => { if (!copyBtn.classList.contains('disabled')) copyLink(); });
    phoneToggle.addEventListener('click', () => { if (!phoneToggle.classList.contains('disabled')) togglePhonePreview(); });

    // Восстанавливаем формат и инициализируем боковые панели
    const savedFormat = localStorage.getItem('app.viewer.format');
    if (savedFormat && PHONE_FORMATS.some(f => f.id === savedFormat)) currentFormatId = savedFormat;
    initPhonePanels();

    // Восстанавливаем phone-режим из localStorage
    if (localStorage.getItem('app.viewer.mobileMode') === 'true') {
        if (window.innerWidth >= 900) {
            document.body.classList.add('phone-preview');
            phoneToggle.classList.add('active');
            applyPhoneFormat();
        } else {
            localStorage.setItem('app.viewer.mobileMode', 'false');
        }
    }

    // Читаем project-id из URL и открываем нужный сайт
    const urlId = new URLSearchParams(location.search).get('project-id');
    const startIdx = urlId !== null
        ? (TANDEM_SITES.findIndex(s => s.id === parseInt(urlId, 10)) || 0)
        : 0;
    loadSite(Math.max(0, startIdx));
}

/* ════════════════════════════════════════════════
   ЗАГРУЗКА САЙТА
   ════════════════════════════════════════════════ */

function loadSite(index) {
    if (index < 0 || index >= TANDEM_SITES.length) return;

    currentIndex = index;
    const site = TANDEM_SITES[index];
    const isHome = site.id === 0;

    syncUrl(site.id);

    // Прогресс
    loader.classList.remove('hidden');
    startProgress();

    // Анимация смены заголовка
    triggerInfoAnimation(() => {
        titleEl.textContent = site.title;
        descEl.textContent = site.description;
        const nonHomePos   = TANDEM_SITES.filter((s, i) => s.id !== 0 && i <= index).length;
        const nonHomeTotal  = TANDEM_SITES.filter(s => s.id !== 0).length;
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
    openBtn.href = site.path;

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

/* ════════════════════════════════════════════════
   ФОРМАТЫ ДИСПЛЕЯ И УСТРОЙСТВА
   ════════════════════════════════════════════════ */

const PHONE_FORMATS = [
    {
        id: 'std', label: 'Стандарт', sub: '390 × 844', w: 390, h: 844, devices: [
            { b: 'A', c: '#98989d', name: 'iPhone 14', maker: 'Apple' },
            { b: 'A', c: '#98989d', name: 'iPhone 13 / 13 Pro', maker: 'Apple' },
            { b: 'A', c: '#98989d', name: 'iPhone 12 / 12 Pro', maker: 'Apple' },
            { b: 'A', c: '#98989d', name: 'iPhone 16e', maker: 'Apple' },
        ]
    },
    {
        id: 'compact', label: 'Компакт', sub: '375 × 667', w: 375, h: 667, devices: [
            { b: 'A', c: '#98989d', name: 'iPhone SE 3 gen', maker: 'Apple' },
            { b: 'A', c: '#98989d', name: 'iPhone SE 2 gen', maker: 'Apple' },
            { b: 'A', c: '#98989d', name: 'iPhone 8', maker: 'Apple' },
            { b: 'A', c: '#98989d', name: 'iPhone 7', maker: 'Apple' },
        ]
    },
    {
        id: 'pro', label: 'Pro', sub: '393 × 852', w: 393, h: 852, devices: [
            { b: 'A', c: '#98989d', name: 'iPhone 16', maker: 'Apple' },
            { b: 'A', c: '#98989d', name: 'iPhone 15 / 15 Pro', maker: 'Apple' },
            { b: 'A', c: '#98989d', name: 'iPhone 14 Pro', maker: 'Apple' },
        ]
    },
    {
        id: 'max', label: 'Plus / Max', sub: '428 × 926', w: 428, h: 926, devices: [
            { b: 'A', c: '#98989d', name: 'iPhone 14 Plus', maker: 'Apple' },
            { b: 'A', c: '#98989d', name: 'iPhone 13 Pro Max', maker: 'Apple' },
            { b: 'A', c: '#98989d', name: 'iPhone 12 Pro Max', maker: 'Apple' },
        ]
    },
    {
        id: 'tall', label: 'Tall', sub: '412 × 915', w: 412, h: 915, devices: [
            { b: 'G', c: '#4285f4', name: 'Pixel 7 / 8', maker: 'Google' },
            { b: 'N', c: '#d4d4d4', name: 'Phone 3', maker: 'Nothing' },
            { b: 'N', c: '#d4d4d4', name: 'Phone 2a', maker: 'Nothing' },
            { b: 'O', c: '#f5250a', name: 'OnePlus 12 / 13', maker: 'OnePlus' },
        ]
    },
    {
        id: 'mid', label: 'Android Mid', sub: '360 × 800', w: 360, h: 800, devices: [
            { b: 'S', c: '#1428a0', name: 'Galaxy S22 / S24', maker: 'Samsung' },
            { b: 'S', c: '#1428a0', name: 'Galaxy A54 / A55', maker: 'Samsung' },
            { b: 'X', c: '#ff6900', name: 'Redmi Note 13', maker: 'Xiaomi' },
            { b: 'O', c: '#f5250a', name: 'Nord CE 3 / 4', maker: 'OnePlus' },
        ]
    },
];

/* ════════════════════════════════════════════════
   PHONE-РЕЖИМ
   ════════════════════════════════════════════════ */

/* ── Превью как с телефона ── */
function togglePhonePreview() {
    const enabling = !document.body.classList.contains('phone-preview');
    phoneToggle.classList.toggle('active', enabling);
    localStorage.setItem('app.viewer.mobileMode', enabling);
    phoneToggle.classList.add('disabled');

    // Переключаем режим и конфигурируем геометрию iframe
    document.body.classList.toggle('phone-preview', enabling);
    frame.style.transition = 'none';
    enabling ? applyPhoneFormat() : clearFramePhoneStyles();
    void frame.offsetWidth;
    frame.style.transition = '';

    // Стандартный лоадер с подписью — идентично смене сайта
    loader.classList.remove('hidden');
    startProgress();
    loaderLabel.textContent = enabling
        ? 'Переход в режим смартфона...'
        : 'Выход из режима смартфона...';

    onFrameLoadCallback = () => phoneToggle.classList.remove('disabled');
    reloadFrame(TANDEM_SITES[currentIndex].path);
}

/* ════════════════════════════════════════════════
   БОКОВЫЕ ПАНЕЛИ
   ════════════════════════════════════════════════ */

function initPhonePanels() {
    const fmtList = document.getElementById('pp-formats');
    PHONE_FORMATS.forEach(fmt => {
        const el = document.createElement('div');
        el.className = 'pp-fmt' + (fmt.id === currentFormatId ? ' active' : '');
        el.dataset.id = fmt.id;
        el.innerHTML = `<span class="pp-fmt-label">${fmt.label}</span><span class="pp-fmt-sub">${fmt.sub}</span>`;
        el.addEventListener('click', () => selectFormat(fmt.id));
        fmtList.appendChild(el);
    });
    positionPanels();
    renderDevices();
}

function selectFormat(id) {
    currentFormatId = id;
    localStorage.setItem('app.viewer.format', id);
    document.querySelectorAll('.pp-fmt').forEach(el =>
        el.classList.toggle('active', el.dataset.id === id));
    applyPhoneFormat();
    renderDevices();
}

function applyPhoneFormat() {
    const fmt = PHONE_FORMATS.find(f => f.id === currentFormatId);
    if (!fmt) return;
    const scale = calcPhoneScale();
    const displayW = Math.round(fmt.w * scale);
    const panelH = getPanelH();
    // Нативные размеры → сайт думает что на смартфоне; scale() — только визуально
    frame.style.width = fmt.w + 'px';
    frame.style.height = fmt.h + 'px';
    frame.style.transform = `scale(${scale})`;
    frame.style.transformOrigin = 'top left';
    frame.style.left = `calc(50% - ${displayW / 2}px)`;
    frame.style.top = (panelH + 24) + 'px';
    frame.style.bottom = 'auto';
    positionPanels(displayW);
}

function positionPanels(w) {
    const fmt = PHONE_FORMATS.find(f => f.id === currentFormatId);
    const half = (w ?? (fmt ? fmt.w : 390)) / 2;
    ppLeft.style.right = `calc(50% + ${half + 12}px)`;
    ppRight.style.left = `calc(50% + ${half + 12}px)`;
}

function renderDevices() {
    const fmt = PHONE_FORMATS.find(f => f.id === currentFormatId);
    const list = document.getElementById('pp-devices');
    list.innerHTML = '';
    if (!fmt) return;
    fmt.devices.forEach(dev => {
        const el = document.createElement('div');
        el.className = 'pp-device';
        el.innerHTML = `
        <div class="pp-device-icon" style="color:${dev.c}">${dev.b}</div>
        <div>
          <div class="pp-device-name">${dev.name}</div>
          <div class="pp-device-maker">${dev.maker}</div>
        </div>`;
        list.appendChild(el);
    });
}

/* ════════════════════════════════════════════════
   УТИЛИТЫ
   ════════════════════════════════════════════════ */

function copyLink() {
    navigator.clipboard.writeText(location.href).then(() => {
        clearTimeout(copyTimer);
        copyBtn.classList.add('copied');
        copyTimer = setTimeout(() => copyBtn.classList.remove('copied'), 2000);
    });
}

function syncUrl(siteId) {
    const url = new URL(location.href);
    siteId === 0
        ? url.searchParams.delete('project-id')
        : url.searchParams.set('project-id', siteId);
    history.replaceState(null, '', url);
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

function navigate(direction) {
    const next = currentIndex + direction;
    if (next >= 0 && next < TANDEM_SITES.length) loadSite(next);
}

function selectSite(idx) {
    loadSite(parseInt(idx, 10));
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

/* ════════════════════════════════════════════════
   ПРОГРЕССБАР
   ════════════════════════════════════════════════ */

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

/* ════════════════════════════════════════════════
   СОБЫТИЯ
   ════════════════════════════════════════════════ */

/* ── Закрытие дропдауна при переходе фокуса в iframe ── */
// Когда пользователь кликает в iframe, window теряет фокус — используем этот событие
window.addEventListener('blur', () => {
    if (dropdownEl.classList.contains('open')) closeDropdown();
});

/* ── Клавиатурная навигация (← →) ── */
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
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

/* ── Пересчёт при ресайзе/зуме ── */
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

/* ── Запуск ── */
init();
