// Logger.js - Sistema EXHAUSTIVO de logs visible en pantalla

const Logger = {
    logs: [],
    container: null,
    content: null,
    isVisible: true,
    
    init() {
        this.createUI();
        this.interceptConsole();
        this.interceptErrors();
        this.log('🚀 LOGGER INICIADO', 'system');
        this.log('URL: ' + window.location.href, 'system');
        this.log('UserAgent: ' + navigator.userAgent.substring(0, 50), 'system');
        this.log('───────────────────────────', 'system');
    },
    
    createUI() {
        // Contenedor principal
        this.container = document.createElement('div');
        this.container.id = 'logger-container';
        this.container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 500px;
            max-height: 400px;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #d4af37;
            border-radius: 8px;
            z-index: 99999;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #00ff00;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
        `;
        
        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            background: #d4af37;
            color: #000;
            padding: 8px 12px;
            font-weight: bold;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        `;
        header.innerHTML = `
            <span>📋 SYSTEM LOGS</span>
            <span style="font-size: 10px;">[CLICK TO HIDE]</span>
        `;
        header.onclick = () => this.toggleVisibility();
        this.container.appendChild(header);
        
        // Contenido de logs
        this.content = document.createElement('div');
        this.content.style.cssText = `
            max-height: 360px;
            overflow-y: auto;
            padding: 10px;
        `;
        this.container.appendChild(this.content);
        
        // Stats
        this.stats = document.createElement('div');
        this.stats.style.cssText = `
            border-top: 1px solid #d4af37;
            padding: 5px 10px;
            background: rgba(212, 175, 55, 0.2);
            font-size: 10px;
            color: #d4af37;
        `;
        this.stats.innerHTML = 'Logs: 0 | Errors: 0 | Warnings: 0';
        this.container.appendChild(this.stats);
        
        document.body.appendChild(this.container);
    },
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = { timestamp, message, type };
        this.logs.push(entry);
        
        // Colores por tipo
        const colors = {
            system: '#00ffff',
            info: '#00ff00',
            warn: '#ffaa00',
            error: '#ff0000',
            success: '#00ff00',
            network: '#ff00ff',
            three: '#00aaff'
        };
        
        const color = colors[type] || colors.info;
        
        // Crear elemento visual
        const div = document.createElement('div');
        div.style.cssText = `
            margin: 2px 0;
            padding: 3px 6px;
            border-left: 3px solid ${color};
            background: rgba(255,255,255,0.05);
            word-wrap: break-word;
        `;
        div.innerHTML = `<span style="color:#888">[${timestamp}]</span> <span style="color:${color}">${this.escapeHtml(message)}</span>`;
        
        this.content.appendChild(div);
        this.content.scrollTop = this.content.scrollHeight;
        
        // Actualizar stats
        this.updateStats();
        
        // También en consola
        console.log(`[${type.toUpperCase()}] ${message}`);
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    updateStats() {
        const errors = this.logs.filter(l => l.type === 'error').length;
        const warnings = this.logs.filter(l => l.type === 'warn').length;
        this.stats.innerHTML = `Logs: ${this.logs.length} | Errors: ${errors} | Warnings: ${warnings}`;
    },
    
    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.content.style.display = this.isVisible ? 'block' : 'none';
        this.stats.style.display = this.isVisible ? 'block' : 'none';
    },
    
    interceptConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            originalLog.apply(console, args);
            this.log(args.join(' '), 'info');
        };
        
        console.error = (...args) => {
            originalError.apply(console, args);
            this.log('ERROR: ' + args.join(' '), 'error');
        };
        
        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.log('WARN: ' + args.join(' '), 'warn');
        };
    },
    
    interceptErrors() {
        // Errores de JavaScript
        window.onerror = (msg, url, line, col, error) => {
            this.log(`❌ JS ERROR: ${msg}`, 'error');
            this.log(`   File: ${url}:${line}:${col}`, 'error');
            if (error && error.stack) {
                this.log(`   Stack: ${error.stack.split('\n')[0]}`, 'error');
            }
            return false;
        };
        
        // Promesas rechazadas
        window.onunhandledrejection = (event) => {
            this.log(`❌ PROMISE REJECTION: ${event.reason}`, 'error');
        };
        
        // Errores de red (fetch, XMLHttpRequest)
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            const url = args[0];
            this.log(`🌐 FETCH: ${url}`, 'network');
            
            return originalFetch.apply(window, args)
                .then(response => {
                    if (!response.ok) {
                        this.log(`❌ FETCH ERROR: ${response.status} ${url}`, 'error');
                    } else {
                        this.log(`✅ FETCH OK: ${response.status} ${url}`, 'success');
                    }
                    return response;
                })
                .catch(error => {
                    this.log(`❌ FETCH FAILED: ${url} - ${error.message}`, 'error');
                    throw error;
                });
        };
        
        // XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            
            xhr.open = function(method, url) {
                Logger.log(`🌐 XHR: ${method} ${url}`, 'network');
                
                xhr.addEventListener('load', function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        Logger.log(`✅ XHR OK: ${xhr.status} ${url}`, 'success');
                    } else {
                        Logger.log(`❌ XHR ERROR: ${xhr.status} ${url}`, 'error');
                    }
                });
                
                xhr.addEventListener('error', function() {
                    Logger.log(`❌ XHR FAILED: ${url}`, 'error');
                });
                
                return originalOpen.apply(xhr, arguments);
            };
            
            return xhr;
        };
    },
    
    // Helpers específicos
    logScript(name, status) {
        if (status === 'loading') {
            this.log(`📜 Cargando: ${name}`, 'system');
        } else if (status === 'loaded') {
            this.log(`✅ ${name} cargado`, 'success');
        } else if (status === 'error') {
            this.log(`❌ ${name} falló`, 'error');
        }
    },
    
    logVariable(name, value) {
        const exists = typeof value !== 'undefined';
        if (exists) {
            this.log(`✓ Variable ${name} = ${value}`, 'info');
        } else {
            this.log(`✗ Variable ${name} NO definida`, 'warn');
        }
    },
    
    logThree(name, exists) {
        if (exists) {
            this.log(`✓ THREE.${name}`, 'three');
        } else {
            this.log(`✗ THREE.${name} no encontrado`, 'error');
        }
    }
};

// Iniciar inmediatamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Logger.init());
} else {
    Logger.init();
}
