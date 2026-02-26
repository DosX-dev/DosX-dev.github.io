/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/app.viewer.js
   — Глобальное состояние, DOM-ссылки, утилиты
   ──────────────────────────────────────────────── */

/* ── Состояние ── */
let currentIndex         = 0;
let currentProgress      = 0;
let progressTimer        = null;
let isRealLoad           = false;
let phonePrevWasActive   = false;
let onFrameLoadCallback  = null; // вызывается один раз после следующей реальной загрузки
let currentFormatId      = 'std';
let copyTimer            = null;

/* ── DOM-элементы ── */
const
    frame            = document.getElementById('viewer-frame'),
    loader           = document.getElementById('loader'),
    progressBar      = document.getElementById('progress-bar'),
    loaderLabel      = document.getElementById('loader-label'),
    titleEl          = document.getElementById('site-title'),
    descEl           = document.getElementById('site-description'),
    counterEl        = document.getElementById('site-counter'),
    openBtn          = document.getElementById('open-btn'),
    copyBtn          = document.getElementById('copy-btn'),
    phoneToggle      = document.getElementById('phone-toggle'),
    btnPrev          = document.getElementById('btn-prev'),
    btnNext          = document.getElementById('btn-next'),
    infoBlock        = document.getElementById('site-info'),
    dropdownEl       = document.getElementById('site-dropdown'),
    selectLabel      = document.getElementById('select-label'),
    selectWrap       = document.getElementById('site-select-wrap'),
    ppLeft           = document.getElementById('pp-left'),
    ppRight          = document.getElementById('pp-right'),
    mobileActionsBtn = document.getElementById('mobile-actions-btn'),
    amOpenBtn        = document.getElementById('am-open-btn'),
    amCopyBtn        = document.getElementById('am-copy-btn'),
    amSiteName       = document.getElementById('am-site-name');

/* ── Утилиты ── */

/** Высота панели из CSS-переменной */
function getPanelH() {
    return parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--panel-h')) || 64;
}

/** Сброс инлайн-стилей геометрии iframe (выход из phone-режима) */
function clearFramePhoneStyles() {
    frame.style.width          = '';
    frame.style.height         = '';
    frame.style.transform      = '';
    frame.style.transformOrigin = '';
    frame.style.left           = '';
    frame.style.top            = '';
    frame.style.bottom         = '';
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
    frame.src  = '';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            isRealLoad = true;
            frame.src  = src;
        });
    });
}

/** Единый масштаб для phone-режима (не зависит от зума браузера) */
function calcPhoneScale() {
    const availH = window.innerHeight - getPanelH() - 48;
    const REF    = 926; // самый высокий формат (Plus / Max)
    return Math.min(
        (window.screen.availHeight * 0.72) / REF, // стабильная база — физический экран
        (availH * 0.98) / REF                     // страховочный потолок по вьюпорту
    );
}
