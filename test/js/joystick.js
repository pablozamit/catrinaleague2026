// Joystick.js - Control táctil virtual

const Joystick = {
    zone: null,
    base: null,
    handle: null,
    active: false,
    value: { x: 0, y: 0 },
    touchId: null,
    maxRadius: 35,
    
    init() {
        this.zone = document.getElementById('joystick-zone');
        this.base = this.zone.querySelector('.joystick-base');
        this.handle = this.zone.querySelector('.joystick-handle');
        
        this.setupEvents();
    },
    
    setupEvents() {
        // Touch events
        this.zone.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.zone.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.zone.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        this.zone.addEventListener('touchcancel', (e) => this.onTouchEnd(e), { passive: false });
        
        // Mouse events
        this.zone.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => {
            if (this.active) this.onMouseMove(e);
        });
        document.addEventListener('mouseup', (e) => {
            if (this.active) this.onMouseUp(e);
        });
    },
    
    onTouchStart(e) {
        e.preventDefault();
        if (this.touchId !== null) return;
        
        this.touchId = e.touches[0].identifier;
        this.active = true;
        
        const touch = e.touches[0];
        this.updateJoystick(touch.clientX, touch.clientY);
    },
    
    onTouchMove(e) {
        e.preventDefault();
        if (!this.active) return;
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.touchId) {
                const touch = e.changedTouches[i];
                this.updateJoystick(touch.clientX, touch.clientY);
                break;
            }
        }
    },
    
    onTouchEnd(e) {
        e.preventDefault();
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.touchId) {
                this.reset();
                break;
            }
        }
    },
    
    onMouseDown(e) {
        e.preventDefault();
        this.active = true;
        this.updateJoystick(e.clientX, e.clientY);
    },
    
    onMouseMove(e) {
        if (!this.active) return;
        this.updateJoystick(e.clientX, e.clientY);
    },
    
    onMouseUp(e) {
        if (!this.active) return;
        this.reset();
    },
    
    updateJoystick(clientX, clientY) {
        const rect = this.zone.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let deltaX = clientX - centerX;
        let deltaY = clientY - centerY;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Limitar al radio máximo
        if (distance > this.maxRadius) {
            const angle = Math.atan2(deltaY, deltaX);
            deltaX = Math.cos(angle) * this.maxRadius;
            deltaY = Math.sin(angle) * this.maxRadius;
        }
        
        // Actualizar posición visual del handle
        this.handle.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
        
        // Normalizar valores (-1 a 1)
        this.value = {
            x: deltaX / this.maxRadius,
            y: deltaY / this.maxRadius
        };
        
        // Mover al hombre
        Man.move(this.value);
    },
    
    reset() {
        this.active = false;
        this.touchId = null;
        this.value = { x: 0, y: 0 };
        this.handle.style.transform = 'translate(-50%, -50%)';
        Man.stop();
    },
    
    show() {
        this.zone.classList.add('active');
    },
    
    hide() {
        this.zone.classList.remove('active');
        this.reset();
    }
};
