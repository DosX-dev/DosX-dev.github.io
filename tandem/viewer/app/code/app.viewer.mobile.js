/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/app.viewer.mobile.js
   — Phone-режим, форматы устройств, боковые панели
   ──────────────────────────────────────────────── */

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

/* ── Переключение phone-режима ── */
function togglePhonePreview() {
    const enabling = !document.body.classList.contains('phone-preview');
    phoneToggle.classList.toggle('active', enabling);
    localStorage.setItem('app.viewer.mobileMode', enabling);
    phoneToggle.classList.add('disabled');

    document.body.classList.toggle('phone-preview', enabling);
    frame.style.transition = 'none';
    enabling ? applyPhoneFormat() : clearFramePhoneStyles();
    void frame.offsetWidth;
    frame.style.transition = '';

    loader.classList.remove('hidden');
    startProgress();
    loaderLabel.textContent = enabling
        ? 'Переход в режим смартфона...'
        : 'Выход из режима смартфона...';

    onFrameLoadCallback = () => phoneToggle.classList.remove('disabled');
    reloadFrame(TANDEM_SITES[currentIndex].path);
}

/* ── Применить текущий формат к iframe ── */
function applyPhoneFormat() {
    const fmt = PHONE_FORMATS.find(f => f.id === currentFormatId);
    if (!fmt) return;
    const scale = calcPhoneScale();
    const displayW = Math.round(fmt.w * scale);
    const panelH = getPanelH();
    frame.style.width = fmt.w + 'px';
    frame.style.height = fmt.h + 'px';
    frame.style.transform = `scale(${scale})`;
    frame.style.transformOrigin = 'top left';
    frame.style.left = `calc(50% - ${displayW / 2}px)`;
    frame.style.top = (panelH + 24) + 'px';
    frame.style.bottom = 'auto';
    positionPanels(displayW);
}

/* ── Позиционирование боковых панелей ── */
function positionPanels(w) {
    const fmt = PHONE_FORMATS.find(f => f.id === currentFormatId);
    const half = (w ?? (fmt ? fmt.w : 390)) / 2;
    ppLeft.style.right = `calc(50% + ${half + 12}px)`;
    ppRight.style.left = `calc(50% + ${half + 12}px)`;
}

/* ── Инициализация боковых панелей ── */
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

/* ── Переключение формата экрана ── */
function selectFormat(id) {
    currentFormatId = id;
    localStorage.setItem('app.viewer.format', id);
    document.querySelectorAll('.pp-fmt').forEach(el =>
        el.classList.toggle('active', el.dataset.id === id));
    applyPhoneFormat();
    renderDevices();
}

/* ── Список устройств в правой панели ── */
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
