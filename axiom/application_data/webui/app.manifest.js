/**
 * Axiom Terminal Application
 * Main application manifest and command processor
 */

class AxiomTerminal {
    constructor() {
        this.commandHistory = [];
        this.historyIndex = -1;
        this.commands = new Map();
        this.aliases = new Map();
        this.outputElement = null;
        this.statusElement = null;
        this.initialized = false;
        this.currentInput = '';
        this.cursorPosition = 0;
        this.currentInputLine = null;
        this.editorMode = false;
        this.uiNotepad = null;
        
        this.registerCommands();
        this.loadAliases();
        this.loadHistory();
    }

    async initialize() {
        // Get DOM elements
        this.outputElement = document.getElementById('terminal-output');
        this.statusElement = document.getElementById('system-status');

        // Set up keyboard listener for entire page
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Set up context menu
        this.setupContextMenu();
        
        // Boot the system
        try {
            const bootManager = new BootManager();
            await bootManager.initialize();
            
            // Initialize interrupt handler
            window.axiomInterrupts = new InterruptHandler();
            await window.axiomInterrupts.initialize();
            
            // Initialize instruction set
            window.axiomInstructions = new InstructionSet();
            
            // Initialize UI Notepad
            this.uiNotepad = new UINotepad(this);
            
            this.initialized = true;
            this.updateStatus('Ready');
            this.createInputLine();
            
        } catch (error) {
            this.printLine(`BOOT ERROR: ${error.message}`, 'output-error');
            this.updateStatus('Boot Failed');
        }
    }

    createInputLine() {
        // Remove any existing cursors to prevent duplication
        const existingCursors = document.querySelectorAll('.cursor');
        existingCursors.forEach(cursor => cursor.remove());
        
        // Remove old input line if exists
        if (this.currentInputLine && this.currentInputLine.parentNode) {
            this.currentInputLine.remove();
        }
        
        this.currentInputLine = document.createElement('div');
        this.currentInputLine.className = 'input-line';
        
        const promptSpan = document.createElement('span');
        promptSpan.className = 'input-prompt';
        promptSpan.textContent = window.axiomEnv.get('PS1');
        
        const inputSpan = document.createElement('span');
        inputSpan.className = 'input-text';
        inputSpan.textContent = '';
        
        const cursor = document.createElement('span');
        cursor.className = 'cursor blink';
        cursor.textContent = ' ';
        
        this.currentInputLine.appendChild(promptSpan);
        this.currentInputLine.appendChild(inputSpan);
        this.currentInputLine.appendChild(cursor);
        
        this.outputElement.appendChild(this.currentInputLine);
        this.currentInput = '';
        this.cursorPosition = 0;
        this.updateInputDisplay();
        this.scrollToBottom();
    }

    updateInputDisplay() {
        if (!this.currentInputLine) return;
        
        const inputSpan = this.currentInputLine.querySelector('.input-text');
        const cursor = this.currentInputLine.querySelector('.cursor');
        
        if (!inputSpan || !cursor) return;
        
        // Split input at cursor position
        const beforeCursor = this.currentInput.substring(0, this.cursorPosition);
        const atCursor = this.currentInput.substring(this.cursorPosition, this.cursorPosition + 1);
        const afterCursor = this.currentInput.substring(this.cursorPosition + 1);
        
        // Update display
        inputSpan.textContent = beforeCursor;
        
        // Cursor shows character under it, or space if at end
        cursor.textContent = atCursor || ' ';
        
        // Add text after cursor
        let afterSpan = this.currentInputLine.querySelector('.after-cursor');
        if (afterCursor.length > 0) {
            if (!afterSpan) {
                afterSpan = document.createElement('span');
                afterSpan.className = 'after-cursor';
                cursor.after(afterSpan);
            }
            afterSpan.textContent = afterCursor;
        } else {
            if (afterSpan) afterSpan.remove();
        }
    }

    handleKeyDown(event) {
        // Don't handle keys when in editor mode
        if (this.editorMode) return;
        
        if (!this.initialized || !this.currentInputLine) return;

        // Navigation keys
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            if (this.cursorPosition > 0) {
                this.cursorPosition--;
                this.updateInputDisplay();
            }
            return;
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            if (this.cursorPosition < this.currentInput.length) {
                this.cursorPosition++;
                this.updateInputDisplay();
            }
            return;
        } else if (event.key === 'Home') {
            event.preventDefault();
            this.cursorPosition = 0;
            this.updateInputDisplay();
            return;
        } else if (event.key === 'End') {
            event.preventDefault();
            this.cursorPosition = this.currentInput.length;
            this.updateInputDisplay();
            return;
        }

        // Command execution
        if (event.key === 'Enter') {
            event.preventDefault();
            const command = this.currentInput.trim();
            
            // Finalize current line
            const inputSpan = this.currentInputLine.querySelector('.input-text');
            const cursor = this.currentInputLine.querySelector('.cursor');
            const afterSpan = this.currentInputLine.querySelector('.after-cursor');
            
            if (inputSpan) inputSpan.textContent = this.currentInput;
            if (cursor) cursor.remove();
            if (afterSpan) afterSpan.remove();
            
            this.currentInputLine = null;
            this.currentInput = '';
            this.cursorPosition = 0;
            
            if (command) {
                // Don't duplicate if same as last command
                const lastCommand = this.commandHistory[this.commandHistory.length - 1];
                if (command !== lastCommand) {
                    this.commandHistory.push(command);
                    this.saveHistory();
                }
                this.historyIndex = this.commandHistory.length;
                this.executeCommand(command);
            } else {
                this.createInputLine();
            }
            return;
        }
        
