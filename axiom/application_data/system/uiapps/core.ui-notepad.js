/**
 * UI-Notepad - Axiom OS Text Editor
 * Full-featured modal text editor with line numbers and keyboard shortcuts
 * 
 * Features:
 * - Line numbers with synchronized scrolling
 * - Ctrl shortcuts (Latin + Cyrillic support)
 * - Cut/paste clipboard
 * - Search functionality
 * - Modification tracking
 * - Auto-save to VMContainer
 */

class UINotepad {
    constructor(terminal) {
        this.terminal = terminal;
        this.editorMode = false;
        this.clipboard = '';
        this.modified = false;
    }

    /**
     * Open file in editor
     * @param {string} filename - Path to file
     */
    async open(filename) {
        let content = '';
        let fileExists = false;

        // Try to read existing file
        try {
            if (window.axiomContainer.exists(filename)) {
                content = window.axiomContainer.readFile(filename);
                fileExists = true;
            }
        } catch (e) {
            // New file
        }

        this.enterEditorMode(filename, content, fileExists);
    }

    /**
     * Enter modal editor mode
     */
    enterEditorMode(filename, content, fileExists) {
        this.editorMode = true;
        this.modified = false;
        
        // Sync with terminal
        this.terminal.editorMode = true;
        
        // Remove all cursor blink animations to fix duplication bug
        const styles = document.querySelectorAll('style');
        styles.forEach(style => {
            if (style.textContent.includes('@keyframes blink') || style.textContent.includes('cursor-blink')) {
                style.remove();
            }
        });
        
        // Remove any existing input elements
        const oldInput = document.getElementById('terminal-input');
        if (oldInput) {
            oldInput.remove();
        }
        
        // Hide terminal
        const terminalContainer = document.getElementById('terminal-container');
        terminalContainer.style.display = 'none';
        
        // Create editor
        const editor = document.createElement('div');
        editor.id = 'axiom-editor';
        editor.className = 'axiom-editor';
        
        const statusText = fileExists ? '' : ' [New File]';
        
        editor.innerHTML = `
            <div class="editor-header">
                <span class="editor-filename">File: ${filename}${statusText}</span>
                <span class="editor-info">Modified</span>
            </div>
            <div class="editor-body">
                <div class="editor-line-numbers" id="editor-line-numbers"></div>
                <textarea class="editor-content" id="editor-textarea" spellcheck="false">${content}</textarea>
            </div>
            <div class="editor-footer">
                <div class="editor-shortcuts">
                    <span>^S Save</span>
                    <span>^X Exit</span>
                    <span>^K Cut Line</span>
                    <span>^U Paste</span>
                    <span>^W Search</span>
                </div>
                <div class="editor-status" id="editor-status">Line 1, Col 1</div>
            </div>
        `;
        
        document.body.appendChild(editor);
        
        const textarea = document.getElementById('editor-textarea');
        const lineNumbers = document.getElementById('editor-line-numbers');
        const statusBar = document.getElementById('editor-status');
        const infoBar = editor.querySelector('.editor-info');
        
        // Update line numbers
        const updateLineNumbers = () => {
            const lines = textarea.value.split('\n').length;
            const numbers = [];
            for (let i = 1; i <= lines; i++) {
                numbers.push(`<div class="line-number">${i}</div>`);
            }
            lineNumbers.innerHTML = numbers.join('');
        };
        
        // Update cursor position
        const updateStatus = () => {
            const pos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, pos);
            const line = textBefore.split('\n').length;
            const col = textBefore.split('\n').pop().length + 1;
            statusBar.textContent = `Line ${line}, Col ${col}`;
        };
        
        // Mark as modified
        const markModified = () => {
            if (!this.modified) {
                this.modified = true;
                infoBar.textContent = 'Modified';
                infoBar.style.color = '#ffb86c';
            }
        };
        
        // Sync scroll
        textarea.addEventListener('scroll', () => {
            lineNumbers.scrollTop = textarea.scrollTop;
        });
        
        // Update on input
        textarea.addEventListener('input', () => {
            updateLineNumbers();
            updateStatus();
            markModified();
        });
        
