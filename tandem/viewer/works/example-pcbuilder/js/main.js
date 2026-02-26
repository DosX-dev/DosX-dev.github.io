/**
 * CyberPredator — PC Configurator Logic
 * ──────────────────────────────────────
 * Архитектура: ванильный JS, никаких зависимостей.
 * Принцип: select → validate → update summary → check PSU.
 */

'use strict';

// ── Состояние сборки ─────────────────────────────────────────────────────────
const BUILD = {
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    cooling: null,
    psu: null,
    case: null
};

const LABELS = {
    cpu: "Процессор",
    motherboard: "Материнская плата",
    ram: "Оперативная память",
    gpu: "Видеокарта",
    storage: "Накопитель",
    cooling: "Охлаждение",
    psu: "Блок питания",
    case: "Корпус"
};

// ── Инициализация ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initHeroCanvas();
    initBurgerMenu();
    initScrollAnimations();
    renderAllSections();
    updateSummary();
});

// ── Hero Canvas — частицы ─────────────────────────────────────────────────────
function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles;
    let animId;

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
        buildParticles();
    }

    function buildParticles() {
        const count = Math.min(Math.floor((W * H) / 10000), 90);
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.5 + 0.4,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            a: Math.random() * 0.5 + 0.15
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = W;
            if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H;
            if (p.y > H) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,245,160,${p.a})`;
            ctx.fill();
        });

        // линии между близкими частицами
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0,245,160,${0.12 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animId = requestAnimationFrame(draw);
    }

    // Пауза когда вкладка скрыта — экономим ресурсы
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(animId);
        else draw();
    });

    // Пользователь предпочитает меньше анимаций — отключаем canvas
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.style.display = 'none';
        return;
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement);
    resize();
    draw();
}

// ── Бургер-меню ───────────────────────────────────────────────────────────────
function initBurgerMenu() {
    const btn = document.getElementById('burger-btn');
    const nav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('nav-overlay');
    if (!btn || !nav) return;

    function toggleMenu(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.classList.toggle('is-open', open);
    nav.classList.toggle('is-visible', open);
    nav.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';
    }

    btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        toggleMenu(!isOpen);
    });

    overlay && overlay.addEventListener('click', () => toggleMenu(false));

    // Escape закрывает меню
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') toggleMenu(false);
    });

    // Ссылки в меню закрывают его
    nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => toggleMenu(false));
    });
}

// ── Scroll-анимации (Intersection Observer) ───────────────────────────────────
function initScrollAnimations() {
    if (!window.IntersectionObserver) return; // fallback: всё уже видно

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.anim-fade').forEach(el => io.observe(el));
}

// ── Render helpers ────────────────────────────────────────────────────────────

/**
 * Рендерит секцию выбора компонента.
 * @param {string}   category   - ключ из BUILD / COMPONENTS
 * @param {Array}    items      - массив компонентов
 * @param {Function} [filter]   - опциональная функция-фильтр
 */
function renderSection(category, items, filter) {
    const container = document.getElementById(`section-${category}`);
    if (!container) return;

    const list = filter ? items.filter(filter) : items;
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">⚡</span>
        <p>Сначала выберите процессор, чтобы увидеть совместимые материнские платы.</p>
      </div>`;
        return;
    }

    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'component-card';
        card.setAttribute('role', 'radio');
        card.setAttribute('aria-checked', BUILD[category]?.id === item.id ? 'true' : 'false');
        card.setAttribute('tabindex', '0');
        card.dataset.id = item.id;

        if (BUILD[category]?.id === item.id) card.classList.add('is-selected');

        const specsHtml = Object.entries(item.specs || {})
            .map(([k, v]) => `<span class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></span>`)
            .join('');

        card.innerHTML = `
      <div class="card-header">
        <span class="card-name">${item.brand ? `<em>${item.brand}</em> ` : ''}${item.name}</span>
        ${item.badge ? `<span class="card-badge">${item.badge}</span>` : ''}
        <span class="card-price">$${item.price.toLocaleString('ru-RU')}</span>
      </div>
      <div class="card-specs">${specsHtml}</div>
      <button class="card-select-btn" aria-label="Выбрать ${item.name}">Выбрать</button>`;

        // Клик и Enter
        const selectHandler = () => selectComponent(category, item.id, items);
        card.querySelector('.card-select-btn').addEventListener('click', selectHandler);
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectHandler(); }
        });

        container.appendChild(card);
    });
}

