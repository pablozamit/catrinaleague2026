// Man.js - Hombre escala proporcional a la mesa

const Man = {
    mesh: null,
    group: null,
    state: 'sleeping',
    parts: {},
    animTime: 0,
    walkSpeed: 8,
    isMoving: false,
    
    // Escala: humano ~1.75m real → ~9.6 unidades (×5.5)
    scale: 5.5,
    
    init(scene) {
        this.group = new THREE.Group();
        
        const s = this.scale; // Factor de escala
        
        // Materiales
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0x8d5524,
            roughness: 0.6
        });
        
        const shirtMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.8
        });
        
        const pantsMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.7
        });
        
        const shoesMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.5
        });
        
        // === HOMBRE TUMBADO DEBAJO DE LA MESA ===
        // Cabeza (tamaño proporcional: ~0.3m radio real)
        const headGeo = new THREE.SphereGeometry(0.35 * s, 16, 16);
        this.parts.head = new THREE.Mesh(headGeo, skinMaterial);
        this.parts.head.position.set(0, 0.6, 1.5);
        this.parts.head.castShadow = true;
        this.group.add(this.parts.head);
        
        // Cuello
        const neckGeo = new THREE.CylinderGeometry(0.18 * s, 0.18 * s, 0.3 * s, 12);
        this.parts.neck = new THREE.Mesh(neckGeo, skinMaterial);
        this.parts.neck.position.set(0, 0.5, 1.0);
        this.parts.neck.rotation.x = Math.PI / 4;
        this.group.add(this.parts.neck);
        
        // Torso (tamaño proporcional: ~0.45m ancho, ~1.2m largo)
        const torsoGeo = new THREE.CylinderGeometry(0.5 * s, 0.5 * s, 1.2 * s, 12);
        this.parts.torso = new THREE.Mesh(torsoGeo, shirtMaterial);
        this.parts.torso.position.set(0, 0.6, -0.2);
        this.parts.torso.rotation.x = Math.PI / 2;
        this.parts.torso.castShadow = true;
        this.group.add(this.parts.torso);
        
        // Brazos
        const armGeo = new THREE.CylinderGeometry(0.15 * s, 0.15 * s, 1.0 * s, 12);
        
        // Brazo derecho (bajo la cabeza)
        this.parts.armR = new THREE.Mesh(armGeo, shirtMaterial);
        this.parts.armR.position.set(0.8, 0.4, 1.2);
        this.parts.armR.rotation.set(Math.PI/3, 0, Math.PI/4);
        this.group.add(this.parts.armR);
        
        // Brazo izquierdo (sobre el cuerpo)
        this.parts.armL = new THREE.Mesh(armGeo, shirtMaterial);
        this.parts.armL.position.set(-0.8, 0.6, -0.2);
        this.parts.armL.rotation.set(Math.PI/2, 0, -Math.PI/6);
        this.group.add(this.parts.armL);
        
        // Piernas
        const legGeo = new THREE.CylinderGeometry(0.22 * s, 0.22 * s, 1.5 * s, 12);
        
        // Pierna derecha (doblada)
        this.parts.legR_upper = new THREE.Mesh(legGeo, pantsMaterial);
        this.parts.legR_upper.position.set(0.6, 0.3, -1.5);
        this.parts.legR_upper.rotation.x = Math.PI / 2.5;
        this.group.add(this.parts.legR_upper);
        
        this.parts.legR_lower = new THREE.Mesh(legGeo, pantsMaterial);
        this.parts.legR_lower.position.set(1.2, 0.25, -2.5);
        this.parts.legR_lower.rotation.x = Math.PI / 2;
        this.group.add(this.parts.legR_lower);
        
        // Pierna izquierda (estirada)
        this.parts.legL = new THREE.Mesh(legGeo, pantsMaterial);
        this.parts.legL.position.set(-0.6, 0.25, -2.5);
        this.parts.legL.rotation.x = Math.PI / 2;
        this.group.add(this.parts.legL);
        
        // Zapatos
        const shoeGeo = new THREE.BoxGeometry(0.4 * s, 0.2 * s, 0.8 * s);
        this.parts.shoeR = new THREE.Mesh(shoeGeo, shoesMaterial);
        this.parts.shoeR.position.set(1.8, 0.1, -3.5);
        this.group.add(this.parts.shoeR);
        
        this.parts.shoeL = new THREE.Mesh(shoeGeo, shoesMaterial);
        this.parts.shoeL.position.set(-0.6, 0.1, -3.8);
        this.group.add(this.parts.shoeL);
        
        // Posición inicial bajo la mesa (escala grande)
        this.group.position.set(2, -1.5, 1);
        
        scene.add(this.group);
        this.mesh = this.group;
    },
    
    wakeUp() {
        if (this.state !== 'sleeping') return;
        
        this.state = 'waking';
        if (Audio && Audio.playRadio) Audio.playRadio();
        
        const s = this.scale;
        const wakeDuration = 3000;
        const startTime = Date.now();
        const startPos = this.group.position.clone();
        const startRot = this.group.rotation.clone();
        
        // Posición final: fuera de la mesa
        const endPos = new THREE.Vector3(12, 0, 8);
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / wakeDuration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            this.group.position.lerpVectors(startPos, endPos, ease);
            this.group.rotation.x = startRot.x * (1 - ease);
            this.group.rotation.y = startRot.y + (Math.PI / 2) * ease;
            
            this.animateWakeUpParts(progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.state = 'idle';
                this.isMoving = false;
                if (Game && Game.activateJoystick) Game.activateJoystick();
            }
        };
        
        animate();
    },
    
    animateWakeUpParts(progress) {
        this.parts.armR.rotation.z = Math.sin(Date.now() * 0.005) * 0.3 + 0.3;
        this.parts.armL.rotation.z = -Math.sin(Date.now() * 0.005) * 0.3 - 0.3;
        this.parts.legR_upper.rotation.x = Math.PI / 2.5 * (1 - progress);
        this.parts.legR_lower.rotation.x = Math.PI / 2 * (1 - progress);
        this.parts.legL.rotation.x = Math.PI / 2 * (1 - progress);
    },
    
    move(direction) {
        if (this.state !== 'idle' && this.state !== 'walking') return;
        
        this.state = 'walking';
        this.isMoving = true;
        
        const speed = this.walkSpeed * 0.016;
        const moveX = direction.x * speed;
        const moveZ = direction.y * speed;
        
        this.group.position.x += moveX;
        this.group.position.z += moveZ;
        
        const angle = Math.atan2(moveX, moveZ);
        this.group.rotation.y = angle;
        
        this.animateWalk();
    },
    
    stop() {
        this.isMoving = false;
        if (this.state === 'walking') {
            this.state = 'idle';
        }
    },
    
    animateWalk() {
        const time = Date.now() * 0.005;
        
        this.parts.armR.rotation.z = Math.sin(time) * 0.3 + 0.3;
        this.parts.armL.rotation.z = -Math.sin(time) * 0.3 - 0.3;
        
        const legAngle = Math.sin(time) * 0.2;
        this.parts.legR_upper.rotation.x = Math.PI / 2 + legAngle;
        this.parts.legL.rotation.x = Math.PI / 2 - legAngle;
        
        this.group.position.y = Math.abs(Math.sin(time * 2)) * 0.1;
    },
    
    update(delta) {
        this.animTime += delta;
        
        if (this.state === 'sleeping') {
            const breathe = Math.sin(this.animTime * 2) * 0.02;
            this.group.position.y = -1.5 + breathe;
            
            this.parts.armR.rotation.z = Math.sin(this.animTime * 1.5) * 0.05;
            this.parts.armL.rotation.z = Math.sin(this.animTime * 1.3 + 1) * 0.05;
        }
        
        if (this.state === 'idle') {
            if (Math.random() < 0.01) {
                this.parts.head.scale.y = 0.95;
                setTimeout(() => {
                    this.parts.head.scale.y = 1;
                }, 150);
            }
        }
    }
};
window.Man = Man;
