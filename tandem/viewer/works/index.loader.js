(function () {
    var params = new URLSearchParams(window.location.search),
        renderMode = params.get('render-mode'),
        projectId = params.get('project-id'),
        projectName = (params.get('project-name') || '').trim();

    if (renderMode !== 'fullscreen') {
        var redir = new URLSearchParams();
        redir.set('render-mode', 'fullscreen');
        if (projectId !== null) redir.set('project-id', projectId);
        else if (projectName) redir.set('project-name', projectName);
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

    if (projectId !== null) {
        var id = parseInt(projectId, 10);
        if (isNaN(id) || id <= 0) { showError(); return; }

        var script = document.createElement('script');
        script.src = '../index.db.js';
        script.onload = function () {
            if (typeof TANDEM_SITES === 'undefined') { showError(); return; }
            var site = null;
            for (var i = 0; i < TANDEM_SITES.length; i++) {
                if (TANDEM_SITES[i].id === id) { site = TANDEM_SITES[i]; break; }
            }
            if (!site) { showError(); return; }
            loadFrame('../' + site.path);
        };
        script.onerror = showError;
        document.head.appendChild(script);
    } else if (projectName && /^[a-zA-Z0-9_-]+$/.test(projectName)) {
        loadFrame(projectName);

    } else {
        showError();
    }
}());
