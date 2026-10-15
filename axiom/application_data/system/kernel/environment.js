/**
 * Axiom Environment Manager
 * Manages environment variables and system configuration
 */

class Environment {
    constructor() {
        this.variables = new Map();
        this.defaultVariables = {
            'USER': 'root',
            'HOME': '/root',
            'PATH': '/bin:/usr/bin:/usr/local/bin',
            'SHELL': '/bin/axiom',
            'PWD': '/root',
            'OLDPWD': '/root',
            'TERM': 'axiom-256color',
            'LANG': 'en_US.UTF-8',
            'EDITOR': 'vi',
            'HOSTNAME': 'axiom',
            'LOGNAME': 'root',
            'PS1': 'root@axiom:~$'
        };
    }

    async initialize() {
        // Load default variables
        for (const [key, value] of Object.entries(this.defaultVariables)) {
            this.variables.set(key, value);
        }

        // Try to load from localStorage
        try {
            const stored = localStorage.getItem('axiom_env');
            if (stored) {
                const parsed = JSON.parse(stored);
                for (const [key, value] of Object.entries(parsed)) {
                    this.variables.set(key, value);
                }
            }
        } catch (e) {
            console.warn('Failed to load environment from storage:', e);
        }

        return true;
    }

    get(key) {
        return this.variables.get(key) || '';
    }

    set(key, value) {
        this.variables.set(key, String(value));
        this.save();
    }

    unset(key) {
        this.variables.delete(key);
        this.save();
    }

    has(key) {
        return this.variables.has(key);
    }

    list() {
        const result = {};
        for (const [key, value] of this.variables.entries()) {
            result[key] = value;
        }
        return result;
    }

    expand(str) {
        // Expand environment variables in string
        // Supports $VAR and ${VAR} syntax
        return str.replace(/\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/g, (match, braced, simple) => {
            const varName = braced || simple;
            return this.get(varName) || match;
        });
    }

    updatePWD(newPath) {
        const oldPwd = this.get('PWD');
        this.set('OLDPWD', oldPwd);
        this.set('PWD', newPath);
        this.updatePrompt();
    }

    updatePrompt() {
        const user = this.get('USER');
        const hostname = this.get('HOSTNAME');
        const pwd = this.get('PWD');
        const home = this.get('HOME');
        
        // Replace home directory with ~
        let displayPath = pwd;
        if (pwd === home) {
            displayPath = '~';
        } else if (pwd.startsWith(home + '/')) {
            displayPath = '~' + pwd.substring(home.length);
        }
        
        const prompt = `${user}@${hostname}:${displayPath}$`;
        this.set('PS1', prompt);
        
        // Update UI prompt
        if (typeof window.axiomTerminal !== 'undefined') {
            window.axiomTerminal.updatePrompt(prompt);
        }
    }

    save() {
        try {
            const obj = {};
            for (const [key, value] of this.variables.entries()) {
                obj[key] = value;
            }
            localStorage.setItem('axiom_env', JSON.stringify(obj));
        } catch (e) {
            console.warn('Failed to save environment:', e);
        }
    }

    reset() {
        this.variables.clear();
        for (const [key, value] of Object.entries(this.defaultVariables)) {
            this.variables.set(key, value);
        }
        this.save();
    }
}

// Export for global access
window.Environment = Environment;
