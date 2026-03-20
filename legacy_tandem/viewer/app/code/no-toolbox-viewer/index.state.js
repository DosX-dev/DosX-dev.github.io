/* ────────────────────────────────────────────────
   Tandem Portfolio Viewer — Engine v1.0
   app/code/no-toolbox-viewer/index.state.js
   — URL-параметры и ранний редирект
   ──────────────────────────────────────────────── */

const params = new URLSearchParams(location.search);
const renderMode = params.get('render-mode');
const projectId = params.get('project-id');
const projectName = (params.get('project-name') ?? '').trim();

/* Если render-mode !== fullscreen — немедленный редирект на главный вьювер */
if (renderMode !== 'fullscreen') {
    const redir = new URLSearchParams();
    if (projectId !== null) redir.set('project-id', projectId);
    location.replace('../?' + redir.toString());
}
