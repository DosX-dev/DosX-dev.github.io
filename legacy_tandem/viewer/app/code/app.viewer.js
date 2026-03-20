/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/app.viewer.js
   — Глобальное состояние, DOM-ссылки, утилиты
   ──────────────────────────────────────────────── */

/* ── Пространство имён приложения ── */
const App = {
    /* Мутабельное состояние */
    state: {
        currentIndex: 0,
        currentProgress: 0,
        progressTimer: null,
        isRealLoad: false,
        phonePrevWasActive: false,
        onFrameLoadCallback: null, // вызывается один раз после следующей реальной загрузки
        currentFormatId: 'std',
        copyTimer: null,
    },

    /* DOM-элементы */
    UI: {
        frame: document.getElementById('viewer-frame'),
        loader: document.getElementById('loader'),
        progressBar: document.getElementById('progress-bar'),
        loaderLabel: document.getElementById('loader-label'),
        titleEl: document.getElementById('site-title'),
        descEl: document.getElementById('site-description'),
        counterEl: document.getElementById('site-counter'),
        openBtn: document.getElementById('open-btn'),
        copyBtn: document.getElementById('copy-btn'),
        phoneToggle: document.getElementById('phone-toggle'),
        btnPrev: document.getElementById('btn-prev'),
        btnNext: document.getElementById('btn-next'),
        infoBlock: document.getElementById('site-info'),
        dropdownEl: document.getElementById('site-dropdown'),
        selectLabel: document.getElementById('select-label'),
        selectWrap: document.getElementById('site-select-wrap'),
        ppLeft: document.getElementById('pp-left'),
        ppRight: document.getElementById('pp-right'),
        mobileActionsBtn: document.getElementById('mobile-actions-btn'),
        amOpenBtn: document.getElementById('am-open-btn'),
        amCopyBtn: document.getElementById('am-copy-btn'),
        amSiteName: document.getElementById('am-site-name'),
    },
};

/* ── Утилиты ── */

/** Высота панели из CSS-переменной */
function getPanelH() {
    return parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--panel-h')) || 64;
}

/** Сброс инлайн-стилей геометрии iframe (выход из phone-режима) */
function clearFramePhoneStyles() {
    App.UI.frame.style.width = '';
    App.UI.frame.style.height = '';
    App.UI.frame.style.transform = '';
    App.UI.frame.style.transformOrigin = '';
    App.UI.frame.style.left = '';
    App.UI.frame.style.top = '';
    App.UI.frame.style.bottom = '';
}

/**
 * Мгновенно скрыть iframe без transition-мигания,
 * затем через двойной rAF сменить src и начать реальную загрузку.
 */
function reloadFrame(src) {
    App.UI.frame.style.transition = 'none';
    App.UI.frame.classList.add('loading');
    void App.UI.frame.offsetWidth;
    App.UI.frame.style.transition = '';
    App.state.isRealLoad = false;
    App.UI.frame.src = '';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            App.state.isRealLoad = true;
            App.UI.frame.src = src;
        });
    });
}

/** Единый масштаб для phone-режима (не зависит от зума браузера) */
function calcPhoneScale() {
    const availH = window.innerHeight - getPanelH() - 48;
    const REF = 926; // самый высокий формат (Plus / Max)
    return Math.min(
        (window.screen.availHeight * 0.72) / REF, // стабильная база — физический экран
        (availH * 0.98) / REF                     // страховочный потолок по вьюпорту
    );
}
