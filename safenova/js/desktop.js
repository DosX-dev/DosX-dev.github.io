'use strict';

/* ============================================================
   SAVE VFS
   ============================================================ */
async function saveVFS() {
  if (!App.key || !App.container) return;
  try {
    const json = JSON.stringify(VFS.toObj());
    const { iv, blob } = await Crypto.encrypt(App.key, json);
    await DB.saveVFS(App.container.id, iv, blob);
    App.container.totalSize = VFS.totalSize();
    await DB.saveContainer(App.container);
    Desktop.updateTaskbar();
  } catch (e) { console.error('saveVFS error', e); }
}



/* ============================================================
   CONTEXT MENU
   ============================================================ */
let _activeSubmenu = null;

function showCtxMenu(x, y, items) {
  hideSubmenu();
  const menu = document.getElementById('ctx-menu');
  menu.innerHTML = '';
  items.forEach(item => {
    if (item.sep) {
      const d = document.createElement('div'); d.className = 'ctx-sep'; menu.appendChild(d); return;
    }
    const li = document.createElement('div');
    li.className = 'ctx-item' + (item.danger ? ' danger' : '') + (item.disabled ? ' disabled' : '');
    if (item.submenu) {
      li.innerHTML = `<span class="ctx-item-icon">${item.icon || ''}</span><span>${escHtml(item.label)}</span><span class="ctx-item-arrow">›</span>`;
      li.addEventListener('mouseenter', () => showSubmenu(li, item.submenu));
      li.addEventListener('mouseleave', e => { if (!e.relatedTarget?.closest('#ctx-menu-sub')) hideSubmenu(); });
    } else if (item.disabled && item._tooltip) {
      li.innerHTML = `<span class="ctx-item-icon">${item.icon || ''}</span><span>${escHtml(item.label)}</span>`;
      let _tip = null;
      li.addEventListener('mouseenter', () => {
        _tip = document.createElement('div');
        _tip.className = 'ctx-tooltip';
        _tip.textContent = item._tooltip;
        document.body.appendChild(_tip);
        const r = li.getBoundingClientRect();
        _tip.style.left = r.right + 6 + 'px'; _tip.style.top = r.top + 'px';
        const tr = _tip.getBoundingClientRect();
        if (tr.right > window.innerWidth) _tip.style.left = Math.max(0, r.left - tr.width - 6) + 'px';
      });
      li.addEventListener('mouseleave', () => { if (_tip) { _tip.remove(); _tip = null; } });
    } else {
      li.innerHTML = `<span class="ctx-item-icon">${item.icon || ''}</span><span>${escHtml(item.label)}</span>`;
      li.addEventListener('click', () => { hideCtxMenu(); item.action?.(); });
      li.addEventListener('mouseenter', hideSubmenu);
    }
    menu.appendChild(li);
  });
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
  menu.classList.add('show');
  const r = menu.getBoundingClientRect();
  // Account for taskbar at the bottom (36px + 1px border)
  const taskbarH = document.querySelector('.taskbar')?.offsetHeight || 37;
  const maxBottom = window.innerHeight - taskbarH;
  if (r.right  > window.innerWidth) menu.style.left = Math.max(0, x - r.width)  + 'px';
  if (r.bottom > maxBottom)         menu.style.top  = Math.max(0, y - r.height) + 'px';
}

function showSubmenu(parentEl, items) {
  hideSubmenu();
  let sub = document.getElementById('ctx-menu-sub');
  if (!sub) {
    sub = document.createElement('div');
    sub.className = 'ctx-menu'; sub.id = 'ctx-menu-sub';
    document.body.appendChild(sub);
  }
  sub.innerHTML = '';
  let _activeSub2 = null;

  function hideSub2() {
    if (_activeSub2) { _activeSub2.remove(); _activeSub2 = null; }
  }

  items.forEach(item => {
    if (item.sep) { const d = document.createElement('div'); d.className = 'ctx-sep'; sub.appendChild(d); return; }
    const li = document.createElement('div');
    li.className = 'ctx-item' + (item.danger ? ' danger' : '') + (item.disabled ? ' disabled' : '');
    if (item.submenu) {
      li.innerHTML = `<span class="ctx-item-icon">${item.icon || ''}</span><span>${escHtml(item.label)}</span><span class="ctx-item-arrow">›</span>`;
      li.addEventListener('mouseenter', () => {
        hideSub2();
        const sub2 = document.createElement('div');
        sub2.className = 'ctx-menu show';
        item.submenu.forEach(si => {
          if (si.sep) { const d = document.createElement('div'); d.className = 'ctx-sep'; sub2.appendChild(d); return; }
          const li2 = document.createElement('div');
          li2.className = 'ctx-item' + (si.danger ? ' danger' : '');
          li2.innerHTML = `<span class="ctx-item-icon">${si.icon || ''}</span><span>${escHtml(si.label)}</span>`;
          li2.addEventListener('click', () => { hideCtxMenu(); si.action?.(); });
          sub2.appendChild(li2);
        });
        document.body.appendChild(sub2);
        const pr = li.getBoundingClientRect();
        sub2.style.position = 'fixed';
        sub2.style.left = pr.right + 'px'; sub2.style.top = pr.top + 'px';
        const sr = sub2.getBoundingClientRect();
        const _taskbarH2 = document.querySelector('.taskbar')?.offsetHeight || 37;
        const _maxB2 = window.innerHeight - _taskbarH2;
        if (window.innerWidth <= 640) {
          sub2.style.left = Math.max(0, Math.min(pr.left, window.innerWidth - sr.width)) + 'px';
          sub2.style.top  = Math.min(pr.bottom, _maxB2 - sr.height) + 'px';
        } else {
          if (sr.right  > window.innerWidth) sub2.style.left = Math.max(0, pr.left - sr.width) + 'px';
          if (sr.bottom > _maxB2)            sub2.style.top  = Math.max(0, pr.top  - (sr.bottom - _maxB2)) + 'px';
        }
        _activeSub2 = sub2;
        sub2.addEventListener('mouseleave', e => {
          if (e.relatedTarget && li.contains(e.relatedTarget)) return;
          hideSub2();
        });
      });
      li.addEventListener('mouseleave', e => {
        if (_activeSub2 && _activeSub2.contains(e.relatedTarget)) return;
        hideSub2();
      });
    } else {
      li.innerHTML = `<span class="ctx-item-icon">${item.icon || ''}</span><span>${escHtml(item.label)}</span>`;
      li.addEventListener('click', () => { hideCtxMenu(); item.action?.(); });
      li.addEventListener('mouseenter', hideSub2);
    }
    sub.appendChild(li);
  });
  sub.classList.add('show');
  const pr = parentEl.getBoundingClientRect();
  sub.style.left = pr.right + 'px'; sub.style.top = pr.top + 'px';
  const sr = sub.getBoundingClientRect();
  const _taskbarH = document.querySelector('.taskbar')?.offsetHeight || 37;
  const _maxB = window.innerHeight - _taskbarH;
  if (window.innerWidth <= 640) {
    // Mobile: open below parent item to prevent horizontal overflow
    sub.style.left = Math.max(0, Math.min(pr.left, window.innerWidth - sr.width)) + 'px';
    sub.style.top  = Math.min(pr.bottom, _maxB - sr.height) + 'px';
  } else {
    if (sr.right  > window.innerWidth) sub.style.left = Math.max(0, pr.left - sr.width) + 'px';
    if (sr.bottom > _maxB)             sub.style.top  = Math.max(0, pr.top  - (sr.bottom - _maxB)) + 'px';
  }
  _activeSubmenu = sub;
}

function hideSubmenu() {
  // Remove any third-level submenus
  document.querySelectorAll('body > .ctx-menu:not(#ctx-menu):not(#ctx-menu-sub)').forEach(el => el.remove());
  if (_activeSubmenu) { _activeSubmenu.classList.remove('show'); _activeSubmenu = null; }
}

function hideCtxMenu() {
  document.getElementById('ctx-menu').classList.remove('show');
  document.querySelectorAll('body > .ctx-menu:not(#ctx-menu):not(#ctx-menu-sub)').forEach(el => el.remove());
  document.querySelectorAll('.ctx-tooltip').forEach(el => el.remove());
  hideSubmenu();
}

/* ============================================================
   HOVER TOOLTIP
   ============================================================ */
let _tooltipTimer = null;
let _tooltipEl    = null;
let _isDragging   = false;

function _startHoverTooltip(el, node) {
  if (_isDragging) return;
  _cancelHoverTooltip();
  _tooltipTimer = setTimeout(() => {
    _tooltipEl = document.createElement('div');
    _tooltipEl.className = 'file-tooltip';
    const mime       = node.type === 'folder' ? 'Folder' : (node.mime || getMime(node.name));
    const childCount = node.type === 'folder' ? VFS.children(node.id).length : null;
    const folderSize = node.type === 'folder' && typeof _folderSize === 'function' ? _folderSize(node.id) : null;
    _tooltipEl.innerHTML =
      `<div class="ft-name">${escHtml(node.name)}</div>` +
      `<div class="ft-row">Path: ${escHtml(VFS.fullPath(node.id))}</div>` +
      `<div class="ft-row">Type: ${escHtml(node.type === 'folder' ? 'Folder' : mime)}</div>` +
      (node.size  != null  ? `<div class="ft-row">Size: ${fmtSize(node.size)}</div>` : '') +
      (folderSize !== null ? `<div class="ft-row">Size: ${fmtSize(folderSize)}</div>` : '') +
      (childCount !== null ? `<div class="ft-row">Items: ${childCount}</div>` : '') +
      `<div class="ft-row">Modified: ${fmtDate(node.mtime)}</div>` +
      `<div class="ft-row">Created: ${fmtDate(node.ctime)}</div>`;
    _tooltipEl.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden';
    document.body.appendChild(_tooltipEl);
    const rect = el.getBoundingClientRect();
    // If element was removed from DOM or has zero size, abort
    if (!document.contains(el) || (rect.width === 0 && rect.height === 0)) {
      _tooltipEl.remove(); _tooltipEl = null; return;
    }
    const tw = _tooltipEl.offsetWidth, th = _tooltipEl.offsetHeight;
    let left = rect.right + 10, top = rect.top;
    if (left + tw > window.innerWidth  - 8) left = rect.left - tw - 10;
    if (top  + th > window.innerHeight - 8) top  = window.innerHeight - th - 8;
    left = Math.max(4, left);
    top  = Math.max(4, top);
    _tooltipEl.style.cssText = `position:fixed;left:${left}px;top:${top}px`;
  }, 750);
}

function _cancelHoverTooltip() {
  if (_tooltipTimer) { clearTimeout(_tooltipTimer); _tooltipTimer = null; }
  if (_tooltipEl)    { _tooltipEl.remove(); _tooltipEl = null; }
}

/* ============================================================
   SETTINGS
   ============================================================ */
const SETTINGS_DEFAULTS = { iconSize: 'normal', gridDots: true, autoLock: '60', disableAnimations: false };

let _autoLockTimerId = null;

function _resetContainerSettings() {
  // Cancel any pending auto-lock timer
  if (_autoLockTimerId) { clearTimeout(_autoLockTimerId); _autoLockTimerId = null; }
  // Reset body icon-size and animation classes to defaults
  document.body.classList.remove('icons-small', 'icons-normal', 'icons-large', 'no-animations');
  document.body.classList.add('icons-normal');
  // Reset grid constants
  GRID_X = 96;
  GRID_Y = 96;
  // Reset desktop grid dots to default (visible)
  const area = document.getElementById('desktop-area');
  if (area) area.classList.remove('no-grid-dots');
}

function _getSettings() {
  const s = App.container?.settings;
  return { ...SETTINGS_DEFAULTS, ...s };
}

function _applySettings(s) {
  // Icon Size — apply to body so it covers desktop + all folder windows
  document.body.classList.remove('icons-small', 'icons-normal', 'icons-large');
  document.body.classList.add('icons-' + (s.iconSize || 'normal'));
  // Update internal grid size depending on scale
  const oldGX = GRID_X, oldGY = GRID_Y;
  let scale = 1;
  if (s.iconSize === 'small') scale = 0.75;
  if (s.iconSize === 'large') scale = 1.25;
  GRID_X = Math.round(96 * scale);
  GRID_Y = Math.round(96 * scale);

  // Remap all saved positions to the new grid if grid changed
  if (oldGX !== GRID_X || oldGY !== GRID_Y) {
    VFS.remapPositions(oldGX, oldGY, GRID_X, GRID_Y);
    saveVFS();
    Desktop._renderIcons();
    if (typeof WinManager !== 'undefined') WinManager.renderAll();
  }
  
  // Grid Dots
  const area = document.getElementById('desktop-area');
  area.classList.toggle('no-grid-dots', !s.gridDots);
  document.querySelectorAll('.fw-area').forEach(a => a.classList.toggle('no-grid-dots', !s.gridDots));
  // Animations
  document.body.classList.toggle('no-animations', !!s.disableAnimations);
}

async function _saveSettings(s) {
  if (!App.container) return;
  App.container.settings = s;
  await DB.saveContainer(App.container);
}

function _resetAutoLockTimer() {
  if (_autoLockTimerId) {
    clearTimeout(_autoLockTimerId);
    _autoLockTimerId = null;
  }
  const s = _getSettings();
  if (s.autoLock && s.autoLock !== '0') {
    const min = parseInt(s.autoLock, 10);
    if (!isNaN(min) && min > 0) {
      _autoLockTimerId = setTimeout(() => {
        App.closeContainer();
      }, min * 60 * 1000);
    }
  }
}

