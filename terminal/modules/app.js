const visual = {
    installTheme(theme) {
        visual.setTheme(theme);
        localStorage.setItem('console-theme', theme);
    },
    setTheme(theme) {
        const linkId = 'theme-link',
            link = document.getElementById(linkId);

        if (link) {
            link.href = theme;
        } else {
            const newLink = document.createElement('link');
            newLink.id = linkId;
            newLink.rel = 'stylesheet';
            newLink.href = theme;
            document.head.appendChild(newLink);
        }
    },
    loadTheme() {
        const theme = localStorage.getItem('console-theme');
        if (theme) {
            visual.setTheme(theme);
        } else {
            visual.installTheme('styles/themes/default.css');
        }
    }
}

visual.loadTheme();

Object.entries({
    "app-default-config": "0",
    "app-prompt": navigator.userAgent
}).forEach(([key, value]) => {
    setDefaultPromptValue(key, value);
});

const commandInput = document.getElementById("commandInput");
var commandHistory = [],
    currentCommandIndex = -1;

function replaceTagsWithEntities(text) {
    return replacedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function setFocus() {
    if (window.getSelection().toString() == '' && commandInput !== document.activeElement) {
        commandInput.focus();
    }
}

function fingerprint() {
    var fingerprintData = {
        'User Agent': navigator.userAgent,
        'Browser Language': navigator.language,
        'Cookies Enabled': navigator.cookieEnabled,
        'Screen Resolution': screen.width + 'x' + screen.height,
        'Available Screen Resolution': screen.availWidth + 'x' + screen.availHeight,
        'Color Depth': screen.colorDepth,
        'Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'Local Storage Enabled': typeof Storage !== 'undefined',
        'Session Storage Enabled': typeof sessionStorage !== 'undefined',
        'Do Not Track': Boolean(navigator.doNotTrack),
        'Plugins': Array.from(navigator.plugins).map(plugin => plugin.name).join(', '),
        'WebGL Vendor': getWebGLVendor(),
        'WebGL Renderer': getWebGLRenderer(),
        'WebGL Version': getWebGLVersion(),
        'Web Audio API': isWebAudioAPISupported(),
        'MIDI API': isMIDIAPIAvailable(),
        'WebSockets Supported': isWebSocketsSupported(),
        'Battery API Supported': isBatteryAPISupported(),
        'WebVR API Supported': isWebVRAPIAvailable(),
        'AudioContext Max Channels': getMaxAudioContextChannels()
    };

    var fingerprintString = Object.entries(fingerprintData)
        .map(entry => `<b>${entry[0]}</b>` + ': ' + entry[1])
        .join('\n');

    return fingerprintString;
}

function getWebGLVendor() {
    var canvas = document.createElement('canvas'),
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl.getExtension('WEBGL_debug_renderer_info')) {
        return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_VENDOR_WEBGL);
    }
    return 'N/A';
}

function getWebGLRenderer() {
    var canvas = document.createElement('canvas'),
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl.getExtension('WEBGL_debug_renderer_info')) {
        return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
    }
    return 'N/A';
}

function getWebGLVersion() {
    var canvas = document.createElement('canvas'),
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
        return gl.getParameter(gl.VERSION);
    }
    return 'N/A';
}

function isWebAudioAPISupported() {
    return typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined';
}

function isMIDIAPIAvailable() { return typeof navigator.requestMIDIAccess !== 'undefined'; }

function isWebSocketsSupported() { return 'WebSocket' in window ? 'Supported' : 'Not supported'; }

function isBatteryAPISupported() { return navigator.getBattery ? 'Supported' : 'Not supported'; }

function isWebVRAPIAvailable() { return 'getVRDisplays' in navigator ? 'Supported' : 'Not supported'; }

function isWebXRAPIAvailable() { return 'xr' in navigator ? 'Supported' : 'Not supported'; }

function getMaxAudioContextChannels() {
    try {
        var audioContext = new(window.AudioContext || window.webkitAudioContext)(),
            maxChannels = audioContext.destination.maxChannelCount;
        audioContext.close();
        return maxChannels;
    } catch (exc) {
        return 'N/A'
    }
}

function wrapFirstWord(sentence) {
    var words = sentence.split(' ');

    if (words.length === 0) {
        return '';
    }

    words[0] = `<span class="first">${words[0]}</span>`;

    return words.join(' ');
}

window.onerror = function(message, source, lineno, colno, error) {
    console.error(`[APP]: ${error}`);
};

function autoScroll() {
    window.scrollTo(0, document.body.scrollHeight);
}