/**
 * Рендерит все секции разом.
 */
function renderAllSections() {
    renderSection('cpu', COMPONENTS.cpus);
    renderSection('gpu', COMPONENTS.gpus);
    renderSection('ram', COMPONENTS.ram);
    renderSection('storage', COMPONENTS.storage);
    renderSection('cooling', COMPONENTS.cooling);
    renderSection('psu', COMPONENTS.psus);
    renderSection('case', COMPONENTS.cases);
    renderMotherboards();
}

/**
 * Материнские платы — умная фильтрация по выбранному CPU.
 */
function renderMotherboards() {
    const filter = BUILD.cpu
        ? mb => mb.socket === BUILD.cpu.socket
        : null;
    renderSection('motherboard', COMPONENTS.motherboards, filter);
}

// ── Выбор компонента ─────────────────────────────────────────────────────────
function selectComponent(category, id, sourceArray) {
    const item = sourceArray.find(c => c.id === id);
    if (!item) return;

    BUILD[category] = item;

    // CPU → перерендерить материнки (фильтр по сокету)
    if (category === 'cpu') {
        BUILD.motherboard = null; // Сброс несовместимой MB
        renderMotherboards();
    }

    // Обновить aria-checked в секции
    const section = document.getElementById(`section-${category}`);
    if (section) {
        section.querySelectorAll('.component-card').forEach(card => {
            const selected = card.dataset.id === id;
            card.classList.toggle('is-selected', selected);
            card.setAttribute('aria-checked', selected ? 'true' : 'false');
        });
    }

    updateSummary();
    checkCompatibility();

    // Прокрутить к следующей незаполненной секции
    const order = ['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'cooling', 'psu', 'case'];
    const next = order.find(k => k !== category && !BUILD[k]);
    if (next) {
        const nextSection = document.querySelector(`.builder-step[data-step="${next}"]`);
        if (nextSection) {
            setTimeout(() => nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
        }
    }
}

// ── Сводка / Summary ─────────────────────────────────────────────────────────
function updateSummary() {
    const total = calcTotal();
    const totalEl = document.getElementById('summary-total');
    const listEl = document.getElementById('summary-list');
    const dlBtn = document.getElementById('download-btn');

    if (totalEl) {
        totalEl.textContent = `$${total.toLocaleString('ru-RU')}`;
    }

    if (listEl) {
        listEl.innerHTML = Object.keys(BUILD).map(k => {
            const item = BUILD[k];
            return `
        <li class="summary-item ${item ? 'is-filled' : 'is-empty'}">
          <span class="summary-label">${LABELS[k]}</span>
          <span class="summary-value">${item ? item.name : '—'}</span>
          ${item ? `<span class="summary-price">$${item.price.toLocaleString('ru-RU')}</span>` : ''}
        </li>`;
        }).join('');
    }

    // Кнопка скачать активна только если хотя бы CPU и GPU выбраны
    if (dlBtn) {
        const canDownload = BUILD.cpu && BUILD.gpu;
        dlBtn.disabled = !canDownload;
        dlBtn.setAttribute('aria-disabled', !canDownload);
    }
}

function calcTotal() {
    return Object.values(BUILD).reduce((sum, item) => sum + (item ? item.price : 0), 0);
}

// ── Проверка совместимости ────────────────────────────────────────────────────
function checkCompatibility() {
    const warnings = [];
    const errors = [];

    // 1. Сокет CPU ↔ MB
    if (BUILD.cpu && BUILD.motherboard) {
        if (BUILD.cpu.socket !== BUILD.motherboard.socket) {
            errors.push(`Несовместимо: ${BUILD.cpu.name} (${BUILD.cpu.socket}) + ${BUILD.motherboard.name} (${BUILD.motherboard.socket})`);
        }
    }

    // 2. Охлаждение ↔ TDP процессора
    if (BUILD.cpu && BUILD.cooling) {
        if (BUILD.cooling.maxTdp < BUILD.cpu.tdp) {
            warnings.push(`⚠️ Кулер рассчитан на ${BUILD.cooling.maxTdp} W, но CPU потребляет ${BUILD.cpu.tdp} W. Рекомендуем более мощное охлаждение.`);
        }
    }

    // 3. БП ↔ суммарное потребление
    if (BUILD.psu && (BUILD.cpu || BUILD.gpu)) {
        const cpuTdp = BUILD.cpu ? BUILD.cpu.tdp : 0;
        const gpuTdp = BUILD.gpu ? BUILD.gpu.tdp : 0;
        const required = cpuTdp + gpuTdp + 100; // +100W системный резерв
        if (BUILD.psu.wattage < required) {
            errors.push(`Недостаточно мощности БП: требуется ≥ ${required} W, у вас ${BUILD.psu.wattage} W.`);
        } else if (BUILD.psu.wattage < required * 1.2) {
            warnings.push(`⚠️ Рекомендуем запас ≥ 20% для стабильной работы. Текущий запас: ${BUILD.psu.wattage - required} W.`);
        }
    }

    // 4. RTX 5090 + PSU предупреждение (легендарный 575W TDP)
    if (BUILD.gpu?.id === 'rtx-5090' && BUILD.psu && BUILD.psu.wattage < 1200) {
        warnings.push('⚡ RTX 5090 рекомендует БП ≥ 1200 W для стабильного пика.');
    }

    renderCompatibility(errors, warnings);
}

function renderCompatibility(errors, warnings) {
    const box = document.getElementById('compat-box');
    if (!box) return;

    box.innerHTML = '';
    box.className = 'compat-box';

    if (errors.length === 0 && warnings.length === 0) {
        const allFilled = Object.values(BUILD).every(v => v !== null);
        if (allFilled) {
            box.classList.add('compat-ok');
            box.innerHTML = '<span>✅ Всё совместимо. Конфигурация готова к сборке!</span>';
        }
        return;
    }

    errors.forEach(msg => {
        const el = document.createElement('p');
        el.className = 'compat-error';
        el.textContent = '🚫 ' + msg;
        box.appendChild(el);
    });

    warnings.forEach(msg => {
        const el = document.createElement('p');
        el.className = 'compat-warn';
        el.textContent = msg;
        box.appendChild(el);
    });
}

// ── Скачать конфиг .txt ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const dlBtn = document.getElementById('download-btn');
    if (!dlBtn) return;

    dlBtn.addEventListener('click', () => {
        if (dlBtn.disabled) return;
        downloadConfig();
    });
});

