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
        'WebXR API Supported': isWebXRAPIAvailable(),
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

function pushCommand(command, displayCommand = true) {
    var consoleDiv = document.getElementById('console'),
        output = document.createElement('div');
    if (displayCommand) {
        commandInput.placeholder = '';
        output.classList.add('out');
        output.innerHTML = '> <span class="command">' + wrapFirstWord(replaceTagsWithEntities(command)) + '</span>';
        consoleDiv.appendChild(output);
    }

    function out(text) {
        let outStd = document.createElement('div');
        ['out', 'log'].forEach(outClass => {
            outStd.classList.add(outClass);
        });
        outStd.innerHTML = text;
        consoleDiv.appendChild(outStd);
    }

    function error(text) {
        out(`<span class="error">${text}</span>`);
        let lastCommands = document.getElementsByClassName("command"),
            lastCommand = lastCommands[lastCommands.length - 1];
        lastCommand.style = 'color: rgba(255, 79, 79);';
        lastCommand.innerHTML += '<span style="color: gray;"> (!)</span>';
    }

    const commandArgs = command.trim().split(' ');

    console.error = error;
    console.log = console.info = console.warn = out;
    console.clear = () => pushCommand("clear");


    switch (commandArgs[0]) {
        case 'help':
            out(`help - show this message
clear - clear console text
exit - exit from the application
echo [html] - format and write text in console
js [code] - execute JavaScript
fingerprint - get client information`);
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

        case 'js':
            let codeToExec = '';
            for (let i = 1; i < commandArgs.length; i++) {
                codeToExec += commandArgs[i] + ' ';
            }
            if (codeToExec.trim() == '') {
                error('Empty source!');
            } else {
                try {
                    out(`<span style="color: gray;">< ${eval(codeToExec)}<span>`);
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

    window.scrollTo(0, document.body.scrollHeight);
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
        case 13: // если нажата клавиша Enter
            let command = commandInput.value;
            if (command.trim() !== '') {
                commandHistory.push(command);
            }
            currentCommandIndex = commandHistory.length;
            break;
        case 38: // если нажата клавиша вверх
            if (currentCommandIndex > 0) {
                currentCommandIndex--;
                commandInput.value = commandHistory[currentCommandIndex];
            }
            setTimeout(() => {
                commandInput.selectionStart = commandInput.selectionEnd = commandInput.value.length;
            }, 10);
            break;
        case 40: // если нажата клавиша вниз
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
        if (event.keyCode === 13) {
            event.preventDefault();
            var command = commandInput.value.trim();
            pushCommand(command);
            commandInput.value = '';
        }
    });
});

setInterval(() => {
    if (window.getSelection().toString() == '' && commandInput !== document.activeElement) {
        commandInput.focus();
    }
}, 250);