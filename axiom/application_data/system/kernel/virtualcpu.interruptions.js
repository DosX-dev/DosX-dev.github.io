/**
 * Axiom CPU Interrupt Handler
 * Manages hardware and software interrupts
 */

class InterruptHandler {
    constructor() {
        this.handlers = new Map();
        this.interruptVector = [];
        this.pendingInterrupts = [];
        
        // Standard interrupt numbers
        this.INT_DIVIDE_BY_ZERO = 0x00;
        this.INT_DEBUG = 0x01;
        this.INT_NMI = 0x02;
        this.INT_BREAKPOINT = 0x03;
        this.INT_OVERFLOW = 0x04;
        this.INT_BOUNDS = 0x05;
        this.INT_INVALID_OPCODE = 0x06;
        this.INT_DEVICE_NOT_AVAILABLE = 0x07;
        this.INT_DOUBLE_FAULT = 0x08;
        this.INT_INVALID_TSS = 0x0A;
        this.INT_SEGMENT_NOT_PRESENT = 0x0B;
        this.INT_STACK_FAULT = 0x0C;
        this.INT_GENERAL_PROTECTION = 0x0D;
        this.INT_PAGE_FAULT = 0x0E;
        this.INT_FPU_ERROR = 0x10;
        this.INT_ALIGNMENT_CHECK = 0x11;
        this.INT_MACHINE_CHECK = 0x12;
        this.INT_SIMD_EXCEPTION = 0x13;
        
        // Software interrupts
        this.INT_SYSCALL = 0x80;
        this.INT_TIMER = 0x20;
        this.INT_KEYBOARD = 0x21;
        this.INT_STORAGE = 0x22;
    }

    async initialize() {
        // Register default handlers
        this.registerHandler(this.INT_DIVIDE_BY_ZERO, this.handleDivideByZero.bind(this));
        this.registerHandler(this.INT_INVALID_OPCODE, this.handleInvalidOpcode.bind(this));
        this.registerHandler(this.INT_GENERAL_PROTECTION, this.handleGeneralProtection.bind(this));
        this.registerHandler(this.INT_PAGE_FAULT, this.handlePageFault.bind(this));
        this.registerHandler(this.INT_SYSCALL, this.handleSyscall.bind(this));
        this.registerHandler(this.INT_TIMER, this.handleTimer.bind(this));
        this.registerHandler(this.INT_KEYBOARD, this.handleKeyboard.bind(this));
        this.registerHandler(this.INT_STORAGE, this.handleStorage.bind(this));
        
        return true;
    }

    registerHandler(interruptNumber, handler) {
        if (typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }
        this.handlers.set(interruptNumber, handler);
    }

    unregisterHandler(interruptNumber) {
        this.handlers.delete(interruptNumber);
    }

    async handleInterrupt(interruptNumber, data = null) {
        const handler = this.handlers.get(interruptNumber);
        
        if (!handler) {
            console.warn(`No handler for interrupt 0x${interruptNumber.toString(16)}`);
            return { success: false, error: 'No handler registered' };
        }

        try {
            const result = await handler(data);
            return { success: true, result };
        } catch (error) {
            console.error(`Interrupt handler error (0x${interruptNumber.toString(16)}):`, error);
            return { success: false, error: error.message };
        }
    }

    // Default interrupt handlers
    async handleDivideByZero(data) {
        console.error('EXCEPTION: Divide by zero');
        if (window.axiomTerminal) {
            window.axiomTerminal.printLine('EXCEPTION: Division by zero error', 'output-error');
        }
        return { exception: true, type: 'DIVIDE_BY_ZERO' };
    }

    async handleInvalidOpcode(data) {
        console.error('EXCEPTION: Invalid opcode');
        if (window.axiomTerminal) {
            window.axiomTerminal.printLine(`EXCEPTION: Invalid opcode at ${data?.address || 'unknown'}`, 'output-error');
        }
        return { exception: true, type: 'INVALID_OPCODE' };
    }

    async handleGeneralProtection(data) {
        console.error('EXCEPTION: General protection fault');
        if (window.axiomTerminal) {
            window.axiomTerminal.printLine('EXCEPTION: General protection fault', 'output-error');
        }
        return { exception: true, type: 'GENERAL_PROTECTION' };
    }

    async handlePageFault(data) {
        console.error('EXCEPTION: Page fault');
        if (window.axiomTerminal) {
            window.axiomTerminal.printLine(`EXCEPTION: Page fault at ${data?.address || 'unknown'}`, 'output-error');
        }
        return { exception: true, type: 'PAGE_FAULT' };
    }

    async handleSyscall(data) {
        // System call handler
        if (window.axiomVM && data?.syscall) {
            return await window.axiomVM.executeSyscall(data.syscall, data.args);
        }
        return { success: false, error: 'Invalid syscall' };
    }

    async handleTimer(data) {
        // Timer interrupt handler
        // Used for scheduling and time-based operations
        return { success: true };
    }

    async handleKeyboard(data) {
        // Keyboard interrupt handler
        if (data?.key) {
            // Process keyboard input
            return { success: true, key: data.key };
        }
        return { success: false };
    }

    async handleStorage(data) {
        // Storage I/O interrupt handler
        if (data?.operation) {
            // Handle storage operations
            return { success: true, operation: data.operation };
        }
        return { success: false };
    }

    queueInterrupt(interruptNumber, data = null) {
        this.pendingInterrupts.push({
            number: interruptNumber,
            data,
            timestamp: Date.now()
        });
    }

    async processQueue() {
        while (this.pendingInterrupts.length > 0) {
            const interrupt = this.pendingInterrupts.shift();
            await this.handleInterrupt(interrupt.number, interrupt.data);
        }
    }

    clearQueue() {
        this.pendingInterrupts = [];
    }

    getQueueLength() {
        return this.pendingInterrupts.length;
    }
}

// Export for global access
window.InterruptHandler = InterruptHandler;