        // History navigation
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.currentInput = this.commandHistory[this.historyIndex];
                this.cursorPosition = this.currentInput.length;
                this.updateInputDisplay();
            }
            return;
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.currentInput = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                this.currentInput = '';
            }
            this.cursorPosition = this.currentInput.length;
            this.updateInputDisplay();
            return;
        }
        
        // Tab completion
        if (event.key === 'Tab') {
            event.preventDefault();
            this.handleTabCompletion();
            return;
        }
        
        // Control commands
        if (event.ctrlKey && event.key === 'c') {
            // Check if there's a text selection
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                // Allow default copy behavior
                return;
            }
            
            // Otherwise, handle as interrupt
            event.preventDefault();
            const inputSpan = this.currentInputLine.querySelector('.input-text');
            const cursor = this.currentInputLine.querySelector('.cursor');
            const afterSpan = this.currentInputLine.querySelector('.after-cursor');
            
            if (inputSpan) inputSpan.textContent = this.currentInput;
            if (cursor) cursor.remove();
            if (afterSpan) afterSpan.remove();
            
            this.currentInputLine = null;
            this.currentInput = '';
            this.cursorPosition = 0;
            
            this.printLine('^C', 'output-warning');
            this.createInputLine();
            return;
        } else if (event.ctrlKey && event.key === 'l') {
            event.preventDefault();
            this.clearScreen();
            this.createInputLine();
            return;
        }
        
        // Backspace
        if (event.key === 'Backspace') {
            event.preventDefault();
            if (this.cursorPosition > 0) {
                this.currentInput = this.currentInput.substring(0, this.cursorPosition - 1) + 
                                   this.currentInput.substring(this.cursorPosition);
                this.cursorPosition--;
                this.updateInputDisplay();
            }
            return;
        }
        
        // Delete
        if (event.key === 'Delete') {
            event.preventDefault();
            if (this.cursorPosition < this.currentInput.length) {
                this.currentInput = this.currentInput.substring(0, this.cursorPosition) + 
                                   this.currentInput.substring(this.cursorPosition + 1);
                this.updateInputDisplay();
            }
            return;
        }
        
        // Regular character input
        if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
            event.preventDefault();
            this.currentInput = this.currentInput.substring(0, this.cursorPosition) + 
                               event.key + 
                               this.currentInput.substring(this.cursorPosition);
            this.cursorPosition++;
            this.updateInputDisplay();
            return;
        }
    }

    handleTabCompletion(inputSpan) {
        const input = inputSpan.textContent;
        const parts = input.split(' ');
        const lastPart = parts[parts.length - 1];

        if (parts.length === 1) {
            // Command completion
            const matches = Array.from(this.commands.keys()).filter(cmd => 
                cmd.startsWith(lastPart)
            );
            
            if (matches.length === 1) {
                inputSpan.textContent = matches[0];
                this.focusInput();
            } else if (matches.length > 1) {
                const cursor = this.currentInputLine.querySelector('.cursor');
                if (cursor) cursor.remove();
                this.currentInputLine = null;
                this.printLine(matches.join('  '));
                this.createInputLine();
                inputSpan.textContent = lastPart;
                this.focusInput();
            }
        } else {
            // File/directory completion
            try {
                const currentDir = window.axiomContainer.getCurrentDirectory();
                const children = window.axiomContainer.listDirectory(currentDir);
                const matches = children
                    .filter(child => child.name.startsWith(lastPart))
                    .map(child => child.name);
                
                if (matches.length === 1) {
                    parts[parts.length - 1] = matches[0];
                    inputSpan.textContent = parts.join(' ');
                    this.focusInput();
                } else if (matches.length > 1) {
                    const cursor = this.currentInputLine.querySelector('.cursor');
                    if (cursor) cursor.remove();
                    this.currentInputLine = null;
                    this.printLine(matches.join('  '));
                    this.createInputLine();
                    inputSpan.textContent = input;
                    this.focusInput();
                }
            } catch (e) {
                // Silent fail
            }
        }
    }

    async executeCommand(commandLine) {
        // Check for pipes
        if (commandLine.includes('|')) {
            await this.executePipeline(commandLine);
            return;
        }
        
        // Check for output redirection
        let outputFile = null;
        let appendMode = false;
        let errorFile = null;
        
        if (commandLine.includes('>>')) {
            const parts = commandLine.split('>>');
            commandLine = parts[0].trim();
            outputFile = parts[1].trim();
            appendMode = true;
        } else if (commandLine.includes('2>')) {
            const parts = commandLine.split('2>');
            commandLine = parts[0].trim();
            errorFile = parts[1].trim();
        } else if (commandLine.includes('>')) {
            const parts = commandLine.split('>');
            commandLine = parts[0].trim();
            outputFile = parts[1].trim();
            appendMode = false;
        }
        
        // Parse command
        const parts = this.parseCommand(commandLine);
        
        if (parts.length === 0) {
            this.createInputLine();
            return;
        }
        
        const commandName = parts[0];
        const args = parts.slice(1);

        // Check for alias
        const actualCommand = this.aliases.get(commandName) || commandName;
        const command = this.commands.get(actualCommand);
        
        if (!command) {
            const errorMsg = `Command not found: ${commandName}`;
            if (errorFile) {
                try {
                    window.axiomContainer.writeFile(errorFile, errorMsg + '\n', false);
                } catch (e) {
                    this.printLine(`bash: ${e.message}`, 'output-error');
                }
            } else {
                this.printLine(errorMsg, 'output-error');
            }
            this.createInputLine();
            return;
        }

        try {
            // Prevent redirect loops
            if (outputFile && outputFile.length > 4096) {
                throw new Error('Output file path too long');
            }
            
            // Capture output if redirecting
            if (outputFile) {
                const originalPrintLine = this.printLine.bind(this);
                let capturedOutput = '';
                const maxOutputSize = 1024 * 1024; // 1MB limit
                
                this.printLine = (text) => {
                    if (capturedOutput.length + (text || '').length > maxOutputSize) {
                        throw new Error('Output size limit exceeded');
                    }
                    capturedOutput += String(text || '') + '\n';
                };
                
                await command.handler(args);
                
                this.printLine = originalPrintLine;
                
                // Write to file
                try {
                    window.axiomContainer.writeFile(outputFile, capturedOutput, appendMode);
                } catch (e) {
                    this.printLine(`bash: ${e.message}`, 'output-error');
                }
            } else {
                await command.handler(args);
            }
        } catch (error) {
            const errorMsg = `Error: ${error.message}`;
            if (errorFile) {
                try {
                    window.axiomContainer.writeFile(errorFile, errorMsg + '\n', false);
                } catch (e) {
                    this.printLine(`bash: ${e.message}`, 'output-error');
                }
            } else {
                this.printLine(errorMsg, 'output-error');
            }
        }
        
        // Create new input line after command execution (if not already created)
        if (!this.currentInputLine) {
            this.createInputLine();
        }
    }

    async executePipeline(commandLine) {
        const commands = commandLine.split('|').map(cmd => cmd.trim());
        
        // Limit number of pipes to prevent DoS
        if (commands.length > 20) {
            this.printLine('Error: Too many pipes (max 20)', 'output-error');
            this.createInputLine();
            return;
        }
        
        let data = '';
        const maxPipeDataSize = 512 * 1024; // 512KB limit
        
        for (let i = 0; i < commands.length; i++) {
            const cmdLine = commands[i];
            const parts = this.parseCommand(cmdLine);
            
            if (parts.length === 0) continue;
            
            const commandName = parts[0];
            const args = parts.slice(1);
            
            const actualCommand = this.aliases.get(commandName) || commandName;
            const command = this.commands.get(actualCommand);
            
            if (!command) {
                this.printLine(`Command not found: ${commandName}`, 'output-error');
                this.createInputLine();
                return;
            }
            
            try {
                // Capture output for piping
                const originalPrintLine = this.printLine.bind(this);
                let capturedOutput = '';
                
                this.printLine = (text) => {
                    if (capturedOutput.length > maxPipeDataSize) {
                        throw new Error('Pipe data size limit exceeded (512KB)');
                    }
                    capturedOutput += String(text || '') + '\n';
                };
                
                // If not first command, pass previous data as input
                if (i > 0 && data) {
                    // For commands that read files, we'll simulate stdin
                    await this.executePipeCommand(command, args, data);
                } else {
                    await command.handler(args);
                }
                
                this.printLine = originalPrintLine;
                data = capturedOutput.trim();
                
            } catch (error) {
                const originalPrintLine = this.printLine.bind(this);
                this.printLine = originalPrintLine;
                this.printLine(`Error: ${error.message}`, 'output-error');
                this.createInputLine();
                return;
            }
        }
        
        // Print final output
        if (data) {
            this.printLine(data);
        }
        
        this.createInputLine();
    }

    async executePipeCommand(command, args, inputData) {
        // Handle piped input for different command types
        // For now, we'll treat inputData as lines to process
        window.axiomPipeData = inputData;
        await command.handler(args);
        delete window.axiomPipeData;
    }

    parseCommand(commandLine) {
        // Sanitize input
        commandLine = String(commandLine || '').trim();
        
        // Limit command length to prevent DoS
        if (commandLine.length > 10000) {
            throw new Error('Command too long (max 10000 characters)');
        }
        
        // Block null bytes
        if (commandLine.includes('\0') || commandLine.includes('\x00')) {
            throw new Error('Invalid command: null bytes not allowed');
        }
        
        // Simple command parser
        const parts = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < commandLine.length; i++) {
            const char = commandLine[i];
            
            if (char === '"' || char === "'") {
                inQuotes = !inQuotes;
            } else if (char === ' ' && !inQuotes) {
                if (current) {
                    parts.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }
        
        // Limit number of arguments
        if (parts.length > 1000) {
            throw new Error('Too many arguments (max 1000)');
        }
        
        if (current) {
            parts.push(current);
        }
        
        return parts;
    }

    expandWildcards(pattern, currentDir = null) {
        // Expand wildcards like *, ?, [abc]
        const dir = currentDir || window.axiomContainer.getCurrentDirectory();
        
        // If no wildcards, return as-is
        if (!pattern.includes('*') && !pattern.includes('?') && !pattern.includes('[')) {
            return [pattern];
        }
        
        try {
            const files = window.axiomContainer.listDirectory(dir);
            const regex = new RegExp('^' + pattern
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.*')
                .replace(/\?/g, '.')
                .replace(/\[([^\]]+)\]/g, '[$1]') + '$');
            
            const matches = files
                .map(f => f.name)
                .filter(name => regex.test(name));
            
            return matches.length > 0 ? matches : [pattern];
        } catch (e) {
            return [pattern];
        }
    }

    hasCommonFlag(args, ...flags) {
        // Check if any of the common Unix flags are present
        return args.some(arg => {
            if (!arg.startsWith('-')) return false;
            // Support both -rf and -r -f
            return flags.some(flag => arg.includes(flag.replace('-', '')));
        });
    }

    filterFlags(args, knownFlags = []) {
        // Separate flags from arguments
        const flags = [];
        const params = [];
        
        for (const arg of args) {
            if (arg.startsWith('-') && arg !== '--help' && arg !== '-h') {
                flags.push(arg);
            } else {
                params.push(arg);
            }
        }
        
        return { flags, params };
    }

    registerCommands() {
        // System commands
        this.registerCommand('help', this.cmd_help.bind(this), 'Display available commands', '[command]');
        this.registerCommand('clear', this.cmd_clear.bind(this), 'Clear the terminal screen', '');
        this.registerCommand('exit', this.cmd_exit.bind(this), 'Exit the terminal', '');
        this.registerCommand('history', this.cmd_history.bind(this), 'Show command history', '');
        this.registerCommand('cleanup', this.cmd_cleanup.bind(this), 'Clean up disk space (history, temp files, cache)', '[-y]', {
            '-y': 'Automatic yes to prompts (skip confirmation)'
        });
        
        // File commands
        this.registerCommand('ls', this.cmd_ls.bind(this), 'List directory contents', '[-l] [-a] [path]', {
            '-l': 'Use long listing format',
            '-a, -A': 'Show hidden files (starting with .)',
            '-h': 'Human-readable file sizes'
        });
        this.registerCommand('cd', this.cmd_cd.bind(this), 'Change directory', '[directory]');
        this.registerCommand('pwd', this.cmd_pwd.bind(this), 'Print working directory', '');
        this.registerCommand('cat', this.cmd_cat.bind(this), 'Display file contents', '<file>', {
            '-n': 'Number all output lines'
        });
        this.registerCommand('echo', this.cmd_echo.bind(this), 'Display text', '<text> [> file]');
        this.registerCommand('touch', this.cmd_touch.bind(this), 'Create empty file', '<file> [file2...]');
        this.registerCommand('mkdir', this.cmd_mkdir.bind(this), 'Create directory', '<directory> [dir2...]', {
            '-p': 'Create parent directories as needed'
        });
        this.registerCommand('rm', this.cmd_rm.bind(this), 'Remove file', '<file> [file2...]', {
            '-r, -R': 'Remove directories recursively',
            '-f': 'Force removal, ignore errors',
            '-rf': 'Recursive force remove (common combo)'
        });
        this.registerCommand('rmdir', this.cmd_rmdir.bind(this), 'Remove directory', '<directory> [dir2...]');
        this.registerCommand('cp', this.cmd_cp.bind(this), 'Copy file', '<source> <destination>', {
            '-r': 'Copy directories recursively',
            '-v': 'Verbose mode (show what is being copied)'
        });
        this.registerCommand('mv', this.cmd_mv.bind(this), 'Move/rename file', '<source> <destination>', {
            '-v': 'Verbose mode (show what is being moved)'
        });
        this.registerCommand('find', this.cmd_find.bind(this), 'Find files', '[path] [pattern]');
        this.registerCommand('grep', this.cmd_grep.bind(this), 'Search in files', '<pattern> <file>', {
            '-i': 'Ignore case distinctions',
            '-v': 'Invert match (show non-matching lines)',
            '-c': 'Count matching lines only'
        });
        this.registerCommand('head', this.cmd_head.bind(this), 'Display first lines of file', '[-n lines] <file>', {
            '-n <num>': 'Print first <num> lines (default: 10)'
        });
        this.registerCommand('tail', this.cmd_tail.bind(this), 'Display last lines of file', '[-n lines] <file>', {
            '-n <num>': 'Print last <num> lines (default: 10)'
        });
        this.registerCommand('wc', this.cmd_wc.bind(this), 'Word count', '<file>');
        
        // System info commands
        this.registerCommand('uname', this.cmd_uname.bind(this), 'System information', '[-a]');
        this.registerCommand('whoami', this.cmd_whoami.bind(this), 'Current user', '');
        this.registerCommand('date', this.cmd_date.bind(this), 'Display date and time', '');
        this.registerCommand('uptime', this.cmd_uptime.bind(this), 'System uptime', '');
        this.registerCommand('free', this.cmd_free.bind(this), 'Memory information', '');
        this.registerCommand('df', this.cmd_df.bind(this), 'Disk space information', '');
        this.registerCommand('ps', this.cmd_ps.bind(this), 'Process status', '');
        this.registerCommand('top', this.cmd_top.bind(this), 'System monitor', '');
        
        // Environment commands
        this.registerCommand('env', this.cmd_env.bind(this), 'Environment variables', '');
        this.registerCommand('export', this.cmd_export.bind(this), 'Set environment variable', '<VAR=value>');
        this.registerCommand('unset', this.cmd_unset.bind(this), 'Unset environment variable', '<variable>');
        
        // CPU commands
        this.registerCommand('cpuinfo', this.cmd_cpuinfo.bind(this), 'Display CPU information', '');
        this.registerCommand('lscpu', this.cmd_lscpu.bind(this), 'Display CPU architecture', '');
        
        // Network commands
        this.registerCommand('wget', this.cmd_wget.bind(this), 'Download file from URL', '<url> [-O file]', {
            '-O <file>': 'Write downloaded content to specified file'
        });
        this.registerCommand('curl', this.cmd_curl.bind(this), 'Transfer data from URL', '<url> [-o file]', {
            '-o <file>': 'Write output to file instead of stdout'
        });
        this.registerCommand('ping', this.cmd_ping.bind(this), 'Test network connectivity', '<host>');
        this.registerCommand('netstat', this.cmd_netstat.bind(this), 'Network statistics', '');
        
        // System utilities
        this.registerCommand('man', this.cmd_man.bind(this), 'Display manual page', '<command>');
        this.registerCommand('which', this.cmd_which.bind(this), 'Show command path', '<command>');
        this.registerCommand('alias', this.cmd_alias.bind(this), 'Create command alias', '[name=command]');
        this.registerCommand('ln', this.cmd_ln.bind(this), 'Create symbolic link', '[-s] <target> <link>', {
            '-s': 'Create symbolic link (soft link)'
        });
        this.registerCommand('sort', this.cmd_sort.bind(this), 'Sort lines of text', '<file>');
        this.registerCommand('uniq', this.cmd_uniq.bind(this), 'Report unique lines', '<file>');
        this.registerCommand('diff', this.cmd_diff.bind(this), 'Compare files', '<file1> <file2>');
        this.registerCommand('tree', this.cmd_tree.bind(this), 'Display directory tree', '[path] [-a] [-d] [-L level] [-f]', {
            '-a': 'Show all files including hidden',
            '-d': 'List directories only',
            '-L <level>': 'Limit depth of recursion',
            '-f': 'Print full path prefix for each file'
        });
        
        // Environment UI
        this.registerCommand('ui-notepad', this.cmd_ui_notepad.bind(this), 'Text editor (notepad-style)', '<file>');
    }

    registerCommand(name, handler, description, usage = '', flags = {}) {
        this.commands.set(name, { handler, description, usage, flags });
    }

    checkHelp(args, commandName) {
        if (args.includes('--help') || args.includes('-h')) {
            const cmd = this.commands.get(commandName);
            if (cmd) {
                this.printLine(`Usage: ${commandName} ${cmd.usage}`, 'output-info');
                this.printLine(`Description: ${cmd.description}`);
                
                if (cmd.flags && Object.keys(cmd.flags).length > 0) {
                    this.printLine('');
                    this.printLine('Options:', 'output-info');
                    for (const [flag, desc] of Object.entries(cmd.flags)) {
                        this.printLine(`  ${flag.padEnd(12)} ${desc}`);
                    }
                }
            }
            return true;
        }
        return false;
    }

    // Command implementations
    async cmd_help(args) {
        if (args.length > 0) {
            const cmd = this.commands.get(args[0]);
            if (cmd) {
                this.printLine(`${args[0]}: ${cmd.description}`);
            } else {
                this.printLine(`Unknown command: ${args[0]}`, 'output-error');
            }
            return;
        }

        this.printLine('Available commands:');
        this.printLine('');
        
        const categories = {
            'System': ['help', 'clear', 'exit', 'history', 'cleanup'],
            'Files': ['ls', 'cd', 'pwd', 'cat', 'echo', 'touch', 'mkdir', 'rm', 'rmdir', 'cp', 'mv', 'find', 'grep', 'head', 'tail', 'wc'],
            'Network': ['wget', 'curl', 'ping', 'netstat'],
            'System Info': ['uname', 'whoami', 'date', 'uptime', 'free', 'df', 'ps', 'top', 'cpuinfo', 'lscpu'],
            'Utilities': ['man', 'which', 'alias', 'ln', 'sort', 'uniq', 'diff'],
            'Environment': ['env', 'export', 'unset'],
            'Environment UI': ['ui-notepad']
        };

        for (const [category, commands] of Object.entries(categories)) {
            this.printLine(`${category}:`, 'output-info');
            for (const cmdName of commands) {
                const cmd = this.commands.get(cmdName);
                if (cmd) {
                    this.printLine(`  ${cmdName.padEnd(12)} - ${cmd.description}`);
                }
            }
            this.printLine('');
        }
    }

    async cmd_clear(args) {
        this.clearScreen();
        // Clear will be followed by createInputLine from executeCommand
    }

    async cmd_exit(args) {
        this.printLine('Goodbye!', 'output-success');
        this.initialized = false;
        // Remove current input line
        if (this.currentInputLine) {
            this.currentInputLine.remove();
            this.currentInputLine = null;
        }
    }

    async cmd_history(args) {
        if (this.checkHelp(args, 'history')) return;
        
        this.commandHistory.forEach((cmd, index) => {
            this.printLine(`${(index + 1).toString().padStart(4)} ${cmd}`);
        });
    }

    loadHistory() {
        try {
            // Try to load from file system first
            if (window.axiomContainer && window.axiomContainer.exists('/var/log/history.log')) {
                const historyData = window.axiomContainer.readFile('/var/log/history.log');
                this.commandHistory = JSON.parse(historyData);
                return;
            }
            
            // Fallback: migrate from localStorage if exists
            const stored = localStorage.getItem('axiom_history');
            if (stored) {
                this.commandHistory = JSON.parse(stored);
                // Migrate to file system
                this.saveHistory();
                // Clean up old localStorage
                localStorage.removeItem('axiom_history');
            }
        } catch (e) {
            console.warn('Failed to load history:', e);
        }
    }

    saveHistory() {
        try {
            // Keep last 1000 commands
            const historyToSave = this.commandHistory.slice(-1000);
            const historyData = JSON.stringify(historyToSave);
            
            // Ensure /var/log directory exists
            if (!window.axiomContainer.exists('/var')) {
                window.axiomContainer.createDirectory('/var', true);
            }
            if (!window.axiomContainer.exists('/var/log')) {
                window.axiomContainer.createDirectory('/var/log', true);
            }
            
            // Save to file system (will be compressed automatically by VMContainer)
            window.axiomContainer.writeFile('/var/log/history.log', historyData);
        } catch (e) {
            console.warn('Failed to save history:', e);
        }
    }

    async cmd_cleanup(args) {
        if (this.checkHelp(args, 'cleanup')) return;
        
        const autoConfirm = args.includes('-y');
        
        this.printLine('Axiom Disk Cleanup Utility', 'output-info');
        this.printLine('');
        
        // Calculate sizes
        let totalFreed = 0;
        
        // History size (from file system)
        let historySize = 0;
        try {
            if (window.axiomContainer.exists('/var/log/history.log')) {
                const historyData = window.axiomContainer.readFile('/var/log/history.log');
                historySize = new Blob([historyData]).size;
            }
        } catch (e) {
            historySize = 0;
        }
        this.printLine(`Command history: ${historySize} bytes`);
        
        // Aliases size (from file system)
        let aliasesSize = 0;
        try {
            if (window.axiomContainer.exists('/etc/aliases')) {
                const aliasesData = window.axiomContainer.readFile('/etc/aliases');
                aliasesSize = new Blob([aliasesData]).size;
            }
        } catch (e) {
            aliasesSize = 0;
        }
        this.printLine(`Aliases: ${aliasesSize} bytes`);
        
        // Temp files
        let tempSize = 0;
        let tempCount = 0;
        try {
            if (window.axiomContainer.exists('/tmp')) {
                const tempFiles = window.axiomContainer.listDirectory('/tmp');
                tempFiles.forEach(file => {
                    if (file.type === 'file') {
                        tempSize += file.size;
                        tempCount++;
                    }
                });
            }
        } catch (e) {}
        this.printLine(`Temporary files: ${tempCount} files, ${tempSize} bytes`);
        
        // File system cache overhead
        const fsData = localStorage.getItem('axiom_fs') || '';
        const currentSize = new Blob([fsData]).size;
        this.printLine(`File system: ${currentSize} bytes`);
        
        this.printLine('');
        this.printLine(`Total reclaimable space: ${historySize + aliasesSize + tempSize} bytes`);
        this.printLine('');
        
        if (!autoConfirm) {
            this.printLine('Run with -y flag to proceed with cleanup', 'output-warning');
            return;
        }
        
        // Perform cleanup
        this.printLine('Cleaning up...', 'output-info');
        
        // Clear history
        this.commandHistory = [];
        this.historyIndex = -1;
        try {
            if (window.axiomContainer.exists('/var/log/history.log')) {
                window.axiomContainer.deleteFile('/var/log/history.log');
            }
        } catch (e) {}
        totalFreed += historySize;
        this.printLine('✓ Cleared command history', 'output-success');
        
        // Clear temp files
        if (tempCount > 0) {
            try {
                const tempFiles = window.axiomContainer.listDirectory('/tmp');
                for (const file of tempFiles) {
                    if (file.type === 'file') {
                        window.axiomContainer.deleteFile(file.path);
                    }
                }
                totalFreed += tempSize;
                this.printLine(`✓ Deleted ${tempCount} temporary files`, 'output-success');
            } catch (e) {
                this.printLine(`✗ Failed to clean temp files: ${e.message}`, 'output-error');
            }
        }
        
        // Optimize storage
        try {
            window.axiomContainer.saveToStorage();
            this.printLine('✓ Optimized file system storage', 'output-success');
        } catch (e) {
            this.printLine(`✗ Failed to optimize storage: ${e.message}`, 'output-error');
        }
        
        this.printLine('');
        this.printLine(`Cleanup complete! Freed ${totalFreed} bytes`, 'output-success');
        
        const stats = window.axiomContainer.getStorageStats();
        this.printLine(`Disk usage: ${stats.usedPercent}% (${stats.used} / ${stats.total} bytes)`, 'output-info');
    }

    async cmd_ls(args) {
        if (this.checkHelp(args, 'ls')) return;
        
        const { flags, params } = this.filterFlags(args);
        const showHidden = this.hasCommonFlag(args, '-a', '-A');
        const longFormat = this.hasCommonFlag(args, '-l');
        const humanReadable = this.hasCommonFlag(args, '-h');
        
        const path = params[0] || '.';
        
        try {
            let children = window.axiomContainer.listDirectory(path);
            
            // Filter hidden files if not -a
            if (!showHidden) {
                children = children.filter(c => !c.name.startsWith('.'));
            }
            
            if (longFormat) {
                for (const child of children) {
                    const date = new Date(child.modified).toISOString().split('T')[0];
                    const size = child.size.toString().padStart(8);
                    
                    // Colorful file names based on type
                    let nameClass = 'file-name';
                    let nameDisplay = child.name;
                    
                    if (child.type === 'directory') {
                        nameClass = 'directory-name';
                        nameDisplay += '/';
                    } else if (child.name.endsWith('.sh') || child.name.endsWith('.exe')) {
                        nameClass = 'executable-name';
                    } else if (child.name.match(/\.(zip|tar|gz|bz2|7z|rar)$/)) {
                        nameClass = 'archive-name';
                    } else if (child.name.match(/\.(jpg|jpeg|png|gif|svg|bmp)$/)) {
                        nameClass = 'image-name';
                    } else if (child.name.match(/\.(txt|md|log)$/)) {
                        nameClass = 'text-name';
                    }
                    
                    const name = `<span class="${nameClass}">${nameDisplay}</span>`;
                    
                    this.printLine(
                        `<span class="file-permissions">${child.permissions}</span>` +
                        `<span class="file-size">${size}</span>` +
                        `<span class="file-date">${date}</span>` +
                        name
                    );
                }
            } else {
                const names = children.map(c => {
                    let nameClass = 'file-name';
                    let nameDisplay = c.name;
                    
                    if (c.type === 'directory') {
                        nameClass = 'directory-name';
                        nameDisplay += '/';
                    } else if (c.name.endsWith('.sh') || c.name.endsWith('.exe')) {
                        nameClass = 'executable-name';
                    } else if (c.name.match(/\.(zip|tar|gz|bz2|7z|rar)$/)) {
                        nameClass = 'archive-name';
                    } else if (c.name.match(/\.(jpg|jpeg|png|gif|svg|bmp)$/)) {
                        nameClass = 'image-name';
                    } else if (c.name.match(/\.(txt|md|log)$/)) {
                        nameClass = 'text-name';
                    }
                    
                    return `<span class="${nameClass}">${nameDisplay}</span>`;
                });
                this.printLine(names.join('  |  '));
            }
        } catch (error) {
            this.printLine(`ls: ${error.message}`, 'output-error');
        }
    }

    async cmd_cd(args) {
        if (this.checkHelp(args, 'cd')) return;
        
        const path = args[0] || window.axiomEnv.get('HOME');
        
        try {
            window.axiomContainer.changeDirectory(path);
        } catch (error) {
            this.printLine(`cd: ${error.message}`, 'output-error');
        }
    }

    async cmd_pwd(args) {
        if (this.checkHelp(args, 'pwd')) return;
        this.printLine(window.axiomContainer.getCurrentDirectory());
    }

    async cmd_cat(args) {
        if (this.checkHelp(args, 'cat')) return;
        
        const { flags, params } = this.filterFlags(args);
        const showLineNumbers = this.hasCommonFlag(args, '-n');
        
        if (params.length === 0) {
            this.printLine('cat: missing file operand', 'output-error');
            this.printLine("Try 'cat --help' for more information.");
            return;
        }

        try {
            for (const file of params) {
                const content = window.axiomContainer.readFile(file);
                
                // Limit output size
                if (content.length > 10 * 1024 * 1024) {
                    this.printLine('cat: file too large to display (max 10MB)', 'output-error');
                    return;
                }
                
                if (showLineNumbers) {
                    const lines = content.split('\\n');
                    lines.forEach((line, i) => {
                        this.printLine(`${(i + 1).toString().padStart(6)}  ${line}`);
                    });
                } else {
                    this.printLine(content);
                }
            }
        } catch (error) {
            this.printLine(`cat: ${error.message}`, 'output-error');
        }
    }

    async cmd_echo(args) {
        if (this.checkHelp(args, 'echo')) return;
        
        const text = args.join(' ');
        
        // Limit text length
        if (text.length > 100000) {
            this.printLine('echo: text too long (max 100KB)', 'output-error');
            return;
        }
        
        // Check for output redirection
        if (text.includes('>')) {
            const parts = text.split('>');
            const content = parts[0].trim();
            const file = parts[1].trim();
            const append = text.includes('>>');
            
            // Validate filename
            if (!file || file.length > 4096) {
                this.printLine('echo: invalid filename', 'output-error');
                return;
            }
            
            try {
                window.axiomContainer.writeFile(file, content + '\n', append);
            } catch (error) {
                this.printLine(`echo: ${error.message}`, 'output-error');
            }
        } else {
            this.printLine(window.axiomEnv.expand(text));
        }
    }

    async cmd_touch(args) {
        if (this.checkHelp(args, 'touch')) return;
        
        if (args.length === 0) {
            this.printLine('touch: missing file operand', 'output-error');
            this.printLine('Try \'touch --help\' for more information.');
            return;
        }
        
        // Limit bulk operations
        if (args.length > 100) {
            this.printLine('touch: too many arguments (max 100)', 'output-error');
            return;
        }

        try {
            for (const file of args) {
                if (!window.axiomContainer.exists(file)) {
                    window.axiomContainer.writeFile(file, '');
                }
            }
        } catch (error) {
            this.printLine(`touch: ${error.message}`, 'output-error');
        }
    }

    async cmd_mkdir(args) {
        if (this.checkHelp(args, 'mkdir')) return;
        
        const { flags, params } = this.filterFlags(args);
        
        if (params.length === 0) {
            this.printLine('mkdir: missing operand', 'output-error');
            this.printLine('Try \'mkdir --help\' for more information.');
            return;
        }
        
        if (params.length > 100) {
            this.printLine('mkdir: too many arguments (max 100)', 'output-error');
            return;
        }

        try {
            for (const dir of params) {
                window.axiomContainer.createDirectory(dir);
            }
        } catch (error) {
            this.printLine(`mkdir: ${error.message}`, 'output-error');
        }
    }

    async cmd_rm(args) {
        if (this.checkHelp(args, 'rm')) return;
        
        const { flags, params } = this.filterFlags(args);
        const recursive = this.hasCommonFlag(args, '-r', '-R');
        const force = this.hasCommonFlag(args, '-f');
        
        if (params.length === 0) {
            this.printLine('rm: missing operand', 'output-error');
            this.printLine('Try \'rm --help\' for more information.');
            return;
        }
        
        if (params.length > 100) {
            this.printLine('rm: too many arguments (max 100)', 'output-error');
            return;
        }

        try {
            for (const pattern of params) {
                // Expand wildcards
                const files = this.expandWildcards(pattern);
                
                for (const file of files) {
                    try {
                        const entry = window.axiomContainer.getFile(file);
                        
                        if (entry && entry.type === 'directory') {
                            if (recursive) {
                                // Recursive delete not fully implemented, just try remove
                                window.axiomContainer.removeDirectory(file);
                            } else {
                                if (!force) {
                                    this.printLine(`rm: cannot remove '${file}': Is a directory`, 'output-error');
                                }
                            }
                        } else {
                            window.axiomContainer.deleteFile(file);
                        }
                    } catch (e) {
                        if (!force) {
                            this.printLine(`rm: ${e.message}`, 'output-error');
                        }
                    }
                }
            }
        } catch (error) {
            if (!force) {
                this.printLine(`rm: ${error.message}`, 'output-error');
            }
        }
    }

    async cmd_rmdir(args) {
        if (this.checkHelp(args, 'rmdir')) return;
        
        const { flags, params } = this.filterFlags(args);
        
        if (params.length === 0) {
            this.printLine('rmdir: missing operand', 'output-error');
            this.printLine('Try \'rmdir --help\' for more information.');
            return;
        }
        
        if (params.length > 100) {
            this.printLine('rmdir: too many arguments (max 100)', 'output-error');
            return;
        }

        try {
            for (const dir of params) {
                window.axiomContainer.removeDirectory(dir);
            }
        } catch (error) {
            this.printLine(`rmdir: ${error.message}`, 'output-error');
        }
    }

    async cmd_cp(args) {
        if (this.checkHelp(args, 'cp')) return;
        
        const { flags, params } = this.filterFlags(args);
        const verbose = this.hasCommonFlag(args, '-v');
        
        if (params.length < 2) {
            this.printLine('cp: missing file operand', 'output-error');
            this.printLine('Try \'cp --help\' for more information.');
            return;
        }

        try {
            window.axiomContainer.copyFile(params[0], params[1]);
            if (verbose) {
                this.printLine(`'${params[0]}' -> '${params[1]}'`, 'output-success');
            }
        } catch (error) {
            this.printLine(`cp: ${error.message}`, 'output-error');
        }
    }

    async cmd_mv(args) {
        if (this.checkHelp(args, 'mv')) return;
        
        const { flags, params } = this.filterFlags(args);
        const verbose = this.hasCommonFlag(args, '-v');
        
        if (params.length < 2) {
            this.printLine('mv: missing file operand', 'output-error');
            this.printLine('Try \'mv --help\' for more information.');
            return;
        }

        try {
            window.axiomContainer.moveFile(params[0], params[1]);
            if (verbose) {
                this.printLine(`'${params[0]}' -> '${params[1]}'`, 'output-success');
            }
        } catch (error) {
            this.printLine(`mv: ${error.message}`, 'output-error');
        }
    }

    async cmd_find(args) {
        if (this.checkHelp(args, 'find')) return;
        
        const path = args[0] || '.';
        const pattern = args[1] || '*';
        
        // Limit pattern length
        if (pattern.length > 255) {
            this.printLine('find: pattern too long (max 255 characters)', 'output-error');
            return;
        }
        
        try {
            const allFiles = [];
            const maxResults = 10000;
            const maxDepth = 100;
            
            const findRecursive = (dir, depth = 0) => {
                // Prevent excessive recursion
                if (depth > maxDepth) {
                    throw new Error(`Maximum directory depth exceeded (${maxDepth})`);
                }
                
                // Limit results
                if (allFiles.length >= maxResults) {
                    return;
                }
                
                const children = window.axiomContainer.listDirectory(dir);
                
                for (const child of children) {
                    if (allFiles.length >= maxResults) break;
                    
                    if (child.name.includes(pattern) || pattern === '*') {
                        allFiles.push(child.path);
                    }
                    if (child.type === 'directory') {
                        findRecursive(child.path, depth + 1);
                    }
                }
            };
            
            findRecursive(path);
            
            allFiles.forEach(f => this.printLine(f));
            
            if (allFiles.length >= maxResults) {
                this.printLine(`find: output truncated (max ${maxResults} results)`, 'output-warning');
            }
        } catch (error) {
            this.printLine(`find: ${error.message}`, 'output-error');
        }
    }

    async cmd_grep(args) {
        if (this.checkHelp(args, 'grep')) return;
        
        const { flags, params } = this.filterFlags(args);
        const ignoreCase = this.hasCommonFlag(args, '-i');
        const invertMatch = this.hasCommonFlag(args, '-v');
        const countOnly = this.hasCommonFlag(args, '-c');
        
        if (params.length < 2) {
            this.printLine('grep: missing operand', 'output-error');
            this.printLine("Try 'grep --help' for more information.");
            return;
        }

        const pattern = String(params[0] || '');
        const file = params[1];
        
        // Limit pattern length
        if (pattern.length > 1000) {
            this.printLine('grep: pattern too long (max 1000 characters)', 'output-error');
            return;
        }

        try {
            const content = window.axiomContainer.readFile(file);
            
            // Limit file size for grep
            if (content.length > 5 * 1024 * 1024) {
                this.printLine('grep: file too large (max 5MB)', 'output-error');
                return;
            }
            
            const lines = content.split('\\n');
            let matchCount = 0;
            const maxMatches = 10000;
            
            lines.forEach((line, index) => {
                if (matchCount >= maxMatches && !countOnly) return;
                
                let matches = false;
                if (ignoreCase) {
                    matches = line.toLowerCase().includes(pattern.toLowerCase());
                } else {
                    matches = line.includes(pattern);
                }
                
                if (invertMatch) matches = !matches;
                
                if (matches) {
                    matchCount++;
                    if (!countOnly) {
                        this.printLine(`${index + 1}: ${line}`);
                    }
                }
            });
            
            if (countOnly) {
                this.printLine(matchCount.toString());
            } else if (matchCount >= maxMatches) {
                this.printLine(`grep: output truncated (max ${maxMatches} matches)`, 'output-warning');
            }
        } catch (error) {
            this.printLine(`grep: ${error.message}`, 'output-error');
        }
    }

    async cmd_head(args) {
        if (this.checkHelp(args, 'head')) return;
        
        let lines = 10;
        if (args.includes('-n')) {
            const lineArg = args[args.indexOf('-n') + 1];
            lines = parseInt(lineArg);
            if (isNaN(lines) || lines < 0) {
                this.printLine('head: invalid number of lines', 'output-error');
                return;
            }
            lines = Math.min(lines, 100000);
        }
        
        const file = args.filter(a => !a.startsWith('-') && a !== args[args.indexOf('-n') + 1])[0];

        if (!file) {
            this.printLine('head: missing file operand', 'output-error');
            this.printLine('Try \'head --help\' for more information.');
            return;
        }

        try {
            const content = window.axiomContainer.readFile(file);
            const fileLines = content.split('\n');
            this.printLine(fileLines.slice(0, lines).join('\n'));
        } catch (error) {
            this.printLine(`head: ${error.message}`, 'output-error');
        }
    }

    async cmd_tail(args) {
        if (this.checkHelp(args, 'tail')) return;
        
        let lines = 10;
        if (args.includes('-n')) {
            const lineArg = args[args.indexOf('-n') + 1];
            lines = parseInt(lineArg);
            if (isNaN(lines) || lines < 0) {
                this.printLine('tail: invalid number of lines', 'output-error');
                return;
            }
            lines = Math.min(lines, 100000);
        }
        
        const file = args.filter(a => !a.startsWith('-') && a !== args[args.indexOf('-n') + 1])[0];

        if (!file) {
            this.printLine('tail: missing file operand', 'output-error');
            this.printLine('Try \'tail --help\' for more information.');
            return;
        }

        try {
            const content = window.axiomContainer.readFile(file);
            const fileLines = content.split('\n');
            this.printLine(fileLines.slice(-lines).join('\n'));
        } catch (error) {
            this.printLine(`tail: ${error.message}`, 'output-error');
        }
    }

    async cmd_wc(args) {
        if (this.checkHelp(args, 'wc')) return;
        
        if (args.length === 0) {
            this.printLine('wc: missing file operand', 'output-error');
            this.printLine('Try \'wc --help\' for more information.');
            return;
        }

        try {
            const content = window.axiomContainer.readFile(args[0]);
            const lines = content.split('\n').length;
            const words = content.split(/\s+/).filter(w => w.length > 0).length;
            const chars = content.length;
            
            this.printLine(`${lines.toString().padStart(8)} ${words.toString().padStart(8)} ${chars.toString().padStart(8)} ${args[0]}`);
        } catch (error) {
            this.printLine(`wc: ${error.message}`, 'output-error');
        }
    }

    async cmd_uname(args) {
        if (this.checkHelp(args, 'uname')) return;
        
        if (args.includes('-a')) {
            this.printLine('Axiom 1.0.0 axiom x86_64 DosX-Processor-A10');
        } else {
            this.printLine('Axiom');
        }
    }

    async cmd_whoami(args) {
        if (this.checkHelp(args, 'whoami')) return;
        this.printLine(window.axiomEnv.get('USER'));
    }

    async cmd_date(args) {
        if (this.checkHelp(args, 'date')) return;
        this.printLine(new Date().toString());
    }

    async cmd_uptime(args) {
        if (this.checkHelp(args, 'uptime')) return;
        
        const uptime = Date.now() - window.performance.timeOrigin;
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        this.printLine(`up ${hours}h ${minutes % 60}m ${seconds % 60}s`);
    }

    async cmd_free(args) {
        if (this.checkHelp(args, 'free')) return;
        
        const memInfo = window.axiomMemory.getMemoryInfo();
        
        this.printLine('              total        used        free');
        this.printLine(`Mem:      ${memInfo.total.toString().padStart(8)} ${memInfo.allocated.toString().padStart(11)} ${memInfo.free.toString().padStart(11)}`);
    }

    async cmd_df(args) {
        if (this.checkHelp(args, 'df')) return;
        
        const stats = window.axiomContainer.getStorageStats();
        
        this.printLine('Filesystem      Size  Used Avail Use%');
        this.printLine(`/dev/axiom     ${Math.floor(stats.total/1024)}K  ${Math.floor(stats.used/1024)}K  ${Math.floor(stats.free/1024)}K  ${stats.usedPercent}%`);
        
        // Show compression info if enabled
        if (stats.compressed && stats.compressionRatio) {
            this.printLine('');
            this.printLine(`<span class="output-success">Compression: ${stats.algorithm} (${stats.compressionRatio}% saved)</span>`);
        }
    }

    async cmd_ps(args) {
        if (this.checkHelp(args, 'ps')) return;
        
        const processes = window.axiomVM.listProcesses();
        
        this.printLine('PID  STATE        NAME');
        processes.forEach(proc => {
            this.printLine(`${proc.pid.toString().padStart(4)} ${proc.state.padEnd(12)} ${proc.name}`);
        });
    }

    async cmd_top(args) {
        if (this.checkHelp(args, 'top')) return;
        
        const cpuInfo = window.axiomCPU.getState();
        const memInfo = window.axiomMemory.getMemoryInfo();
        const counters = window.axiomCPU.getCounters();
        
        this.printLine('<span class="cpu-info">CPU Usage:</span>');
        this.printLine(`  Running: ${cpuInfo.running}`);
        this.printLine(`  Instructions: ${counters.instructionsExecuted}`);
        this.printLine(`  Cycles: ${counters.cyclesElapsed}`);
        this.printLine('');
        this.printLine('<span class="cpu-info">Memory:</span>');
        this.printLine(`  Total: ${memInfo.total} MB`);
        this.printLine(`  Used: ${memInfo.allocated} MB`);
        this.printLine(`  Free: ${memInfo.free} MB`);
    }

    async cmd_cpuinfo(args) {
        if (this.checkHelp(args, 'cpuinfo')) return;
        
        const cpuInfo = window.axiomCPU.getCPUInfo();
        
        this.printLine('<span class="cpu-info">Processor Information:</span>');
        this.printLine(`  Model name:    ${cpuInfo.name}`);
        this.printLine(`  Vendor:        ${cpuInfo.vendor}`);
        this.printLine(`  Architecture:  ${cpuInfo.architecture}`);
        this.printLine(`  CPU cores:     ${cpuInfo.cores}`);
        this.printLine(`  Threads:       ${cpuInfo.threads}`);
        this.printLine(`  Clock speed:   ${cpuInfo.clockSpeed} MHz`);
        this.printLine(`  Features:      ${cpuInfo.features.join(', ')}`);
    }

    async cmd_lscpu(args) {
        if (this.checkHelp(args, 'lscpu')) return;
        await this.cmd_cpuinfo(args);
    }

    async cmd_env(args) {
        if (this.checkHelp(args, 'env')) return;
        
        const vars = window.axiomEnv.list();
        
        for (const [key, value] of Object.entries(vars)) {
            this.printLine(`${key}=${value}`);
        }
    }

    async cmd_export(args) {
        if (this.checkHelp(args, 'export')) return;
        
        if (args.length === 0) {
            await this.cmd_env(args);
            return;
        }

        for (const arg of args) {
            const [key, value] = arg.split('=');
            if (key && value) {
                window.axiomEnv.set(key, value);
            } else {
                this.printLine(`export: invalid format. Use VAR=value`, 'output-error');
            }
        }
    }

    async cmd_unset(args) {
        if (this.checkHelp(args, 'unset')) return;
        
        if (args.length === 0) {
            this.printLine('unset: missing variable name', 'output-error');
            this.printLine('Try \'unset --help\' for more information.');
            return;
        }

        for (const key of args) {
            window.axiomEnv.unset(key);
        }
    }

    // Terminal UI methods
    print(text) {
        const line = document.createElement('div');
        line.className = 'output-line';
        line.innerHTML = text;
        this.outputElement.appendChild(line);
        this.scrollToBottom();
    }

    printLine(text, className = '') {
        // Don't print when in editor mode
        if (this.editorMode) return;
        
        const line = document.createElement('div');
        line.className = 'output-line ' + className;
        line.innerHTML = text;
        this.outputElement.appendChild(line);
        this.scrollToBottom();
    }

    clearScreen() {
        this.outputElement.innerHTML = '';
    }

    // Alias for external access
    clear() {
        this.clearScreen();
    }

    updatePrompt(prompt) {
        // Update prompt in current input line
        if (this.currentInputLine) {
            const promptSpan = this.currentInputLine.querySelector('.input-prompt');
            if (promptSpan) {
                promptSpan.textContent = prompt;
            }
        }
    }

    updateStatus(status) {
        this.statusElement.textContent = status;
    }

    scrollToBottom() {
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    setupContextMenu() {
        const contextMenu = document.getElementById('axiom-context-menu');
        const container = document.getElementById('terminal-container');
        
        // Show context menu on right-click
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            const selection = window.getSelection();
            const hasSelection = selection && selection.toString().length > 0;
            
            // Position menu
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
            contextMenu.classList.add('show');
            
            // Enable/disable Copy based on selection
            const copyItem = contextMenu.querySelector('[data-action="copy"]');
            if (hasSelection) {
                copyItem.classList.remove('disabled');
            } else {
                copyItem.classList.add('disabled');
            }
        });
        
        // Hide context menu on click outside
        document.addEventListener('click', (e) => {
            if (!contextMenu.contains(e.target)) {
                contextMenu.classList.remove('show');
            }
        });
        
        // Handle menu item clicks
        contextMenu.addEventListener('click', async (e) => {
            const item = e.target.closest('.context-menu-item');
            if (!item || item.classList.contains('disabled')) return;
            
            const action = item.dataset.action;
            contextMenu.classList.remove('show');
            
            switch (action) {
                case 'copy':
                    const selection = window.getSelection();
                    if (selection && selection.toString().length > 0) {
                        try {
                            await navigator.clipboard.writeText(selection.toString());
                        } catch (err) {
                            // Fallback for older browsers
                            document.execCommand('copy');
                        }
                    }
                    break;
                    
                case 'paste':
                    try {
                        const text = await navigator.clipboard.readText();
                        if (text && this.currentInputLine) {
                            // Replace newlines with spaces to prevent breaking the terminal
                            const sanitizedText = text.replace(/[\r\n]+/g, ' ').trim();
                            
                            if (sanitizedText) {
                                // Insert text at cursor position
                                this.currentInput = this.currentInput.substring(0, this.cursorPosition) + 
                                                   sanitizedText + 
                                                   this.currentInput.substring(this.cursorPosition);
                                this.cursorPosition += sanitizedText.length;
                                this.updateInputDisplay();
                            }
                        }
                    } catch (err) {
                        this.printLine('Paste permission denied', 'output-error');
                    }
                    break;
                    
                case 'reboot':
                    this.clearScreen();
                    this.printLine('Rebooting Axiom OS...', 'output-warning');
                    setTimeout(() => {
                        location.reload();
                    }, 500);
                    break;
            }
        });
    }

    // Alias management
    loadAliases() {
        try {
            // Try to load from file system first
            if (window.axiomContainer && window.axiomContainer.exists('/etc/aliases')) {
                const aliasesData = window.axiomContainer.readFile('/etc/aliases');
                const aliases = JSON.parse(aliasesData);
                for (const [key, value] of Object.entries(aliases)) {
                    this.aliases.set(key, value);
                }
                return;
            }
            
            // Fallback: migrate from localStorage if exists
            const stored = localStorage.getItem('axiom_aliases');
            if (stored) {
                const aliases = JSON.parse(stored);
                for (const [key, value] of Object.entries(aliases)) {
                    this.aliases.set(key, value);
                }
                // Migrate to file system
                this.saveAliases();
                // Clean up old localStorage
                localStorage.removeItem('axiom_aliases');
            }
        } catch (e) {
            console.warn('Failed to load aliases:', e);
        }
    }

    saveAliases() {
        try {
            const obj = {};
            for (const [key, value] of this.aliases.entries()) {
                obj[key] = value;
            }
            const aliasesData = JSON.stringify(obj);
            
            // Ensure /etc directory exists
            if (!window.axiomContainer.exists('/etc')) {
                window.axiomContainer.createDirectory('/etc', true);
            }
            
            // Save to file system (will be compressed automatically by VMContainer)
            window.axiomContainer.writeFile('/etc/aliases', aliasesData);
        } catch (e) {
            console.warn('Failed to save aliases:', e);
        }
    }

    // Network commands
    async cmd_wget(args) {
        if (this.checkHelp(args, 'wget')) return;
        
        if (args.length === 0) {
            this.printLine('wget: missing URL', 'output-error');
            this.printLine("Try 'wget --help' for more information.");
            return;
        }

        const url = String(args[0] || '').trim();
        
        // Validate URL
        try {
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                throw new Error('Only HTTP/HTTPS protocols are supported');
            }
            // Prevent SSRF to localhost/private IPs
            if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].some(h => urlObj.hostname.includes(h))) {
                throw new Error('Access to localhost is not allowed');
            }
        } catch (e) {
            this.printLine(`wget: ${e.message}`, 'output-error');
            return;
        }
        
        const outputFile = args.includes('-O') ? args[args.indexOf('-O') + 1] : url.split('/').pop() || 'index.html';
        
        // Validate output filename
        if (outputFile.length > 255) {
            this.printLine('wget: filename too long', 'output-error');
            return;
        }

        this.printLine(`Connecting to ${url}...`);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
            
            const response = await fetch(url, {
                signal: controller.signal,
                redirect: 'follow',
                headers: { 'User-Agent': 'Axiom-wget/1.0' }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            
            // Check content length
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
                throw new Error('File too large (max 5MB)');
            }

            const content = await response.text();
            
            // Double-check actual size
            if (content.length > 5 * 1024 * 1024) {
                throw new Error('File too large (max 5MB)');
            }
            
            window.axiomContainer.writeFile(outputFile, content);
            
            this.printLine(`Saved to '${outputFile}' (${content.length} bytes)`, 'output-success');
        } catch (error) {
            this.printLine(`wget: ${error.message}`, 'output-error');
        }
    }

    async cmd_curl(args) {
        if (this.checkHelp(args, 'curl')) return;
        
        if (args.length === 0) {
            this.printLine('curl: missing URL', 'output-error');
            this.printLine("Try 'curl --help' for more information.");
            return;
        }

        const url = String(args[0] || '').trim();
        
        // Validate URL
        try {
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                throw new Error('Only HTTP/HTTPS protocols are supported');
            }
            if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].some(h => urlObj.hostname.includes(h))) {
                throw new Error('Access to localhost is not allowed');
            }
        } catch (e) {
            this.printLine(`curl: ${e.message}`, 'output-error');
            return;
        }
        
        const outputFile = args.includes('-o') ? args[args.indexOf('-o') + 1] : null;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            
            const response = await fetch(url, {
                signal: controller.signal,
                redirect: 'follow',
                headers: { 'User-Agent': 'Axiom-curl/1.0' }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
                throw new Error('Response too large (max 5MB)');
            }

            const content = await response.text();
            
            if (content.length > 5 * 1024 * 1024) {
                throw new Error('Response too large (max 5MB)');
            }
            
            if (outputFile) {
                window.axiomContainer.writeFile(outputFile, content);
                this.printLine(`Saved to '${outputFile}'`, 'output-success');
            } else {
                this.printLine(content);
            }
        } catch (error) {
            this.printLine(`curl: ${error.message}`, 'output-error');
        }
    }

    async cmd_ping(args) {
        if (this.checkHelp(args, 'ping')) return;
        
        if (args.length === 0) {
            this.printLine('ping: missing host', 'output-error');
            this.printLine("Try 'ping --help' for more information.");
            return;
        }

        const host = String(args[0] || '').trim();
        
        // Validate hostname
        if (!host || host.length > 253) {
            this.printLine('ping: invalid hostname', 'output-error');
            return;
        }
        
        // Block localhost/private IPs
        if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].some(h => host.includes(h))) {
            this.printLine('ping: access to localhost is not allowed', 'output-error');
            return;
        }
        
        this.printLine(`PING ${host}...`);

        try {
            const start = Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            await fetch(`https://${host}`, { 
                method: 'HEAD', 
                mode: 'no-cors',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const time = Date.now() - start;
            
            this.printLine(`Reply from ${host}: time=${time}ms`, 'output-success');
        } catch (error) {
            this.printLine(`ping: ${host}: Host unreachable`, 'output-error');
        }
    }

    async cmd_netstat(args) {
        if (this.checkHelp(args, 'netstat')) return;
        
        this.printLine('Active Internet connections');
        this.printLine('Proto  Local Address          State');
        this.printLine('tcp    localhost:80           LISTEN');
        this.printLine('tcp    localhost:443          LISTEN');
    }

    // System utilities
    async cmd_man(args) {
        if (args.length === 0) {
            this.printLine('man: missing command', 'output-error');
            this.printLine("Try 'man --help' for more information.");
            return;
        }

        const commandName = args[0];
        const cmd = this.commands.get(commandName);
        
        if (!cmd) {
            this.printLine(`No manual entry for ${commandName}`, 'output-error');
            return;
        }

        this.printLine(`NAME`, 'output-info');
        this.printLine(`    ${commandName} - ${cmd.description}`);
        this.printLine('');
        this.printLine(`SYNOPSIS`, 'output-info');
        this.printLine(`    ${commandName} ${cmd.usage}`);
        this.printLine('');
        this.printLine(`DESCRIPTION`, 'output-info');
        this.printLine(`    ${cmd.description}`);
        this.printLine('');
        this.printLine(`OPTIONS`, 'output-info');
        this.printLine(`    --help, -h`);
        this.printLine(`        Display this help message`);
    }

    async cmd_which(args) {
        if (this.checkHelp(args, 'which')) return;
        
        if (args.length === 0) {
            this.printLine('which: missing command', 'output-error');
            this.printLine("Try 'which --help' for more information.");
            return;
        }

        const commandName = args[0];
        
        if (this.commands.has(commandName)) {
            this.printLine(`/usr/bin/${commandName}`);
        } else if (this.aliases.has(commandName)) {
            this.printLine(`alias ${commandName}='${this.aliases.get(commandName)}'`);
        } else {
            this.printLine(`${commandName} not found`, 'output-error');
        }
    }

    async cmd_alias(args) {
        if (this.checkHelp(args, 'alias')) return;
        
        if (args.length === 0) {
            // List all aliases
            if (this.aliases.size === 0) {
                this.printLine('No aliases defined');
            } else {
                for (const [name, command] of this.aliases.entries()) {
                    this.printLine(`alias ${name}='${command}'`);
                }
            }
            return;
        }

        // Create alias
        const aliasStr = args.join(' ');
        const match = aliasStr.match(/^(\w+)=(.+)$/);
        
        if (!match) {
            this.printLine('alias: invalid format. Use: alias name=command', 'output-error');
            return;
        }

        const [, name, command] = match;
        this.aliases.set(name, command.replace(/^['"]|['"]$/g, ''));
        this.saveAliases();
        
        this.printLine(`alias ${name}='${command}'`, 'output-success');
    }

    async cmd_ln(args) {
        if (this.checkHelp(args, 'ln')) return;
        
        const symbolic = args.includes('-s');
        const files = args.filter(a => a !== '-s');
        
        if (files.length < 2) {
            this.printLine('ln: missing file operand', 'output-error');
            this.printLine("Try 'ln --help' for more information.");
            return;
        }

        const target = files[0];
        const link = files[1];

        try {
            if (!window.axiomContainer.exists(target)) {
                throw new Error(`cannot access '${target}': No such file or directory`);
            }

            // Create symbolic link (stored as special file)
            const content = window.axiomContainer.readFile(target);
            window.axiomContainer.writeFile(link, content);
            
            this.printLine(`Created link '${link}' -> '${target}'`, 'output-success');
        } catch (error) {
            this.printLine(`ln: ${error.message}`, 'output-error');
        }
    }

    async cmd_sort(args) {
        if (this.checkHelp(args, 'sort')) return;
        
        if (args.length === 0) {
            this.printLine('sort: missing file operand', 'output-error');
            this.printLine("Try 'sort --help' for more information.");
            return;
        }

        try {
            const content = window.axiomContainer.readFile(args[0]);
            const lines = content.split('\\n');
            lines.sort();
            this.printLine(lines.join('\\n'));
        } catch (error) {
            this.printLine(`sort: ${error.message}`, 'output-error');
        }
    }

    async cmd_uniq(args) {
        if (this.checkHelp(args, 'uniq')) return;
        
        let content;
        
        // Check for piped input
        if (window.axiomPipeData) {
            content = window.axiomPipeData;
        } else if (args.length > 0) {
            try {
                content = window.axiomContainer.readFile(args[0]);
            } catch (error) {
                this.printLine(`uniq: ${error.message}`, 'output-error');
                return;
            }
        } else {
            this.printLine('uniq: missing file operand', 'output-error');
            this.printLine("Try 'uniq --help' for more information.");
            return;
        }

        const lines = content.split('\\n');
        const unique = [];
        let prev = null;
        
        for (const line of lines) {
            if (line !== prev) {
                unique.push(line);
                prev = line;
            }
        }
        
        this.printLine(unique.join('\\n'));
    }

    async cmd_diff(args) {
        if (this.checkHelp(args, 'diff')) return;
        
        if (args.length < 2) {
            this.printLine('diff: missing file operand', 'output-error');
            this.printLine("Try 'diff --help' for more information.");
            return;
        }

        try {
            const content1 = window.axiomContainer.readFile(args[0]);
            const content2 = window.axiomContainer.readFile(args[1]);
            
            const lines1 = content1.split('\\n');
            const lines2 = content2.split('\\n');
            
            let hasDiff = false;
            const maxLen = Math.max(lines1.length, lines2.length);
            
            for (let i = 0; i < maxLen; i++) {
                const line1 = lines1[i] || '';
                const line2 = lines2[i] || '';
                
                if (line1 !== line2) {
                    if (!hasDiff) {
                        this.printLine(`--- ${args[0]}`);
                        this.printLine(`+++ ${args[1]}`);
                        hasDiff = true;
                    }
                    
                    if (line1) this.printLine(`- ${line1}`, 'output-error');
                    if (line2) this.printLine(`+ ${line2}`, 'output-success');
                }
            }
            
            if (!hasDiff) {
                this.printLine('Files are identical');
            }
        } catch (error) {
            this.printLine(`diff: ${error.message}`, 'output-error');
        }
    }

    async cmd_tree(args) {
        if (this.checkHelp(args, 'tree')) return;
        
        const {params, flags} = this.filterFlags(args);
        
        // Parse flags
        const showAll = flags.includes('-a');
        const dirsOnly = flags.includes('-d');
        const fullPath = flags.includes('-f');
        
        // Parse depth limit
        let maxDepth = Infinity;
        const levelIndex = flags.indexOf('-L');
        if (levelIndex !== -1 && levelIndex + 1 < flags.length) {
            const depth = parseInt(flags[levelIndex + 1]);
            if (!isNaN(depth) && depth > 0) {
                maxDepth = depth;
            }
        }
        
        // Get path (default to current directory)
        const targetPath = params[0] || window.axiomContainer.currentDirectory;
        
        try {
            if (!window.axiomContainer.exists(targetPath)) {
                this.printLine(`tree: ${targetPath}: No such file or directory`, 'output-error');
                return;
            }
            
            const entry = window.axiomContainer.getFile(targetPath);
            if (entry.type !== 'directory') {
                this.printLine(`tree: ${targetPath}: Not a directory`, 'output-error');
                return;
            }
            
            // Print header
            this.printLine(targetPath);
            
            // Statistics
            let dirCount = 0;
            let fileCount = 0;
            
            // Recursive tree builder
            const buildTree = (path, prefix = '', depth = 0) => {
                if (depth >= maxDepth) return;
                
                try {
                    const entries = window.axiomContainer.listDirectory(path);
                    
                    // Filter entries
                    let filtered = entries.filter(entry => {
                        // Skip hidden files unless -a flag
                        if (!showAll && entry.name.startsWith('.')) return false;
                        // Skip files if -d flag (directories only)
                        if (dirsOnly && entry.type !== 'directory') return false;
                        return true;
                    });
                    
                    // Sort: directories first, then files, alphabetically
                    filtered.sort((a, b) => {
                        if (a.type === b.type) return a.name.localeCompare(b.name);
                        return a.type === 'directory' ? -1 : 1;
                    });
                    
                    filtered.forEach((entry, index) => {
                        const isLast = index === filtered.length - 1;
                        const branch = isLast ? '└── ' : '├── ';
                        const extension = isLast ? '    ' : '│   ';
                        
                        // Determine color class
                        let colorClass = '';
                        if (entry.type === 'directory') {
                            colorClass = 'directory-name';
                            dirCount++;
                        } else {
                            fileCount++;
                            // File type colors
                            if (entry.name.match(/\\.(sh|exe|bin)$/)) colorClass = 'executable-name';
                            else if (entry.name.match(/\\.(zip|tar|gz|rar|7z)$/)) colorClass = 'archive-name';
                            else if (entry.name.match(/\\.(jpg|jpeg|png|gif|bmp|svg)$/)) colorClass = 'image-name';
                            else if (entry.name.match(/\\.(txt|md|log)$/)) colorClass = 'text-name';
                            else colorClass = 'file-name';
                        }
                        
                        // Build display name
                        let displayName = entry.name;
                        if (fullPath) {
                            displayName = entry.path;
                        }
                        if (entry.type === 'directory') {
                            displayName += '/';
                        }
                        
                        this.printLine(`${prefix}${branch}<span class="${colorClass}">${displayName}</span>`);
                        
                        // Recurse into directories
                        if (entry.type === 'directory') {
                            buildTree(entry.path, prefix + extension, depth + 1);
                        }
                    });
                } catch (e) {
                    // Permission denied or other error
                    this.printLine(`${prefix}[error opening dir]`, 'output-error');
                }
            };
            
            buildTree(targetPath);
            
            // Print summary
            this.printLine('');
            if (dirsOnly) {
                this.printLine(`${dirCount} directories`);
            } else {
                this.printLine(`${dirCount} directories, ${fileCount} files`);
            }
            
        } catch (error) {
            this.printLine(`tree: ${error.message}`, 'output-error');
        }
    }

    async cmd_ui_notepad(args) {
        if (this.checkHelp(args, 'ui-notepad')) return;
        
        if (args.length === 0) {
            this.printLine('ui-notepad: missing file operand', 'output-error');
            this.printLine("Usage: ui-notepad <file>");
            return;
        }

        const filename = args[0];
        await this.uiNotepad.open(filename);
    }
}

// Initialize terminal on page load
window.axiomTerminal = new AxiomTerminal();

document.addEventListener('DOMContentLoaded', async () => {
    await window.axiomTerminal.initialize();
});
