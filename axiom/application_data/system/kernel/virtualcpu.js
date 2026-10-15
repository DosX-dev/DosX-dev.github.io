/**
 * Axiom Virtual CPU - DosX Processor A10
 * 2 Cores, 2 Threads per core
 */

class VirtualCPU {
    constructor() {
        this.cpuInfo = {
            name: 'DosX Processor A10',
            vendor: 'Axiom Corporation',
            cores: 2,
            threads: 2,
            clockSpeed: 2400, // MHz (simulated)
            architecture: 'x64',
            features: ['SSE', 'SSE2', 'AVX', 'AES-NI', 'VT-x']
        };

        // Registers (per thread)
        this.registers = this.initializeRegisters();
        
        // Execution state
        this.state = {
            running: false,
            halted: false,
            interruptsEnabled: true,
            currentThread: 0,
            cycleCount: 0,
            instructionPointer: 0
        };

        // Performance counters
        this.counters = {
            instructionsExecuted: 0,
            cyclesElapsed: 0,
            cacheHits: 0,
            cacheMisses: 0
        };

        // Interrupt queue
        this.interruptQueue = [];
        
        // Worker threads for simulation
        this.workers = [];
    }

    async initialize() {
        // Initialize CPU threads
        for (let i = 0; i < this.cpuInfo.threads; i++) {
            this.workers[i] = {
                id: i,
                busy: false,
                taskQueue: [],
                registers: this.initializeRegisters()
            };
        }

        this.state.running = true;
        return true;
    }

    initializeRegisters() {
        return {
            // General purpose registers
            rax: 0, rbx: 0, rcx: 0, rdx: 0,
            rsi: 0, rdi: 0, rbp: 0, rsp: 0,
            r8: 0, r9: 0, r10: 0, r11: 0,
            r12: 0, r13: 0, r14: 0, r15: 0,
            
            // Special registers
            rip: 0,     // Instruction pointer
            rflags: 0,  // Flags register
            
            // Segment registers
            cs: 0, ds: 0, ss: 0, es: 0, fs: 0, gs: 0
        };
    }

    getCPUInfo() {
        return { ...this.cpuInfo };
    }

    getState() {
        return { ...this.state };
    }

    getCounters() {
        return { ...this.counters };
    }

    // Execute instruction
    async execute(instruction) {
        if (!this.state.running || this.state.halted) {
            return { success: false, error: 'CPU halted' };
        }

        // Find available worker
        const worker = this.findAvailableWorker();
        if (!worker) {
            return { success: false, error: 'No available CPU threads' };
        }

        worker.busy = true;
        
        try {
            // Simulate instruction execution
            const result = await this.processInstruction(instruction, worker);
            
            this.counters.instructionsExecuted++;
            this.counters.cyclesElapsed += result.cycles || 1;
            
            worker.busy = false;
            return { success: true, result };
        } catch (error) {
            worker.busy = false;
            return { success: false, error: error.message };
        }
    }

    async processInstruction(instruction, worker) {
        // Simulate CPU cycle delay
        await this.simulateCycle(1);

        // Process instruction based on type
        switch (instruction.type) {
            case 'MOV':
                return this.execMOV(instruction, worker);
            case 'ADD':
                return this.execADD(instruction, worker);
            case 'SUB':
                return this.execSUB(instruction, worker);
            case 'MUL':
                return this.execMUL(instruction, worker);
            case 'DIV':
                return this.execDIV(instruction, worker);
            case 'JMP':
                return this.execJMP(instruction, worker);
            case 'CMP':
                return this.execCMP(instruction, worker);
            case 'NOP':
                return { cycles: 1 };
            default:
                throw new Error(`Unknown instruction: ${instruction.type}`);
        }
    }

    findAvailableWorker() {
        return this.workers.find(w => !w.busy) || null;
    }

    async simulateCycle(cycles) {
        // Simulate CPU cycles with minimal delay
        const delay = cycles * (1000 / this.cpuInfo.clockSpeed);
        if (delay > 0.001) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // Instruction implementations
    execMOV(instruction, worker) {
        const { dest, src } = instruction.operands;
        worker.registers[dest] = src;
        return { cycles: 1, result: src };
    }

    execADD(instruction, worker) {
        const { dest, src } = instruction.operands;
        const result = worker.registers[dest] + src;
        worker.registers[dest] = result;
        this.updateFlags(worker, result);
        return { cycles: 1, result };
    }

    execSUB(instruction, worker) {
        const { dest, src } = instruction.operands;
        const result = worker.registers[dest] - src;
        worker.registers[dest] = result;
        this.updateFlags(worker, result);
        return { cycles: 1, result };
    }

    execMUL(instruction, worker) {
        const { dest, src } = instruction.operands;
        const result = worker.registers[dest] * src;
        worker.registers[dest] = result;
        this.updateFlags(worker, result);
        return { cycles: 3, result };
    }

    execDIV(instruction, worker) {
        const { dest, src } = instruction.operands;
        if (src === 0) {
            throw new Error('Division by zero');
        }
        const result = Math.floor(worker.registers[dest] / src);
        worker.registers[dest] = result;
        this.updateFlags(worker, result);
        return { cycles: 4, result };
    }

    execJMP(instruction, worker) {
        const { target } = instruction.operands;
        worker.registers.rip = target;
        return { cycles: 2, result: target };
    }

    execCMP(instruction, worker) {
        const { op1, op2 } = instruction.operands;
        const result = op1 - op2;
        this.updateFlags(worker, result);
        return { cycles: 1, result: 0 };
    }

    updateFlags(worker, result) {
        // Update flags register
        let flags = worker.registers.rflags;
        
        // Zero flag
        flags = result === 0 ? flags | 0x40 : flags & ~0x40;
        
        // Sign flag
        flags = result < 0 ? flags | 0x80 : flags & ~0x80;
        
        worker.registers.rflags = flags;
    }

    raiseInterrupt(interruptNumber, data = null) {
        if (this.state.interruptsEnabled) {
            this.interruptQueue.push({ number: interruptNumber, data, timestamp: Date.now() });
            
            // Notify interrupt handler
            if (typeof window.axiomInterrupts !== 'undefined') {
                window.axiomInterrupts.handleInterrupt(interruptNumber, data);
            }
        }
    }

    halt() {
        this.state.halted = true;
        this.state.running = false;
    }

    reset() {
        this.state = {
            running: true,
            halted: false,
            interruptsEnabled: true,
            currentThread: 0,
            cycleCount: 0,
            instructionPointer: 0
        };

        this.counters = {
            instructionsExecuted: 0,
            cyclesElapsed: 0,
            cacheHits: 0,
            cacheMisses: 0
        };

        this.interruptQueue = [];
        
        for (let worker of this.workers) {
            worker.busy = false;
            worker.taskQueue = [];
            worker.registers = this.initializeRegisters();
        }
    }
}

// Export for global access
window.VirtualCPU = VirtualCPU;
