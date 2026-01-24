/**
 * Fingerprint Component
 * Collects and displays browser & system information
 */
class Fingerprint {
    constructor() {
        this.output = document.getElementById('fingerprint-output');
        this.toolbarButtons = document.querySelectorAll('.toolbar-button');
        this.windowControls = {
            minimize: document.querySelector('.window-control.minimize'),
            maximize: document.querySelector('.window-control.maximize'),
            close: document.querySelector('.window-control.close')
        };
        
        // Add flag to track loading state
        this.isLoading = false;
        
        this.initEventListeners();
        this.generateFingerprint();
    }
    
    initEventListeners() {
        // Toolbar buttons functionality
        this.toolbarButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Check if the system is in loading process
                // If so, don't react to the click
                if (this.isLoading) {
                    return;
                }
                
                this.toolbarButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                
                // Switch view based on active tab
                const view = button.textContent.toLowerCase();
                this.showView(view);
            });
        });
        
        // Window controls are disabled
        // We keep the controls for visual design but remove functionality
        if (this.windowControls.minimize) {
            this.windowControls.minimize.style.cursor = 'default';
        }
        
        if (this.windowControls.maximize) {
            this.windowControls.maximize.style.cursor = 'default';
        }
        
        if (this.windowControls.close) {
            this.windowControls.close.style.cursor = 'default';
        }
    }
    
    showView(view) {
        if (!this.output) return;
        
        // Set loading flag
        this.isLoading = true;
        
        // Clear current content
        this.output.innerHTML = '';
        
        // Show loading animation
        this.showLoading();
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            switch(view) {
                case 'overview':
                    this.renderOverview();
                    break;
                case 'browser':
                    this.renderBrowserInfo();
                    break;
                case 'system':
                    this.renderSystemInfo();
                    break;
                default:
                    this.renderOverview();
            }
            
            // Reset loading flag after rendering completes
            this.isLoading = false;
        }, 800);
    }
    
    showLoading() {
        this.output.innerHTML = `
            <div class="loading-scanner">
                <div class="scanner-animation"></div>
                <div class="scanner-text">Scanning your device...</div>
            </div>
        `;
    }
    
    generateFingerprint() {
        // Set loading flag during initial initialization
        this.isLoading = true;
        
        // Simulate initial delay for better UX
        setTimeout(() => {
            this.renderOverview();
            // Reset loading flag after initialization completes
            this.isLoading = false;
        }, 1500);
    }
    
    renderOverview() {
        if (!this.output) return;
        
        const userAgent = navigator.userAgent;
        const browserInfo = this.getBrowserInfo(userAgent);
        const hashedFingerprint = this.generateHashedFingerprint();
        const suspicionInfo = this.analyzeUserAgentSuspicion();
        const suspicionClass = `suspicion-${suspicionInfo.level.toLowerCase()}`;
        const featureSupport = this.generateFeatureSupport();
        
        // Determine color and class for browser feature support
        let supportClass;
        if (featureSupport.percentage >= 80) {
            supportClass = 'support-high';
        } else if (featureSupport.percentage >= 60) {
            supportClass = 'support-medium';
        } else {
            supportClass = 'support-low';
        }
        
        const html = `
            <div class="fingerprint-section-title">Device Overview</div>
            <div class="fingerprint-card main-fp">
                <div class="fingerprint-hash">${hashedFingerprint}</div>
                <div class="device-type-icon ${this.getDeviceType().toLowerCase()}"></div>
            </div>
            
            <div class="fingerprint-card feature-support-card ${supportClass}">
                <div class="card-title">
                    <div class="card-icon feature"></div>
                    Browser Feature Support
                </div>
                <div class="card-content">
                    <div class="support-meter">
                        <div class="support-meter-fill" style="width: ${featureSupport.percentage}%;"></div>
                        <div class="support-meter-text">${featureSupport.percentage}%</div>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Supported Features:</span>
                        <span class="info-value">${featureSupport.supported} of ${featureSupport.total}</span>
                    </div>
                </div>
            </div>
            
            <div class="suspicion-card ${suspicionClass}">
                <div class="suspicion-header">
                    <div class="suspicion-title">User Agent Suspicion Level</div>
                    <div class="suspicion-badge">${suspicionInfo.level}</div>
                </div>
                <div class="suspicion-content">
                    <ul>
                        ${suspicionInfo.reasons.length > 0 ? 
                            suspicionInfo.reasons.map(reason => `<li>${reason}</li>`).join('') : 
                            '<li>No suspicious patterns detected</li>'}
                    </ul>
                </div>
            </div>
            
            <div class="fingerprint-grid">
                <div class="fingerprint-card">
                    <div class="card-title">
                        <div class="card-icon browser"></div>
                        Browser
                    </div>
                    <div class="card-content">
                        <div class="info-row">
                            <span class="info-label">Name:</span>
                            <span class="info-value">${browserInfo.browser}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Version:</span>
                            <span class="info-value">${browserInfo.version}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Engine:</span>
                            <span class="info-value">${this.getBrowserEngine()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Canvas ID:</span>
                            <span class="info-value">${this.getCanvasFingerprint()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="fingerprint-card">
                    <div class="card-title">
                        <div class="card-icon os"></div>
                        Operating System
                    </div>
                    <div class="card-content">
                        <div class="info-row">
                            <span class="info-label">OS:</span>
                            <span class="info-value">${browserInfo.os}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Platform:</span>
                            <span class="info-value">${navigator.platform}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">CPU Cores:</span>
                            <span class="info-value">${navigator.hardwareConcurrency || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Architecture:</span>
                            <span class="info-value">${this.getArchitecture()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="fingerprint-card">
                    <div class="card-title">
                        <div class="card-icon display"></div>
                        Display
                    </div>
                    <div class="card-content">
                        <div class="info-row">
                            <span class="info-label">Resolution:</span>
                            <span class="info-value">${window.screen.width}x${window.screen.height}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Pixel Ratio:</span>
                            <span class="info-value">${window.devicePixelRatio.toFixed(2)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Color Depth:</span>
                            <span class="info-value">${window.screen.colorDepth}-bit</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Color Scheme:</span>
                            <span class="info-value">${this.getPreferredColorScheme()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="fingerprint-card">
                    <div class="card-title">
                        <div class="card-icon privacy"></div>
                        Privacy
                    </div>
                    <div class="card-content">
                        <div class="info-row">
                            <span class="info-label">Cookies:</span>
                            <span class="info-value">${navigator.cookieEnabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Do Not Track:</span>
                            <span class="info-value">${this.getDNTStatus()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Incognito:</span>
                            <span class="info-value">${this.isIncognitoMode() ? 'Likely Yes' : 'Likely No'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Touch Input:</span>
                            <span class="info-value">${this.detectTouchEmulation()}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="fingerprint-additional-section">
                <div class="fingerprint-section-title">Regional & Timezone Data</div>
                <div class="fingerprint-card language-card">
                    <div class="card-title">
                        <div class="card-icon language"></div>
                        Languages
                    </div>
                    <div class="card-content">
                        ${Object.entries(this.getLanguageInfo()).map(([key, value]) => `
                            <div class="info-row">
                                <span class="info-label">${key}:</span>
                                <span class="info-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="fingerprint-card timezone-card">
                    <div class="card-title">
                        <div class="card-icon timezone"></div>
                        Timezone
                    </div>
                    <div class="card-content">
                        ${Object.entries(this.getDetailedTimezoneInfo()).map(([key, value]) => `
                            <div class="info-row">
                                <span class="info-label">${key}:</span>
                                <span class="info-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="fingerprint-section-title">API Capabilities</div>
            <div class="fingerprint-card api-support-card">
                <div class="card-title">
                    <div class="card-icon capabilities"></div>
                    Supported Browser APIs
                </div>
                <div class="api-capabilities-grid">
                    <div class="api-item ${this.getAvailableAPIs().Bluetooth ? 'supported' : 'unsupported'}">
                        <div class="api-icon bluetooth-icon"></div>
                        <div class="api-name">Bluetooth</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs().Geolocation ? 'supported' : 'unsupported'}">
                        <div class="api-icon geo-icon"></div>
                        <div class="api-name">Geolocation</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs().WebRTC ? 'supported' : 'unsupported'}">
                        <div class="api-icon rtc-icon"></div>
                        <div class="api-name">WebRTC</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs()['Credential Management'] ? 'supported' : 'unsupported'}">
                        <div class="api-icon credential-icon"></div>
                        <div class="api-name">Credential Mgmt</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs().USB ? 'supported' : 'unsupported'}">
                        <div class="api-icon usb-icon"></div>
                        <div class="api-name">USB</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs().Serial ? 'supported' : 'unsupported'}">
                        <div class="api-icon serial-icon"></div>
                        <div class="api-name">Serial</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs().GamePads ? 'supported' : 'unsupported'}">
                        <div class="api-icon gamepad-icon"></div>
                        <div class="api-name">GamePads</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs().Vibration ? 'supported' : 'unsupported'}">
                        <div class="api-icon vibration-icon"></div>
                        <div class="api-name">Vibration</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs()['Payment Request'] ? 'supported' : 'unsupported'}">
                        <div class="api-icon payment-icon"></div>
                        <div class="api-name">Payment Request</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs()['Web Share'] ? 'supported' : 'unsupported'}">
                        <div class="api-icon share-icon"></div>
                        <div class="api-name">Web Share</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs()['Push API'] ? 'supported' : 'unsupported'}">
                        <div class="api-icon push-icon"></div>
                        <div class="api-name">Push API</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs().Notifications ? 'supported' : 'unsupported'}">
                        <div class="api-icon notifications-icon"></div>
                        <div class="api-name">Notifications</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs()['Media Devices'] ? 'supported' : 'unsupported'}">
                        <div class="api-icon media-icon"></div>
                        <div class="api-name">Media Devices</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs()['Speech Recognition'] ? 'supported' : 'unsupported'}">
                        <div class="api-icon speech-icon"></div>
                        <div class="api-name">Speech Recognition</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs()['Web Workers'] ? 'supported' : 'unsupported'}">
                        <div class="api-icon worker-icon"></div>
                        <div class="api-name">Web Workers</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs()['Service Workers'] ? 'supported' : 'unsupported'}">
                        <div class="api-icon service-icon"></div>
                        <div class="api-name">Service Workers</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs().WebGL ? 'supported' : 'unsupported'}">
                        <div class="api-icon webgl-icon"></div>
                        <div class="api-name">WebGL</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs().WebGL2 ? 'supported' : 'unsupported'}">
                        <div class="api-icon webgl2-icon"></div>
                        <div class="api-name">WebGL2</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs().WebVR ? 'supported' : 'unsupported'}">
                        <div class="api-icon webvr-icon"></div>
                        <div class="api-name">WebVR</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs().WebXR ? 'supported' : 'unsupported'}">
                        <div class="api-icon webxr-icon"></div>
                        <div class="api-name">WebXR</div>
                    </div>
                    <div class="api-item ${this.getAvailableAPIs()['Web Audio'] ? 'supported' : 'unsupported'}">
                        <div class="api-icon audio-icon"></div>
                        <div class="api-name">Audio API</div>
                    </div>
                </div>
            </div>
            
            <div class="fingerprint-footer">
                <div class="fingerprint-note">Your browser supports ${this.generateFeatureSupport().supported} out of ${this.generateFeatureSupport().total} modern web features and APIs.</div>
            </div>
        `;
        
        this.output.innerHTML = html;
    }
    
    renderBrowserInfo() {
        if (!this.output) return;
        
        const userAgent = navigator.userAgent;
        const browserInfo = this.getBrowserInfo(userAgent);
        
        const html = `
            <div class="fingerprint-section-title">Browser Information</div>
            
            <div class="browser-header">
                <div class="browser-icon ${browserInfo.browser.toLowerCase().replace(' ', '-')}"></div>
                <div class="browser-title">
                    <div class="browser-name">${browserInfo.browser}</div>
                    <div class="browser-version">Version ${browserInfo.version}</div>
                </div>
            </div>
            
            <div class="fingerprint-details-section">
                <div class="details-title">Core Information</div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-label">User Agent</div>
                        <div class="details-value code-block">${userAgent}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Engine</div>
                        <div class="details-value">${this.getBrowserEngine()}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Language</div>
                        <div class="details-value">${navigator.language || 'N/A'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Languages</div>
                        <div class="details-value">${navigator.languages ? navigator.languages.join(', ') : 'N/A'}</div>
                    </div>
                </div>
            </div>
            
            <div class="fingerprint-details-section">
                <div class="details-title">Features & Capabilities</div>
                <div class="support-summary">
                    <div class="support-meter">
                        <div class="support-meter-fill" style="width: ${this.generateFeatureSupport().percentage}%;"></div>
                        <div class="support-meter-text">${this.generateFeatureSupport().percentage}% Supported</div>
                    </div>
                    <div class="support-stats">
                        <div class="info-row">
                            <span class="info-label">Supported Features:</span>
                            <span class="info-value">${this.generateFeatureSupport().supported} of ${this.generateFeatureSupport().total}</span>
                        </div>
                    </div>
                </div>
                <div class="features-grid">
                    ${this.generateFeaturesList()}
                </div>
            </div>
            
            <div class="fingerprint-details-section">
                <div class="details-title">Storage Information</div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-label">Cookies Enabled</div>
                        <div class="details-value">${navigator.cookieEnabled ? 'Yes' : 'No'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Local Storage</div>
                        <div class="details-value">${typeof window.localStorage !== 'undefined' ? 'Available' : 'Not Available'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Session Storage</div>
                        <div class="details-value">${typeof window.sessionStorage !== 'undefined' ? 'Available' : 'Not Available'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">IndexedDB</div>
                        <div class="details-value">${typeof window.indexedDB !== 'undefined' ? 'Available' : 'Not Available'}</div>
                    </div>
                </div>
            </div>
        `;
        
        this.output.innerHTML = html;
    }
    
    renderSystemInfo() {
        if (!this.output) return;
        
        const browserInfo = this.getBrowserInfo(navigator.userAgent);
        const gpuInfo = this.getGPUInfo();
        
        const html = `
            <div class="fingerprint-section-title">System Information</div>
            
            <div class="system-header">
                <div class="system-icon ${browserInfo.os.toLowerCase().replace(' ', '-')}"></div>
                <div class="system-title">
                    <div class="system-name">${browserInfo.os}</div>
                    <div class="system-arch">${navigator.platform}</div>
                </div>
            </div>
            
            <div class="fingerprint-details-section">
                <div class="details-title">Hardware Information</div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-label">CPU Cores detected</div>
                        <div class="details-value">${navigator.hardwareConcurrency || 'N/A'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Memory (approx.)</div>
                        <div class="details-value">${this.getApproximateMemory()}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Battery Status</div>
                        <div class="details-value">${this.getBatteryInfo()}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Device Type</div>
                        <div class="details-value">${this.getDeviceType()}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Touch Points</div>
                        <div class="details-value">${navigator.maxTouchPoints || 0}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Architecture</div>
                        <div class="details-value">${this.getArchitecture()}</div>
                    </div>
                </div>
            </div>
            
            <div class="fingerprint-details-section">
                <div class="details-title">GPU Information</div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-label">GPU Vendor</div>
                        <div class="details-value">${gpuInfo.vendor || 'Unknown'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">GPU Renderer</div>
                        <div class="details-value">${gpuInfo.renderer || 'Unknown'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">WebGL Version</div>
                        <div class="details-value">${gpuInfo.version || 'N/A'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">WebGL2 Support</div>
                        <div class="details-value">${this.hasWebGL2() ? 'Yes' : 'No'}</div>
                    </div>
                    ${gpuInfo.details ? `
                    <div class="details-item">
                        <div class="details-label">GLSL Version</div>
                        <div class="details-value">${gpuInfo.details['GLSL Version'] || 'N/A'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Max Texture Size</div>
                        <div class="details-value">${gpuInfo.details['Max Texture Size'] || 'N/A'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Max Viewport Dims</div>
                        <div class="details-value">${gpuInfo.details['Max Viewport Dims'] || 'N/A'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Max Renderbuffer Size</div>
                        <div class="details-value">${gpuInfo.details['Max Renderbuffer Size'] || 'N/A'}</div>
                    </div>
                    ` : ''}
                </div>
                ${gpuInfo.details && gpuInfo.details['Key Extensions'] ? `
                <div class="extensions-list">
                    <div class="extensions-title">WebGL Extensions</div>
                    <div class="extensions-value code-block">${gpuInfo.details['Key Extensions']}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="fingerprint-details-section">
                <div class="details-title">Display Information</div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-label">Screen Resolution</div>
                        <div class="details-value">${window.screen.width}x${window.screen.height}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Available Resolution</div>
                        <div class="details-value">${window.screen.availWidth}x${window.screen.availHeight}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Viewport Size</div>
                        <div class="details-value">${window.innerWidth}x${window.innerHeight}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Pixel Ratio</div>
                        <div class="details-value">${window.devicePixelRatio.toFixed(2)}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Color Depth</div>
                        <div class="details-value">${window.screen.colorDepth}-bit</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Preferred Color Scheme</div>
                        <div class="details-value">${this.getPreferredColorScheme()}</div>
                    </div>
                </div>
            </div>
            
            <div class="fingerprint-details-section">
                <div class="details-title">Time & Location</div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-label">Time Zone</div>
                        <div class="details-value">${Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Time Zone Offset</div>
                        <div class="details-value">UTC ${this.getTimezoneOffsetString()}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Date Format</div>
                        <div class="details-value">${new Intl.DateTimeFormat().format(new Date())}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Number Format</div>
                        <div class="details-value">${new Intl.NumberFormat().format(1234567.89)}</div>
                    </div>
                </div>
            </div>
        `;
        
        this.output.innerHTML = html;
    }
    
    // Network section has been removed
    
    // Helper methods
    getBrowserInfo(userAgent) {
        const ua = userAgent.toLowerCase();
        let browser, version, os;
        
        // Detect browser and version
        if (ua.indexOf('edge') !== -1) {
            browser = 'Microsoft Edge';
            version = ua.match(/edge\/(\d+(\.\d+)?)/i)?.[1] || 'Unknown';
        } else if (ua.indexOf('edg') !== -1) {
            browser = 'Microsoft Edge';
            version = ua.match(/edg\/(\d+(\.\d+)?)/i)?.[1] || 'Unknown';
        } else if (ua.indexOf('chrome') !== -1) {
            browser = 'Chrome';
            version = ua.match(/chrome\/(\d+(\.\d+)?)/i)?.[1] || 'Unknown';
        } else if (ua.indexOf('safari') !== -1) {
            browser = 'Safari';
            version = ua.match(/version\/(\d+(\.\d+)?)/i)?.[1] || 'Unknown';
        } else if (ua.indexOf('firefox') !== -1) {
            browser = 'Firefox';
            version = ua.match(/firefox\/(\d+(\.\d+)?)/i)?.[1] || 'Unknown';
        } else if (ua.indexOf('msie') !== -1 || ua.indexOf('trident') !== -1) {
            browser = 'Internet Explorer';
            version = ua.match(/(?:msie |rv:)(\d+(\.\d+)?)/i)?.[1] || 'Unknown';
        } else if (ua.indexOf('opera') !== -1 || ua.indexOf('opr') !== -1) {
            browser = 'Opera';
            version = ua.match(/(?:opera|opr)\/(\d+(\.\d+)?)/i)?.[1] || 'Unknown';
        } else {
            browser = 'Unknown Browser';
            version = 'Unknown';
        }
        
        // Detect OS
        if (ua.indexOf('windows') !== -1) {
            os = 'Windows';
            if (ua.indexOf('windows nt 10') !== -1) os = 'Windows 10';
            else if (ua.indexOf('windows nt 6.3') !== -1) os = 'Windows 8.1';
            else if (ua.indexOf('windows nt 6.2') !== -1) os = 'Windows 8';
            else if (ua.indexOf('windows nt 6.1') !== -1) os = 'Windows 7';
        } else if (ua.indexOf('macintosh') !== -1 || ua.indexOf('mac os x') !== -1) {
            os = 'macOS';
            const macOSMatch = ua.match(/mac os x (\d+[._]\d+([._]\d+)?)/i);
            if (macOSMatch) {
                const versionStr = macOSMatch[1].replace(/_/g, '.');
                if (parseInt(versionStr) >= 10.16 || parseInt(versionStr) >= 11) {
                    os = 'macOS Big Sur or newer';
                } else if (versionStr.startsWith('10.15')) {
                    os = 'macOS Catalina';
                } else if (versionStr.startsWith('10.14')) {
                    os = 'macOS Mojave';
                }
            }
        } else if (ua.indexOf('android') !== -1) {
            os = 'Android';
            const match = ua.match(/android\s([0-9.]*)/i);
            if (match) os = `Android ${match[1]}`;
        } else if (ua.indexOf('ios') !== -1 || ua.indexOf('iphone') !== -1 || ua.indexOf('ipad') !== -1) {
            os = 'iOS';
            const match = ua.match(/os\s([0-9_]*)/i);
            if (match) os = `iOS ${match[1].replace(/_/g, '.')}`;
        } else if (ua.indexOf('linux') !== -1) {
            os = 'Linux';
        } else {
            os = 'Unknown OS';
        }
        
        return { browser, version, os };
    }
    
    getBrowserEngine() {
        const ua = navigator.userAgent.toLowerCase();
        
        if (ua.indexOf('webkit') !== -1) {
            if (ua.indexOf('chrome') !== -1) {
                return 'Blink';
            }
            return 'WebKit';
        } else if (ua.indexOf('gecko') !== -1 && ua.indexOf('firefox') !== -1) {
            return 'Gecko';
        } else if (ua.indexOf('trident') !== -1 || ua.indexOf('msie') !== -1) {
            return 'Trident';
        } else if (ua.indexOf('edg') !== -1) {
            return 'EdgeHTML';
        }
        
        return 'Unknown';
    }
    
    getDeviceType() {
        const ua = navigator.userAgent.toLowerCase();
        
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'Tablet';
        } else if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
            return 'Mobile';
        }
        
        return 'Desktop';
    }
    
    isIncognitoMode() {
        // Very basic detection, not foolproof
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return false;
        } catch (e) {
            return true;
        }
    }
    
    getApproximateMemory() {
        if (navigator.deviceMemory) {
            return `${navigator.deviceMemory} GB`;
        }
        
        const cores = navigator.hardwareConcurrency || 2;
        
        // Very rough estimate based on CPU cores
        if (cores <= 2) return '2-4 GB (estimate)';
        if (cores <= 4) return '4-8 GB (estimate)';
        if (cores <= 8) return '8-16 GB (estimate)';
        return '16+ GB (estimate)';
    }
    
    getTimezoneOffsetString() {
        const offset = new Date().getTimezoneOffset();
        const hours = Math.abs(Math.floor(offset / 60));
        const minutes = Math.abs(offset % 60);
        const sign = offset < 0 ? '+' : '-';
        
        return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    getConnectionType() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            if (conn && conn.effectiveType) {
                return conn.effectiveType.toUpperCase();
            }
        }
        return 'Unknown';
    }
    
    getDownlinkSpeed() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            if (conn && conn.downlink) {
                return `${conn.downlink} Mbps`;
            }
        }
        return 'Unknown';
    }
    
    getRTT() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            if (conn && conn.rtt) {
                return `${conn.rtt} ms`;
            }
        }
        return 'Unknown';
    }
    
    getDataSaver() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            if (conn && 'saveData' in conn) {
                return conn.saveData ? 'Enabled' : 'Disabled';
            }
        }
        return 'Unknown';
    }
    
    getGPUInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return { vendor: 'Not available', renderer: 'Not available', version: 'Not available' };
            }
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            
            // Get WebGL capabilities
            const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
            const maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
            
            // Get WebGL version and GLSL version
            const glVersion = gl.getParameter(gl.VERSION);
            const glslVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
            
            // Get supported extensions
            const extensions = gl.getSupportedExtensions();
            const keyExtensions = extensions.filter(ext => 
                ext.includes('OES_texture_float') || 
                ext.includes('WEBGL_depth_texture') || 
                ext.includes('WEBGL_compressed_texture') ||
                ext.includes('ANGLE') ||
                ext.includes('OES_standard_derivatives')
            );
            
            if (debugInfo) {
                return {
                    vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown',
                    renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown',
                    version: glVersion || 'Unknown',
                    details: {
                        'Vendor': gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown',
                        'Renderer': gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown',
                        'WebGL Version': glVersion || 'Unknown',
                        'GLSL Version': glslVersion || 'Unknown',
                        'Max Texture Size': `${maxTextureSize}px`,
                        'Max Viewport Dims': maxViewportDims ? `${maxViewportDims[0]}x${maxViewportDims[1]}px` : 'N/A',
                        'Max Renderbuffer Size': `${maxRenderbufferSize}px`,
                        'WebGL2 Support': this.hasWebGL2() ? 'Yes' : 'No',
                        'Key Extensions': keyExtensions.length > 0 ? keyExtensions.join(', ') : 'None detected'
                    }
                };
            } else {
                return {
                    vendor: gl.getParameter(gl.VENDOR) || 'Unknown',
                    renderer: gl.getParameter(gl.RENDERER) || 'Unknown',
                    version: glVersion || 'Unknown',
                    details: {
                        'Vendor': gl.getParameter(gl.VENDOR) || 'Unknown',
                        'Renderer': gl.getParameter(gl.RENDERER) || 'Unknown',
                        'WebGL Version': glVersion || 'Unknown',
                        'GLSL Version': glslVersion || 'Unknown',
                        'Max Texture Size': `${maxTextureSize}px`,
                        'Max Viewport Dims': maxViewportDims ? `${maxViewportDims[0]}x${maxViewportDims[1]}px` : 'N/A',
                        'Max Renderbuffer Size': `${maxRenderbufferSize}px`,
                        'WebGL2 Support': this.hasWebGL2() ? 'Yes' : 'No',
                        'Key Extensions': keyExtensions.length > 0 ? keyExtensions.join(', ') : 'None detected'
                    }
                };
            }
        } catch (e) {
            return { vendor: 'Error', renderer: 'Error', version: 'Error' };
        }
    }
    
    // Get detailed hardware info
    getHardwareInfo() {
        let hardwareInfo = {};
        
        // Get CPU cores (logical processors)
        if (navigator.hardwareConcurrency) {
            hardwareInfo['CPU Cores'] = navigator.hardwareConcurrency;
        }
        
        // Get device memory if available
        if (navigator.deviceMemory) {
            hardwareInfo['Device Memory'] = `${navigator.deviceMemory} GB`;
        } else {
            hardwareInfo['Approx. Memory'] = this.getApproximateMemory();
        }
        
        // Add battery information
        const batteryInfo = this.getBatteryInfo();
        if (batteryInfo !== 'N/A') {
            hardwareInfo['Battery Status'] = batteryInfo;
        }
        
        // Add architecture information
        const arch = this.getArchitecture();
        if (arch !== 'Unknown') {
            hardwareInfo['Architecture'] = arch;
        }
        
        return hardwareInfo;
    }
    
    hasWebGL2() {
        try {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('webgl2');
        } catch (e) {
            return false;
        }
    }
    
    getArchitecture() {
        const ua = navigator.userAgent.toLowerCase();
        
        if (ua.indexOf('arm') !== -1 || ua.indexOf('aarch64') !== -1) {
            return 'ARM';
        } else if (ua.indexOf('x86_64') !== -1 || ua.indexOf('x64') !== -1 || ua.indexOf('wow64') !== -1) {
            return 'x86_64';
        } else if (ua.indexOf('x86') !== -1 || ua.indexOf('i386') !== -1 || ua.indexOf('i686') !== -1) {
            return 'x86';
        } else if (ua.indexOf('ppc') !== -1 || ua.indexOf('powerpc') !== -1) {
            return 'PowerPC';
        }
        
        // Try to infer from platform if possible
        const platform = navigator.platform || '';
        if (platform.indexOf('Win64') !== -1 || platform.indexOf('x64') !== -1) {
            return 'x86_64';
        } else if (platform.indexOf('Win32') !== -1 || platform.indexOf('x86') !== -1) {
            // Could be 64-bit running in 32-bit mode too
            return navigator.userAgent.indexOf('WOW64') !== -1 ? 'x86_64' : 'x86';
        } else if (platform.indexOf('MacIntel') !== -1) {
            // Could be Intel or ARM on newer Macs
            if (ua.indexOf('mac os x') !== -1 && ('ontouchend' in document)) {
                return 'ARM (Apple Silicon)';
            }
            return 'x86_64';
        } else if (platform.indexOf('Linux arm') !== -1) {
            return 'ARM';
        } else if (platform.indexOf('Linux') !== -1) {
            return navigator.hardwareConcurrency > 8 ? 'x86_64' : 'x86';
        }
        
        return 'Unknown';
    }
    
    getBatteryInfo() {
        if ('getBattery' in navigator) {
            try {
                // This is async, but we can't use async methods here
                // Just return a placeholder and the actual battery status
                // should be updated asynchronously
                navigator.getBattery().then(battery => {
                    const percentage = Math.round(battery.level * 100);
                    const charging = battery.charging ? 'Charging' : 'Not charging';
                    const batteryElement = document.querySelector('.battery-status');
                    if (batteryElement) {
                        batteryElement.textContent = `${percentage}% (${charging})`;
                    }
                }).catch(() => {});
                
                return '<span class="battery-status">Checking...</span>';
            } catch (e) {
                return 'Not available';
            }
        }
        
        return 'Not available';
    }
    
    getPreferredColorScheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'Dark';
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'Light';
        }
        return 'No preference';
    }
    
    // Get browser language information
    getLanguageInfo() {
        let langInfo = {};
        
        if (navigator.languages && navigator.languages.length) {
            langInfo['Preferred Languages'] = navigator.languages.join(', ');
        }
        
        if (navigator.language) {
            langInfo['Primary Language'] = navigator.language;
        }
        
        return langInfo;
    }
    
    // Check availability of specific APIs
    getAvailableAPIs() {
        const apis = {
            'Bluetooth': 'bluetooth' in navigator,
            'Geolocation': 'geolocation' in navigator,
            'WebRTC': 'RTCPeerConnection' in window,
            'Credential Mgmt': 'credentials' in navigator,
            'USB': 'usb' in navigator,
            'Serial': 'serial' in navigator,
            'GamePads': 'getGamepads' in navigator,
            'Vibration': 'vibrate' in navigator,
            'Payment Request': 'PaymentRequest' in window,
            'Web Share': 'share' in navigator,
            'Push API': 'PushManager' in window,
            'Notifications': 'Notification' in window,
            'Media Devices': 'mediaDevices' in navigator,
            'Speech Recognition': 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
            'Web Workers': 'Worker' in window,
            'Service Workers': 'serviceWorker' in navigator,
            'WebGL': !!window.WebGLRenderingContext,
            'WebGL2': !!window.WebGL2RenderingContext,
            'WebVR': 'getVRDisplays' in navigator,
            'WebXR': 'xr' in navigator,
            'Audio API': 'AudioContext' in window || 'webkitAudioContext' in window,
        };
        
        return apis;
    }
    
    // Detailed timezone information
    getDetailedTimezoneInfo() {
        const tzInfo = {};
        const date = new Date();
        
        tzInfo['Timezone Offset'] = this.getTimezoneOffsetString();
        tzInfo['Timezone Name'] = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
        tzInfo['DST Active'] = this.isDSTActive();
        tzInfo['Current Time'] = date.toLocaleTimeString();
        tzInfo['Current Date'] = date.toLocaleDateString();
        
        return tzInfo;
    }
    
    // Check if Daylight Saving Time is active
    isDSTActive() {
        const date = new Date();
        const jan = new Date(date.getFullYear(), 0, 1);
        const jul = new Date(date.getFullYear(), 6, 1);
        
        return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset()) > date.getTimezoneOffset();
    }
    
    // Get information about installed fonts
    getInstalledFonts() {
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const testString = 'mmmmmmmmmmlli';
        const testSize = '72px';
        const h = document.createElement('span');
        h.style.fontSize = testSize;
        h.style.position = 'absolute';
        h.style.left = '-9999px';
        h.style.visibility = 'hidden';
        h.textContent = testString;
        document.body.appendChild(h);
        
        const baseFontWidths = {};
        baseFonts.forEach(baseFont => {
            h.style.fontFamily = baseFont;
            baseFontWidths[baseFont] = h.offsetWidth;
        });
        
        const fontCheckList = [
            'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Courier New', 
            'Calibri', 'Cambria', 'Cambria Math', 'Comic Sans MS', 'Candara', 'Consolas', 
            'Constantia', 'Georgia', 'Garamond', 'Impact', 'Lucida Console', 'Lucida Sans Unicode', 
            'Microsoft Sans Serif', 'Palatino Linotype', 'Segoe UI', 'Tahoma', 'Times New Roman', 
            'Trebuchet MS', 'Verdana', 'Helvetica', 'Times', 'Courier'
        ];
        
        const detectedFonts = [];
        fontCheckList.forEach(font => {
            let detected = false;
            for (const baseFont of baseFonts) {
                h.style.fontFamily = `'${font}',${baseFont}`;
                if (h.offsetWidth !== baseFontWidths[baseFont]) {
                    detected = true;
                    break;
                }
            }
            if (detected) {
                detectedFonts.push(font);
            }
        });
        
        document.body.removeChild(h);
        return detectedFonts.slice(0, 10);
    }
    
    // Get Canvas fingerprint
    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 50;
            const ctx = canvas.getContext('2d');
            
            // Text with gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, "#FF4500");
            gradient.addColorStop(0.5, "#00CC00");
            gradient.addColorStop(1, "#0000FF");
            ctx.fillStyle = gradient;
            ctx.font = '18px Arial';
            ctx.textBaseline = 'top';
            ctx.fillText('Canvas Fingerprint', 2, 2);
            
            // Smiley face
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(150, 25, 15, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#000000';
            ctx.stroke();
            
            // Eyes
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(145, 20, 2, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(155, 20, 2, 0, Math.PI * 2, true);
            ctx.fill();
            
            // Smile
            ctx.beginPath();
            ctx.arc(150, 25, 10, 0, Math.PI, false);
            ctx.stroke();
            
            // Hash the data for result
            const dataUrl = canvas.toDataURL();
            let hash = 0;
            for (let i = 0; i < dataUrl.length; i++) {
                hash = ((hash << 5) - hash) + dataUrl.charCodeAt(i);
                hash = hash & hash;
            }
            return hash.toString(36).substring(0, 8);
        } catch (e) {
            return 'Canvas not supported';
        }
    }
    
    // Detect DNT (Do Not Track) headers
    getDNTStatus() {
        if (navigator.doNotTrack) {
            return navigator.doNotTrack;
        } else if (navigator.msDoNotTrack) {
            return navigator.msDoNotTrack;
        } else if (window.doNotTrack) {
            return window.doNotTrack;
        }
        return 'Not set';
    }
    
    // Check for touch input emulation
    detectTouchEmulation() {
        const maxTouchPoints = navigator.maxTouchPoints || 0;
        const hasTouchSupport = 'ontouchstart' in window || maxTouchPoints > 0;
        const hasCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
        const hasFinePointer = window.matchMedia?.('(pointer: fine)').matches;
        
        if (hasTouchSupport && hasFinePointer && !hasCoarsePointer) {
            return 'Possible touch emulation';
        } else if (hasTouchSupport && hasCoarsePointer) {
            return 'Genuine touch device';
        } else if (!hasTouchSupport && hasFinePointer) {
            return 'Non-touch device';
        }
        
        return 'Unknown';
    }
    
    // Analyze browser headers for suspicious patterns
    analyzeUserAgentSuspicion() {
        const ua = navigator.userAgent.toLowerCase();
        let suspicionScore = 0;
        let suspicionReasons = [];
        
        // Проверка несоответствий в user agent
        if (ua.includes('firefox') && ua.includes('chrome')) {
            suspicionScore += 50;
            suspicionReasons.push('Mixed browser identifiers');
        }
        
        if (ua.includes('android') && ua.includes('iphone')) {
            suspicionScore += 50;
            suspicionReasons.push('Mixed platform identifiers');
        }
        
        // Проверка на автоматические инструменты и ботов
        const botPatterns = ['bot', 'crawler', 'spider', 'headless', 'puppeteer', 'phantomjs', 'selenium', 'webdriver'];
        for (const pattern of botPatterns) {
            if (ua.includes(pattern)) {
                suspicionScore += 30;
                suspicionReasons.push(`Bot signature detected: ${pattern}`);
                break;
            }
        }
        
        // Проверка несоответствия между JavaScript и User-Agent
        const platform = navigator.platform.toLowerCase();
        if (ua.includes('windows') && !platform.includes('win')) {
            suspicionScore += 25;
            suspicionReasons.push('OS mismatch between UA and platform');
        }
        
        if (ua.includes('mac') && !platform.includes('mac')) {
            suspicionScore += 25;
            suspicionReasons.push('OS mismatch between UA and platform');
        }
        
        // Проверка на Headless браузеры
        if (navigator.plugins.length === 0 && !ua.includes('mobile')) {
            suspicionScore += 15;
            suspicionReasons.push('No plugins detected (possible headless browser)');
        }
        
        // Проверка на VPN или прокси по таймзоне
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const userLanguage = (navigator.language || '').substring(0, 2).toLowerCase();
        
        // Check for mismatch between language and timezone
        const timezoneMap = {
            'ru': ['Europe/Moscow', 'Asia/Yekaterinburg', 'Asia/Omsk', 'Asia/Krasnoyarsk', 'Asia/Irkutsk', 'Asia/Yakutsk', 'Asia/Vladivostok', 'Asia/Magadan', 'Asia/Kamchatka'],
            'en': ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London'],
            'de': ['Europe/Berlin', 'Europe/Vienna'],
            'fr': ['Europe/Paris'],
            'es': ['Europe/Madrid', 'America/Mexico_City'],
            'it': ['Europe/Rome'],
            'ja': ['Asia/Tokyo'],
            'zh': ['Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Taipei'],
            'ko': ['Asia/Seoul']
        };
        
        if (userLanguage && userTimezone && timezoneMap[userLanguage]) {
            const expectedTimezones = timezoneMap[userLanguage];
            if (!expectedTimezones.some(tz => userTimezone.includes(tz))) {
                suspicionScore += 20;
                suspicionReasons.push('Timezone/language mismatch (possible VPN)');
            }
        }
        
        // Определение уровня подозрительности
        let suspicionLevel;
        if (suspicionScore >= 50) {
            suspicionLevel = 'High';
        } else if (suspicionScore >= 20) {
            suspicionLevel = 'Medium';
        } else if (suspicionScore > 0) {
            suspicionLevel = 'Low';
        } else {
            suspicionLevel = 'None';
        }
        
        return {
            score: suspicionScore,
            level: suspicionLevel,
            reasons: suspicionReasons.length > 0 ? suspicionReasons : ['No suspicious patterns detected']
        };
    }
    
    generateHashedFingerprint() {
        // Комбинируем все доступные данные для максимальной уникальности отпечатка
        const userAgent = navigator.userAgent;
        const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const timeZoneOffset = new Date().getTimezoneOffset();
        const isDST = this.isDSTActive();
        const languages = navigator.languages ? navigator.languages.join(',') : navigator.language;
        const hardwareConcurrency = navigator.hardwareConcurrency || '';
        const deviceMemory = navigator.deviceMemory || '';
        const platform = navigator.platform;
        const doNotTrack = this.getDNTStatus();
        const touchEmulation = this.detectTouchEmulation();
        const canvasHash = this.getCanvasFingerprint();
        const availableAPIsCount = Object.values(this.getAvailableAPIs()).filter(Boolean).length;
        const suspicionInfo = this.analyzeUserAgentSuspicion();
        const touchPoints = navigator.maxTouchPoints || 0;
        const pixelRatio = window.devicePixelRatio || 1;
        const colorScheme = this.getPreferredColorScheme();
        
        // Собираем плагины если они доступны
        const plugins = Array.from(navigator.plugins || [])
            .map(p => `${p.name}:${p.filename}:${p.description}`)
            .sort()
            .join('|');
            
        // Шрифты, установленные на устройстве
        const fonts = this.getInstalledFonts().join(',');
        
        // Сочетаем всё в один длинный уникальный компонент с разделителями
        const components = [
            userAgent,
            screenInfo,
            timeZone,
            timeZoneOffset,
            isDST,
            languages,
            hardwareConcurrency,
            deviceMemory,
            platform,
            doNotTrack,
            touchEmulation,
            canvasHash,
            availableAPIsCount,
            suspicionInfo.level,
            touchPoints,
            pixelRatio,
            colorScheme,
            plugins,
            fonts
        ].join('###');
        
        // Используем более сложную хеш-функцию
        let hash = 0;
        for (let i = 0; i < components.length; i++) {
            const char = components.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Конвертируем в 32-битное целое
            
            // Дополнительное перемешивание битов для лучшей уникальности
            if (i % 10 === 0) {
                hash = ((hash << 7) ^ (hash >> 3)) + i;
            }
        }
        
        // Конвертируем в шестнадцатеричное представление с гарантированной длиной
        const hexHash = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
        
        // Add suspicion code to the hash
        const suspicionPrefix = suspicionInfo.level.charAt(0).toUpperCase();
        
        // Create formatted fingerprint identifier
        return `${suspicionPrefix}|${hexHash.substring(0, 4)}-${hexHash.substring(4, 8)}-${Date.now().toString(36).slice(-4)}`;
    }
    
    generateFeatureSupport() {
        // Measure support for modern web standards in the user's browser
        const features = {
            // Web APIs
            fetch: typeof fetch !== 'undefined',
            serviceWorker: 'serviceWorker' in navigator,
            webWorkers: typeof Worker !== 'undefined',
            webAssembly: typeof WebAssembly !== 'undefined',
            indexedDB: 'indexedDB' in window || 'webkitIndexedDB' in window,
            localStorage: 'localStorage' in window,
            sessionStorage: 'sessionStorage' in window,
            
            // Media and Graphics
            webGL: this.hasWebGL2(),
            webRTC: 'RTCPeerConnection' in window || 'webkitRTCPeerConnection' in window,
            webAudio: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
            webSpeech: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
            videoCapture: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
            mediaRecorder: typeof MediaRecorder !== 'undefined',
            
            // Advanced Graphics
            webVR: 'getVRDisplays' in navigator,
            webXR: 'xr' in navigator,
            webGPU: 'gpu' in navigator,
            webAnimations: 'Animation' in window && 'KeyframeEffect' in window,
            canvas: !!document.createElement('canvas').getContext,
            canvasWebGL: !!document.createElement('canvas').getContext('webgl'),
            
            // Modern JavaScript
            promises: typeof Promise !== 'undefined',
            asyncAwait: (function() { try { eval('async function test() {}'); return true; } catch (e) { return false; } })(),
            classes: (function() { try { eval('class Test {}'); return true; } catch (e) { return false; } })(),
            generators: (function() { try { eval('function* test() {}'); return true; } catch (e) { return false; } })(),
            
            // CSS Features
            gridLayout: (function() {
                const el = document.createElement('div');
                return 'grid' in el.style || 'msGrid' in el.style;
            })(),
            flexbox: (function() {
                const el = document.createElement('div');
                return 'flexBasis' in el.style || 'webkitFlexBasis' in el.style;
            })(),
            cssVariables: (function() {
                return window.CSS && CSS.supports && CSS.supports('--a', '0');
            })(),
            
            // Advanced Features
            bluetooth: 'bluetooth' in navigator,
            usb: 'usb' in navigator,
            serial: 'serial' in navigator,
            geolocation: 'geolocation' in navigator,
            notifications: 'Notification' in window,
            paymentRequest: 'PaymentRequest' in window,
            credentials: 'credentials' in navigator,
            batteryAPI: 'getBattery' in navigator,
            webShare: 'share' in navigator,
            
            // Security Features
            https: window.location.protocol === 'https:',
            securityPolicies: 'securitypolicyviolation' in window,
            crossOriginIsolation: window.crossOriginIsolated === true,
            permissions: 'permissions' in navigator
        };
        
        // Calculate the percentage of supported features
        const supportedCount = Object.values(features).filter(Boolean).length;
        const totalFeatures = Object.keys(features).length;
        const supportPercentage = Math.round((supportedCount / totalFeatures) * 100);
        
        return {
            features: features,
            supported: supportedCount,
            total: totalFeatures,
            percentage: supportPercentage,
            categorized: {
                basicAPIs: ['fetch', 'serviceWorker', 'webWorkers', 'indexedDB', 'localStorage', 'sessionStorage'],
                mediaGraphics: ['webGL', 'webRTC', 'webAudio', 'webSpeech', 'videoCapture', 'mediaRecorder'],
                advancedGraphics: ['webVR', 'webXR', 'webGPU', 'webAnimations', 'canvas', 'canvasWebGL'],
                modernJS: ['promises', 'asyncAwait', 'classes', 'generators'],
                cssFeatures: ['gridLayout', 'flexbox', 'cssVariables'],
                advancedAPIs: ['bluetooth', 'usb', 'serial', 'geolocation', 'notifications', 'paymentRequest', 'credentials', 'batteryAPI', 'webShare'],
                security: ['https', 'securityPolicies', 'crossOriginIsolation', 'permissions']
            }
        };
    }
    
    generateFeaturesList() {
        const featureSupport = this.generateFeatureSupport();
        const allFeatures = [];
        
        // Collect all categories and their functions
        const categories = {
            'Basic Web APIs': featureSupport.categorized.basicAPIs,
            'Media & Graphics': featureSupport.categorized.mediaGraphics,
            'Advanced Graphics': featureSupport.categorized.advancedGraphics,
            'Modern JavaScript': featureSupport.categorized.modernJS,
            'CSS Features': featureSupport.categorized.cssFeatures,
            'Advanced APIs': featureSupport.categorized.advancedAPIs,
            'Security': featureSupport.categorized.security
        };
        
        // Create HTML for all categories and their functions
        let html = '';
        
        Object.entries(categories).forEach(([categoryName, featureList]) => {
            html += `<div class="feature-category">
                <div class="category-title">${categoryName}</div>
                <div class="category-features">`;
            
            featureList.forEach(featureName => {
                const supported = featureSupport.features[featureName];
                const displayName = featureName
                    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
                    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                    .replace(/Webgl/g, 'WebGL')
                    .replace(/Webgpu/g, 'WebGPU')
                    .replace(/Webvr/g, 'WebVR')
                    .replace(/Webxr/g, 'WebXR')
                    .replace(/Webrtc/g, 'WebRTC')
                    .replace(/Api/g, 'API')
                    .replace(/Css/g, 'CSS')
                    .replace(/Https/g, 'HTTPS')
                    .replace(/Db/g, 'DB');
                
                html += `
                <div class="feature-item ${supported ? 'supported' : 'not-supported'}">
                    <div class="feature-status-icon"></div>
                    <div class="feature-name">${displayName}</div>
                    <div class="feature-status">${supported ? 'Available' : 'Not Available'}</div>
                </div>`;
            });
            
            html += `</div></div>`;
        });
        
        return html;
    }
}

// Initialize Fingerprint component when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Fingerprint();
});