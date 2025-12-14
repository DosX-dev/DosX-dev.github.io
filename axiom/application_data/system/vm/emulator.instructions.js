/**
 * Axiom VM Instruction Set
 * Defines available instructions for the virtual machine
 */

class InstructionSet {
    constructor() {
        this.instructions = new Map();
        this.registerInstructions();
    }

    registerInstructions() {
        // Data movement instructions
        this.register('MOV', this.inst_mov, 'Move data between registers/memory');
        this.register('PUSH', this.inst_push, 'Push value onto stack');
        this.register('POP', this.inst_pop, 'Pop value from stack');
        this.register('LEA', this.inst_lea, 'Load effective address');
        
        // Arithmetic instructions
        this.register('ADD', this.inst_add, 'Add two values');
        this.register('SUB', this.inst_sub, 'Subtract two values');
        this.register('MUL', this.inst_mul, 'Multiply two values');
        this.register('DIV', this.inst_div, 'Divide two values');
        this.register('INC', this.inst_inc, 'Increment value');
        this.register('DEC', this.inst_dec, 'Decrement value');
        this.register('NEG', this.inst_neg, 'Negate value');
        
        // Logical instructions
        this.register('AND', this.inst_and, 'Logical AND');
        this.register('OR', this.inst_or, 'Logical OR');
        this.register('XOR', this.inst_xor, 'Logical XOR');
        this.register('NOT', this.inst_not, 'Logical NOT');
        this.register('SHL', this.inst_shl, 'Shift left');
        this.register('SHR', this.inst_shr, 'Shift right');
        
        // Comparison instructions
        this.register('CMP', this.inst_cmp, 'Compare two values');
        this.register('TEST', this.inst_test, 'Test bits');
        
        // Control flow instructions
        this.register('JMP', this.inst_jmp, 'Unconditional jump');
        this.register('JE', this.inst_je, 'Jump if equal');
        this.register('JNE', this.inst_jne, 'Jump if not equal');
        this.register('JG', this.inst_jg, 'Jump if greater');
        this.register('JL', this.inst_jl, 'Jump if less');
        this.register('JGE', this.inst_jge, 'Jump if greater or equal');
        this.register('JLE', this.inst_jle, 'Jump if less or equal');
        this.register('CALL', this.inst_call, 'Call subroutine');
        this.register('RET', this.inst_ret, 'Return from subroutine');
        
        // System instructions
        this.register('NOP', this.inst_nop, 'No operation');
        this.register('HLT', this.inst_hlt, 'Halt execution');
        this.register('INT', this.inst_int, 'Software interrupt');
        this.register('SYSCALL', this.inst_syscall, 'System call');
    }

    register(mnemonic, handler, description) {
        this.instructions.set(mnemonic.toUpperCase(), {
            handler,
            description,
            mnemonic
        });
    }

    execute(instruction, context) {
        const inst = this.instructions.get(instruction.mnemonic.toUpperCase());
        if (!inst) {
            throw new Error(`Unknown instruction: ${instruction.mnemonic}`);
        }
        
        return inst.handler.call(this, instruction.operands, context);
    }

    // Instruction implementations
    inst_mov(operands, context) {
        const { dest, src } = operands;
        context.registers[dest] = this.resolveValue(src, context);
        return { cycles: 1 };
    }

    inst_push(operands, context) {
        const { value } = operands;
        const val = this.resolveValue(value, context);
        context.stack.push(val);
        context.registers.rsp -= 8;
        return { cycles: 1 };
    }

    inst_pop(operands, context) {
        const { dest } = operands;
        if (context.stack.length === 0) {
            throw new Error('Stack underflow');
        }
        context.registers[dest] = context.stack.pop();
        context.registers.rsp += 8;
        return { cycles: 1 };
    }

    inst_lea(operands, context) {
        const { dest, address } = operands;
        context.registers[dest] = address;
        return { cycles: 1 };
    }

    inst_add(operands, context) {
        const { dest, src } = operands;
        const val = this.resolveValue(src, context);
        context.registers[dest] += val;
        this.updateFlags(context, context.registers[dest]);
        return { cycles: 1 };
    }

    inst_sub(operands, context) {
        const { dest, src } = operands;
        const val = this.resolveValue(src, context);
        context.registers[dest] -= val;
        this.updateFlags(context, context.registers[dest]);
        return { cycles: 1 };
    }

    inst_mul(operands, context) {
        const { dest, src } = operands;
        const val = this.resolveValue(src, context);
        context.registers[dest] *= val;
        this.updateFlags(context, context.registers[dest]);
        return { cycles: 3 };
    }

    inst_div(operands, context) {
        const { dest, src } = operands;
        const val = this.resolveValue(src, context);
        if (val === 0) {
            throw new Error('Division by zero');
        }
        context.registers[dest] = Math.floor(context.registers[dest] / val);
        this.updateFlags(context, context.registers[dest]);
        return { cycles: 4 };
    }

    inst_inc(operands, context) {
        const { dest } = operands;
        context.registers[dest]++;
        this.updateFlags(context, context.registers[dest]);
        return { cycles: 1 };
    }

    inst_dec(operands, context) {
        const { dest } = operands;
        context.registers[dest]--;
        this.updateFlags(context, context.registers[dest]);
        return { cycles: 1 };
    }

