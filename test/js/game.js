// Game.js - Lógica principal del juego

const Game = {
    state: 'landing', // landing, transitioning, game
    
    init() {
        this.setupNavigation();
        this.setupRadio();
    },
    
    setupNavigation() {
        const markers = document.querySelectorAll('.pocket-marker');
        markers.forEach(marker => {
            marker.addEventListener('click', (e) => {
                if (this.state !== 'landing') return;
                
                e.preventDefault();
                e.stopPropagation();
                
                const target = marker.getAttribute('data-target');
                if (target) {
                    window.location.href = target;
                }
            });
        });
    },
    
    setupRadio() {
        Radio.onActivate = () => this.activateGame();
    },
    
    activateGame() {
        if (this.state !== 'landing') return;
        
        this.state = 'transitioning';
        
        // Ocultar marcadores
        document.querySelectorAll('.pocket-marker').forEach(m => {
            m.classList.add('dimmed');
        });
        
        // Ocultar instrucciones
        document.getElementById('instructions').classList.add('hidden');
        
        // Mostrar status
        const status = document.getElementById('game-status');
        status.style.display = 'block';
        status.classList.add('active');
        
        // Animar cámara
        Scene.setGameCamera([5, 6, 8], [0, 0, 0]);
        
        // Despertar al hombre
        setTimeout(() => {
            Man.wakeUp();
        }, 1000);
    },
    
    activateJoystick() {
        this.state = 'game';
        Joystick.show();
        this.setupGameCamera();
    },
    
    setupGameCamera() {
        const updateCamera = () => {
            if (this.state !== 'game') return;
            
            if (Man.group) {
                const manPos = Man.group.position;
                const targetPos = new THREE.Vector3(
                    manPos.x + 8,
                    manPos.y + 8,
                    manPos.z + 8
                );
                
                Scene.camera.position.lerp(targetPos, 0.05);
                Scene.camera.lookAt(manPos);
            }
            
            requestAnimationFrame(updateCamera);
        };
        
        updateCamera();
    },
    
    reset() {
        this.state = 'landing';
        
        document.querySelectorAll('.pocket-marker').forEach(m => {
            m.classList.remove('dimmed');
            m.classList.add('visible');
        });
        
        document.getElementById('instructions').classList.remove('hidden');
        document.getElementById('game-status').style.display = 'none';
        document.getElementById('game-status').classList.remove('active');
        
        Joystick.hide();
        
        if (Man.group) {
            Man.group.position.set(0.3, 0, 0);
            Man.state = 'sleeping';
        }
        
        if (Radio.parts && Radio.parts.indicator) {
            Radio.isOn = false;
            Radio.parts.indicator.material.emissive.setHex(0x000000);
            Radio.parts.indicator.material.emissiveIntensity = 0;
            Radio.light.intensity = 0;
        }
        
        Scene.cameraAngle = 0;
        Scene.cameraHeight = 12;
        Scene.updateCameraPosition();
    }
};
window.Game = Game;
