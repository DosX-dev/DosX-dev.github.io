/**
 * Axiom Memory Guard
 * Manages virtual memory allocation and protection
 */

class MemoryGuard {
    constructor() {
        this.totalMemory = 128 * 1024 * 1024; // 128 MB simulated
        this.pageSize = 4096; // 4 KB pages
        this.allocatedBlocks = new Map();
        this.freeBlocks = [];
        this.nextAddress = 0x1000; // Start at 4 KB
        this.memoryLimit = this.totalMemory;
    }

    async initialize() {
        // Initialize free memory pool
        this.freeBlocks.push({
            address: this.nextAddress,
            size: this.totalMemory - this.nextAddress
        });
        
        return true;
    }

    allocate(size) {
        if (size <= 0 || !Number.isFinite(size)) {
            throw new Error('Invalid allocation size');
        }
        
        // Prevent excessive allocation
        if (size > this.totalMemory / 2) {
            throw new Error('Allocation size exceeds 50% of total memory');
        }
        
        // Check total allocated memory
        let totalAllocated = 0;
        for (const block of this.allocatedBlocks.values()) {
            totalAllocated += block.size;
        }
        
        if (totalAllocated + size > this.totalMemory * 0.95) {
            throw new Error('Memory limit reached (95% allocated)');
        }

        // Align to page size
        const alignedSize = Math.ceil(size / this.pageSize) * this.pageSize;

        // Find suitable free block
        let blockIndex = -1;
        for (let i = 0; i < this.freeBlocks.length; i++) {
            if (this.freeBlocks[i].size >= alignedSize) {
                blockIndex = i;
                break;
            }
        }

        if (blockIndex === -1) {
            throw new Error('Out of memory');
        }

        const block = this.freeBlocks[blockIndex];
        const address = block.address;

        // Update free block
        if (block.size === alignedSize) {
            this.freeBlocks.splice(blockIndex, 1);
        } else {
            block.address += alignedSize;
            block.size -= alignedSize;
        }

        // Track allocated block
        this.allocatedBlocks.set(address, {
            address,
            size: alignedSize,
            allocated: Date.now(),
            protected: false
        });

        return address;
    }

    free(address) {
        const block = this.allocatedBlocks.get(address);
        if (!block) {
            throw new Error(`Invalid memory address: 0x${address.toString(16)}`);
        }

        if (block.protected) {
            throw new Error('Cannot free protected memory');
        }

        // Remove from allocated blocks
        this.allocatedBlocks.delete(address);

        // Add to free blocks
        this.freeBlocks.push({
            address: block.address,
            size: block.size
        });

        // Merge adjacent free blocks
        this.mergeFreeBlocks();

        return true;
    }

    mergeFreeBlocks() {
        // Sort by address
        this.freeBlocks.sort((a, b) => a.address - b.address);

        // Merge adjacent blocks
        let i = 0;
        while (i < this.freeBlocks.length - 1) {
            const current = this.freeBlocks[i];
            const next = this.freeBlocks[i + 1];

            if (current.address + current.size === next.address) {
                current.size += next.size;
                this.freeBlocks.splice(i + 1, 1);
            } else {
                i++;
            }
        }
    }

    protect(address) {
        const block = this.allocatedBlocks.get(address);
        if (!block) {
            throw new Error(`Invalid memory address: 0x${address.toString(16)}`);
        }

        block.protected = true;
        return true;
    }

    unprotect(address) {
        const block = this.allocatedBlocks.get(address);
        if (!block) {
            throw new Error(`Invalid memory address: 0x${address.toString(16)}`);
        }

        block.protected = false;
        return true;
    }

    isValidAddress(address) {
        return this.allocatedBlocks.has(address);
    }

    getBlockInfo(address) {
        return this.allocatedBlocks.get(address);
    }

    getMemoryInfo() {
        let allocatedSize = 0;
        for (const block of this.allocatedBlocks.values()) {
            allocatedSize += block.size;
        }

        let freeSize = 0;
        for (const block of this.freeBlocks) {
            freeSize += block.size;
        }

        return {
            total: Math.floor(this.totalMemory / (1024 * 1024)),
            allocated: Math.floor(allocatedSize / (1024 * 1024)),
            free: Math.floor(freeSize / (1024 * 1024)),
            available: Math.floor(freeSize / (1024 * 1024)),
            blocks: this.allocatedBlocks.size,
            pageSize: this.pageSize
        };
    }

    getAllocatedBlocks() {
        const blocks = [];
        for (const [address, block] of this.allocatedBlocks.entries()) {
            blocks.push({
                address: '0x' + address.toString(16),
                size: block.size,
                sizeKB: Math.floor(block.size / 1024),
                allocated: new Date(block.allocated).toISOString(),
                protected: block.protected
            });
        }
        return blocks;
    }

    getFreeBlocks() {
        return this.freeBlocks.map(block => ({
            address: '0x' + block.address.toString(16),
            size: block.size,
            sizeKB: Math.floor(block.size / 1024)
        }));
    }

    defragment() {
        // Sort allocated blocks by address
        const blocks = Array.from(this.allocatedBlocks.values())
            .sort((a, b) => a.address - b.address);

        // Rebuild free blocks
        this.freeBlocks = [];
        let currentAddress = this.nextAddress;

        for (const block of blocks) {
            if (currentAddress < block.address) {
                this.freeBlocks.push({
                    address: currentAddress,
                    size: block.address - currentAddress
                });
            }
            currentAddress = block.address + block.size;
        }

        // Add remaining free space
        if (currentAddress < this.memoryLimit) {
            this.freeBlocks.push({
                address: currentAddress,
                size: this.memoryLimit - currentAddress
            });
        }

        return true;
    }

    reset() {
        this.allocatedBlocks.clear();
        this.freeBlocks = [{
            address: this.nextAddress,
            size: this.totalMemory - this.nextAddress
        }];
    }

    // Memory leak detection
    detectLeaks() {
        const now = Date.now();
        const leaks = [];
        const threshold = 3600000; // 1 hour

        for (const [address, block] of this.allocatedBlocks.entries()) {
            if (now - block.allocated > threshold) {
                leaks.push({
                    address: '0x' + address.toString(16),
                    size: block.size,
                    age: Math.floor((now - block.allocated) / 1000) + 's'
                });
            }
        }

        return leaks;
    }
}

// Export for global access
window.MemoryGuard = MemoryGuard;
