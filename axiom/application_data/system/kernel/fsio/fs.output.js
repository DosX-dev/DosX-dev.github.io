/**
 * Axiom File System Output Handler
 * Manages file writing and output operations
 */

class FileSystemOutput {
    constructor() {
        this.writeBuffer = new Map();
        this.outputStreams = new Map();
    }

    async initialize() {
        // Initialize output streams
        this.outputStreams.set(1, 'stdout'); // Standard output
        this.outputStreams.set(2, 'stderr'); // Standard error
        
        return true;
    }

    write(fd, data) {
        const descriptor = window.axiomFS.input.getDescriptor(fd);
        if (!descriptor) {
            throw new Error(`Invalid file descriptor: ${fd}`);
        }

        if (!descriptor.mode.includes('w') && !descriptor.mode.includes('a') && descriptor.mode !== 'r+') {
            throw new Error('File not opened for writing');
        }

        // Handle different write modes
        if (descriptor.mode === 'w' || descriptor.mode === 'w+') {
            // Overwrite mode
            if (descriptor.position === 0) {
                descriptor.buffer = data;
            } else {
                descriptor.buffer = descriptor.buffer.substring(0, descriptor.position) + data;
            }
        } else if (descriptor.mode === 'a' || descriptor.mode === 'a+') {
            // Append mode
            descriptor.buffer += data;
            descriptor.position = descriptor.buffer.length;
        } else if (descriptor.mode === 'r+') {
            // Read-write mode
            const before = descriptor.buffer.substring(0, descriptor.position);
            const after = descriptor.buffer.substring(descriptor.position + data.length);
            descriptor.buffer = before + data + after;
        }

        descriptor.position += data.length;
        return data.length;
    }

    writeLine(fd, data) {
        return this.write(fd, data + '\n');
    }

    writeLines(fd, lines) {
        let totalWritten = 0;
        for (const line of lines) {
            totalWritten += this.writeLine(fd, line);
        }
        return totalWritten;
    }

    flush(fd) {
        return window.axiomFS.input.flush(fd);
    }

    truncate(fd, length = 0) {
        const descriptor = window.axiomFS.input.getDescriptor(fd);
        if (!descriptor) {
            throw new Error(`Invalid file descriptor: ${fd}`);
        }

        if (!descriptor.mode.includes('w') && descriptor.mode !== 'r+') {
            throw new Error('File not opened for writing');
        }

        if (length === 0) {
            descriptor.buffer = '';
            descriptor.position = 0;
        } else if (length < descriptor.buffer.length) {
            descriptor.buffer = descriptor.buffer.substring(0, length);
            descriptor.position = Math.min(descriptor.position, length);
        } else {
            // Pad with null bytes if needed
            const padding = '\0'.repeat(length - descriptor.buffer.length);
            descriptor.buffer += padding;
        }

        return true;
    }

    // Stream redirection support
    redirectOutput(sourceFd, targetPath) {
        const descriptor = window.axiomFS.input.getDescriptor(sourceFd);
        if (!descriptor) {
            throw new Error(`Invalid file descriptor: ${sourceFd}`);
        }

        // Open target file for writing
        const targetFd = window.axiomFS.input.open(targetPath, 'w');
        
        // Copy data to target
        const data = descriptor.buffer;
        this.write(targetFd, data);
        this.flush(targetFd);
        
        // Close target
        window.axiomFS.input.close(targetFd);
        
        return true;
    }

    // Pipe support
    pipe(sourceFd, targetFd) {
        const sourceDescriptor = window.axiomFS.input.getDescriptor(sourceFd);
        if (!sourceDescriptor) {
            throw new Error(`Invalid source file descriptor: ${sourceFd}`);
        }

        const targetDescriptor = window.axiomFS.input.getDescriptor(targetFd);
        if (!targetDescriptor) {
            throw new Error(`Invalid target file descriptor: ${targetFd}`);
        }

        const data = sourceDescriptor.buffer;
        this.write(targetFd, data);
        
        return data.length;
    }

    // Buffered I/O
    setBuffer(fd, bufferSize) {
        if (!this.writeBuffer.has(fd)) {
            this.writeBuffer.set(fd, {
                size: bufferSize,
                data: '',
                autoFlush: false
            });
        } else {
            this.writeBuffer.get(fd).size = bufferSize;
        }
    }

    bufferedWrite(fd, data) {
        if (!this.writeBuffer.has(fd)) {
            // No buffer, write directly
            return this.write(fd, data);
        }

        const buffer = this.writeBuffer.get(fd);
        buffer.data += data;

        // Auto-flush if buffer is full
        if (buffer.data.length >= buffer.size) {
            const written = this.write(fd, buffer.data);
            buffer.data = '';
            this.flush(fd);
            return written;
        }

        return data.length;
    }

    flushBuffer(fd) {
        if (!this.writeBuffer.has(fd)) {
            return 0;
        }

        const buffer = this.writeBuffer.get(fd);
        if (buffer.data.length === 0) {
            return 0;
        }

        const written = this.write(fd, buffer.data);
        buffer.data = '';
        this.flush(fd);
        
        return written;
    }

    clearBuffer(fd) {
        if (this.writeBuffer.has(fd)) {
            this.writeBuffer.get(fd).data = '';
        }
    }

    // Stream operations
    writeToStdout(data) {
        if (window.axiomTerminal) {
            window.axiomTerminal.print(data);
        }
    }

    writeToStderr(data) {
        if (window.axiomTerminal) {
            window.axiomTerminal.printLine(data, 'output-error');
        }
    }
}

// Export for global access
window.FileSystemOutput = FileSystemOutput;