    inst_neg(operands, context) {
        const { dest } = operands;
        context.registers[dest] = -context.registers[dest];
        this.updateFlags(context, context.registers[dest]);
        return { cycles: 1 };
    }

    inst_and(operands, context) {
        const { dest, src } = operands;
        const val = this.resolveValue(src, context);
        context.registers[dest] &= val;
        this.updateFlags(context, context.registers[dest]);
        return { cycles: 1 };
    }

    inst_or(operands, context) {
        const { dest, src } = operands;
        const val = this.resolveValue(src, context);
        context.registers[dest] |= val;
        this.updateFlags(context, context.registers[dest]);
        return { cycles: 1 };
    }

    inst_xor(operands, context) {
        const { dest, src } = operands;
        const val = this.resolveValue(src, context);
        context.registers[dest] ^= val;
        this.updateFlags(context, context.registers[dest]);
        return { cycles: 1 };
    }

    inst_not(operands, context) {
        const { dest } = operands;
        context.registers[dest] = ~context.registers[dest];
        return { cycles: 1 };
    }

    inst_shl(operands, context) {
        const { dest, count } = operands;
        const cnt = this.resolveValue(count, context);
        context.registers[dest] <<= cnt;
        return { cycles: 1 };
    }

    inst_shr(operands, context) {
        const { dest, count } = operands;
        const cnt = this.resolveValue(count, context);
        context.registers[dest] >>= cnt;
        return { cycles: 1 };
    }

    inst_cmp(operands, context) {
        const { op1, op2 } = operands;
        const val1 = this.resolveValue(op1, context);
        const val2 = this.resolveValue(op2, context);
        this.updateFlags(context, val1 - val2);
        return { cycles: 1 };
    }

    inst_test(operands, context) {
        const { op1, op2 } = operands;
        const val1 = this.resolveValue(op1, context);
        const val2 = this.resolveValue(op2, context);
        this.updateFlags(context, val1 & val2);
        return { cycles: 1 };
    }

    inst_jmp(operands, context) {
        const { target } = operands;
        context.registers.rip = target;
        return { cycles: 2, jumped: true };
    }

    inst_je(operands, context) {
        const { target } = operands;
        if (context.flags.zero) {
            context.registers.rip = target;
            return { cycles: 2, jumped: true };
        }
        return { cycles: 1, jumped: false };
    }

    inst_jne(operands, context) {
        const { target } = operands;
        if (!context.flags.zero) {
            context.registers.rip = target;
            return { cycles: 2, jumped: true };
        }
        return { cycles: 1, jumped: false };
    }

    inst_jg(operands, context) {
        const { target } = operands;
        if (!context.flags.zero && !context.flags.sign) {
            context.registers.rip = target;
            return { cycles: 2, jumped: true };
        }
        return { cycles: 1, jumped: false };
    }

    inst_jl(operands, context) {
        const { target } = operands;
        if (context.flags.sign) {
            context.registers.rip = target;
            return { cycles: 2, jumped: true };
        }
        return { cycles: 1, jumped: false };
    }

    inst_jge(operands, context) {
        const { target } = operands;
        if (!context.flags.sign || context.flags.zero) {
            context.registers.rip = target;
            return { cycles: 2, jumped: true };
        }
        return { cycles: 1, jumped: false };
    }

    inst_jle(operands, context) {
        const { target } = operands;
        if (context.flags.sign || context.flags.zero) {
            context.registers.rip = target;
            return { cycles: 2, jumped: true };
        }
        return { cycles: 1, jumped: false };
    }

    inst_call(operands, context) {
        const { target } = operands;
        context.stack.push(context.registers.rip);
        context.registers.rsp -= 8;
        context.registers.rip = target;
        return { cycles: 3, jumped: true };
    }

    inst_ret(operands, context) {
        if (context.stack.length === 0) {
            throw new Error('Stack underflow on return');
        }
        context.registers.rip = context.stack.pop();
        context.registers.rsp += 8;
        return { cycles: 3, jumped: true };
    }

    inst_nop(operands, context) {
        return { cycles: 1 };
    }

    inst_hlt(operands, context) {
        context.halted = true;
        return { cycles: 1, halted: true };
    }

    inst_int(operands, context) {
        const { number } = operands;
        if (window.axiomInterrupts) {
            window.axiomInterrupts.handleInterrupt(number);
        }
        return { cycles: 5 };
    }

    inst_syscall(operands, context) {
        const { syscall, args } = operands;
        // Syscall handled by VM
        return { cycles: 10, syscall, args };
    }

    resolveValue(value, context) {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string' && context.registers[value] !== undefined) {
            return context.registers[value];
        }
        return value;
    }

    updateFlags(context, result) {
        context.flags.zero = result === 0;
        context.flags.sign = result < 0;
        context.flags.overflow = false; // Simplified
        context.flags.carry = false; // Simplified
    }

    listInstructions() {
        const list = [];
        for (const [mnemonic, inst] of this.instructions.entries()) {
            list.push({
                mnemonic,
                description: inst.description
            });
        }
        return list;
    }
}

// Export for global access
window.InstructionSet = InstructionSet;
