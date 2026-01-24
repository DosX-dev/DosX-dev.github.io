/**
 * Axiom Virtual Machine Emulator
 * Executes programs and manages system calls
 */

class VMEmulator {
    constructor() {
        this.programs = new Map();
        this.processes = new Map();
        this.nextPID = 1;
        this.currentProcess = null;
        this.syscallTable = new Map();
    }

    async initialize() {
        this.registerSyscalls();
        return true;
    }

    registerSyscalls() {
        // File operations
        this.syscallTable.set('open', this.sys_open.bind(this));
        this.syscallTable.set('close', this.sys_close.bind(this));
        this.syscallTable.set('read', this.sys_read.bind(this));
        this.syscallTable.set('write', this.sys_write.bind(this));
        this.syscallTable.set('lseek', this.sys_lseek.bind(this));
        
        // Directory operations
        this.syscallTable.set('mkdir', this.sys_mkdir.bind(this));
        this.syscallTable.set('rmdir', this.sys_rmdir.bind(this));
        this.syscallTable.set('chdir', this.sys_chdir.bind(this));
        this.syscallTable.set('getcwd', this.sys_getcwd.bind(this));
        
        // Process operations
        this.syscallTable.set('exit', this.sys_exit.bind(this));
        this.syscallTable.set('getpid', this.sys_getpid.bind(this));
        this.syscallTable.set('sleep', this.sys_sleep.bind(this));
        
        // Memory operations
        this.syscallTable.set('malloc', this.sys_malloc.bind(this));
        this.syscallTable.set('free', this.sys_free.bind(this));
    }

    async executeSyscall(syscall, args) {
        const handler = this.syscallTable.get(syscall);
        if (!handler) {
            throw new Error(`Unknown syscall: ${syscall}`);
        }
        
        try {
            return await handler(args);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Syscall implementations
    async sys_open(args) {
        const { path, mode } = args;
        const fd = window.axiomFS.input.open(path, mode || 'r');
        return { success: true, fd };
    }

    async sys_close(args) {
        const { fd } = args;
        window.axiomFS.input.close(fd);
        return { success: true };
    }

    async sys_read(args) {
        const { fd, length } = args;
        const data = window.axiomFS.input.read(fd, length || -1);
        return { success: true, data };
    }

    async sys_write(args) {
        const { fd, data } = args;
        const written = window.axiomFS.output.write(fd, data);
        return { success: true, written };
    }

    async sys_lseek(args) {
        const { fd, offset, whence } = args;
        const position = window.axiomFS.input.seek(fd, offset, whence || 'SEEK_SET');
        return { success: true, position };
    }

    async sys_mkdir(args) {
        const { path } = args;
        window.axiomContainer.createDirectory(path);
        return { success: true };
    }

    async sys_rmdir(args) {
        const { path } = args;
        window.axiomContainer.removeDirectory(path);
        return { success: true };
    }

    async sys_chdir(args) {
        const { path } = args;
        window.axiomContainer.changeDirectory(path);
        return { success: true };
    }

    async sys_getcwd(args) {
        const cwd = window.axiomContainer.getCurrentDirectory();
        return { success: true, cwd };
    }

    async sys_exit(args) {
        const { code } = args;
        if (this.currentProcess) {
            this.currentProcess.exitCode = code || 0;
            this.currentProcess.state = 'terminated';
        }
        return { success: true, code };
    }

    async sys_getpid(args) {
        const pid = this.currentProcess ? this.currentProcess.pid : 0;
        return { success: true, pid };
    }

    async sys_sleep(args) {
        const { milliseconds } = args;
        await new Promise(resolve => setTimeout(resolve, milliseconds));
        return { success: true };
    }

    async sys_malloc(args) {
        const { size } = args;
        const address = window.axiomMemory.allocate(size);
        return { success: true, address };
    }

    async sys_free(args) {
        const { address } = args;
        window.axiomMemory.free(address);
        return { success: true };
    }

    // Process management
    createProcess(name, code) {
        const pid = this.nextPID++;
        const process = {
            pid,
            name,
            code,
            state: 'ready',
            exitCode: null,
            createdAt: Date.now(),
            memory: new Map()
        };
        
        this.processes.set(pid, process);
        return pid;
    }

    async executeProcess(pid) {
        const process = this.processes.get(pid);
        if (!process) {
            throw new Error(`Process ${pid} not found`);
        }

        this.currentProcess = process;
        process.state = 'running';

        try {
            // Execute process code
            const result = await this.executeCode(process.code);
            process.state = 'terminated';
            process.exitCode = 0;
            return result;
        } catch (error) {
            process.state = 'terminated';
            process.exitCode = 1;
            throw error;
        } finally {
            this.currentProcess = null;
        }
    }

    async executeCode(code) {
        // Simple code execution
        // In a real VM, this would parse and execute bytecode
        try {
            const func = new Function('vm', 'args', code);
            return await func(this, {});
        } catch (error) {
            throw new Error(`Execution error: ${error.message}`);
        }
    }

    killProcess(pid) {
        const process = this.processes.get(pid);
        if (!process) {
            return false;
        }

        process.state = 'terminated';
        process.exitCode = -1;
        this.processes.delete(pid);
        return true;
    }

    listProcesses() {
        const list = [];
        for (const [pid, process] of this.processes.entries()) {
            list.push({
                pid: process.pid,
                name: process.name,
                state: process.state,
                exitCode: process.exitCode
            });
        }
        return list;
    }
}

// Export for global access
window.VMEmulator = VMEmulator;