function pushCommand(command, displayCommand = true) {
    var consoleDiv = document.getElementById('console'),
        output = document.createElement('div');
    if (displayCommand) {
        commandInput.placeholder = '';
        output.classList.add('out');
        output.innerHTML = '<span class="pointer">> </span><span class="command">' + wrapFirstWord(replaceTagsWithEntities(command)) + '</span>';
        consoleDiv.appendChild(output);
    }

    function out(text) {
        let outStd = document.createElement('div');
        ['out', 'log'].forEach(outClass => {
            outStd.classList.add(outClass);
        });
        outStd.innerHTML = text;
        consoleDiv.appendChild(outStd);
        autoScroll();
    }

    function error(text) {
        out(`<span class="error">${text}</span>`);
        let lastCommands = document.getElementsByClassName("command"),
            lastCommand = lastCommands[lastCommands.length - 1];
        lastCommand.style = 'color: rgba(255, 79, 79);';
        lastCommand.innerHTML += '<span style="color: gray;"> (!)</span>';
        autoScroll();
    }

    const commandArgs = command.trim().split(' ');

    console.error = error;
    console.log = console.info = console.warn = out;
    console.clear = () => pushCommand("clear");


    switch (commandArgs[0]) {
        case 'help':
            out(`help - show this message
clear - clear console
theme [name] - change theme
echo [html] - format and write text in console
js [code] - execute JavaScript
fingerprint - get client information
clear - clear console
exit - exit from the application
`);
            break;

        case 'clear':
            consoleDiv.innerText = '';
            out("Console cleared.");
            break;

        case 'exit':
            out('Goodbye!');
            setTimeout(function() {
                window.location.href = 'about:blank';
            }, 300);
            break;

        case 'echo':
            let textToOut = '';
            for (let i = 1; i < commandArgs.length; i++) {
                textToOut += commandArgs[i] + ' ';
            }
            out(textToOut);
            break;

        case 'fingerprint':
            out(fingerprint());
            break;

        case 'theme':
            let isSeccuss = true;
            switch (commandArgs[1]) {
                case 'dark':
                case 'default':
                    visual.installTheme('styles/themes/default.css');
                    break;
                case 'light':
                    visual.installTheme('styles/themes/light.css');
                    break;
                case 'cherry':
                    visual.installTheme('styles/themes/cherry.css');
                    break;
                case 'hacker':
                    visual.installTheme('styles/themes/hacker.css');
                    break;
                default:
                    isSeccuss = false;
                    out(`Themes:
 * dark (default)
 * light
 * cherry
 * hacker

Example: theme dark`);
            }
            if (isSeccuss) {
                out(`Theme installed: ${commandArgs[1]}`);
            }
            break;

        case 'js':
            let codeToExec = '';
            for (let i = 1; i < commandArgs.length; i++) {
                codeToExec += commandArgs[i] + ' ';
            }
            if (codeToExec.trim() == '') {
                error('Empty source!');
            } else {
                try {
                    out(`<span style="color: gray;"><span class="pointer">< </span>${eval(codeToExec)}<span>`);
                } catch (exc) {
                    error(`[VM]: ${exc}`);
                }
            }
            break;

        case '':
            break;

        default:
            error(`Command or packet \'<u>${commandArgs[0]}</u>\' not found!`);
    }
    autoScroll();
}

pushCommand('echo Coded by <a target="_blank" href="https://github.com/DosX-dev">DosX</a>', false);

function setDefaultPromptValue(name, defaultValue) {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has(name)) {
        let locationBarSections = document.URL.split('/'),
            locationBarLastSection = locationBarSections[locationBarSections.length - 1],
            separator = locationBarLastSection.includes('?') ? '&' : '?',
            newUrl = `${window.location.href + separator + name}=${defaultValue}`;
        history.pushState({ path: newUrl }, '', newUrl);
    }
}

commandInput.addEventListener("keydown", (event) => {
    switch (event.keyCode) {
        case 13: // Enter
            let command = commandInput.value;
            if (command.trim() !== '') {
                if (command !== commandHistory[commandHistory.length - 1]) { // if not last
                    commandHistory.push(command);
                    currentCommandIndex = commandHistory.length;
                }
            }
            break;
        case 38: // Up
            if (currentCommandIndex > 0) {
                currentCommandIndex--;
                commandInput.value = commandHistory[currentCommandIndex];
            }
            setTimeout(() => {
                commandInput.selectionStart = commandInput.selectionEnd = commandInput.value.length;
            }, 1);
            break;
        case 40: // Down
            if (currentCommandIndex < commandHistory.length - 1) {
                currentCommandIndex++;
                commandInput.value = commandHistory[currentCommandIndex];
            } else {
                currentCommandIndex = commandHistory.length;
                commandInput.value = '';
            }
            break;
        default:
            break;
    }
});


document.addEventListener('DOMContentLoaded', () => {
    commandInput.addEventListener('keypress', function(event) {
        if (event.keyCode === 13) { // Enter
            event.preventDefault();
            pushCommand(commandInput.value.trim());
            commandInput.value = '';
        }
    });
});

setInterval(() => {
    setFocus()
}, 500);