function openSettings() {
  const s = _getSettings();
  // Populate UI
  document.querySelectorAll('#settings-icon-size .settings-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === s.iconSize);
  });
  document.querySelector('#settings-grid-dots input').checked = s.gridDots;
  document.querySelector('#settings-animations input').checked = !!s.disableAnimations;
  
  // Setup custom dropdown for auto-lock
  const dd = document.getElementById('settings-autolock-dd');
  const currentAl = s.autoLock || '60';
  
  const updateDdUI = (val) => {
    dd.querySelectorAll('.custom-dd-opt').forEach(opt => {
      const isSel = opt.dataset.value === val;
      opt.classList.toggle('selected', isSel);
      if (isSel) dd.querySelector('.custom-dd-val').textContent = opt.textContent;
    });
  };
  
  // Remove old listeners to prevent duplicates (clone head and menu)
  const ddHead = dd.querySelector('.custom-dd-head');
  const newDdHead = ddHead.cloneNode(true);
  ddHead.parentNode.replaceChild(newDdHead, ddHead);
  
  // Set initial value AFTER cloning so we update the live DOM element
  updateDdUI(currentAl);
  
  newDdHead.onclick = (e) => {
    e.stopPropagation();
    document.querySelectorAll('.custom-dd').forEach(d => { if (d !== dd) d.classList.remove('open'); });
    dd.classList.toggle('open');
  };
  
  const ddMenu = dd.querySelector('.custom-dd-menu');
  const newDdMenu = ddMenu.cloneNode(true);
  ddMenu.parentNode.replaceChild(newDdMenu, ddMenu);
  
  newDdMenu.querySelectorAll('.custom-dd-opt').forEach(opt => {
    opt.onclick = async (e) => {
      e.stopPropagation();
      const val = opt.dataset.value;
      updateDdUI(val);
      dd.classList.remove('open');
      const ns = { ..._getSettings(), autoLock: val };
      _applySettings(ns);
      await _saveSettings(ns);
      _resetAutoLockTimer();
    };
  });
  
  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-dd').forEach(d => d.classList.remove('open'));
  }, { once: true }); // This might attach multiple times, let's just make it persistent on body in main if needed, but it's fine here for now since modal blocks. Actually better:
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dd')) {
      document.querySelectorAll('.custom-dd').forEach(d => d.classList.remove('open'));
    }
  });

  // Tab state
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'personalization'));
  document.getElementById('settings-personalization').style.display = '';
  document.getElementById('settings-statistics').style.display = 'none';
  // Bind tabs
  document.querySelectorAll('.settings-tab').forEach(t => {
    t.onclick = () => {
      document.querySelectorAll('.settings-tab').forEach(t2 => t2.classList.remove('active'));
      t.classList.add('active');
      document.getElementById('settings-personalization').style.display = t.dataset.tab === 'personalization' ? '' : 'none';
      document.getElementById('settings-statistics').style.display = t.dataset.tab === 'statistics' ? '' : 'none';
      if (t.dataset.tab === 'statistics') _renderStats();
    };
  });
  // Bind icon size buttons
  document.querySelectorAll('#settings-icon-size .settings-toggle-btn').forEach(btn => {
    btn.onclick = async () => {
      document.querySelectorAll('#settings-icon-size .settings-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const ns = { ..._getSettings(), iconSize: btn.dataset.value };
      _applySettings(ns);
      await _saveSettings(ns);
    };
  });
  // Bind grid dots
  document.querySelector('#settings-grid-dots input').onchange = async function() {
    const ns = { ..._getSettings(), gridDots: this.checked };
    _applySettings(ns);
    await _saveSettings(ns);
  };
  // Bind disabled animations
  document.querySelector('#settings-animations input').onchange = async function() {
    const ns = { ..._getSettings(), disableAnimations: this.checked };
    _applySettings(ns);
    await _saveSettings(ns);
  };
  Overlay.show('modal-settings');
}

const STATS_COLORS = ['#0078d4','#e74856','#16c60c','#f9f1a5','#b4009e','#00b7c3','#ff8c00','#e3008c'];

function _renderStats() {
  const deskFid = Desktop._desktopFolder;
  // Gather all nodes recursively
  let totalFiles = 0, totalFolders = 0, totalSize = 0;
  const typeCounts = {};
  function walk(pid) {
    VFS.children(pid).forEach(n => {
      if (n.type === 'folder') {
        totalFolders++;
        walk(n.id);
      } else {
        totalFiles++;
        totalSize += n.size || 0;
        const ext = n.name.includes('.') ? n.name.split('.').pop().toLowerCase() : 'other';
        typeCounts[ext] = (typeCounts[ext] || 0) + 1;
      }
    });
  }
  walk('root');
  // Stats cards
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';
  const cards = [
    { value: totalFiles, label: 'Files' },
    { value: totalFolders, label: 'Folders' },
    { value: fmtSize(totalSize), label: 'Total Size' },
    { value: fmtDate(App.container?.createdAt), label: 'Created' },
  ];
  cards.forEach(c => {
    const card = document.createElement('div'); card.className = 'stats-card';
    card.innerHTML = `<span class="stats-card-value">${escHtml(String(c.value))}</span><span class="stats-card-label">${escHtml(c.label)}</span>`;
    grid.appendChild(card);
  });
  // File type bar chart (top 6)
  const chart = document.getElementById('stats-bar-chart');
  chart.innerHTML = '';
  const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCount = sorted.length ? sorted[0][1] : 1;
  sorted.forEach(([ext, count], i) => {
    const pct = Math.round(count / totalFiles * 100);
    const row = document.createElement('div'); row.className = 'stats-bar-row';
    row.innerHTML =
      `<span class="stats-bar-row-label">.${escHtml(ext)}</span>` +
      `<div class="stats-bar-row-track"><div class="stats-bar-row-fill" style="width:${Math.round(count/maxCount*100)}%;background:${STATS_COLORS[i%STATS_COLORS.length]}"></div></div>` +
      `<span class="stats-bar-row-pct">${pct}%</span>`;
    chart.appendChild(row);
  });
  if (!sorted.length) chart.innerHTML = '<span style="font-size:12px;color:var(--text-dim)">No files yet</span>';
  // Storage bar
  const storBar = document.getElementById('stats-storage-bar');
  const used = App.container?.totalSize || 0;
  const limit = 500 * 1024 * 1024; // 500MB display cap
  const pctUsed = Math.min(100, Math.round(used / limit * 100));
  storBar.innerHTML =
    `<div class="stats-storage-fill" style="width:${pctUsed}%"></div>` +
    `<span class="stats-storage-text">${fmtSize(used)} used</span>`;
}

/* ============================================================
   SNAP TO FREE GRID CELL
   occupied = Map<"cx_cy", id>  (cells already taken)
   ============================================================ */
function _snapFreeCell(rawX, rawY, occupied) {
  const cx0 = Math.max(0, Math.round((rawX - 8) / GRID_X));
  const cy0 = Math.max(0, Math.round((rawY - 8) / GRID_Y));
  for (let r = 0; r <= 80; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const cx = cx0 + dx, cy = cy0 + dy;
        if (cx < 0 || cy < 0) continue;
        if (!occupied.has(`${cx}_${cy}`)) return { x: 8 + cx * GRID_X, y: 8 + cy * GRID_Y };
      }
    }
  }
  return { x: 8 + cx0 * GRID_X, y: 8 + cy0 * GRID_Y };
}

/* ============================================================
   SHARED ICON ELEMENT BUILDER
   ============================================================ */
function _buildIconEl(node, pos) {
  const div = document.createElement('div');
  div.className  = 'file-item';
  div.dataset.id = node.id;
  div.style.left = pos.x + 'px';
  div.style.top  = pos.y + 'px';
  // Prevent native browser drag-select ghost image
  div.addEventListener('dragstart', e => e.preventDefault());
  div.addEventListener('mouseenter', () => _startHoverTooltip(div, node));
  div.addEventListener('mouseleave', _cancelHoverTooltip);

  const thumb = document.createElement('div');
  if (node.type === 'folder') {
    thumb.className = 'file-thumb folder-icon';
    thumb.innerHTML = getFolderSVG(node.color);
  } else {
    thumb.className = 'file-thumb';
    const mime = node.mime || getMime(node.name);
    if (App.thumbCache[node.id]) {
      const img = document.createElement('img');
      img.src = App.thumbCache[node.id];
      img.draggable = false;
      thumb.appendChild(img);
    } else {
      thumb.innerHTML = getFileIconSVG(mime, node.name);
      if (isImage(mime)) {
        generateThumb(node).then(url => {
          if (!url) return;
          App.thumbCache[node.id] = url;
          // Find in any visible context (main desktop or any window)
          const el = document.querySelector(`.file-item[data-id="${node.id}"] .file-thumb`);
          if (el) {
            const i = document.createElement('img');
            i.src = url; i.draggable = false;
            el.innerHTML = ''; el.appendChild(i);
          }
        });
      }
    }
  }

  const name = document.createElement('div');
  name.className   = 'file-name';
  name.textContent = node.name;
  div.appendChild(thumb);
  div.appendChild(name);
  return div;
}

/* ============================================================
   DESKTOP
   ============================================================ */
