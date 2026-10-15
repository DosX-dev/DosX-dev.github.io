// Coded by DosX
// We're not like this — life is like this.

console.clear();
console.log(`%c
                                                                             
      ██ ███████       ██████   █████  ███████ ███    ███  ██████  ███    ██ 
      ██ ██            ██   ██ ██   ██ ██      ████  ████ ██    ██ ████   ██ 
      ██ ███████ █████ ██   ██ ███████ █████   ██ ████ ██ ██    ██ ██ ██  ██ 
 ██   ██      ██       ██   ██ ██   ██ ██      ██  ██  ██ ██    ██ ██  ██ ██ 
  █████  ███████       ██████  ██   ██ ███████ ██      ██  ██████  ██   ████ 
          %cCoded by DosX%c — %chttps://github.com/DosX-dev/js-daemon              `,
    'color: white; background: black; font-size: 12px; font-weight: bold;', 'color: white; background: black; font-size: 12px;', 'color: white; background: black; font-size: 12px;', 'color: white; background: black; font-size: 12px;');

const nativeFunctionCache = {};

function watchAllFunctions(obj, exclude = []) {
    for (let key in obj) {
        if (typeof obj[key] === 'function' && !exclude.includes(key)) {
            const originalFunction = obj[key];

            if (obj[key] === watchAllFunctions) {
                continue;
            }

            obj[key] = function() {
                const args = Array.from(arguments).map(arg => {
                    if (typeof arg === 'string') {
                        return `"${arg}"`;
                    } else if (typeof arg === 'object') {
                        try {
                            return JSON.stringify(arg);
                        } catch (e) {
                            return '[Circular]';
                        }
                    } else {
                        return arg;
                    }
                });

                if (!(key in nativeFunctionCache)) {
                    nativeFunctionCache[key] = !!originalFunction && (typeof originalFunction).toLowerCase() === 'function' &&
                        (originalFunction === Function.prototype ||
                            /^\s*function\s*(\b[a-z$_][a-z0-9$_]*\b)*\s*\((|([a-z$_][a-z0-9$_]*)(\s*,[a-z$_][a-z0-9$_]*)*)\)\s*{\s*\[native code\]\s*}\s*$/i.test(String(originalFunction)));
                }

                const isNativeFunction = nativeFunctionCache[key];

                console.log(
                    `%c${isNativeFunction ? '[N]' : '[C]'}%c %c[CALL CAPTURED]%c : ${key}(` + args.join(', ') + ");",
                    `color: white; background: ${isNativeFunction ? 'red' : 'gray'};`,
                    'color: default;',
                    'color: white; background: darkorange;',
                    'color: default;'
                );

                if (originalFunction) {
                    return Function.prototype.apply.call(originalFunction, this, arguments);
                }
            };
        }
    }
}

function __test() {}

// Exclude console.log to avoid infinite recursion and other critical methods
const excludeConsoleMethods = ['log', 'warn', 'error', 'info', 'debug'];

watchAllFunctions(window);
watchAllFunctions(document);
watchAllFunctions(console, excludeConsoleMethods);
watchAllFunctions(navigator);
watchAllFunctions(history);
watchAllFunctions(localStorage);
watchAllFunctions(sessionStorage);
watchAllFunctions(String.prototype);