(function () {
    var params      = new URLSearchParams(window.location.search),
        renderMode  = params.get('render-mode'),
        projectId   = params.get('project-id'),
        projectName = (params.get('project-name') || '').trim();

    // Без render-mode=fullscreen — редирект на ../ только с project-id
    if (renderMode !== 'fullscreen') {
        var redir = new URLSearchParams();
        if (projectId !== null) redir.set('project-id', projectId);
        window.location.replace('../?' + redir.toString());
        return;
    }

    function showError() {
        document.getElementById('error-screen').classList.add('visible');
        var f = document.getElementById('project-frame');
        if (f) f.remove();
    }

    function loadFrame(src) {
        var frame = document.getElementById('project-frame');
        if (!frame) return;
        frame.src = src;
        frame.addEventListener('error', showError);
    }

    // ── Режим 1: project-id — читаем БД и сопоставляем
    if (projectId !== null) {
        var id = parseInt(projectId, 10);
        if (isNaN(id) || id <= 0) { showError(); return; }

        var script    = document.createElement('script');
        script.src    = '../index.db.js';
        script.onload = function () {
            if (typeof TANDEM_SITES === 'undefined') { showError(); return; }
            var site = null;
            for (var i = 0; i < TANDEM_SITES.length; i++) {
                if (TANDEM_SITES[i].id === id) { site = TANDEM_SITES[i]; break; }
            }
            if (!site) { showError(); return; }
            // path в БД относительно корня viewer/; мы в no-toolbox-viewer/ → выходим через ../
            loadFrame('../' + site.path);
        };
        script.onerror = showError;
        document.head.appendChild(script);

    // ── Режим 2: project-name — запасной, напрямую
    } else if (projectName && /^[a-zA-Z0-9_-]+$/.test(projectName)) {
        loadFrame('../works/' + projectName + '/index.html');

    } else {
        showError();
    }
}());
