/**
 * Axiom File System Input Handler
 * Manages file reading and input operations
 */

class FileSystemInput {
    constructor() {
        this.fileDescriptors = new Map();
        this.nextFD = 3; // 0=stdin, 1=stdout, 2=stderr
        this.openFiles = new Map();
        
        // Standard file descriptors
        this.STDIN = 0;
        this.STDOUT = 1;
        this.STDERR = 2;
    }

    async initialize() {
        // Initialize standard file descriptors
        this.fileDescriptors.set(this.STDIN, {
            path: '/dev/stdin',
            mode: 'r',
            position: 0,
            buffer: ''
        });
        
        this.fileDescriptors.set(this.STDOUT, {
            path: '/dev/stdout',
            mode: 'w',
            position: 0,
            buffer: ''
        });
        
        this.fileDescriptors.set(this.STDERR, {
            path: '/dev/stderr',
            mode: 'w',
            position: 0,
            buffer: ''
        });
        
        return true;
    }

    open(path, mode = 'r') {
        // Get file from container
        const file = window.axiomContainer.getFile(path);
        
        if (!file && !mode.includes('w') && !mode.includes('a')) {
            throw new Error(`File not found: ${path}`);
        }

        const fd = this.nextFD++;
        this.fileDescriptors.set(fd, {
            path,
            mode,
            position: 0,
            buffer: file ? file.content : '',
            metadata: file ? file.metadata : null
        });

        this.openFiles.set(path, fd);
        return fd;
    }

    close(fd) {
        const descriptor = this.fileDescriptors.get(fd);
        if (!descriptor) {
            throw new Error(`Invalid file descriptor: ${fd}`);
        }

        // Flush buffer if needed
        if (descriptor.mode.includes('w') || descriptor.mode.includes('a')) {
            this.flush(fd);
        }

        this.openFiles.delete(descriptor.path);
        this.fileDescriptors.delete(fd);
        return true;
    }

    read(fd, length = -1) {
        const descriptor = this.fileDescriptors.get(fd);
        if (!descriptor) {
            throw new Error(`Invalid file descriptor: ${fd}`);
        }

        if (!descriptor.mode.includes('r') && descriptor.mode !== 'r+') {
            throw new Error('File not opened for reading');
        }

        const content = descriptor.buffer;
        const start = descriptor.position;
        
        let data;
        if (length === -1) {
            data = content.substring(start);
            descriptor.position = content.length;
        } else {
            data = content.substring(start, start + length);
            descriptor.position = Math.min(start + length, content.length);
        }

        return data;
    }

    readLine(fd) {
        const descriptor = this.fileDescriptors.get(fd);
        if (!descriptor) {
            throw new Error(`Invalid file descriptor: ${fd}`);
        }

        const content = descriptor.buffer;
        const start = descriptor.position;
        const newlineIndex = content.indexOf('\n', start);

        let line;
        if (newlineIndex === -1) {
            line = content.substring(start);
            descriptor.position = content.length;
        } else {
            line = content.substring(start, newlineIndex);
            descriptor.position = newlineIndex + 1;
        }

        return line;
    }

    readLines(fd) {
        const descriptor = this.fileDescriptors.get(fd);
        if (!descriptor) {
            throw new Error(`Invalid file descriptor: ${fd}`);
        }

        const content = descriptor.buffer;
        return content.split('\n');
    }

    seek(fd, position, whence = 'SEEK_SET') {
        const descriptor = this.fileDescriptors.get(fd);
        if (!descriptor) {
            throw new Error(`Invalid file descriptor: ${fd}`);
        }

        const contentLength = descriptor.buffer.length;

        switch (whence) {
            case 'SEEK_SET':
                descriptor.position = Math.max(0, Math.min(position, contentLength));
                break;
            case 'SEEK_CUR':
                descriptor.position = Math.max(0, Math.min(descriptor.position + position, contentLength));
                break;
            case 'SEEK_END':
                descriptor.position = Math.max(0, Math.min(contentLength + position, contentLength));
                break;
            default:
                throw new Error(`Invalid whence: ${whence}`);
        }

        return descriptor.position;
    }

    tell(fd) {
        const descriptor = this.fileDescriptors.get(fd);
        if (!descriptor) {
            throw new Error(`Invalid file descriptor: ${fd}`);
        }
        return descriptor.position;
    }

    flush(fd) {
        const descriptor = this.fileDescriptors.get(fd);
        if (!descriptor) {
            throw new Error(`Invalid file descriptor: ${fd}`);
        }

        if (descriptor.mode.includes('w') || descriptor.mode.includes('a')) {
            // Write buffer to container
            window.axiomContainer.writeFile(descriptor.path, descriptor.buffer);
        }

        return true;
    }

    isEOF(fd) {
        const descriptor = this.fileDescriptors.get(fd);
        if (!descriptor) {
            throw new Error(`Invalid file descriptor: ${fd}`);
        }
        return descriptor.position >= descriptor.buffer.length;
    }

    getDescriptor(fd) {
        return this.fileDescriptors.get(fd);
    }

    listOpenFiles() {
        const files = [];
        for (const [fd, descriptor] of this.fileDescriptors.entries()) {
            if (fd >= 3) { // Skip standard descriptors
                files.push({
                    fd,
                    path: descriptor.path,
                    mode: descriptor.mode,
                    position: descriptor.position
                });
            }
        }
        return files;
    }

    closeAll() {
        const fds = Array.from(this.fileDescriptors.keys());
        for (const fd of fds) {
            if (fd >= 3) { // Don't close standard descriptors
                try {
                    this.close(fd);
                } catch (e) {
                    console.warn(`Failed to close fd ${fd}:`, e);
                }
            }
        }
    }
}

// Export for global access
window.FileSystemInput = FileSystemInput;
