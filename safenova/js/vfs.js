'use strict';

/* ============================================================
   VFS  —  Virtual File System (in-memory, serialized encrypted)
   ============================================================ */
const VFS = (() => {
  let _nodes = {};  // id → Node
  let _pos   = {};  // parentId → { nodeId: {x, y} }

  function init() {
    _nodes = { root: { id:'root', type:'folder', name:'/', parentId:null, ctime:Date.now(), mtime:Date.now() } };
    _pos   = { root: {} };
  }

  function fromObj(obj) {
    _nodes = obj.nodes || {};
    _pos   = obj.pos   || {};
    if (!_nodes.root) _nodes.root = { id:'root', type:'folder', name:'/', parentId:null, ctime:Date.now(), mtime:Date.now() };
    if (!_pos.root)   _pos.root   = {};
    // Integrity repair: reattach orphaned nodes whose parentId points to non-existent node
    Object.values(_nodes).forEach(n => {
      if (n.id !== 'root' && n.parentId && !_nodes[n.parentId]) {
        console.warn('VFS: orphaned node', n.id, '— reattaching to root');
        n.parentId = 'root';
      }
    });
  }

  function toObj() { return { nodes: _nodes, pos: _pos }; }

  function children(pid) { return Object.values(_nodes).filter(n => n.parentId === pid); }

  function getPos(pid, nid)       { return (_pos[pid] || {})[nid] || null; }
  function setPos(pid, nid, x, y) { if (!_pos[pid]) _pos[pid] = {}; _pos[pid][nid] = { x, y }; }
  function delPos(pid, nid)       { if (_pos[pid]) delete _pos[pid][nid]; }

  function add(nd) {
    _nodes[nd.id] = nd;
    if (!_pos[nd.id] && nd.type === 'folder') _pos[nd.id] = {};
  }

  function remove(id) {
    const n = _nodes[id]; if (!n) return;
    if (n.type === 'folder') {
      children(id).forEach(c => remove(c.id));
      delete _pos[id];
    }
    delPos(n.parentId, id);
    delete _nodes[id];
  }

  function rename(id, newName) {
    if (_nodes[id]) { _nodes[id].name = newName; _nodes[id].mtime = Date.now(); }
  }

  function move(id, newParentId) {
    const n = _nodes[id]; if (!n || !_nodes[newParentId]) return 'not_found';
    // prevent move into self or descendant
    let c = newParentId;
    while (c) { if (c === id) return 'cycle'; c = (_nodes[c] || {}).parentId; }
    // prevent duplicate name in destination
    if (children(newParentId).some(s => s.id !== id && s.name.toLowerCase() === n.name.toLowerCase())) return 'duplicate';
    delPos(n.parentId, id);
    n.parentId = newParentId;
    n.mtime    = Date.now();
    return 'ok';
  }

  function totalSize() {
    return Object.values(_nodes)
      .filter(n => n.type === 'file')
      .reduce((s, n) => s + (n.size || 0), 0);
  }

  function breadcrumb(folderId) {
    const path = [], visited = new Set(); let cur = folderId;
    while (cur && !visited.has(cur)) {
      visited.add(cur);
      path.unshift(_nodes[cur]);
      cur = (_nodes[cur] || {}).parentId;
    }
    return path;
  }

  function fullPath(nodeId) {
    const parts = [], visited = new Set();
    let cur = nodeId;
    while (cur) {
      if (visited.has(cur)) break; // cycle guard
      visited.add(cur);
      const n = _nodes[cur];
      if (!n) break;
      if (n.id === 'root') break;
      parts.unshift(n.name);
      cur = n.parentId;
    }
    return '/~/' + (App.container ? App.container.name : '') + (parts.length ? '/' + parts.join('/') : '');
  }

  function autoPos(pid, idx, area) {
    const W    = (area && area.clientWidth) || 800;
    const cols = Math.max(1, Math.floor((W - 16) / GRID_X));
    // Build set of occupied grid cells
    const occupied = new Set();
    Object.values(_pos[pid] || {}).forEach(p => {
      const cx = Math.round((p.x - 8) / GRID_X);
      const cy = Math.round((p.y - 8) / GRID_Y);
      occupied.add(`${cx}_${cy}`);
    });
    // Row-by-row scan for first free cell
    for (let row = 0; row < 10000; row++) {
      for (let col = 0; col < cols; col++) {
        if (!occupied.has(`${col}_${row}`)) return { x: 8 + col * GRID_X, y: 8 + row * GRID_Y };
      }
    }
    const col = idx % cols, row = Math.floor(idx / cols);
    return { x: 8 + col * GRID_X, y: 8 + row * GRID_Y };
  }

  function node(id) { return _nodes[id]; }

  function hasChildNamed(pid, name) {
    const lower = name.toLowerCase();
    return children(pid).some(n => n.name.toLowerCase() === lower);
  }

  function wouldCycle(id, newParentId) {
    let c = newParentId;
    while (c) { if (c === id) return true; c = (_nodes[c] || {}).parentId; }
    return false;
  }

  function remapPositions(oldGX, oldGY, newGX, newGY) {
    if (oldGX === newGX && oldGY === newGY) return;
    for (const pid of Object.keys(_pos)) {
      const map = _pos[pid];
      for (const nid of Object.keys(map)) {
        const p = map[nid];
        const cx = Math.round((p.x - 8) / oldGX);
        const cy = Math.round((p.y - 8) / oldGY);
        map[nid] = { x: 8 + cx * newGX, y: 8 + cy * newGY };
      }
    }
  }

  return { init, fromObj, toObj, children, node, add, remove, rename, move, wouldCycle,
           getPos, setPos, delPos, totalSize, breadcrumb, fullPath, autoPos, hasChildNamed,
           remapPositions };
})();