const Desktop = {
  _desktopFolder: 'root',
  _sel: App.selection,   // main desktop's own selection (same reference as App.selection initially)

  render() {
    // Restore main desktop's folder + selection as the active App context
    App._winCtx   = null;
    App.folder    = this._desktopFolder;
    App.selection = this._sel;

    this._renderBreadcrumb();
    this._renderIcons();
    this.updateTaskbar();
    // Re-render all open folder windows
    if (typeof WinManager !== 'undefined') WinManager.renderAll();
  },

  _renderBreadcrumb() {
    const bc     = document.getElementById('breadcrumb');
    const crumbs = VFS.breadcrumb(this._desktopFolder);
    bc.innerHTML = '';
    crumbs.forEach((n, i) => {
      const span = document.createElement('span');
      span.className   = 'breadcrumb-item' + (i === crumbs.length - 1 ? ' current' : '');
      span.textContent = n.id === 'root' ? ('/~/' + App.container.name) : n.name;
      if (i < crumbs.length - 1) {
        span.addEventListener('click', () => {
          this._desktopFolder = n.id;
          this._sel.clear();
          this.render();
        });
      }
      bc.appendChild(span);
      if (i < crumbs.length - 1) {
        const sep = document.createElement('span');
        sep.className   = 'breadcrumb-sep';
        sep.textContent = ' › ';
        bc.appendChild(sep);
      }
    });
  },

  _renderIcons() {
    const area = document.getElementById('desktop-area');
    area.querySelectorAll(':scope > .file-item').forEach(e => e.remove());

    const items = VFS.children(this._desktopFolder);
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    items.forEach((node, idx) => {
      let pos = VFS.getPos(this._desktopFolder, node.id);
      if (!pos) {
        pos = VFS.autoPos(this._desktopFolder, idx, area);
        VFS.setPos(this._desktopFolder, node.id, pos.x, pos.y);
      }
      const div = _buildIconEl(node, pos);
      if (this._sel.has(node.id)) div.classList.add('selected');
      // pop-in animation with stagger
      div.style.animation = `iconPop 0.12s ease ${Math.min(idx * 15, 200)}ms both`;
      div.addEventListener('mousedown',   e => this._onIconMousedown(e, div, node));
      div.addEventListener('dblclick',    e => { e.stopPropagation(); this._openNode(node); });
      div.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); this._contextIcon(e, node); });
      // Mobile: single tap → context menu, double tap → open
      { let _ts = 0, _tm = false, _lastTap = 0;
        div.addEventListener('touchstart', () => { _ts = Date.now(); _tm = false; }, { passive: true });
        div.addEventListener('touchmove',  () => { _tm = true; }, { passive: true });
        div.addEventListener('touchend', e => {
          if (_tm || Date.now() - _ts > 350) return;
          e.preventDefault();
          const now = Date.now(), t = e.changedTouches[0];
          if (now - _lastTap < 300) { _lastTap = 0; this._openNode(node); }
          else { _lastTap = now; this._contextIcon({ clientX: t.clientX, clientY: t.clientY, ctrlKey: false, metaKey: false, preventDefault(){}, stopPropagation(){} }, node); }
        }); }
      area.appendChild(div);
    });

    this._updateSelectionBar();
    if (typeof _applyCutStyles !== 'undefined') _applyCutStyles();
  },

  // Incremental update: add new icons, remove gone ones, sync names — NO re-animation for existing
  _patchIcons() {
    App._winCtx   = null;
    App.folder    = this._desktopFolder;
    App.selection = this._sel;

    const area    = document.getElementById('desktop-area');
    const nodes   = VFS.children(this._desktopFolder);
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Remove elements for nodes no longer in this folder
    area.querySelectorAll(':scope > .file-item').forEach(el => {
      if (!nodeMap.has(el.dataset.id)) el.remove();
    });

    // Add new icons; sync names of existing ones (no re-animate existing)
    nodes.forEach((node, idx) => {
      let pos = VFS.getPos(this._desktopFolder, node.id);
      if (!pos) {
        pos = VFS.autoPos(this._desktopFolder, idx, area);
        VFS.setPos(this._desktopFolder, node.id, pos.x, pos.y);
      }
      const existing = area.querySelector(`:scope > .file-item[data-id="${node.id}"]`);
      if (existing) {
        const nameEl = existing.querySelector('.file-name');
        if (nameEl && nameEl.textContent !== node.name) nameEl.textContent = node.name;
        // Update folder color if changed
        if (node.type === 'folder') {
          const thumbEl = existing.querySelector('.file-thumb.folder-icon');
          if (thumbEl) thumbEl.innerHTML = getFolderSVG(node.color);
        }
      } else {
        const div = _buildIconEl(node, pos);
        if (this._sel.has(node.id)) div.classList.add('selected');
        div.style.animation = 'iconPop 0.12s ease both';
        div.addEventListener('mousedown',   e => this._onIconMousedown(e, div, node));
        div.addEventListener('dblclick',    e => { e.stopPropagation(); this._openNode(node); });
        div.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); this._contextIcon(e, node); });
        // Mobile: single tap → context menu, double tap → open
        { let _ts = 0, _tm = false, _lastTap = 0;
          div.addEventListener('touchstart', () => { _ts = Date.now(); _tm = false; }, { passive: true });
          div.addEventListener('touchmove',  () => { _tm = true; }, { passive: true });
          div.addEventListener('touchend', e => {
            if (_tm || Date.now() - _ts > 350) return;
            e.preventDefault();
            const now = Date.now(), t = e.changedTouches[0];
            if (now - _lastTap < 300) { _lastTap = 0; this._openNode(node); }
            else { _lastTap = now; this._contextIcon({ clientX: t.clientX, clientY: t.clientY, ctrlKey: false, metaKey: false, preventDefault(){}, stopPropagation(){} }, node); }
          }); }
        area.appendChild(div);
      }
    });

    this._updateSelectionBar();
    if (typeof _applyCutStyles !== 'undefined') _applyCutStyles();
    this.updateTaskbar();
    if (typeof WinManager !== 'undefined') WinManager.renderAll();
  },

  _onIconMousedown(e, el, node) {
    if (e.button !== 0) return;
    hideCtxMenu();
    e.stopPropagation();
    e.preventDefault(); // prevent text selection while dragging
    _cancelHoverTooltip();

    if (!e.ctrlKey && !e.metaKey && !this._sel.has(node.id)) {
      this._sel.clear();
      document.querySelectorAll('#desktop-area > .file-item.selected').forEach(i => i.classList.remove('selected'));
    }
    this._sel.add(node.id);
    el.classList.add('selected');
    this._updateSelectionBar();

    // Elevate z-index of all selected items above folder windows during drag
    this._sel.forEach(id => {
      const item = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
      if (item) item.style.zIndex = '7900';
    });

    const startX = e.clientX, startY = e.clientY;
    const area = document.getElementById('desktop-area');
    const areaRect = area.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const clickOffX = e.clientX - elRect.left;
    const clickOffY = e.clientY - elRect.top;
    const startScrollX = area.scrollLeft, startScrollY = area.scrollTop;
    const startPosMap = {};
    this._sel.forEach(id => {
      const item = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
      if (item) startPosMap[id] = { x: parseInt(item.style.left), y: parseInt(item.style.top) };
    });
    // Build occupied map for snap preview (exclude dragged items)
    const occupiedAtStart = new Map();
    VFS.children(this._desktopFolder).forEach(n => {
      if (this._sel.has(n.id)) return;
      const p = VFS.getPos(this._desktopFolder, n.id);
      if (p) occupiedAtStart.set(`${Math.round((p.x-8)/GRID_X)}_${Math.round((p.y-8)/GRID_Y)}`, n.id);
    });
    let snapPreviewEls = [];
    let fwSnapPreviewEls = [];  // snap previews inside a hovered folder-window
    let moved = false, hoverFolder = null, hoverWin = null, lastX = e.clientX, lastY = e.clientY;

    const onMove = mv => {
      lastX = mv.clientX; lastY = mv.clientY;
      const mainPos = startPosMap[node.id];
      const targetMainX = mv.clientX - areaRect.left + area.scrollLeft - clickOffX;
      const targetMainY = mv.clientY - areaRect.top + area.scrollTop - clickOffY;
      const dx = targetMainX - mainPos.x;
      const dy = targetMainY - mainPos.y;
      if (!moved && (Math.abs(mv.clientX - startX) + Math.abs(mv.clientY - startY)) > 4) {
        moved = true; _isDragging = true; _cancelHoverTooltip();
      }
      if (!moved) return;
      this._sel.forEach(id => {
        const item = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
        const sp   = startPosMap[id];
        if (item && sp) { item.style.left = (sp.x + dx) + 'px'; item.style.top = (sp.y + dy) + 'px'; }
      });
      // Highlight folder under cursor (hide dragged items briefly for elementFromPoint)
      this._sel.forEach(id => {
        const it = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
        if (it) it.style.pointerEvents = 'none';
      });
      const target   = document.elementFromPoint(mv.clientX, mv.clientY);
      this._sel.forEach(id => {
        const it = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
        if (it) it.style.pointerEvents = '';
      });
      const folderEl = target?.closest('.file-item[data-id]');
      const newHover = folderEl && !this._sel.has(folderEl.dataset.id) &&
                       VFS.node(folderEl.dataset.id)?.type === 'folder' ? folderEl.dataset.id : null;
      if (newHover !== hoverFolder) {
        if (hoverFolder) document.querySelectorAll(`.file-item[data-id="${hoverFolder}"]`).forEach(el => el.classList.remove('drag-target'));
        hoverFolder = newHover;
        if (hoverFolder && folderEl) folderEl.classList.add('drag-target');
      }
      // Detect if cursor is over a folder-window (but not hovering a folder icon)
      const fwEl = !hoverFolder ? target?.closest('.folder-window') : null;
      const curWin = fwEl ? (typeof WinManager !== 'undefined' ? WinManager._wins.find(w => w.el === fwEl) : null) : null;
      if (curWin !== hoverWin) {
        fwSnapPreviewEls.forEach(p => p.remove()); fwSnapPreviewEls = [];
        hoverWin = curWin;
      }
      // Snap preview: folder-icon hover > folder-window hover > desktop
      if (hoverFolder) {
        snapPreviewEls.forEach(p => p.style.display = 'none');
        fwSnapPreviewEls.forEach(p => p.style.display = 'none');
      } else if (hoverWin) {
        // Show snap preview inside the hovered folder window
        snapPreviewEls.forEach(p => p.style.display = 'none');
        const winArea = hoverWin.el.querySelector('.fw-area');
        const winRect = winArea.getBoundingClientRect();
        const dropX   = mv.clientX - winRect.left + winArea.scrollLeft - clickOffX;
        const dropY   = mv.clientY - winRect.top  + winArea.scrollTop - clickOffY;
        const winOcc  = new Map();
        VFS.children(hoverWin.folderId).forEach(n => {
          const p = VFS.getPos(hoverWin.folderId, n.id);
          if (p) winOcc.set(`${Math.round((p.x-8)/GRID_X)}_${Math.round((p.y-8)/GRID_Y)}`, n.id);
        });
        const selIds = [...this._sel];
        while (fwSnapPreviewEls.length < selIds.length) {
          const pEl = document.createElement('div'); pEl.className = 'snap-preview';
          winArea.appendChild(pEl); fwSnapPreviewEls.push(pEl);
        }
        while (fwSnapPreviewEls.length > selIds.length) { fwSnapPreviewEls.pop().remove(); }
        const snapOcc = new Map(winOcc);
        const mainSp = startPosMap[node.id];
        selIds.forEach((id, i) => {
          const sp = startPosMap[id];
          const offX = sp && mainSp ? sp.x - mainSp.x : 0;
          const offY = sp && mainSp ? sp.y - mainSp.y : 0;
          const snapped = _snapFreeCell(dropX + offX, dropY + offY, snapOcc);
          const cx = Math.round((snapped.x - 8) / GRID_X), cy = Math.round((snapped.y - 8) / GRID_Y);
          snapOcc.set(`${cx}_${cy}`, id);
          fwSnapPreviewEls[i].style.left = snapped.x + 'px';
          fwSnapPreviewEls[i].style.top  = snapped.y + 'px';
          fwSnapPreviewEls[i].style.display = '';
        });
      } else {
        // Snap preview on desktop
        fwSnapPreviewEls.forEach(p => p.style.display = 'none');
        const mainSp = startPosMap[node.id];
        if (mainSp) {
          const selIds = [...this._sel];
          while (snapPreviewEls.length < selIds.length) {
            const pEl = document.createElement('div'); pEl.className = 'snap-preview';
            area.appendChild(pEl); snapPreviewEls.push(pEl);
          }
          while (snapPreviewEls.length > selIds.length) { snapPreviewEls.pop().remove(); }
          // Each item finds its own nearest free cell (so previews never overlap folders)
          const snapOccupied = new Map(occupiedAtStart);
          selIds.forEach((id, i) => {
            const sp = startPosMap[id]; if (!sp) return;
            const snapped = _snapFreeCell(sp.x + dx, sp.y + dy, snapOccupied);
            const cx = Math.round((snapped.x - 8) / GRID_X);
            const cy = Math.round((snapped.y - 8) / GRID_Y);
            snapOccupied.set(`${cx}_${cy}`, id);
            snapPreviewEls[i].style.left = snapped.x + 'px';
            snapPreviewEls[i].style.top  = snapped.y + 'px';
            snapPreviewEls[i].style.display = '';
          });
        }
      }
    };

    const onUp = async () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      _isDragging = false;
      snapPreviewEls.forEach(p => p.remove()); snapPreviewEls = [];
      fwSnapPreviewEls.forEach(p => p.remove()); fwSnapPreviewEls = [];
      if (hoverFolder) document.querySelectorAll(`.file-item[data-id="${hoverFolder}"]`).forEach(el => el.classList.remove('drag-target'));

      // Restore z-index (will be overwritten by next render anyway)
      this._sel.forEach(id => {
        const item = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
        if (item) item.style.zIndex = '';
      });

      if (moved) {
        // Check if dropped onto a folder window
        const dropTarget = document.elementFromPoint(lastX, lastY);
        const fwEl = dropTarget?.closest('.folder-window');
        const isChangingFolder = (fwEl && WinManager._wins.find(w => w.el === fwEl)) || hoverFolder;

        let blocked = null;
        if (isChangingFolder && typeof WinManager !== 'undefined') {
          const openFolderIds = new Set();
          WinManager._wins.forEach(w => {
            let cur = w.folderId;
            while (cur && cur !== 'root') { openFolderIds.add(cur); cur = (VFS.node(cur) || {}).parentId; }
          });
          // Determine drop target folder to skip items that would produce a cycle anyway
          const _targetFId = hoverFolder ||
            (fwEl ? WinManager._wins.find(w => w.el === fwEl)?.folderId : null);
          blocked = Array.from(this._sel).find(id => {
            const n = VFS.node(id);
            if (!n || n.type !== 'folder' || !openFolderIds.has(id)) return false;
            // If it's a cycle, the cycle check will handle it — don't pre-empt with wrong error
            if (_targetFId && VFS.wouldCycle(id, _targetFId)) return false;
            return true;
          });
        }
        if (blocked) {
          this._sel.forEach(id => {
            const item = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
            const sp   = startPosMap[id];
            if (item && sp) {
              item.style.transition = 'left 0.12s ease, top 0.12s ease';
              item.style.left = sp.x + 'px'; item.style.top = sp.y + 'px';
              setTimeout(() => { if (item.parentNode) item.style.transition = ''; }, 150);
            }
          });
          toast(`“${VFS.node(blocked)?.name}” is open in Explorer — close the window first`, 'error');
          return;
        }

        if (fwEl && !hoverFolder) {
          const winTarget = WinManager._wins.find(w => w.el === fwEl);
          if (winTarget) {
            // Pre-check duplicates before moving
            const targetChildren = VFS.children(winTarget.folderId);
            const existingNames  = new Set(targetChildren.map(n => n.name.toLowerCase()));
            const conflicts = [];
            this._sel.forEach(id => {
              const n = VFS.node(id); if (!n) return;
              if (n.parentId !== winTarget.folderId && existingNames.has(n.name.toLowerCase())) conflicts.push(n.name);
            });
            if (conflicts.length) {
              this._sel.forEach(id => {
                const item = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
                const sp   = startPosMap[id];
                if (item && sp) {
                  item.style.transition = 'left 0.12s ease, top 0.12s ease';
                  item.style.left = sp.x + 'px'; item.style.top = sp.y + 'px';
                  setTimeout(() => { if (item.parentNode) item.style.transition = ''; }, 150);
                }
              });
              toast(`Cannot move: "${conflicts[0]}" already exists in target folder`, 'error');
              return;
            }
            // Pre-check: verify no cycles before attempting any move
            const winCycled = [];
            this._sel.forEach(id => {
              if (VFS.wouldCycle(id, winTarget.folderId)) winCycled.push(VFS.node(id)?.name || id);
            });
            if (winCycled.length) {
              this._sel.forEach(id => {
                const item = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
                const sp   = startPosMap[id];
                if (item && sp) {
                  item.style.transition = 'left 0.12s ease, top 0.12s ease';
                  item.style.left = sp.x + 'px'; item.style.top = sp.y + 'px';
                  setTimeout(() => { if (item.parentNode) item.style.transition = ''; }, 150);
                }
              });
              toast(`Cannot move "${winCycled[0]}" into itself or a subfolder`, 'error');
              return;
            }
            // Smart drop: calculate position in target window at cursor location
            const targetArea = winTarget.el.querySelector('.fw-area');
            const tRect      = targetArea.getBoundingClientRect();
            const dropPosX   = lastX - tRect.left + targetArea.scrollLeft - clickOffX;
            const dropPosY   = lastY - tRect.top  + targetArea.scrollTop - clickOffY;
            const occupied   = new Map();
            VFS.children(winTarget.folderId).forEach(n => {
              const p = VFS.getPos(winTarget.folderId, n.id);
              if (p) occupied.set(`${Math.round((p.x-8)/GRID_X)}_${Math.round((p.y-8)/GRID_Y)}`, n.id);
            });
            const movedIds = [];
            const mainSp = startPosMap[node.id];
            this._sel.forEach(id => {
              const n = VFS.node(id); if (!n) return;
              const result = VFS.move(id, winTarget.folderId);
              if (result === 'duplicate') { toast(`"${n.name}" already exists in target folder`, 'error'); return; }
              if (result === 'cycle')     { toast(`Cannot move "${n.name}" into itself or a subfolder`, 'error'); return; }
              if (result !== 'ok')        { return; }
              const sp = startPosMap[id];
              const offX = sp && mainSp ? sp.x - mainSp.x : 0;
              const offY = sp && mainSp ? sp.y - mainSp.y : 0;
              const snapped = _snapFreeCell(dropPosX + offX, dropPosY + offY, occupied);
              VFS.setPos(winTarget.folderId, id, snapped.x, snapped.y);
              const cx = Math.round((snapped.x - 8) / GRID_X), cy = Math.round((snapped.y - 8) / GRID_Y);
              occupied.set(`${cx}_${cy}`, id);
              movedIds.push(id);
            });
            // Remove moved icons from desktop DOM and move selection
            winTarget.selection.clear();
            movedIds.forEach(id => {
              this._sel.delete(id);
              winTarget.selection.add(id);
              area.querySelector(`:scope > .file-item[data-id="${id}"]`)?.remove();
            });
            // Snap back items that failed to move (cycle/duplicate) to their start positions
            this._sel.forEach(id => {
              const item = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
              const sp   = startPosMap[id];
              if (item && sp) {
                item.style.transition = 'left 0.12s ease, top 0.12s ease';
                item.style.left = sp.x + 'px'; item.style.top = sp.y + 'px';
                setTimeout(() => { if (item.parentNode) item.style.transition = ''; }, 150);
              }
            });
            this._updateSelectionBar();
            this.updateTaskbar();
            await saveVFS();
            winTarget.render();
            return;
          }
        }
        if (hoverFolder) {
          // Pre-check: verify no cycles before moving anything
          const cycled = [];
          this._sel.forEach(id => {
            if (id === hoverFolder) return;
            if (VFS.wouldCycle(id, hoverFolder)) cycled.push(VFS.node(id)?.name || id);
          });
          if (cycled.length) {
            this._sel.forEach(id => {
              const item = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
              const sp   = startPosMap[id];
              if (item && sp) {
                item.style.transition = 'left 0.12s ease, top 0.12s ease';
                item.style.left = sp.x + 'px'; item.style.top = sp.y + 'px';
                setTimeout(() => { if (item.parentNode) item.style.transition = ''; }, 150);
              }
            });
            toast(`Cannot move "${cycled[0]}" into itself or a subfolder`, 'error');
            return;
          }
          // Pre-check: verify no duplicate names before moving anything
          const targetChildren = VFS.children(hoverFolder);
          const existingNames  = new Set(targetChildren.map(n => n.name.toLowerCase()));
          const conflicts = [];
          this._sel.forEach(id => {
            if (id === hoverFolder) return;
            const n = VFS.node(id); if (!n) return;
            if (existingNames.has(n.name.toLowerCase())) conflicts.push(n.name);
          });
          if (conflicts.length) {
            // Snap items back to their original positions
            this._sel.forEach(id => {
              const item = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
              const sp   = startPosMap[id];
              if (item && sp) {
                item.style.transition = 'left 0.12s ease, top 0.12s ease';
                item.style.left = sp.x + 'px'; item.style.top = sp.y + 'px';
                setTimeout(() => { if (item.parentNode) item.style.transition = ''; }, 150);
              }
            });
            toast(`Cannot move: "${conflicts[0]}" already exists in "${VFS.node(hoverFolder)?.name}"`, 'error');
            return;
          }
          const movedIds = [];
          this._sel.forEach(id => {
            if (id === hoverFolder) return;
            const n = VFS.node(id); if (!n) return;
            const result = VFS.move(id, hoverFolder);
            if (result === 'duplicate') { toast(`"${n.name}" already exists in "${VFS.node(hoverFolder)?.name}"`, 'error'); return; }
            if (result === 'cycle')     { toast(`Cannot move "${n.name}" into itself or a subfolder`, 'error'); return; }
            if (result !== 'ok')        { return; }
            movedIds.push(id);
          });
          // Remove moved icons from DOM and try to select in target window if open
          const targetWinForFolder = typeof WinManager !== 'undefined' ? WinManager._wins.find(w => w.folderId === hoverFolder) : null;
          if (targetWinForFolder) targetWinForFolder.selection.clear();
          
          movedIds.forEach(id => {
            this._sel.delete(id);
            if (targetWinForFolder) targetWinForFolder.selection.add(id);
            area.querySelector(`:scope > .file-item[data-id="${id}"]`)?.remove();
          });
          this._updateSelectionBar();
          this.updateTaskbar();
          await saveVFS();
          // Update any open window for the target folder
          if (typeof WinManager !== 'undefined') WinManager.renderAll();
        } else {
          // Build map of currently-occupied cells (excluding dragged items)
          const occupied = new Map();
          VFS.children(this._desktopFolder).forEach(n => {
            if (this._sel.has(n.id)) return;
            const p = VFS.getPos(this._desktopFolder, n.id);
            if (p) occupied.set(`${Math.round((p.x-8)/GRID_X)}_${Math.round((p.y-8)/GRID_Y)}`, n.id);
          });

          this._sel.forEach(id => {
            const item = document.querySelector(`#desktop-area > .file-item[data-id="${id}"]`);
            if (!item) return;
            const rawX = parseInt(item.style.left), rawY = parseInt(item.style.top);
            const snapped = _snapFreeCell(rawX, rawY, occupied);
            const cx = Math.round((snapped.x - 8) / GRID_X);
            const cy = Math.round((snapped.y - 8) / GRID_Y);
            occupied.set(`${cx}_${cy}`, id);
            // Smooth animate to snapped position
            item.style.transition = 'left 0.12s ease, top 0.12s ease';
            item.style.left = snapped.x + 'px';
            item.style.top  = snapped.y + 'px';
            setTimeout(() => { if (item.parentNode) item.style.transition = ''; }, 150);
            VFS.setPos(this._desktopFolder, id, snapped.x, snapped.y);
          });
          await saveVFS();
        }
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  },

  /* ---- Touch-drag for mobile: long-press (400ms) + drag icons ---- */
  _initTouchDrag(area) {
    // Only active on touch devices — no-op on desktop
    if (typeof window.ontouchstart === 'undefined' && !navigator.maxTouchPoints) return;

    let _touchDragNode = null, _touchDragEl = null;
    let _tdStartX = 0, _tdStartY = 0, _tdOffX = 0, _tdOffY = 0;
    let _tdMoved  = false, _tdTimer = null, _tdActive = false;
    let _tdStartPos = {}, _tdHoverFolder = null;

    area.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const iconEl = t.target?.closest('#desktop-area > .file-item[data-id]');
      if (!iconEl) return;

      const nodeId = iconEl.dataset.id;
      const node   = VFS.node(nodeId);
      if (!node) return;

      _tdMoved = false; _tdActive = false;
      _tdStartX = t.clientX; _tdStartY = t.clientY;
      const r = iconEl.getBoundingClientRect();
      _tdOffX = t.clientX - r.left;
      _tdOffY = t.clientY - r.top;

      _tdTimer = setTimeout(() => {
        if (_tdMoved) return;
        _tdActive = true;
        _touchDragNode = node;
        _touchDragEl   = iconEl;

        // Select this icon
        if (!this._sel.has(nodeId)) {
          this._sel.clear();
          area.querySelectorAll('.file-item.selected').forEach(i => i.classList.remove('selected'));
          this._sel.add(nodeId);
          iconEl.classList.add('selected');
          this._updateSelectionBar();
        }

        // Snapshot positions of all selected
        _tdStartPos = {};
        this._sel.forEach(id => {
          const el = area.querySelector(`:scope > .file-item[data-id="${id}"]`);
          if (el) _tdStartPos[id] = { x: parseInt(el.style.left), y: parseInt(el.style.top) };
        });

        iconEl.classList.add('dragging');
        _cancelHoverTooltip();
        e.preventDefault();
      }, 400);
    }, { passive: true });

    area.addEventListener('touchmove', e => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - _tdStartX, dy = t.clientY - _tdStartY;
      if (Math.abs(dx) + Math.abs(dy) > 5) _tdMoved = true;

      if (!_tdActive || !_touchDragNode) return;
      e.preventDefault();

      const areaRect = area.getBoundingClientRect();
      const mainSp   = _tdStartPos[_touchDragNode.id];
      const rawX     = t.clientX - areaRect.left + area.scrollLeft - _tdOffX;
      const rawY     = t.clientY - areaRect.top  + area.scrollTop  - _tdOffY;
      const ddx      = rawX - mainSp.x, ddy = rawY - mainSp.y;

      this._sel.forEach(id => {
        const el = area.querySelector(`:scope > .file-item[data-id="${id}"]`);
        const sp = _tdStartPos[id];
        if (el && sp) { el.style.left = (sp.x + ddx) + 'px'; el.style.top = (sp.y + ddy) + 'px'; }
      });

      // Highlight folder under finger
      this._sel.forEach(id => {
        const el = area.querySelector(`:scope > .file-item[data-id="${id}"]`);
        if (el) el.style.pointerEvents = 'none';
      });
      const hit = document.elementFromPoint(t.clientX, t.clientY);
      this._sel.forEach(id => {
        const el = area.querySelector(`:scope > .file-item[data-id="${id}"]`);
        if (el) el.style.pointerEvents = '';
      });
      const folderEl = hit?.closest('.file-item[data-id]');
      const newHover = folderEl && !this._sel.has(folderEl.dataset.id) &&
                       VFS.node(folderEl.dataset.id)?.type === 'folder' ? folderEl.dataset.id : null;
      if (newHover !== _tdHoverFolder) {
        if (_tdHoverFolder) area.querySelector(`.file-item[data-id="${_tdHoverFolder}"]`)?.classList.remove('drag-target');
        _tdHoverFolder = newHover;
        if (_tdHoverFolder && folderEl) folderEl.classList.add('drag-target');
      }
    }, { passive: false });

    area.addEventListener('touchend', async e => {
      if (_tdTimer) { clearTimeout(_tdTimer); _tdTimer = null; }
      if (!_tdActive || !_touchDragNode) { _tdActive = false; _touchDragNode = null; return; }
      _tdActive = false;

      const node = _touchDragNode; _touchDragNode = null;
      _touchDragEl?.classList.remove('dragging');
      if (_tdHoverFolder) area.querySelector(`.file-item[data-id="${_tdHoverFolder}"]`)?.classList.remove('drag-target');

      const occupied = new Map();
      if (_tdHoverFolder) {
        // Move into folder
        const cycled = [...this._sel].filter(id => id !== _tdHoverFolder && VFS.wouldCycle(id, _tdHoverFolder));
        if (cycled.length) {
          _snapBack(_tdStartPos); toast(`Cannot move "${VFS.node(cycled[0])?.name}" into itself`, 'error'); return;
        }
        const tgtChildren = VFS.children(_tdHoverFolder);
        const existing    = new Set(tgtChildren.map(n => n.name.toLowerCase()));
        const dupe = [...this._sel].find(id => id !== _tdHoverFolder && existing.has(VFS.node(id)?.name?.toLowerCase()));
        if (dupe) {
          _snapBack(_tdStartPos); toast(`"${VFS.node(dupe)?.name}" already exists in target folder`, 'error'); return;
        }
        const moved = [];
        this._sel.forEach(id => {
          if (id === _tdHoverFolder) return;
          if (VFS.move(id, _tdHoverFolder) === 'ok') { moved.push(id); area.querySelector(`:scope > .file-item[data-id="${id}"]`)?.remove(); }
        });
        moved.forEach(id => this._sel.delete(id));
        _tdHoverFolder = null;
      } else {
        // Snap to grid in place
        VFS.children(this._desktopFolder).forEach(n => {
          if (this._sel.has(n.id)) return;
          const p = VFS.getPos(this._desktopFolder, n.id);
          if (p) occupied.set(`${Math.round((p.x-8)/GRID_X)}_${Math.round((p.y-8)/GRID_Y)}`, n.id);
        });
        this._sel.forEach(id => {
          const el = area.querySelector(`:scope > .file-item[data-id="${id}"]`);
          if (!el) return;
          const snapped = _snapFreeCell(parseInt(el.style.left), parseInt(el.style.top), occupied);
          const cx = Math.round((snapped.x - 8) / GRID_X), cy = Math.round((snapped.y - 8) / GRID_Y);
          occupied.set(`${cx}_${cy}`, id);
          el.style.transition = 'left .12s ease,top .12s ease';
          el.style.left = snapped.x + 'px'; el.style.top = snapped.y + 'px';
          setTimeout(() => { if (el.parentNode) el.style.transition = ''; }, 150);
          VFS.setPos(this._desktopFolder, id, snapped.x, snapped.y);
        });
      }
      this._updateSelectionBar(); this.updateTaskbar(); await saveVFS();
      if (typeof WinManager !== 'undefined') WinManager.renderAll();

      function _snapBack(startPos) {
        Object.entries(startPos).forEach(([id, sp]) => {
          const el = area.querySelector(`:scope > .file-item[data-id="${id}"]`);
          if (el && sp) {
            el.style.transition = 'left .12s ease,top .12s ease';
            el.style.left = sp.x + 'px'; el.style.top = sp.y + 'px';
            setTimeout(() => { if (el.parentNode) el.style.transition = ''; }, 150);
          }
        });
      }
    });
  },

  _openNode(node) {
    hideCtxMenu();
    if (node.type === 'folder') {
      // Folders always open in a new floating window
      WinManager.open(node.id);
    } else {
      openFile(node);
    }
  },

  _contextIcon(e, node) {
    if (!e.ctrlKey && !e.metaKey && !this._sel.has(node.id)) {
      this._sel.clear();
      document.querySelectorAll('#desktop-area > .file-item.selected').forEach(i => i.classList.remove('selected'));
    }
    this._sel.add(node.id);
    document.querySelector(`#desktop-area > .file-item[data-id="${node.id}"]`)?.classList.add('selected');
    this._updateSelectionBar();
    const _sync = () => { App.folder = this._desktopFolder; App.selection = this._sel; App._winCtx = null; };
    const items = [];

    if (node.type === 'folder') {
      items.push({ label: 'Open',               icon: Icons.open,      action: () => WinManager.open(node.id) });
      items.push({ label: 'Open in New Window', icon: Icons.newfolder, action: () => WinManager.open(node.id) });
      items.push({ label: 'Folder Color', icon: Icons.folder, submenu: FOLDER_COLORS.map(fc => ({
        label: fc.label,
        icon: `<span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:${fc.color}"></span>`,
        action: async () => { node.color = fc.color === '#0078d4' ? undefined : fc.color; await saveVFS(); Desktop._patchIcons(); }
      }))});
    } else {
      items.push({ label: 'Open',               icon: Icons.file,     action: () => this._openNode(node) });
      items.push({ label: 'Edit as plain text', icon: Icons.rename, action: () => openFileAsText(node) });
      items.push({ label: 'Export',             icon: Icons.download, action: () => downloadFile(node) });
    }
    items.push({ label: 'Export as ZIP', icon: Icons.download, action: () => exportAsZip([...this._sel]) });
    items.push({ sep: true });
    items.push({ label: 'Copy', icon: Icons.copy, action: () => { _sync(); copyItems(); } });
    items.push({ label: 'Cut',  icon: Icons.cut,  action: () => { _sync(); cutItems(); } });
    items.push({ sep: true });
    items.push({ label: 'Rename', icon: Icons.rename, action: () => renameNode(node) });
    items.push({ sep: true });
    if (this._sel.size > 1) {
      items.push({ label: `Delete ${this._sel.size} items`, icon: Icons.trash, danger: true, action: () => { _sync(); deleteSelected(); } });
    } else {
      items.push({ label: 'Delete', icon: Icons.trash, danger: true, action: () => { _sync(); deleteSelected(); } });
    }
    items.push({ sep: true });
    items.push({ label: 'Properties', icon: Icons.info, action: () => showProps(node) });
    showCtxMenu(e.clientX, e.clientY, items);
  },

  _contextDesktop(e) {
    this._sel.clear();
    document.querySelectorAll('#desktop-area > .file-item.selected').forEach(i => i.classList.remove('selected'));
    this._updateSelectionBar();
    const _sync = () => { App.folder = this._desktopFolder; App.selection = this._sel; App._winCtx = null; };
    const items = [
      { label: 'New Text File',  icon: Icons.newfile,   action: () => { _sync(); App._ctxScreenPos = { x: e.clientX, y: e.clientY }; newTextFile(); } },
      { label: 'New Folder',     icon: Icons.newfolder, action: () => { _sync(); App._ctxScreenPos = { x: e.clientX, y: e.clientY }; newFolder(); } },
      { sep: true },
      { label: 'Import Files...', icon: Icons.upload, action: () => { _sync(); document.getElementById('file-input').click(); } },
    ];
    if (App.clipboard) {
      items.push({ sep: true });
      items.push({ label: 'Paste', icon: Icons.paste, action: () => { _sync(); pasteItems(); } });
    }
    const sortSub = [
      { label: 'By Name', icon: Icons.sortName, submenu: [
        { label: 'A → Z',  icon: Icons.sortAsc,  action: () => sortIcons('name',  'asc')  },
        { label: 'Z → A',  icon: Icons.sortDesc, action: () => sortIcons('name',  'desc') },
      ]},
      { label: 'By Date Modified', icon: Icons.sortDate, submenu: [
        { label: 'Newest first', icon: Icons.sortDesc, action: () => sortIcons('mtime', 'desc') },
        { label: 'Oldest first', icon: Icons.sortAsc,  action: () => sortIcons('mtime', 'asc')  },
      ]},
      { label: 'By Date Created', icon: Icons.sortDate, submenu: [
        { label: 'Newest first', icon: Icons.sortDesc, action: () => sortIcons('ctime', 'desc') },
        { label: 'Oldest first', icon: Icons.sortAsc,  action: () => sortIcons('ctime', 'asc')  },
      ]},
      { sep: true },
      { label: 'By Size', icon: Icons.sortSize, submenu: [
        { label: 'Largest first',  icon: Icons.sortDesc, action: () => sortIcons('size',  'desc') },
        { label: 'Smallest first', icon: Icons.sortAsc,  action: () => sortIcons('size',  'asc')  },
      ]},
      { sep: true },
      { label: 'By Type', icon: Icons.sortType, action: () => sortIcons('type',  'asc')  },
    ];
    items.push({ sep: true });
    items.push({ label: 'Sort', icon: Icons.sort, submenu: sortSub });
    items.push({ sep: true });
    items.push({ label: 'Refresh', icon: Icons.refresh, action: () => { Desktop._renderIcons(); if (typeof WinManager !== 'undefined') WinManager.renderAll(); } });
    showCtxMenu(e.clientX, e.clientY, items);
  },

  _updateSelectionBar() {
    const bar = document.getElementById('selection-bar');
    if (this._sel.size > 0) {
      const totalSz = [...this._sel].reduce((s, id) => {
        const n = VFS.node(id); return s + (n && n.size ? n.size : 0);
      }, 0);
      bar.textContent = `${this._sel.size} item${this._sel.size !== 1 ? 's' : ''} selected${totalSz > 0 ? ' · ' + fmtSize(totalSz) : ''}`;
      bar.classList.add('show');
    } else {
      bar.classList.remove('show');
    }
  },

  updateTaskbar() {
    if (!App.container) return;
    const tot  = App.container.totalSize || 0;
    const pct  = Math.min(tot / CONTAINER_LIMIT * 100, 100);
    const cls  = pct > 90 ? 'danger' : pct > 70 ? 'warn' : '';
    document.getElementById('taskbar-name').textContent      = App.container.name;
    document.getElementById('taskbar-size-text').textContent = `${fmtSize(tot)} / ${fmtSize(CONTAINER_LIMIT)}`;
    document.getElementById('taskbar-size-pct').textContent  = pct.toFixed(1) + '%';
    const bar = document.getElementById('taskbar-bar-fill');
    bar.style.width = pct + '%';
    bar.className   = 'taskbar-bar-fill ' + cls;
  },

  initEvents() {
    const area = document.getElementById('desktop-area');
    // Mobile touch-drag for icons
    this._initTouchDrag(area);

    area.addEventListener('contextmenu', e => {
      if (e.target === area || e.target.classList.contains('drop-overlay') ||
          e.target.classList.contains('selection-bar')) {
        e.preventDefault();
        this._contextDesktop(e);
      }
    });

    area.addEventListener('mousedown', e => {
      if (e.target !== area) return;
      if (!e.ctrlKey && !e.metaKey) {
        this._sel.clear();
        document.querySelectorAll('#desktop-area > .file-item.selected').forEach(i => i.classList.remove('selected'));
        this._updateSelectionBar();
      }
      this._startRubberBand(e);
    });

    area.addEventListener('keydown', e => this._onKey(e));

    let _deskDndHoverFolder = null;
    area.addEventListener('dragover', e => {
      e.preventDefault();
      const overFW = !!e.target.closest('.folder-window');
      if (!overFW) {
        const folderEl = e.target?.closest?.('#desktop-area > .file-item[data-id]');
        const newHover = folderEl && VFS.node(folderEl.dataset.id)?.type === 'folder' ? folderEl.dataset.id : null;
        if (newHover !== _deskDndHoverFolder) {
          if (_deskDndHoverFolder) document.querySelector(`#desktop-area > .file-item[data-id="${_deskDndHoverFolder}"]`)?.classList.remove('drag-target');
          _deskDndHoverFolder = newHover;
          if (_deskDndHoverFolder) document.querySelector(`#desktop-area > .file-item[data-id="${_deskDndHoverFolder}"]`)?.classList.add('drag-target');
        }
      }
      document.getElementById('drop-overlay').classList.toggle('show', !overFW && !_deskDndHoverFolder);
    });
    area.addEventListener('dragleave', e => {
      if (!area.contains(e.relatedTarget)) {
        if (_deskDndHoverFolder) document.querySelector(`#desktop-area > .file-item[data-id="${_deskDndHoverFolder}"]`)?.classList.remove('drag-target');
        _deskDndHoverFolder = null;
        document.getElementById('drop-overlay').classList.remove('show');
      }
    });
    area.addEventListener('drop', e => {
      e.preventDefault();
      if (_deskDndHoverFolder) document.querySelector(`#desktop-area > .file-item[data-id="${_deskDndHoverFolder}"]`)?.classList.remove('drag-target');
      const targetFolderId = _deskDndHoverFolder || this._desktopFolder;
      _deskDndHoverFolder = null;
      document.getElementById('drop-overlay').classList.remove('show');
      App._winCtx   = null;
      App.folder    = targetFolderId;
      App.selection = this._sel;
      uploadEntries(e.dataTransfer.items, targetFolderId);
    });

    /* ---- Touch: long-press context menu on desktop area ---- */
    let _lpTimer = null, _lpMoved = false;
    area.addEventListener('touchstart', e => {
      _lpMoved = false;
      const t = e.touches[0];
      _lpTimer = setTimeout(() => {
        if (_lpMoved) return;
        const target = document.elementFromPoint(t.clientX, t.clientY);
        const iconEl = target?.closest('#desktop-area > .file-item[data-id]');
        if (!iconEl) {
          this._contextDesktop({ clientX: t.clientX, clientY: t.clientY, preventDefault(){}, stopPropagation(){} });
        }
      }, 500);
    }, { passive: true });
    area.addEventListener('touchmove', () => { _lpMoved = true; if (_lpTimer) { clearTimeout(_lpTimer); _lpTimer = null; } }, { passive: true });
    area.addEventListener('touchend', () => { if (_lpTimer) { clearTimeout(_lpTimer); _lpTimer = null; } }, { passive: true });

    // Global: dismiss context menu on any LMB click outside the menu
    document.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      if (e.target.closest('#ctx-menu, #ctx-menu-sub, body > .ctx-menu')) return;
      hideCtxMenu();
    });
  },

  _startRubberBand(e) {
    const area = document.getElementById('desktop-area');
    const rect = area.getBoundingClientRect();
    const sx   = e.clientX - rect.left + area.scrollLeft;
    const sy   = e.clientY - rect.top  + area.scrollTop;
    const band = document.createElement('div');
    band.className = 'rubberband';
    band.style.cssText = `left:${sx}px;top:${sy}px;width:0;height:0`;
    area.appendChild(band);

    const onMove = mv => {
      const cx = mv.clientX - rect.left + area.scrollLeft;
      const cy = mv.clientY - rect.top  + area.scrollTop;
      const x  = Math.min(sx, cx), y = Math.min(sy, cy);
      const w  = Math.abs(cx - sx), h = Math.abs(cy - sy);
      band.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
      const bx1 = x, by1 = y, bx2 = x + w, by2 = y + h;
      document.querySelectorAll('#desktop-area > .file-item').forEach(item => {
        const ix = parseInt(item.style.left), iy = parseInt(item.style.top);
        const hit = ix < bx2 && (ix + ICON_W) > bx1 && iy < by2 && (iy + ICON_H) > by1;
        if (hit) { this._sel.add(item.dataset.id); item.classList.add('selected'); }
        else if (!e.ctrlKey && !e.metaKey) { this._sel.delete(item.dataset.id); item.classList.remove('selected'); }
      });
      this._updateSelectionBar();
    };
    const onUp = () => { band.remove(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  },

  _onKey(e) {
    const _syncCtx = () => { App.folder = this._desktopFolder; App.selection = this._sel; App._winCtx = null; };
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this._sel.size > 0) { _syncCtx(); deleteSelected(); }
    } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC') {
      if (this._sel.size > 0) { _syncCtx(); copyItems(); }
    } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyX') {
      if (this._sel.size > 0) { _syncCtx(); cutItems(); }
    } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV') {
      _syncCtx(); pasteItems();
    } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyA') {
      _syncCtx(); selectAll();
    } else if (e.key === 'Escape') {
      if (App.clipboard?.op === 'cut') cancelClipboard();
      this._sel.clear();
      document.querySelectorAll('#desktop-area > .file-item.selected').forEach(i => i.classList.remove('selected'));
      this._updateSelectionBar();
    } else if (e.key === 'F2') {
      if (this._sel.size === 1) renameNode(VFS.node([...this._sel][0]));
    } else if (e.key === 'F5') {
      e.preventDefault();
      Desktop._renderIcons();
      if (typeof WinManager !== 'undefined') WinManager.renderAll();
    }
  }
};