function downloadConfig() {
    const date = new Date().toLocaleDateString('ru-RU');
    const total = calcTotal();

    const lines = [
        '╔══════════════════════════════════════════════════════╗',
        '║          CYBERPREDATOR — КОНФИГУРАЦИЯ ПК             ║',
        '╚══════════════════════════════════════════════════════╝',
        `Дата сборки: ${date}`,
        '',
        '── КОМПОНЕНТЫ ──────────────────────────────────────────',
        ...Object.keys(BUILD).map(k => {
            const item = BUILD[k];
            const label = LABELS[k].padEnd(22, ' ');
            return item
                ? `${label}: ${item.name}  ($${item.price.toLocaleString('ru-RU')})`
                : `${label}: — не выбрано`;
        }),
        '',
        '── ИТОГ ─────────────────────────────────────────────────',
        `Общая стоимость (USD):  $${total.toLocaleString('ru-RU')}`,
        '',
        '── ПОТРЕБЛЕНИЕ ──────────────────────────────────────────',
        `CPU TDP:     ${BUILD.cpu ? BUILD.cpu.tdp + ' W' : '—'}`,
        `GPU TDP:     ${BUILD.gpu ? BUILD.gpu.tdp + ' W' : '—'}`,
        `PSU мощность:${BUILD.psu ? BUILD.psu.wattage + ' W' : '—'}`,
        '',
        '── ПЕРЕДАТЬ В СЕРВИС ────────────────────────────────────',
        'CyberPredator',
        'г. Тандем, ул. Лендинговая, д. 1',
        'Тел.: +7 (XXX) XXX-XX-XX',
        'Email: tandemsites@example.com',
        '',
        '── Примечание ───────────────────────────────────────────',
        'Цены актуальны на Февраль 2026. Для уточнения обратитесь',
        'в сервис. Файл сгенерирован автоматически.'
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberPredator_Build_${date.replace(/\./g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Фидбек пользователю
    const dlBtn = document.getElementById('download-btn');
    if (dlBtn) {
        const orig = dlBtn.textContent;
        dlBtn.textContent = '✓ Скачано!';
        dlBtn.classList.add('is-downloaded');
        setTimeout(() => {
            dlBtn.textContent = orig;
            dlBtn.classList.remove('is-downloaded');
        }, 2500);
    }
}

// ── Сброс сборки ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.getElementById('reset-btn');
    if (!resetBtn) return;

    resetBtn.addEventListener('click', () => {
        Object.keys(BUILD).forEach(k => BUILD[k] = null);
        renderAllSections();
        updateSummary();
        checkCompatibility();
        document.querySelector('.builder-container')?.scrollIntoView({ behavior: 'smooth' });
    });
});

// ── Табы брендов (AMD/Intel для CPU, NVIDIA/AMD для GPU) ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.brand-tabs').forEach(tabGroup => {
        const category = tabGroup.dataset.category;
        tabGroup.querySelectorAll('.brand-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabGroup.querySelectorAll('.brand-tab').forEach(t => {
                    t.classList.remove('is-active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('is-active');
                tab.setAttribute('aria-selected', 'true');

                const brand = tab.dataset.brand;
                const section = document.getElementById(`section-${category}`);
                if (!section) return;

                section.querySelectorAll('.component-card').forEach(card => {
                    const id = card.dataset.id;
                    const source = category === 'cpu' ? COMPONENTS.cpus : COMPONENTS.gpus;
                    const item = source.find(c => c.id === id);
                    if (brand === 'all' || !item || item.brand === brand) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    });
});

// ── Глитч-анимация заголовка ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const glitch = document.querySelector('.glitch');
    if (!glitch) return;

    let glitchInterval;

    function startGlitch() {
        glitchInterval = setInterval(() => {
            glitch.classList.add('glitch-active');
            setTimeout(() => glitch.classList.remove('glitch-active'), 200);
        }, 3500 + Math.random() * 2000);
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        startGlitch();
    }
});

// ── Live PSU рекомендация (авто-подсветка нужного БП) ─────────────────────────
function highlightRecommendedPsu() {
    const cpuTdp = BUILD.cpu ? BUILD.cpu.tdp : 0;
    const gpuTdp = BUILD.gpu ? BUILD.gpu.tdp : 0;
    const required = cpuTdp + gpuTdp + 100;

    const section = document.getElementById('section-psu');
    if (!section) return;

    section.querySelectorAll('.component-card').forEach(card => {
        const psu = COMPONENTS.psus.find(p => p.id === card.dataset.id);
        card.classList.remove('is-recommended');
        if (psu && psu.wattage >= required && psu.wattage < required * 1.5) {
            card.classList.add('is-recommended');
        }
    });
}

// PSU-рекомендация: слушаем смену CPU и GPU
document.addEventListener('DOMContentLoaded', () => {
    // Слушаем изменение CPU или GPU — обновляем рекомендованный БП
    ['cpu', 'gpu'].forEach(category => {
        const section = document.getElementById(`section-${category}`);
        if (section) {
            section.addEventListener('click', () => {
                setTimeout(highlightRecommendedPsu, 50);
            });
        }
    });
});
