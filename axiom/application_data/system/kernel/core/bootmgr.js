/**
 * Axiom Boot Manager
 * Handles system initialization and boot sequence
 */

class BootManager {
    constructor() {
        this.bootStage = 0;
        this.bootMessages = [];
        this.startTime = performance.now();
        this.colors = {
            ok: 'output-success',
            info: 'output-info',
            warn: 'output-warning',
            error: 'output-error'
        };
        
        // Real system parameters (emulated, not simulated!)
        this.realMemorySize = this.detectRealMemory();
        this.realCores = navigator.hardwareConcurrency || 2;
        this.realPlatform = this.detectPlatform();
    }
    
    detectRealMemory() {
        // Try to get real device memory
        if (navigator.deviceMemory) {
            return navigator.deviceMemory * 1024; // GB to MB
        }
        // Fallback: estimate from performance.memory API
        if (performance.memory) {
            const jsHeapLimit = performance.memory.jsHeapSizeLimit;
            const jsHeapUsed = performance.memory.usedJSHeapSize;
            // Estimate: JS heap is typically 25-30% of total RAM
            const estimatedRAM = Math.floor(jsHeapLimit / 1024 / 1024 * 3.5);
            return Math.min(estimatedRAM, 128); // Cap at 128MB for VM
        }
        // Check if running in ServiceWorker/limited context
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            return 64; // Conservative for workers
        }
        return 128; // Default fallback
    }
    
    detectPlatform() {
        const ua = navigator.userAgent;
        const platform = navigator.platform;
        
        // Detect OS
        let os = 'Unknown Host';
        let arch = 'x86_64';
        
        if (ua.includes('Win')) {
            os = 'Windows Host';
            if (ua.includes('Win64') || ua.includes('x64')) arch = 'x86_64';
            else if (ua.includes('ARM')) arch = 'arm64';
        } else if (ua.includes('Mac')) {
            os = 'macOS Host';
            if (ua.includes('Intel')) arch = 'x86_64';
            else if (ua.includes('ARM') || platform.includes('arm')) arch = 'arm64';
        } else if (ua.includes('Linux')) {
            os = 'Unix Host';
            arch = platform.includes('arm') ? 'arm64' : 'x86_64';
        } else if (ua.includes('Android')) {
            os = 'Android Host';
            arch = ua.includes('arm64') ? 'arm64' : 'arm';
        } else if (ua.includes('iPhone') || ua.includes('iPad')) {
            os = 'iOS Host';
            arch = 'arm64';
        }
        
        // Detect screen info for more context
        const screenInfo = {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio || 1
        };
        
        return { os, arch, screen: screenInfo };
    }
    
    detectGPU() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return { vendor: 'Unknown', renderer: 'Software Rendering' };
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                return {
                    vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown',
                    renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown'
                };
            }
            
            return {
                vendor: gl.getParameter(gl.VENDOR) || 'Unknown',
                renderer: gl.getParameter(gl.RENDERER) || 'Unknown'
            };
        } catch (e) {
            return { vendor: 'Unknown', renderer: 'Software Rendering' };
        }
    }
    
    async detectBattery() {
        try {
            if ('getBattery' in navigator) {
                const battery = await navigator.getBattery();
                return {
                    charging: battery.charging,
                    level: Math.round(battery.level * 100),
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            }
        } catch (e) {
            // Battery API not available
        }
        return null;
    }
    
    toHex(num, padding = 16) {
        return '0x' + num.toString(16).padStart(padding, '0');
    }
    
    formatMemRange(start, end) {
        return `[mem ${this.toHex(start)}-${this.toHex(end)}]`;
    }

    async initialize() {
        // Kernel banner
        this.log(`[${this.formatTime()}] Booting Axiom OS (Kernel 6.2.0-axiom)`, 'boot-message');
        this.log(`[${this.formatTime()}] Command line: BOOT_IMAGE=/boot/axiom-vmlinuz root=/dev/sda1 ro quiet splash`, 'boot-message');
        this.log(`[${this.formatTime()}] Kernel command line: BOOT_IMAGE=/boot/axiom-vmlinuz root=/dev/sda1 ro quiet splash`, 'boot-message');
        
        await this.stage1_EarlyBoot();
        await this.stage2_HardwareDetection();
        await this.stage3_CPUInitialization();
        await this.stage4_MemoryInitialization();
        await this.stage5_StorageInitialization();
        await this.stage6_FileSystemInitialization();
        await this.stage7_DeviceInitialization();
        await this.stage8_NetworkInitialization();
        await this.stage9_EnvironmentSetup();
        await this.stage10_VMInitialization();
        await this.stage11_ServicesStart();
        await this.stage12_SystemReady();
        
        // Save boot log to /var/log/boot.log
        await this.saveBootLog();
        
        // Задержка и очистка консоли
        await this.sleep(100);
        if (typeof window.axiomTerminal !== 'undefined') {
            window.axiomTerminal.clear();
        }
        
        // Финальный вывод (LTS = Long-Term Support - версия с долгосрочной поддержкой)
        this.log(`Axiom OS 1.0.0 LTS`, 'output-success');
        this.log('', 'boot-message');
        
        return true;
    }
    
    async saveBootLog() {
        try {
            // Ensure /var/log directory exists
            if (!window.axiomContainer.exists('/var')) {
                window.axiomContainer.createDirectory('/var', true);
            }
            if (!window.axiomContainer.exists('/var/log')) {
                window.axiomContainer.createDirectory('/var/log', true);
            }
            
            // Format boot log with timestamp
            const timestamp = new Date().toISOString();
            const header = `=== Axiom OS Boot Log ===\nBoot Time: ${timestamp}\nKernel: 6.2.0-axiom\n\n`;
            const logContent = header + this.bootMessages.join('\n') + '\n';
            
            // Overwrite boot.log with current boot sequence
            window.axiomContainer.writeFile('/var/log/boot.log', logContent);
        } catch (e) {
            // Silently fail if filesystem not ready
            console.warn('Failed to save boot log:', e);
        }
    }

    async stage1_EarlyBoot() {
        this.log(`[${this.formatTime()}] Early boot initialization`, 'boot-message');
        this.log(`[${this.formatTime()}] BIOS-provided physical RAM map:`, 'boot-message');
        
        // Calculate real memory addresses based on detected memory
        const memSizeMB = this.realMemorySize;
        const memBytes = memSizeMB * 1024 * 1024;
        
        // BIOS reserved area (standard)
        const biosLowEnd = 0x9fbff;
        const biosHighStart = 0x100000;
        const memEnd = memBytes - 1;
        
        this.log(`[${this.formatTime()}] BIOS-e820: ${this.formatMemRange(0, biosLowEnd)} usable`, 'boot-message');
        this.log(`[${this.formatTime()}] BIOS-e820: ${this.formatMemRange(biosHighStart, memEnd)} usable`, 'boot-message');
        this.log(`[${this.formatTime()}] DMI: Axiom Virtual Platform 1.0`, 'boot-message');
        this.log(`[${this.formatTime()}] Hypervisor detected: Browser VM`, 'boot-message');
        
        // Reserved regions
        this.log(`[${this.formatTime()}] e820: update ${this.formatMemRange(0, 0xfff)} usable ==> reserved`, 'boot-message');
        this.log(`[${this.formatTime()}] e820: remove ${this.formatMemRange(0xa0000, 0xfffff)} usable`, 'boot-message');
        
        // Calculate page frame numbers
        const lastPfn = Math.floor(memBytes / 4096);
        const maxArchPfn = 0x400000000; // x86_64 maximum
        
        this.log(`[${this.formatTime()}] last_pfn = ${this.toHex(lastPfn, 4)} max_arch_pfn = ${this.toHex(maxArchPfn, 8)}`, 'boot-message');
        this.log(`[${this.formatTime()}] MTRR default type: uncachable`, 'boot-message');
        this.log(`[${this.formatTime()}] MTRR fixed ranges enabled:`, 'boot-message');
        await this.sleep(80);
    }

    async stage2_HardwareDetection() {
        this.log(`[${this.formatTime()}] Initializing hardware abstraction layer...`, 'boot-message');
        
        // Real browser/hardware info
        const cores = this.realCores;
        const memoryGB = this.realMemorySize >= 1024 ? `${(this.realMemorySize / 1024).toFixed(1)}GB` : `${this.realMemorySize}MB`;
        const platform = navigator.platform;
        
        this.log(`[${this.formatTime()}] DMI: ${platform} ${this.realPlatform.os}`, 'boot-message');
        this.log(`[${this.formatTime()}] Detected ${cores} logical processors`, 'boot-message');
        this.log(`[${this.formatTime()}] Memory: ${memoryGB} available`, 'boot-message');
        
        // x86/FPU features (check real browser capabilities)
        const hasWasm = typeof WebAssembly !== 'undefined';
        const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
        
        this.log(`[${this.formatTime()}] x86/fpu: Supporting XSAVE feature 0x001: 'x87 floating point registers'`, 'boot-message');
        this.log(`[${this.formatTime()}] x86/fpu: Supporting XSAVE feature 0x002: 'SSE registers'`, 'boot-message');
        this.log(`[${this.formatTime()}] x86/fpu: Supporting XSAVE feature 0x004: 'AVX registers'`, 'boot-message');
        
        if (hasWasm) {
            this.log(`[${this.formatTime()}] WebAssembly: supported (SIMD available)`, 'boot-message');
        }
        
        // GPU detection
        const gpu = this.detectGPU();
        this.log(`[${this.formatTime()}] pci 0000:00:02.0: VGA compatible controller: ${gpu.vendor}`, 'boot-message');
        this.log(`[${this.formatTime()}] pci 0000:00:02.0: ${gpu.renderer}`, 'boot-message');
        
        // Screen information
        this.log(`[${this.formatTime()}] fb0: ${this.realPlatform.screen.width}x${this.realPlatform.screen.height}x${this.realPlatform.screen.colorDepth} (display framebuffer)`, 'boot-message');
        
        // ACPI addresses (standard x86 locations)
        const pmTimerPort = 0x608;
        const localApicAddr = 0xfee00000;
        
        this.log(`[${this.formatTime()}] ACPI: PM-Timer IO Port: ${this.toHex(pmTimerPort, 3)}`, 'boot-message');
        this.log(`[${this.formatTime()}] ACPI: Local APIC address ${this.toHex(localApicAddr, 8)}`, 'boot-message');
        
        await this.sleep(80);
    }

    async stage3_CPUInitialization() {
        if (typeof VirtualCPU === 'undefined') {
            this.printFail('CPU initialization failed: VirtualCPU not found');
            throw new Error('VirtualCPU not found');
        }
        
        window.axiomCPU = new VirtualCPU();
        await window.axiomCPU.initialize();
        
        const cpuInfo = window.axiomCPU.getCPUInfo();
        
        // Calculate cache sizes based on core count (realistic scaling)
        const l1CachePerCore = 32; // KB
        const l2CachePerCore = 256; // KB
        const l3CacheTotal = cpuInfo.cores * 2048; // 2MB per core for L3
        
        const totalL1 = l1CachePerCore * cpuInfo.cores;
        const totalL2 = l2CachePerCore * cpuInfo.cores;
        
        this.log(`[${this.formatTime()}] smpboot: Allowing ${cpuInfo.cores} CPUs, 0 hotplug CPUs`, 'boot-message');
        this.log(`[${this.formatTime()}] setup_percpu: NR_CPUS:${cpuInfo.cores * 2} nr_cpumask_bits:${cpuInfo.cores} nr_cpu_ids:${cpuInfo.cores} nr_node_ids:1`, 'boot-message');
        this.log(`[${this.formatTime()}] CPU: ${cpuInfo.name}`, 'boot-message');
        this.log(`[${this.formatTime()}] CPU: ${cpuInfo.cores} cores, ${cpuInfo.threads} threads @ ${cpuInfo.clockSpeed}MHz`, 'boot-message');
        this.log(`[${this.formatTime()}] CPU: Physical Processor ID: 0`, 'boot-message');
        this.log(`[${this.formatTime()}] CPU: Processor Core ID: 0`, 'boot-message');
        this.log(`[${this.formatTime()}] CPU: Features - SSE SSE2 SSE3 SSE4.1 SSE4.2 AVX AVX2 FMA3`, 'boot-message');
        this.log(`[${this.formatTime()}] CPU: L1 Cache: ${l1CachePerCore}KB/core (${totalL1}KB total), L2 Cache: ${l2CachePerCore}KB/core (${totalL2}KB total), L3 Cache: ${l3CacheTotal}KB`, 'boot-message');
        this.log(`[${this.formatTime()}] mce: CPU supports ${cpuInfo.cores} MCE banks`, 'boot-message');
        this.log(`[${this.formatTime()}] Performance Events: Virtual PMU driver`, 'boot-message');
        this.printOK('CPU initialization');
        
        await this.sleep(80);
    }

    async stage4_MemoryInitialization() {
        if (typeof MemoryGuard === 'undefined') {
            this.printFail('Memory initialization failed');
            throw new Error('MemoryGuard not found');
        }
        
        window.axiomMemory = new MemoryGuard();
        await window.axiomMemory.initialize();
        
        const memInfo = window.axiomMemory.getMemoryInfo();
        const totalPages = (memInfo.total * 1024) / 4;
        const freePages = (memInfo.available * 1024) / 4;
        const kernelCodePages = Math.floor(totalPages * 0.15);
        const reservedPages = Math.floor(totalPages * 0.1);
        const dataPages = Math.floor(totalPages * 0.6);
        const initPages = Math.floor(totalPages * 0.05);
        
        this.log(`[${this.formatTime()}] Memory: ${memInfo.total}MB total, ${memInfo.available}MB available`, 'boot-message');
        this.log(`[${this.formatTime()}] Memory: ${totalPages}K/${totalPages}K available (${kernelCodePages}K kernel code, ${reservedPages}K reserved, ${dataPages}K data, ${initPages}K init)`, 'boot-message');
        this.log(`[${this.formatTime()}] Memory: Page size 4096 bytes`, 'boot-message');
        this.log(`[${this.formatTime()}] Kernel/User page tables isolation: enabled`, 'boot-message');
        this.log(`[${this.formatTime()}] Memory: Using ${memInfo.total}MB for main memory`, 'boot-message');
        
        // Calculate zone ranges based on real memory
        const dmaEnd = 0xffffff; // 16MB DMA limit (standard)
        const dma32Start = 0x1000000;
        const totalMemBytes = memInfo.total * 1024 * 1024;
        const dma32End = Math.min(totalMemBytes - 1, 0xffffffff); // 4GB limit for DMA32
        
        this.log(`[${this.formatTime()}] Zone ranges:`, 'boot-message');
        this.log(`[${this.formatTime()}]   DMA      ${this.formatMemRange(0x1000, dmaEnd)}`, 'boot-message');
        this.log(`[${this.formatTime()}]   DMA32    ${this.formatMemRange(dma32Start, dma32End)}`, 'boot-message');
        
        if (totalMemBytes > 0x100000000) {
            // If memory exceeds 4GB, show Normal zone
            this.log(`[${this.formatTime()}]   Normal   ${this.formatMemRange(0x100000000, totalMemBytes - 1)}`, 'boot-message');
        } else {
            this.log(`[${this.formatTime()}]   Normal   empty`, 'boot-message');
        }
        
        this.printOK('Memory initialization');
        
        await this.sleep(80);
    }

    async stage5_StorageInitialization() {
        // Real localStorage info
        let storageUsed = 0, storageTotal = 5 * 1024 * 1024;
        try {
            const estimate = await navigator.storage?.estimate();
            if (estimate) {
                storageUsed = estimate.usage || 0;
                storageTotal = estimate.quota || storageTotal;
            }
        } catch (e) {
            // Fallback to localStorage check
            const test = localStorage.getItem('axiom_fs') || '';
            storageUsed = new Blob([test]).size;
        }
        
        const usedMB = (storageUsed / (1024 * 1024)).toFixed(2);
        const totalMB = (storageTotal / (1024 * 1024)).toFixed(2);
        const usedPercent = ((storageUsed / storageTotal) * 100).toFixed(1);
        
        // Calculate partition info based on real storage
        const sectorSize = 512; // bytes
        const totalSectors = Math.floor(storageTotal / sectorSize);
        const partitionStart = 2048; // standard partition start (1MB alignment)
        const partitionSize = totalSectors - partitionStart;
        
        this.log(`[${this.formatTime()}] Storage: Probing for storage devices...`, 'boot-message');
        this.log(`[${this.formatTime()}] Storage: localStorage backend detected`, 'boot-message');
        this.log(`[${this.formatTime()}] Storage: LZ-based compression enabled (space saving)`, 'boot-message');
        this.log(`[${this.formatTime()}] Storage: sda: Virtual Disk (${totalMB}MB)`, 'boot-message');
        this.log(`[${this.formatTime()}] Storage: sda: ${usedMB}MB used / ${totalMB}MB total (${usedPercent}% used)`, 'boot-message');
        this.log(`[${this.formatTime()}] Storage: sda1: partition 1 start=${partitionStart} size=${partitionSize} sectors`, 'boot-message');
        this.log(`[${this.formatTime()}] SCSI subsystem initialized`, 'boot-message');
        this.printOK('Storage subsystem');
        
        await this.sleep(80);
    }

    async stage6_FileSystemInitialization() {
        if (typeof FileSystemInput === 'undefined' || typeof FileSystemOutput === 'undefined') {
            this.printFail('File system initialization failed');
            throw new Error('File System modules not found');
        }
        
        window.axiomFS = {
            input: new FileSystemInput(),
            output: new FileSystemOutput()
        };
        
        await window.axiomFS.input.initialize();
        await window.axiomFS.output.initialize();
        
        if (typeof VMContainer === 'undefined') {
            throw new Error('VMContainer not found');
        }
        
        window.axiomContainer = new VMContainer();
        await window.axiomContainer.initialize();
        
        // Calculate kernel memory usage based on actual allocated memory
        const memInfo = window.axiomMemory.getMemoryInfo();
        const unusedKernelMem = Math.floor(memInfo.total * 0.02); // 2% unused kernel memory
        const roDataSize = Math.floor(memInfo.total * 0.12); // 12% for read-only data
        const unusedImageMem = Math.floor(memInfo.total * 0.015); // 1.5% unused image
        
        this.log(`[${this.formatTime()}] VFS: Disk quotas dquot_6.6.0`, 'boot-message');
        this.log(`[${this.formatTime()}] VFS: Mounted root (localStorage) filesystem readonly on device 8:1`, 'boot-message');
        this.log(`[${this.formatTime()}] VFS: File descriptors: stdin(0), stdout(1), stderr(2)`, 'boot-message');
        this.log(`[${this.formatTime()}] devtmpfs: mounted`, 'boot-message');
        this.log(`[${this.formatTime()}] Freeing unused kernel memory: ${unusedKernelMem}K`, 'boot-message');
        this.log(`[${this.formatTime()}] Write protecting the kernel read-only data: ${roDataSize}k`, 'boot-message');
        this.log(`[${this.formatTime()}] Freeing unused kernel image memory: ${unusedImageMem}K`, 'boot-message');
        this.log(`[${this.formatTime()}] EXT4-fs (sda1): mounted filesystem with ordered data mode`, 'boot-message');
        this.printOK('File system mounted');
        
        await this.sleep(80);
    }

    async stage7_DeviceInitialization() {
        this.log(`[${this.formatTime()}] input: Virtual Keyboard as /devices/platform/i8042/input/input0`, 'boot-message');
        this.log(`[${this.formatTime()}] input: Virtual Mouse as /devices/platform/i8042/input/input1`, 'boot-message');
        
        // Battery info (if available)
        const battery = await this.detectBattery();
        if (battery) {
            const status = battery.charging ? 'Charging' : 'Discharging';
            this.log(`[${this.formatTime()}] ACPI: Battery [BAT0] (battery, ${status}, ${battery.level}%)`, 'boot-message');
            if (battery.charging && battery.chargingTime !== Infinity) {
                const timeMin = Math.floor(battery.chargingTime / 60);
                this.log(`[${this.formatTime()}] ACPI: AC Adapter [AC0] (on-line, full charge in ${timeMin}min)`, 'boot-message');
            }
        }
        
        this.log(`[${this.formatTime()}] rtc_cmos 00:00: RTC can wake from S4`, 'boot-message');
        this.log(`[${this.formatTime()}] rtc_cmos 00:00: registered as rtc0`, 'boot-message');
        this.log(`[${this.formatTime()}] Serial: 8250/16550 driver, 4 ports, IRQ sharing enabled`, 'boot-message');
        this.printOK('Device initialization');
        
        await this.sleep(80);
    }

    async stage8_NetworkInitialization() {
        // Real network info
        const online = navigator.onLine;
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const effectiveType = connection?.effectiveType || 'unknown';
        const downlink = connection?.downlink || 0;
        const saveData = connection?.saveData || false;
        
        this.log(`[${this.formatTime()}] e1000: Intel(R) PRO/1000 Network Driver`, 'boot-message');
        this.log(`[${this.formatTime()}] e1000: eth0 NIC Link is ${online ? 'Up' : 'Down'}`, 'boot-message');
        if (online && connection) {
            const speedMbps = downlink > 0 ? downlink.toFixed(1) : 'unknown';
            this.log(`[${this.formatTime()}] e1000: eth0: ${effectiveType} connection (${speedMbps}Mbps)`, 'boot-message');
            if (connection.rtt) {
                this.log(`[${this.formatTime()}] e1000: eth0: RTT ~${connection.rtt}ms`, 'boot-message');
            }
            if (saveData) {
                this.log(`[${this.formatTime()}] e1000: eth0: Data saver mode enabled`, 'boot-message');
            }
        }
        this.log(`[${this.formatTime()}] IPv6: ADDRCONF(NETDEV_CHANGE): eth0: link becomes ready`, 'boot-message');
        this.printOK('Network configuration');
        
        await this.sleep(80);
    }

    async stage9_EnvironmentSetup() {
        if (typeof Environment === 'undefined') {
            this.printFail('Environment setup failed');
            throw new Error('Environment not found');
        }
        
        window.axiomEnv = new Environment();
        await window.axiomEnv.initialize();
        
        this.log(`[${this.formatTime()}] systemd[1]: systemd 252.5-2 running in system mode`, 'boot-message');
        this.log(`[${this.formatTime()}] systemd[1]: Detected virtualization browser`, 'boot-message');
        this.log(`[${this.formatTime()}] systemd[1]: Detected architecture x86-64`, 'boot-message');
        this.log(`[${this.formatTime()}] systemd[1]: Hostname set to <axiom-vm>`, 'boot-message');
        this.log(`[${this.formatTime()}] systemd[1]: Loading environment variables`, 'boot-message');
        this.log(`[${this.formatTime()}] systemd[1]: Set environment USER=${window.axiomEnv.get('USER')}`, 'boot-message');
        this.log(`[${this.formatTime()}] systemd[1]: Set environment HOME=${window.axiomEnv.get('HOME')}`, 'boot-message');
        this.log(`[${this.formatTime()}] systemd[1]: Set environment PATH=${window.axiomEnv.get('PATH')}`, 'boot-message');
        this.log(`[${this.formatTime()}] systemd[1]: Set environment SHELL=${window.axiomEnv.get('SHELL')}`, 'boot-message');
        this.printOK('Environment configuration');
        
        await this.sleep(80);
    }

    async stage10_VMInitialization() {
        if (typeof VMEmulator === 'undefined') {
            this.printFail('VM initialization failed');
            throw new Error('VM modules not found');
        }
        
        window.axiomVM = new VMEmulator();
        await window.axiomVM.initialize();
        
        this.log(`[${this.formatTime()}] kvm: VM support detected`, 'boot-message');
        this.log(`[${this.formatTime()}] kvm: DosX virtual machine initialized`, 'boot-message');
        this.log(`[${this.formatTime()}] kvm: Instruction set loaded (x86-64 compatible)`, 'boot-message');
        this.log(`[${this.formatTime()}] kvm: 64-bit syscall interface ready`, 'boot-message');
        this.log(`[${this.formatTime()}] kvm: Virtualization features enabled`, 'boot-message');
        this.printOK('Virtual machine');
        
        await this.sleep(80);
    }

    async stage11_ServicesStart() {
        this.log(`[${this.formatTime()}] systemd[1]: Starting system services...`, 'boot-message');
        this.log(`[${this.formatTime()}] systemd[1]: Started Dispatch Password Requests to Console`, 'boot-message');
        this.printOK('systemd-tmpfiles-setup-dev.service - Create Static Device Nodes');
        this.printOK('systemd-journald.service - Journal Service');
        this.printOK('systemd-udevd.service - Rule-based Manager for Device Events');
        this.printOK('systemd-timesyncd.service - Network Time Synchronization');
        this.printOK('systemd-logind.service - User Login Management');
        this.printOK('dbus.service - D-Bus System Message Bus');
        this.printOK('axiom-terminal.service - Axiom Terminal Service');
        this.printOK('axiom-shell.service - Axiom Shell');
        
        await this.sleep(80);
    }

    async stage12_SystemReady() {
        this.printOK('Reached target Basic System');
        this.printOK('Reached target Network');
        this.printOK('Reached target Multi-User System');
        this.printOK('Reached target Graphical Interface');
        this.log(`[${this.formatTime()}] systemd[1]: Startup finished in ${((performance.now() - this.startTime) / 1000).toFixed(2)}s (kernel) + ${((performance.now() - this.startTime) / 1000 * 0.3).toFixed(2)}s (userspace) = ${((performance.now() - this.startTime) / 1000 * 1.3).toFixed(2)}s`, 'boot-message');
        
        await this.sleep(80);
    }

    formatTime() {
        const seconds = (performance.now() - this.startTime) / 1000;
        return seconds.toFixed(6).padStart(10, ' ');
    }

    printOK(message) {
        this.log(`[${this.formatTime()}] [  OK  ] ${message}`, 'output-success');
    }

    printFail(message) {
        this.log(`[${this.formatTime()}] [FAILED] ${message}`, 'output-error');
    }

    log(message, className = 'boot-message') {
        this.bootMessages.push(message);
        
        if (typeof window.axiomTerminal !== 'undefined') {
            window.axiomTerminal.printLine(message, className);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getBootMessages() {
        return this.bootMessages;
    }
}

// Export for global access
window.BootManager = BootManager;