/* ============================================================
   FOLDER WINDOW MANAGER
   ============================================================ */
const WinManager = {
  _wins: [],
  _z:    300,

  open(folderId) {
    hideCtxMenu();
    // Auto-cancel cut if the opened folder (or its ancestor) is in the clipboard
    if (App.clipboard?.op === 'cut') {
      const cutIds = new Set(App.clipboard.ids);
      let cur = folderId;
      while (cur && cur !== 'root') {
        if (cutIds.has(cur)) { cancelClipboard(); break; }
        cur = (VFS.node(cur) || {}).parentId;
      }
    }
    // Bring existing window to front if already open
    const existing = this._wins.find(w => w.folderId === folderId && !w._navStack.length);
    if (existing) { existing.bringToFront(); return existing; }
    const win = new FolderWindow(folderId);
    this._wins.push(win);
    return win;
  },

  close(win) {
    this._wins = this._wins.filter(w => w !== win);
    win.el.remove();
  },

  closeAll() {
    this._wins.forEach(w => w.el.remove());
    this._wins = [];
  },

  renderAll() {
    this._wins.forEach(w => w.render());
  },

  nextZ() { return ++this._z; }
};

/* ============================================================
   FOLDER WINDOW  (floating explorer)
   ============================================================ */
class FolderWindow {
  constructor(folderId) {
    this.folderId  = folderId;
    this.selection = new Set();
    this._navStack = [];  // for back navigation (not used in default: navigate in window)
    this.el        = null;
    this._build();
  }

