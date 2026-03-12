// Loader.js - Sistema de carga robusto con logs exhaustivos

const Loader = {
    logs: [],
    scripts: [
        { name: 'audio.js', var: 'Audio', deps: [] },
        { name: 'scene.js', var: 'Scene', deps: [] },
        { name: 'table.js', var: 'Table', deps: ['Scene'] },
        { name: 'man.js', var: 'Man', deps: ['Scene'] },
        { name: 'radio.js', var: 'Radio', deps: ['Scene'] },
        { name: 'joystick.js', var: 'Joystick', deps: [] },
        { name: 'game.js', var: 'Game', deps: ['Scene', 'Table', 'Man', 'Radio', 'Joystick'] },
        { name: 'main.js', var: null, deps: ['Scene', 'Table', 'Man', 'Radio', 'Joystick', 'Game'] }
    ],
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        this.logs.push(logEntry);
        
        // Console con colores
        const styles = {
            info: 'color: #00ff00',
            warn: 'color: #ffaa00',
            error: 'color: #ff6666; font-weight: bold'
        };
        
        console.log(`%c${logEntry}`, styles[type] || styles.info);
        
        // UI
        this.updateLogUI(logEntry, type);
    },
    
    updateLogUI(message, type) {
        const container = document.getElementById('debug-logs');
        if (!container) return;
        
        const entry = document.createElement('div');
        entry.style.cssText = `
            padding: 3px 6px;
            margin: 2px 0;
            font-size: 11px;
            font-family: monospace;
            color: ${type === 'error' ? '#ff6666' : type === 'warn' ? '#ffaa00' : '#00ff00'};
            border-left: 3px solid ${type === 'error' ? '#ff6666' : type === 'warn' ? '#ffaa00' : '#00ff00'};
            background: rgba(0,0,0,0.5);
        `;
        entry.textContent = message;
        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;
    },
    
    init() {
        this.log('╔════════════════════════════════════╗', 'info');
        this.log('║  LA CATRINA 3D - DEBUG SYSTEM     ║', 'info');
        this.log('╚════════════════════════════════════╝', 'info');
        this.log(`URL: ${window.location.href}`, 'info');
        this.log(`Path: ${window.location.pathname}`, 'info');
        this.log(`User Agent: ${navigator.userAgent.slice(0, 50)}...`, 'info');
        
        this.createLogContainer();
        this.checkThreeJS();
        this.loadAllScripts();
    },
    
    createLogContainer() {
        const container = document.createElement('div');
        container.id = 'debug-logs';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            width: 450px;
            max-height: 400px;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #d4af37;
            border-radius: 8px;
            overflow-y: auto;
            z-index: 10000;
            padding: 10px;
            font-family: monospace;
        `;
        
        const header = document.createElement('div');
        header.innerHTML = '📋 DEBUG CONSOLE <span style="color:#888; font-size:10px;">(click para cerrar)</span>';
        header.style.cssText = `
            border-bottom: 2px solid #d4af37;
            padding-bottom: 8px;
            margin-bottom: 8px;
            font-weight: bold;
            color: #d4af37;
            cursor: pointer;
        `;
        header.onclick = () => container.remove();
        container.appendChild(header);
        
        document.body.appendChild(container);
    },
    
    checkThreeJS() {
        this.log('─────────────────────────────', 'info');
        this.log('Verificando Three.js', 'info');
        
        if (typeof THREE === 'undefined') {
            this.log('❌ THREE.js NO CARGADO', 'error');
            return false;
        }
        
        this.log('✅ THREE.js v' + THREE.REVISION, 'info');
        
        // Verificar clases esenciales
        const required = [
            'Scene', 'PerspectiveCamera', 'WebGLRenderer',
            'BoxGeometry', 'SphereGeometry', 'CylinderGeometry',
            'MeshStandardMaterial', 'Mesh', 'Vector3', 'Clock'
        ];
        
        let missing = 0;
        required.forEach(cls => {
            if (THREE[cls]) {
                this.log(`✅ ${cls}`, 'info');
            } else {
                this.log(`❌ ${cls}`, 'error');
                missing++;
            }
        });
        
        if (missing > 0) {
            this.log(`Faltan ${missing} componentes`, 'error');
        }
        
        return missing === 0;
    },
    
    async loadAllScripts() {
        this.log('─────────────────────────────', 'info');
        this.log('Iniciando carga de scripts', 'info');
        
            // Usar ruta absoluta desde la raíz
        const basePath = '/test/';
        this.log(`Ruta base: ${basePath}`, 'info');
        
        for (let i = 0; i < this.scripts.length; i++) {
            const script = this.scripts[i];
            this.log(`[${i+1}/${this.scripts.length}] Cargando ${script.name}...`, 'info');
            
            try {
                await this.loadScript(basePath + 'js/' + script.name);
                this.log(`✅ ${script.name} OK`, 'info');
                
                // Verificar variable global
                if (script.var) {
                    const exists = typeof window[script.var] !== 'undefined';
                    if (exists) {
                        this.log(`   Variable ${script.var} ✓`, 'info');
                    } else {
                        this.log(`   Variable ${script.var} ✗ (aún no definida)`, 'warn');
                    }
                }
                
                // Verificar dependencias
                if (script.deps.length > 0) {
                    script.deps.forEach(dep => {
                        if (window[dep]) {
                            this.log(`   Dep ${dep} ✓`, 'info');
                        } else {
                            this.log(`   Dep ${dep} ✗`, 'warn');
                        }
                    });
                }
            } catch (error) {
                this.log(`❌ ${script.name} ERROR: ${error.message}`, 'error');
            }
        }
        
        this.log('─────────────────────────────', 'info');
        this.log('Carga completada', 'info');
        this.verifyAllSystems();
    },
    
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = false;
            
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`404 - ${url}`));
            
            document.head.appendChild(script);
        });
    },
    
    verifyAllSystems() {
        this.log('═══════════════════════════════════════', 'info');
        this.log('VERIFICACIÓN FINAL', 'info');
        
        const systems = {
            'Scene': Scene,
            'Table': Table,
            'Man': Man,
            'Radio': Radio,
            'Joystick': Joystick,
            'Game': Game,
            'Audio': Audio
        };
        
        Object.entries(systems).forEach(([name, obj]) => {
            if (obj) {
                this.log(`✅ ${name} activo`, 'info');
            } else {
                this.log(`❌ ${name} no disponible`, 'error');
            }
        });
        
        // Iniciar si todo está bien
        if (Scene && Table && Man && Radio) {
            this.log('✅ Todos los sistemas listos', 'info');
            this.startApplication();
        } else {
            this.log('❌ Algunos sistemas fallaron', 'error');
            this.showErrorReport();
        }
    },
    
    startApplication() {
        this.log('Iniciando aplicación...', 'info');
        
        try {
            if (Scene.init) Scene.init();
            if (Table.init) Table.init(Scene.scene);
            if (Man.init) Man.init(Scene.scene);
            if (Radio.init) Radio.init(Scene.scene);
            if (Audio.init) Audio.init();
            if (Joystick.init) Joystick.init();
            if (Game.init) Game.init();
            
            this.log('✅ Aplicación iniciada', 'info');
            
            // Ocultar loading
            setTimeout(() => {
                const loading = document.getElementById('loading');
                if (loading) {
                    loading.style.opacity = '0';
                    setTimeout(() => loading.style.display = 'none', 500);
                }
                
                document.querySelectorAll('.pocket-marker').forEach(m => {
                    m.classList.add('visible');
                });
            }, 1000);
            
        } catch (error) {
            this.log(`❌ Error al iniciar: ${error.message}`, 'error');
            this.log(error.stack, 'error');
        }
    },
    
    showErrorReport() {
        const container = document.getElementById('debug-logs');
        if (container) {
            const errorMsg = document.createElement('div');
            errorMsg.innerHTML = `
                <br><div style="color:#ff6666; font-weight:bold; border:2px solid #ff6666; padding:10px;">
                ⚠️ ERROR CRÍTICO<br>
                Algunos componentes no se cargaron.<br>
                Revisa la consola (F12) para más detalles.
                </div>
            `;
            container.appendChild(errorMsg);
        }
    }
};

// Iniciar cuando DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Loader.init());
} else {
    Loader.init();
}