        textarea.addEventListener('click', updateStatus);
        textarea.addEventListener('keyup', updateStatus);
        
        // Keyboard shortcuts
        textarea.addEventListener('keydown', (e) => {
            // Ctrl+S - Save (support Cyrillic 'ы')
            if (e.ctrlKey && (e.key === 's' || e.key === 'ы')) {
                e.preventDefault();
                try {
                    window.axiomContainer.writeFile(filename, textarea.value);
                    this.modified = false;
                    infoBar.textContent = 'Saved';
                    infoBar.style.color = '#50fa7b';
                    setTimeout(() => {
                        infoBar.textContent = '';
                    }, 2000);
                } catch (err) {
                    infoBar.textContent = `Error: ${err.message}`;
                    infoBar.style.color = '#ff5555';
                }
                return;
            }
            
            // Ctrl+X - Exit (support Cyrillic 'ч')
            if (e.ctrlKey && (e.key === 'x' || e.key === 'ч')) {
                e.preventDefault();
                if (this.modified) {
                    const save = confirm(`Save modified buffer (y/n)?`);
                    if (save) {
                        try {
                            window.axiomContainer.writeFile(filename, textarea.value);
                        } catch (err) {
                            alert(`Error saving: ${err.message}`);
                            return;
                        }
                    }
                }
                this.exitEditorMode(editor);
                return;
            }
            
            // Ctrl+K - Cut line (support Cyrillic 'л')
            if (e.ctrlKey && (e.key === 'k' || e.key === 'л')) {
                e.preventDefault();
                const start = textarea.selectionStart;
                const value = textarea.value;
                const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                const lineEnd = value.indexOf('\n', start);
                const end = lineEnd === -1 ? value.length : lineEnd + 1;
                
                this.clipboard = value.substring(lineStart, end);
                textarea.value = value.substring(0, lineStart) + value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = lineStart;
                
                updateLineNumbers();
                updateStatus();
                markModified();
                return;
            }
            
            // Ctrl+U - Paste (support Cyrillic 'г')
            if (e.ctrlKey && (e.key === 'u' || e.key === 'г')) {
                e.preventDefault();
                if (this.clipboard) {
                    const start = textarea.selectionStart;
                    const value = textarea.value;
                    textarea.value = value.substring(0, start) + this.clipboard + value.substring(start);
                    textarea.selectionStart = textarea.selectionEnd = start + this.clipboard.length;
                    
                    updateLineNumbers();
                    updateStatus();
                    markModified();
                }
                return;
            }
            
            // Ctrl+W - Search (support Cyrillic 'ц')
            if (e.ctrlKey && (e.key === 'w' || e.key === 'ц')) {
                e.preventDefault();
                const search = prompt('Search:');
                if (search) {
                    const pos = textarea.value.indexOf(search, textarea.selectionStart);
                    if (pos !== -1) {
                        textarea.selectionStart = pos;
                        textarea.selectionEnd = pos + search.length;
                        textarea.focus();
                        updateStatus();
                    } else {
                        alert('Not found');
                    }
                }
                return;
            }
            
            // Tab - Insert 4 spaces
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const value = textarea.value;
                textarea.value = value.substring(0, start) + '    ' + value.substring(start);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
                markModified();
                return;
            }
        });
        
        // Initial setup
        updateLineNumbers();
        updateStatus();
        textarea.focus();
    }

    /**
     * Exit editor mode and return to terminal
     */
    exitEditorMode(editor) {
        this.editorMode = false;
        
        // Sync with terminal
        this.terminal.editorMode = false;
        
        editor.remove();
        
        // Show terminal
        const terminalContainer = document.getElementById('terminal-container');
        terminalContainer.style.display = 'flex';
        
        // Clear any remaining cursor styles
        const styles = document.querySelectorAll('style');
        styles.forEach(style => {
            if (style.textContent.includes('@keyframes blink') || style.textContent.includes('cursor-blink')) {
                style.remove();
            }
        });
        
        // Recreate input line and restore cursor blink
        this.terminal.createInputLine();
    }

    /**
     * Check if editor is currently active
     */
    isActive() {
        return this.editorMode;
    }
}

// Export for global access
window.UINotepad = UINotepad;