  /* ---- DOM BUILD ---- */
  _build() {
    const node   = VFS.node(this.folderId);
    const el     = document.createElement('div');
    el.className = 'folder-window';
    el.style.zIndex = WinManager.nextZ();

    // Cascade position
    const area  = document.getElementById('desktop-area');
    const count = WinManager._wins.length;
    const defW  = 680, defH = 440;
    const cx = Math.max(20, Math.min((area.clientWidth  - defW) / 2 + count * 28, area.clientWidth  - defW - 10));
    const cy = Math.max(20, Math.min((area.clientHeight - defH) / 2 + count * 28, area.clientHeight - defH - 10));
    el.style.left   = cx + 'px';
    el.style.top    = cy + 'px';
    el.style.width  = defW + 'px';
    el.style.height = defH + 'px';

    el.innerHTML = `
      <div class="fw-titlebar">
        <div class="fw-drag-area">
          <span class="fw-folder-icon">${getFolderSVG(node.color)}</span>
          <span class="fw-title">${escHtml(node.name)}</span>
        </div>
        <div class="fw-controls">
          <button class="fw-btn fw-btn-navup" title="Go up">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
            </svg>
          </button>
          <button class="fw-btn fw-btn-close close" title="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="fw-toolbar">
        <button class="btn btn-ghost btn-sm fw-btn-upload">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5 8V1M3 4.5l3.5-3.5 3.5 3.5M1 10h11v2H1z" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/>
          </svg>
          Import
        </button>
        <button class="btn btn-ghost btn-sm fw-btn-newfile">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 1h6l3 3v8H2z" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/>
            <path d="M8 1v3h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/>
            <path d="M6.5 6v3M5 7.5h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/>
          </svg>
          New File
        </button>
        <button class="btn btn-ghost btn-sm fw-btn-newfolder">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 3h4l1.5 2H12v7H1z" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/>
            <path d="M6.5 6.5v2.5M5.2 7.8h2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/>
          </svg>
          New Folder
        </button>
        <div class="fw-breadcrumb" id="fw-bc-${this.folderId}"></div>
      </div>
      <div class="fw-area" tabindex="0">
        <div class="fw-drop-overlay">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 8v24M12 20l12-12 12 12M8 36h32v4H8z" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"/></svg>
          Drop files to import
        </div>
      </div>
      <div class="fw-statusbar">
        <span class="fw-status-text">0 items</span>
      </div>
      <div class="fw-resize-handle"></div>
    `;

    this.el = el;
    area.appendChild(el);
    this._bindEvents();
    this.render();
  }

  /* ---- EVENTS ---- */
  _bindEvents() {
    const el = this.el;
    el.addEventListener('mousedown', () => this.bringToFront(), true);

    // Title bar drag (move window)
    this._makeDraggable(el.querySelector('.fw-drag-area'));

    // Buttons
    el.querySelector('.fw-btn-close').addEventListener('click', e => {
      e.stopPropagation(); WinManager.close(this);
    });
    el.querySelector('.fw-btn-navup').addEventListener('click', e => {
      e.stopPropagation();
      const n = VFS.node(this.folderId);
      if (n && n.parentId && n.parentId !== 'root') { this.folderId = n.parentId; this.selection.clear(); this.render(); }
    });
    el.querySelector('.fw-btn-upload').addEventListener('click', e => {
      e.stopPropagation();
      this._setCtx();
      document.getElementById('file-input').click();
    });
    el.querySelector('.fw-btn-newfile').addEventListener('click', e => {
      e.stopPropagation(); App._ctxScreenPos = null; this._setCtx(); newTextFile();
    });
    el.querySelector('.fw-btn-newfolder').addEventListener('click', e => {
      e.stopPropagation(); App._ctxScreenPos = null; this._setCtx(); newFolder();
    });

    // Content area events
    const area = el.querySelector('.fw-area');
    area.addEventListener('contextmenu', e => {
      if (e.target === area) { e.preventDefault(); e.stopPropagation(); this._ctxDesktop(e); }
    });
    area.addEventListener('mousedown', e => {
      if (e.target !== area) return;
      hideCtxMenu();
      area.focus();
      if (!e.ctrlKey && !e.metaKey) {
        this.selection.clear();
        area.querySelectorAll('.file-item.selected').forEach(i => i.classList.remove('selected'));
        this._updateStatus();
      }
      this._startRubberBand(e);
    });
    area.addEventListener('keydown', e => this._onKey(e));
    const fwDropOv = area.querySelector('.fw-drop-overlay');
    let _fwDndHoverFolder = null;
    area.addEventListener('dragover', e => {
      e.preventDefault();
      const folderEl = e.target?.closest?.('.file-item[data-id]');
      const newHover = folderEl && VFS.node(folderEl.dataset.id)?.type === 'folder' ? folderEl.dataset.id : null;
      if (newHover !== _fwDndHoverFolder) {
        if (_fwDndHoverFolder) area.querySelector(`.file-item[data-id="${_fwDndHoverFolder}"]`)?.classList.remove('drag-target');
        _fwDndHoverFolder = newHover;
        if (_fwDndHoverFolder) area.querySelector(`.file-item[data-id="${_fwDndHoverFolder}"]`)?.classList.add('drag-target');
      }
      if (fwDropOv) fwDropOv.classList.toggle('show', !_fwDndHoverFolder);
    });
    area.addEventListener('dragleave', e => {
      if (!area.contains(e.relatedTarget)) {
        if (_fwDndHoverFolder) area.querySelector(`.file-item[data-id="${_fwDndHoverFolder}"]`)?.classList.remove('drag-target');
        _fwDndHoverFolder = null;
        if (fwDropOv) fwDropOv.classList.remove('show');
      }
    });
    area.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation(); // prevent desktop from also receiving this drop
      if (_fwDndHoverFolder) area.querySelector(`.file-item[data-id="${_fwDndHoverFolder}"]`)?.classList.remove('drag-target');
      const targetFolderId = _fwDndHoverFolder || this.folderId;
      _fwDndHoverFolder = null;
      if (fwDropOv) fwDropOv.classList.remove('show');
      App._winCtx   = this;
      App.folder    = targetFolderId;
      App.selection = this.selection;
      uploadEntries(e.dataTransfer.items, targetFolderId);
    });

    /* ---- Touch: long-press context menu in folder window ---- */
    let _fwLpTimer = null, _fwLpMoved = false;
    area.addEventListener('touchstart', e => {
      _fwLpMoved = false;
      const t = e.touches[0];
      _fwLpTimer = setTimeout(() => {
        if (_fwLpMoved) return;
        const target = document.elementFromPoint(t.clientX, t.clientY);
        const iconEl = target?.closest('.file-item[data-id]');
        if (!iconEl) {
          this._ctxDesktop({ clientX: t.clientX, clientY: t.clientY, preventDefault(){}, stopPropagation(){} });
        }
      }, 500);
    }, { passive: true });
    area.addEventListener('touchmove', () => { _fwLpMoved = true; if (_fwLpTimer) { clearTimeout(_fwLpTimer); _fwLpTimer = null; } }, { passive: true });
    area.addEventListener('touchend', () => { if (_fwLpTimer) { clearTimeout(_fwLpTimer); _fwLpTimer = null; } }, { passive: true });

    this._addResizeHandle();
  }

  /* ---- SET CONTEXT for modal-based and async ops ---- */
  _setCtx() {
    App._winCtx   = this;
    App.folder    = this.folderId;
    App.selection = this.selection;
  }

  /* ---- SET CONTEXT for sync ops (save+restore immediately) ---- */
  _withCtxSync(fn) {
    const pF = App.folder, pS = App.selection, pW = App._winCtx;
    App.folder = this.folderId; App.selection = this.selection; App._winCtx = this;
    try { fn(); } finally { App.folder = pF; App.selection = pS; App._winCtx = pW; }
  }

  /* ---- WINDOW DRAG ---- */
  _makeDraggable(handle) {
    handle.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      const startMouseX = e.clientX, startMouseY = e.clientY;
      const startLeft   = parseInt(this.el.style.left) || 0;
      const startTop    = parseInt(this.el.style.top)  || 0;
      const onMove = mv => {
        const area = document.getElementById('desktop-area');
        const maxL = area.clientWidth  - this.el.offsetWidth;
        const maxT = area.clientHeight - this.el.offsetHeight;
        this.el.style.left = Math.max(0, Math.min(maxL, startLeft + mv.clientX - startMouseX)) + 'px';
        this.el.style.top  = Math.max(0, Math.min(maxT, startTop  + mv.clientY - startMouseY)) + 'px';
      };
      const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
  }

  bringToFront() { this.el.style.zIndex = WinManager.nextZ(); }

  /* ---- RENDER ---- */
  render() {
    const node  = VFS.node(this.folderId);
    if (!node) { WinManager.close(this); return; }

    // Update title — full path
    this.el.querySelector('.fw-title').textContent = VFS.fullPath(this.folderId);
    // Update title bar folder icon (reflects current color)
    const _folderIconEl = this.el.querySelector('.fw-folder-icon');
    if (_folderIconEl) _folderIconEl.innerHTML = getFolderSVG(node.color);

    // Update breadcrumb inside toolbar
    const bcId = `fw-bc-${this.el.querySelector('.fw-breadcrumb').id.replace('fw-bc-', '')}`;
    const bc   = this.el.querySelector('.fw-breadcrumb');
    bc.innerHTML = '';
    VFS.breadcrumb(this.folderId).forEach((n, i, arr) => {
      if (i === 0) return; // skip root
      const sp = document.createElement('span');
      sp.className   = 'fw-bc-item' + (i === arr.length - 1 ? ' current' : '');
      sp.textContent = n.name;
      if (i < arr.length - 1) sp.addEventListener('click', () => { this.folderId = n.id; this.selection.clear(); this.render(); });
      bc.appendChild(sp);
      if (i < arr.length - 1) { const s = document.createElement('span'); s.className = 'fw-bc-sep'; s.textContent = ' › '; bc.appendChild(s); }
    });

    // Render icons — incremental when same folder to avoid flash, full rebuild on navigation
    const area = this.el.querySelector('.fw-area');
    const folderChanged = this._renderedFolderId !== this.folderId;
    this._renderedFolderId = this.folderId;

    const items = VFS.children(this.folderId);
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    if (folderChanged) {
      area.querySelectorAll('.file-item').forEach(e => e.remove());
      items.forEach((n, idx) => {
        let pos = VFS.getPos(this.folderId, n.id);
        if (!pos) {
          pos = VFS.autoPos(this.folderId, idx, area);
          VFS.setPos(this.folderId, n.id, pos.x, pos.y);
        }
        area.appendChild(this._makeIcon(n, pos, idx));
      });
    } else {
      const nodeMap = new Map(items.map(n => [n.id, n]));
      // Animate out removed items, then add new ones
      area.querySelectorAll('.file-item').forEach(el => {
        if (!nodeMap.has(el.dataset.id)) {
          el.style.transition = 'opacity .1s, transform .1s';
          el.style.opacity = '0'; el.style.transform = 'scale(.85)';
          setTimeout(() => el.remove(), 110);
        }
      });
      items.forEach((n, idx) => {
        let pos = VFS.getPos(this.folderId, n.id);
        if (!pos) {
          pos = VFS.autoPos(this.folderId, idx, area);
          VFS.setPos(this.folderId, n.id, pos.x, pos.y);
        }
        const existing = area.querySelector(`.file-item[data-id="${n.id}"]`);
        if (existing) {
          const nameEl = existing.querySelector('.file-name');
          if (nameEl && nameEl.textContent !== n.name) nameEl.textContent = n.name;
          if (n.type === 'folder') {
            const thumbEl = existing.querySelector('.file-thumb.folder-icon');
            if (thumbEl) thumbEl.innerHTML = getFolderSVG(n.color);
          }
        } else {
          area.appendChild(this._makeIcon(n, pos, idx));
        }
      });
    }

    this._updateStatus();
    if (typeof _applyCutStyles !== 'undefined') _applyCutStyles();
    // Sync grid dots setting with this window
    const s = _getSettings();
    area.classList.toggle('no-grid-dots', !s.gridDots);
  }

  /* ---- MAKE ICON (for this window) ---- */
  _makeIcon(node, pos, idx = 0) {
    const div = _buildIconEl(node, pos);
    if (this.selection.has(node.id)) div.classList.add('selected');
    div.style.animation = `iconPop 0.12s ease ${Math.min(idx * 15, 200)}ms both`;

    div.addEventListener('mousedown', e => this._onIconMousedown(e, div, node));
    div.addEventListener('dblclick',  e => { e.stopPropagation(); this._openNode(node); });
    div.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); this._ctxIcon(e, node); });
    // Mobile: single tap → context menu, double tap → open
    { let _ts = 0, _tm = false, _lastTap = 0;
      div.addEventListener('touchstart', () => { _ts = Date.now(); _tm = false; }, { passive: true });
      div.addEventListener('touchmove',  () => { _tm = true; }, { passive: true });
      div.addEventListener('touchend', e => {
        if (_tm || Date.now() - _ts > 350) return;
        e.preventDefault();
        const now = Date.now(), t = e.changedTouches[0];
        if (now - _lastTap < 300) { _lastTap = 0; this._openNode(node); }
        else { _lastTap = now; this._ctxIcon({ clientX: t.clientX, clientY: t.clientY, ctrlKey: false, metaKey: false, preventDefault(){}, stopPropagation(){} }, node); }
      }); }
    return div;
  }

  /* ---- ICON DRAG (within window + escape to desktop/other windows) ---- */
  _onIconMousedown(e, el, node) {
    if (e.button !== 0) return;
    hideCtxMenu();
    e.stopPropagation(); e.preventDefault();
    _cancelHoverTooltip();

    if (!e.ctrlKey && !e.metaKey && !this.selection.has(node.id)) {
      this.selection.clear();
      this.el.querySelectorAll('.fw-area > .file-item.selected').forEach(i => i.classList.remove('selected'));
    }
    this.selection.add(node.id);
    el.classList.add('selected');
    this._updateStatus();

    const fwArea    = this.el.querySelector('.fw-area');
    fwArea.focus();
    const startX    = e.clientX, startY = e.clientY;
    const startScrollX = fwArea.scrollLeft, startScrollY = fwArea.scrollTop;
    // Remember click offset within the icon for ghost positioning
    const elRect = el.getBoundingClientRect();
    const clickOffX = e.clientX - elRect.left;
    const clickOffY = e.clientY - elRect.top;
    const startPosMap = {};
    this.selection.forEach(id => {
      const item = fwArea.querySelector(`.file-item[data-id="${id}"]`);
      if (item) startPosMap[id] = { x: parseInt(item.style.left), y: parseInt(item.style.top) };
    });
    // Build occupied map for snap preview (exclude dragged items)
    const fwOccupiedAtStart = new Map();
    VFS.children(this.folderId).forEach(n => {
      if (this.selection.has(n.id)) return;
      const p = VFS.getPos(this.folderId, n.id);
      if (p) fwOccupiedAtStart.set(`${Math.round((p.x-8)/GRID_X)}_${Math.round((p.y-8)/GRID_Y)}`, n.id);
    });
    let snapPreviewEls = [];
    let deskSnapPreviewEls = []; // snap previews on desktop when dragging out of window
    let winSnapPreviewEls = [];  // snap previews inside a target folder window
    let moved = false, escaped = false, hoverFolder = null, hoverWin = null;
    // Ghost clones placed in desktop-area when dragging outside fw
    let ghostEls = [];

    const fwRect = () => this.el.getBoundingClientRect();

    const onMove = mv => {
      const r = fwRect();
      const fwAreaRect = fwArea.getBoundingClientRect();
      const mainPos = startPosMap[node.id];
      const targetMainX = mv.clientX - fwAreaRect.left + fwArea.scrollLeft - clickOffX;
      const targetMainY = mv.clientY - fwAreaRect.top + fwArea.scrollTop - clickOffY;
      const dx = targetMainX - mainPos.x;
      const dy = targetMainY - mainPos.y;
      if (!moved && Math.abs(mv.clientX - startX) + Math.abs(mv.clientY - startY) > 4) {
        moved = true; _isDragging = true; _cancelHoverTooltip();
      }
      const outsideWindow = mv.clientX < r.left || mv.clientX > r.right ||
                            mv.clientY < r.top  || mv.clientY > r.bottom;

      // Re-enter source window: cancel escape, remove ghosts, restore originals
      if (!outsideWindow && escaped) {
        escaped = false;
        ghostEls.forEach(g => g.remove());
        ghostEls = [];
        deskSnapPreviewEls.forEach(p => p.remove()); deskSnapPreviewEls = [];
        this.selection.forEach(id => {
          const orig = fwArea.querySelector(`.file-item[data-id="${id}"]`);
          if (orig) orig.style.visibility = '';
        });
      }

      if (outsideWindow && !escaped) {
        // Escape from window: hide originals, create ghost clones in desktop-area
        escaped = true;
        this.selection.forEach(id => {
          const orig = fwArea.querySelector(`.file-item[data-id="${id}"]`);
          if (orig) orig.style.visibility = 'hidden';
        });
        const deskArea = document.getElementById('desktop-area');
        const selIds = [...this.selection];
        // First ghost = clicked item, positioned exactly under cursor
        selIds.sort((a, b) => (a === node.id ? -1 : b === node.id ? 1 : 0));
        selIds.forEach((id, i) => {
          const n = VFS.node(id); if (!n) return;
          const ghost = _buildIconEl(n, { x: 0, y: 0 });
          ghost.classList.add('selected');
          ghost.style.position  = 'absolute';
          ghost.style.zIndex    = '7900';
          ghost.style.opacity   = '0.7';
          ghost.style.pointerEvents = 'none';
          ghost.style.willChange = 'left, top';
          ghost.dataset.ghostFor = id;
          ghost.dataset.ghostIdx = String(i); // 0 = clicked item
          deskArea.appendChild(ghost);
          ghostEls.push(ghost);
        });
      }
      if (!escaped) {
        // Normal inner-window drag
        this.selection.forEach(id => {
          const item = fwArea.querySelector(`.file-item[data-id="${id}"]`);
          const sp   = startPosMap[id];
          if (item && sp) { item.style.left = (sp.x + dx) + 'px'; item.style.top = (sp.y + dy) + 'px'; }
        });
      }
      if (escaped) {
        // Position ghosts in desktop-area coordinates
        // Clicked item follows cursor; others preserve relative layout
        const deskArea = document.getElementById('desktop-area');
        const deskRect = deskArea.getBoundingClientRect();
        const baseX = mv.clientX - deskRect.left + deskArea.scrollLeft - clickOffX;
        const baseY = mv.clientY - deskRect.top  + deskArea.scrollTop  - clickOffY;
        const mainSp = startPosMap[node.id];
        ghostEls.forEach(g => {
          const gid = g.dataset.ghostFor;
          const sp = startPosMap[gid];
          const offX = sp && mainSp ? sp.x - mainSp.x : 0;
          const offY = sp && mainSp ? sp.y - mainSp.y : 0;
          g.style.left = (baseX + offX) + 'px';
          g.style.top  = (baseY + offY) + 'px';
        });
      }
      // Highlight drop-target folder (in both window areas and desktop)
      // Temporarily disable pointer events on dragged items so elementFromPoint can see through them
      if (!escaped) {
        this.selection.forEach(id => {
          const it = fwArea.querySelector(`.file-item[data-id="${id}"]`);
          if (it) it.style.pointerEvents = 'none';
        });
      }
      const target   = document.elementFromPoint(mv.clientX, mv.clientY);
      if (!escaped) {
        this.selection.forEach(id => {
          const it = fwArea.querySelector(`.file-item[data-id="${id}"]`);
          if (it) it.style.pointerEvents = '';
        });
      }
      const folderEl = target?.closest('.file-item[data-id]');
      const newHover = folderEl && !this.selection.has(folderEl.dataset.id) &&
                       VFS.node(folderEl.dataset.id)?.type === 'folder' ? folderEl.dataset.id : null;
      if (newHover !== hoverFolder) {
        if (hoverFolder) document.querySelectorAll(`.file-item[data-id="${hoverFolder}"]`).forEach(el => el.classList.remove('drag-target'));
        hoverFolder = newHover;
        if (hoverFolder) document.querySelectorAll(`.file-item[data-id="${hoverFolder}"]`).forEach(el => el.classList.add('drag-target'));
      }
      
      const fwElt = !hoverFolder ? target?.closest('.folder-window') : null;
      const curWin = fwElt ? (typeof WinManager !== 'undefined' ? WinManager._wins.find(w => w.el === fwElt) : null) : null;
      if (curWin !== hoverWin) {
        winSnapPreviewEls.forEach(p => p.remove()); winSnapPreviewEls = [];
        hoverWin = curWin;
      }

      // Snap preview: within window when not escaped, on desktop when escaped
      if (!escaped && moved) {
        if (hoverFolder) {
          snapPreviewEls.forEach(p => p.style.display = 'none');
        } else {
          const mainSp = startPosMap[node.id];
          if (mainSp) {
            const mainSnapped = _snapFreeCell(mainSp.x + dx, mainSp.y + dy, fwOccupiedAtStart);
            const selIds = [...this.selection];
            while (snapPreviewEls.length < selIds.length) {
              const pEl = document.createElement('div'); pEl.className = 'snap-preview';
              fwArea.appendChild(pEl); snapPreviewEls.push(pEl);
            }
            while (snapPreviewEls.length > selIds.length) { snapPreviewEls.pop().remove(); }
            selIds.forEach((id, i) => {
              const sp = startPosMap[id]; if (!sp) return;
              const offX = Math.round((sp.x - mainSp.x) / GRID_X) * GRID_X;
              const offY = Math.round((sp.y - mainSp.y) / GRID_Y) * GRID_Y;
              snapPreviewEls[i].style.left = (mainSnapped.x + offX) + 'px';
              snapPreviewEls[i].style.top  = (mainSnapped.y + offY) + 'px';
              snapPreviewEls[i].style.display = '';
            });
          }
        }
      } else if (escaped && moved) {
        // Show snap preview on desktop while dragging out of window
        snapPreviewEls.forEach(p => p.style.display = 'none');
        if (hoverFolder) {
          deskSnapPreviewEls.forEach(p => p.style.display = 'none');
          winSnapPreviewEls.forEach(p => p.style.display = 'none');
        } else if (hoverWin && hoverWin !== this) {
          deskSnapPreviewEls.forEach(p => p.style.display = 'none');
          const winArea = hoverWin.el.querySelector('.fw-area');
          const winRect = winArea.getBoundingClientRect();
          const dropX   = mv.clientX - winRect.left + winArea.scrollLeft - clickOffX;
          const dropY   = mv.clientY - winRect.top  + winArea.scrollTop - clickOffY;
          const winOcc  = new Map();
          VFS.children(hoverWin.folderId).forEach(n => {
            const p = VFS.getPos(hoverWin.folderId, n.id);
            if (p) winOcc.set(`${Math.round((p.x-8)/GRID_X)}_${Math.round((p.y-8)/GRID_Y)}`, n.id);
          });
          const selIds = [...this.selection];
          while (winSnapPreviewEls.length < selIds.length) {
            const pEl = document.createElement('div'); pEl.className = 'snap-preview';
            winArea.appendChild(pEl); winSnapPreviewEls.push(pEl);
          }
          while (winSnapPreviewEls.length > selIds.length) { winSnapPreviewEls.pop().remove(); }
          const snapOcc = new Map(winOcc);
          const mainSp = startPosMap[node.id];
          selIds.forEach((id, i) => {
            const sp = startPosMap[id];
            const offX = sp && mainSp ? sp.x - mainSp.x : 0;
            const offY = sp && mainSp ? sp.y - mainSp.y : 0;
            const snapped = _snapFreeCell(dropX + offX, dropY + offY, snapOcc);
            const cx = Math.round((snapped.x - 8) / GRID_X), cy = Math.round((snapped.y - 8) / GRID_Y);
            snapOcc.set(`${cx}_${cy}`, id);
            winSnapPreviewEls[i].style.left = snapped.x + 'px';
            winSnapPreviewEls[i].style.top  = snapped.y + 'px';
            winSnapPreviewEls[i].style.display = '';
          });
        } else {
          winSnapPreviewEls.forEach(p => p.style.display = 'none');
          const deskArea = document.getElementById('desktop-area');
          const deskRect = deskArea.getBoundingClientRect();
          const baseDropX = mv.clientX - deskRect.left + deskArea.scrollLeft - clickOffX;
          const baseDropY = mv.clientY - deskRect.top  + deskArea.scrollTop  - clickOffY;
          const _deskFidSnap = Desktop._desktopFolder;
          const deskOcc = new Map();
          VFS.children(_deskFidSnap).forEach(n => {
            const p = VFS.getPos(_deskFidSnap, n.id);
            if (p) deskOcc.set(`${Math.round((p.x-8)/GRID_X)}_${Math.round((p.y-8)/GRID_Y)}`, n.id);
          });
          // Each item gets its own nearest free cell sequentially based on relative distance
          const selIds = [...this.selection];
          while (deskSnapPreviewEls.length < selIds.length) {
            const pEl = document.createElement('div'); pEl.className = 'snap-preview';
            deskArea.appendChild(pEl); deskSnapPreviewEls.push(pEl);
          }
          while (deskSnapPreviewEls.length > selIds.length) { deskSnapPreviewEls.pop().remove(); }
          const tempOcc = new Map(deskOcc);
          const mainSp = startPosMap[node.id];
          selIds.forEach((id, i) => {
            const sp = startPosMap[id];
            const offX = sp && mainSp ? sp.x - mainSp.x : 0;
            const offY = sp && mainSp ? sp.y - mainSp.y : 0;
            const snapped = _snapFreeCell(
              baseDropX + offX,
              baseDropY + offY,
              tempOcc
            );
            deskSnapPreviewEls[i].style.left = snapped.x + 'px';
            deskSnapPreviewEls[i].style.top  = snapped.y + 'px';
            deskSnapPreviewEls[i].style.display = '';
            // Mark cell as occupied so next item doesn't overlap
            const cx = Math.round((snapped.x - 8) / GRID_X), cy = Math.round((snapped.y - 8) / GRID_Y);
            tempOcc.set(`${cx}_${cy}`, id);
          });
        }
      }
    };

    const onUp = async () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      _isDragging = false;
      snapPreviewEls.forEach(p => p.remove()); snapPreviewEls = [];
      deskSnapPreviewEls.forEach(p => p.remove()); deskSnapPreviewEls = [];
      winSnapPreviewEls.forEach(p => p.remove()); winSnapPreviewEls = [];
      if (hoverFolder) document.querySelectorAll(`.file-item[data-id="${hoverFolder}"]`).forEach(el => el.classList.remove('drag-target'));
      // Remove ghosts
      ghostEls.forEach(g => g.remove());
      ghostEls = [];

      if (!moved) {
        // Restore visibility on no-move (just a click)
        this.selection.forEach(id => {
          const orig = fwArea.querySelector(`.file-item[data-id="${id}"]`);
          if (orig) orig.style.visibility = '';
        });
        return;
      }

      const isChangingFolder = escaped;
      let blocked = null;
      if (isChangingFolder && typeof WinManager !== 'undefined') {
        const dropT = document.elementFromPoint(_lastFwDragX, _lastFwDragY);
        const tfw = dropT?.closest('.folder-window');
        const tw = tfw ? WinManager._wins.find(w => w.el === tfw) : null;
        const srcRect = fwRect();
        const actuallyEscaped = !(_lastFwDragX >= srcRect.left && _lastFwDragX <= srcRect.right && _lastFwDragY >= srcRect.top && _lastFwDragY <= srcRect.bottom);
        
        // If it really escaped and not just dropped back into the same folder window
        if (actuallyEscaped && !(tw === this)) {
          const openFolderIds = new Set();
          WinManager._wins.forEach(w => {
            let cur = w.folderId;
            while (cur && cur !== 'root') { openFolderIds.add(cur); cur = (VFS.node(cur) || {}).parentId; }
          });
          // Determine drop target to avoid pre-empting cycle errors
          const _targetFId2 = tw ? tw.folderId : null;
          blocked = Array.from(this.selection).find(id => {
            const n = VFS.node(id);
            if (!n || n.type !== 'folder' || !openFolderIds.has(id)) return false;
            if (_targetFId2 && VFS.wouldCycle(id, _targetFId2)) return false;
            return true;
          });
        }
      }

      if (blocked) {
        this.selection.forEach(id => {
          const orig = fwArea.querySelector(`.file-item[data-id="${id}"]`);
          const sp   = startPosMap[id];
          if (orig) {
            orig.style.visibility = '';
            if (sp && !escaped) {
              orig.style.transition = 'left 0.12s ease, top 0.12s ease';
              orig.style.left = sp.x + 'px'; orig.style.top = sp.y + 'px';
              setTimeout(() => { if (orig.parentNode) orig.style.transition = ''; }, 150);
            }
          }
        });
        toast(`“${VFS.node(blocked)?.name}” is open in Explorer — close the window first`, 'error');
        return;
      }

      if (escaped) {
        // Re-validate: if cursor ended inside source window, cancel drop (race between mouseup/mousemove)
        const srcR = fwRect();
        if (_lastFwDragX >= srcR.left && _lastFwDragX <= srcR.right &&
            _lastFwDragY >= srcR.top  && _lastFwDragY <= srcR.bottom) {
          this.selection.forEach(id => {
            const orig = fwArea.querySelector(`.file-item[data-id="${id}"]`);
            if (orig) orig.style.visibility = '';
          });
          return;
        }
        // Dropped outside this window
        const dropTarget = document.elementFromPoint(_lastFwDragX, _lastFwDragY);
        const targetFw   = dropTarget?.closest('.folder-window');
        const targetWin  = targetFw ? WinManager._wins.find(w => w.el === targetFw) : null;

        if (targetWin && targetWin !== this) {
          // Drop into another folder window
          const targetArea = targetWin.el.querySelector('.fw-area');
          const tRect      = targetArea.getBoundingClientRect();
          const dropPosX   = _lastFwDragX - tRect.left + targetArea.scrollLeft - clickOffX;
          const dropPosY   = _lastFwDragY - tRect.top  + targetArea.scrollTop  - clickOffY;
          const occupied   = new Map();
          VFS.children(targetWin.folderId).forEach(n => {
            const p = VFS.getPos(targetWin.folderId, n.id);
            if (p) occupied.set(`${Math.round((p.x-8)/GRID_X)}_${Math.round((p.y-8)/GRID_Y)}`, n.id);
          });
          // Each item gets its own nearest free cell sequentially based on relative distance
          const selIds2 = [...this.selection];
          const movedIds = [];
          const mainSp = startPosMap[node.id];
          selIds2.forEach((id, i) => {
            const n = VFS.node(id); if (!n) return;
            const result = VFS.move(id, targetWin.folderId);
            if (result === 'duplicate') { toast(`"${n.name}" already exists in target folder`, 'error'); return; }
            if (result === 'cycle')     { toast(`Cannot move "${n.name}" into itself or a subfolder`, 'error'); return; }
            if (result !== 'ok')        { return; }
            const sp = startPosMap[id];
            const offX = sp && mainSp ? sp.x - mainSp.x : 0;
            const offY = sp && mainSp ? sp.y - mainSp.y : 0;
            const snapped = _snapFreeCell(
              dropPosX + offX,
              dropPosY + offY,
              occupied
            );
            VFS.setPos(targetWin.folderId, id, snapped.x, snapped.y);
            const cx = Math.round((snapped.x - 8) / GRID_X), cy = Math.round((snapped.y - 8) / GRID_Y);
            occupied.set(`${cx}_${cy}`, id);
            movedIds.push(id);
          });
          // Remove moved items from source window DOM (no full re-render = no flash)
          targetWin.selection.clear();
          movedIds.forEach(id => {
            this.selection.delete(id);
            targetWin.selection.add(id);
            const orig = fwArea.querySelector(`.file-item[data-id="${id}"]`);
            if (orig) orig.remove();
          });
          // Restore visibility for items that failed to move (duplicates)
          this.selection.forEach(id => {
            const orig = fwArea.querySelector(`.file-item[data-id="${id}"]`);
            if (orig) orig.style.visibility = '';
          });
          this._updateStatus();
          await saveVFS();
          targetWin.render();
        } else if (hoverFolder) {
          // Drop onto a folder icon
          const movedIds = [];
          this.selection.forEach(id => {
            if (id === hoverFolder) return;
            const n = VFS.node(id); if (!n) return;
            const result = VFS.move(id, hoverFolder);
            if (result === 'duplicate') { toast(`"${n.name}" already exists in "${VFS.node(hoverFolder)?.name}"`, 'error'); return; }
            if (result === 'cycle')     { toast(`Cannot move "${n.name}" into itself or a subfolder`, 'error'); return; }
            if (result !== 'ok')        { return; }
            movedIds.push(id);
          });
          const targetWinForFolder = typeof WinManager !== 'undefined' ? WinManager._wins.find(w => w.folderId === hoverFolder) : null;
          if (targetWinForFolder) targetWinForFolder.selection.clear();
          movedIds.forEach(id => {
            this.selection.delete(id);
            if (targetWinForFolder) targetWinForFolder.selection.add(id);
            const orig = fwArea.querySelector(`.file-item[data-id="${id}"]`);
            if (orig) orig.remove();
          });
          this.selection.forEach(id => {
            const orig = fwArea.querySelector(`.file-item[data-id="${id}"]`);
            if (orig) orig.style.visibility = '';
          });
          this._updateStatus();
          await saveVFS();
          if (typeof WinManager !== 'undefined') WinManager.renderAll();
        } else {
          // Drop onto desktop
          const deskArea = document.getElementById('desktop-area');
          const deskRect = deskArea.getBoundingClientRect();
          const dropPosX = _lastFwDragX - deskRect.left + deskArea.scrollLeft - clickOffX;
          const dropPosY = _lastFwDragY - deskRect.top  + deskArea.scrollTop  - clickOffY;
          const deskFid  = Desktop._desktopFolder;
          const occupied = new Map();
          VFS.children(deskFid).forEach(n => {
            const p = VFS.getPos(deskFid, n.id);
            if (p) occupied.set(`${Math.round((p.x-8)/GRID_X)}_${Math.round((p.y-8)/GRID_Y)}`, n.id);
          });
          // Each item gets its own nearest free cell sequentially based on relative distance
          const selIds = [...this.selection];
          const movedIds = [];
          const mainSp = startPosMap[node.id];
          selIds.forEach((id, i) => {
            const n = VFS.node(id); if (!n) return;
            const result = VFS.move(id, deskFid);
            if (result === 'duplicate') { toast(`"${n.name}" already exists on desktop`, 'error'); return; }
            if (result === 'cycle')     { toast(`Cannot move "${n.name}" into itself or a subfolder`, 'error'); return; }
            const sp = startPosMap[id];
            const offX = sp && mainSp ? sp.x - mainSp.x : 0;
            const offY = sp && mainSp ? sp.y - mainSp.y : 0;
            const snapped = _snapFreeCell(
              dropPosX + offX,
              dropPosY + offY,
              occupied
            );
            VFS.setPos(deskFid, id, snapped.x, snapped.y);
            const cx = Math.round((snapped.x - 8) / GRID_X), cy = Math.round((snapped.y - 8) / GRID_Y);
            occupied.set(`${cx}_${cy}`, id);
            movedIds.push(id);
          });
          movedIds.forEach(id => {
            this.selection.delete(id);
            Desktop._sel.add(id);
            const orig = fwArea.querySelector(`.file-item[data-id="${id}"]`);
            if (orig) orig.remove();
          });
          // Restore visibility & snap back items that failed (duplicate/cycle)
          this.selection.forEach(id => {
            const orig = fwArea.querySelector(`.file-item[data-id="${id}"]`);
            if (orig) {
              orig.style.visibility = '';
              const sp = startPosMap[id];
              if (sp) {
                orig.style.transition = 'left 0.15s ease, top 0.15s ease';
                orig.style.left = sp.x + 'px'; orig.style.top = sp.y + 'px';
                setTimeout(() => { if (orig.parentNode) orig.style.transition = ''; }, 160);
              }
            }
          });
          this._updateStatus();
          await saveVFS();
          Desktop._patchIcons();
        }
        return;
      }

      // Restore visibility (non-escaped path)
      this.selection.forEach(id => {
        const orig = fwArea.querySelector(`.file-item[data-id="${id}"]`);
        if (orig) orig.style.visibility = '';
      });

      // Normal within-window drop
      if (hoverFolder) {
        const movedIds = [];
        this.selection.forEach(id => {
          if (id === hoverFolder) return;
          const n = VFS.node(id); if (!n) return;
          const result = VFS.move(id, hoverFolder);
          if (result === 'duplicate') { toast(`"${n.name}" already exists in "${VFS.node(hoverFolder)?.name}"`, 'error'); return; }
          if (result === 'cycle')     { toast(`Cannot move "${n.name}" into itself or a subfolder`, 'error'); return; }
          if (result !== 'ok')        { return; }
          movedIds.push(id);
        });
        // Snap items that failed to move back to their VFS positions
        this.selection.forEach(id => {
          const item = fwArea.querySelector(`.file-item[data-id="${id}"]`);
          const pos  = VFS.getPos(this.folderId, id);
          if (item && pos) {
            item.style.transition = 'left 0.12s ease, top 0.12s ease';
            item.style.left = pos.x + 'px'; item.style.top = pos.y + 'px';
            setTimeout(() => { if (item.parentNode) item.style.transition = ''; }, 150);
          }
        });
        movedIds.forEach(id => { this.selection.delete(id); });
        await saveVFS();
        this.render();
        if (typeof WinManager !== 'undefined') WinManager.renderAll();
      } else {
        // Grid snap
        const occupied = new Map();
        VFS.children(this.folderId).forEach(n => {
          if (this.selection.has(n.id)) return;
          const p = VFS.getPos(this.folderId, n.id);
          if (p) occupied.set(`${Math.round((p.x-8)/GRID_X)}_${Math.round((p.y-8)/GRID_Y)}`, n.id);
        });
        this.selection.forEach(id => {
          const item = fwArea.querySelector(`.file-item[data-id="${id}"]`);
          if (!item) return;
          const rawX = parseInt(item.style.left), rawY = parseInt(item.style.top);
          const snapped = _snapFreeCell(rawX, rawY, occupied);
          const cx = Math.round((snapped.x - 8) / GRID_X), cy = Math.round((snapped.y - 8) / GRID_Y);
          occupied.set(`${cx}_${cy}`, id);
          item.style.transition = 'left 0.12s ease, top 0.12s ease';
          item.style.left = snapped.x + 'px'; item.style.top = snapped.y + 'px';
          setTimeout(() => { if (item.parentNode) item.style.transition = ''; }, 150);
          VFS.setPos(this.folderId, id, snapped.x, snapped.y);
        });
        await saveVFS();
      }
    };

    // Track last mouse position for use in onUp
    let _lastFwDragX = e.clientX, _lastFwDragY = e.clientY;
    const _trackMove = mv => { _lastFwDragX = mv.clientX; _lastFwDragY = mv.clientY; };
    const origOnMove = onMove;
    const wrappedOnMove = mv => { _trackMove(mv); origOnMove(mv); };

    document.addEventListener('mousemove', wrappedOnMove);
    document.addEventListener('mouseup', function cleanup(ev) {
      document.removeEventListener('mousemove', wrappedOnMove);
      document.removeEventListener('mouseup', cleanup);
      // Update last position from mouseup event
      _lastFwDragX = ev.clientX; _lastFwDragY = ev.clientY;
      onUp();
    });
  }

  /* ---- OPEN NODE: default = navigate within window ---- */
  _openNode(node) {
    hideCtxMenu();
    if (node.type === 'folder') {
      // Auto-cancel cut if navigating into a cut folder
      if (App.clipboard?.op === 'cut') {
        const cutIds = new Set(App.clipboard.ids);
        let cur = node.id;
        while (cur && cur !== 'root') {
          if (cutIds.has(cur)) { cancelClipboard(); break; }
          cur = (VFS.node(cur) || {}).parentId;
        }
      }
      this.folderId = node.id; this.selection.clear(); this.render();
    } else {
      openFile(node);
    }
  }

  /* ---- RUBBER BAND selection ---- */
  _startRubberBand(e) {
    const area = this.el.querySelector('.fw-area');
    const rect = area.getBoundingClientRect();
    const sx   = e.clientX - rect.left + area.scrollLeft;
    const sy   = e.clientY - rect.top  + area.scrollTop;
    const band = document.createElement('div');
    band.className = 'rubberband';
    band.style.cssText = `left:${sx}px;top:${sy}px;width:0;height:0`;
    area.appendChild(band);
    const onMove = mv => {
      const cx = mv.clientX - rect.left + area.scrollLeft;
      const cy = mv.clientY - rect.top  + area.scrollTop;
      const x = Math.min(sx, cx), y = Math.min(sy, cy), w = Math.abs(cx - sx), h = Math.abs(cy - sy);
      band.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
      area.querySelectorAll('.file-item').forEach(item => {
        const ix = parseInt(item.style.left), iy = parseInt(item.style.top);
        const hit = ix < x+w && ix+ICON_W > x && iy < y+h && iy+ICON_H > y;
        if (hit) { this.selection.add(item.dataset.id); item.classList.add('selected'); }
        else if (!e.ctrlKey) { this.selection.delete(item.dataset.id); item.classList.remove('selected'); }
      });
      this._updateStatus();
    };
    const onUp = () => { band.remove(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  }

  /* ---- CONTEXT MENUS ---- */
  _ctxDesktop(e) {
    this.selection.clear();
    this.el.querySelectorAll('.file-item.selected').forEach(i => i.classList.remove('selected'));
    this._updateStatus();
    const items = [
      { label: 'New Text File',   icon: Icons.newfile,   action: () => { this._setCtx(); App._ctxScreenPos = { x: e.clientX, y: e.clientY }; newTextFile(); } },
      { label: 'New Folder',      icon: Icons.newfolder, action: () => { this._setCtx(); App._ctxScreenPos = { x: e.clientX, y: e.clientY }; newFolder(); } },
      { sep: true },
      { label: 'Import Files...', icon: Icons.upload,    action: () => { this._setCtx(); document.getElementById('file-input').click(); } },
    ];
    if (App.clipboard) {
      items.push({ sep: true });
      items.push({ label: 'Paste', icon: Icons.paste, action: () => { this._setCtx(); pasteItems(); } });
    }
    const self = this;
    const sortSub = [
      { label: 'By Name', icon: Icons.sortName, submenu: [
        { label: 'A → Z',  icon: Icons.sortAsc,  action: () => sortIcons('name',  'asc',  self) },
        { label: 'Z → A',  icon: Icons.sortDesc, action: () => sortIcons('name',  'desc', self) },
      ]},
      { label: 'By Date Modified', icon: Icons.sortDate, submenu: [
        { label: 'Newest first', icon: Icons.sortDesc, action: () => sortIcons('mtime', 'desc', self) },
        { label: 'Oldest first', icon: Icons.sortAsc,  action: () => sortIcons('mtime', 'asc',  self) },
      ]},
      { label: 'By Date Created', icon: Icons.sortDate, submenu: [
        { label: 'Newest first', icon: Icons.sortDesc, action: () => sortIcons('ctime', 'desc', self) },
        { label: 'Oldest first', icon: Icons.sortAsc,  action: () => sortIcons('ctime', 'asc',  self) },
      ]},
      { sep: true },
      { label: 'By Size', icon: Icons.sortSize, submenu: [
        { label: 'Largest first',  icon: Icons.sortDesc, action: () => sortIcons('size',  'desc', self) },
        { label: 'Smallest first', icon: Icons.sortAsc,  action: () => sortIcons('size',  'asc',  self) },
      ]},
      { sep: true },
      { label: 'By Type', icon: Icons.sortType, action: () => sortIcons('type',  'asc',  self) },
    ];
    items.push({ sep: true });
    items.push({ label: 'Sort', icon: Icons.sort, submenu: sortSub });
    items.push({ sep: true });
    items.push({ label: 'Refresh', icon: Icons.refresh, action: () => this.render() });
    showCtxMenu(e.clientX, e.clientY, items);
  }

  _ctxIcon(e, node) {
    if (!e.ctrlKey && !e.metaKey && !this.selection.has(node.id)) {
      this.selection.clear();
      this.el.querySelectorAll('.file-item.selected').forEach(i => i.classList.remove('selected'));
    }
    this.selection.add(node.id);
    this.el.querySelector(`.file-item[data-id="${node.id}"]`)?.classList.add('selected');
    this._updateStatus();
    const items = [];
    if (node.type === 'folder') {
      items.push({ label: 'Open',               icon: Icons.open,      action: () => this._openNode(node) });
      items.push({ label: 'Open in New Window', icon: Icons.newfolder, action: () => WinManager.open(node.id) });
      const self = this;
      items.push({ label: 'Folder Color', icon: Icons.folder, submenu: FOLDER_COLORS.map(fc => ({
        label: fc.label,
        icon: `<span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:${fc.color}"></span>`,
        action: async () => { node.color = fc.color === '#0078d4' ? undefined : fc.color; await saveVFS(); self.render(); }
      }))});
    } else {
      items.push({ label: 'Open',               icon: Icons.file,   action: () => openFile(node) });
      items.push({ label: 'Edit as plain text', icon: Icons.rename, action: () => openFileAsText(node) });
      items.push({ label: 'Export',             icon: Icons.download, action: () => downloadFile(node) });
    }
    items.push({ label: 'Export as ZIP', icon: Icons.download, action: () => this._withCtxSync(() => exportAsZip([...this.selection])) });
    items.push({ sep: true });
    items.push({ label: 'Cut',  icon: Icons.cut,  action: () => this._withCtxSync(() => cutItems()) });
    items.push({ sep: true });
    items.push({ label: 'Rename', icon: Icons.rename, action: () => renameNode(node) });
    items.push({ sep: true });
    const sz = this.selection.size;
    items.push({ label: sz > 1 ? `Delete ${sz} items` : 'Delete', icon: Icons.trash, danger: true,
                 action: () => { this._setCtx(); deleteSelected(); } });
    items.push({ sep: true });
    items.push({ label: 'Properties', icon: Icons.info, action: () => showProps(node) });
    showCtxMenu(e.clientX, e.clientY, items);
  }

  /* ---- RESIZE HANDLE ---- */
  _addResizeHandle() {
    const handle = this.el.querySelector('.fw-resize-handle');
    if (!handle) return;
    handle.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      const startX = e.clientX, startY = e.clientY;
      const startW = this.el.offsetWidth, startH = this.el.offsetHeight;
      const onMove = mv => {
        this.el.style.width  = Math.max(420, Math.min(1400, startW + mv.clientX - startX)) + 'px';
        this.el.style.height = Math.max(260, Math.min(900,  startH + mv.clientY - startY)) + 'px';
      };
      const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
  }

  /* ---- STATUS BAR & KEYBOARD ---- */
  _updateStatus() {
    const count = VFS.children(this.folderId).length;
    const sel   = this.selection.size;
    this.el.querySelector('.fw-status-text').textContent =
      sel > 0 ? `${sel} of ${count} selected` : `${count} item${count !== 1 ? 's' : ''}`;
  }

  _onKey(e) {
    if (['Delete', 'Backspace'].includes(e.key) && this.selection.size > 0) {
      this._setCtx(); deleteSelected();
    } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC' && this.selection.size > 0) {
      this._withCtxSync(() => copyItems());
    } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyX' && this.selection.size > 0) {
      this._withCtxSync(() => cutItems());
    } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV') {
      this._setCtx(); pasteItems();
    } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyA') {
      VFS.children(this.folderId).forEach(n => {
        this.selection.add(n.id);
        const el = this.el.querySelector(`.file-item[data-id="${n.id}"]`);
        if (el) el.classList.add('selected');
      });
      this._updateStatus();
    } else if (e.key === 'Escape') {
      if (App.clipboard?.op === 'cut') cancelClipboard();
      this.selection.clear();
      this.el.querySelectorAll('.file-item.selected').forEach(i => i.classList.remove('selected'));
      this._updateStatus();
    } else if (e.key === 'F2' && this.selection.size === 1) {
      renameNode(VFS.node([...this.selection][0]));
    } else if (e.key === 'F5') {
      e.preventDefault();
      this.render();
      this.el.querySelector('.fw-area')?.focus();
    } else if (e.key === 'Backspace') {
      const n = VFS.node(this.folderId);
      if (n && n.parentId && n.parentId !== 'root') { this.folderId = n.parentId; this.selection.clear(); this.render(); }
    }
  }
}
