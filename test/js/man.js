// Man.js - Hombre visible debajo de la mesa

const Man = {
    mesh: null,
    group: null,
    state: 'sleeping',
    parts: {},
    animTime: 0,
    walkSpeed: 5,
    isMoving: false,
    
    init(scene) {
        this.group = new THREE.Group();
        
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
        
        // === HOMBRE TUMBADO - TAMAÑOS DIRECTOS ===
        // Sin escala multiplicadora, tamaños reales en unidades
        
        // Cabeza
        const headGeo = new THREE.SphereGeometry(0.5, 16, 16);
        this.parts.head = new THREE.Mesh(headGeo, skinMaterial);
        this.parts.head.position.set(0, 0.5, 0);
        this.parts.head.castShadow = true;
        this.group.add(this.parts.head);
        
        // Torso (tumbado de lado)
        const torsoGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.5, 12);
        this.parts.torso = new THREE.Mesh(torsoGeo, shirtMaterial);
        this.parts.torso.rotation.x = Math.PI / 2; // Horizontal
        this.parts.torso.rotation.z = Math.PI / 2; // De lado
        this.parts.torso.position.set(0, 0.5, -1.5);
        this.parts.torso.castShadow = true;
        this.group.add(this.parts.torso);
        
        // Brazos
        const armGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 12);
        
        // Brazo derecho (bajo la cabeza como almohada)
        this.parts.armR = new THREE.Mesh(armGeo, shirtMaterial);
        this.parts.armR.rotation.z = Math.PI / 2;
        this.parts.armR.position.set(0.8, 0.3, 0.5);
        this.group.add(this.parts.armR);
        
        // Brazo izquierdo (sobre el torso)
        this.parts.armL = new THREE.Mesh(armGeo, shirtMaterial);
        this.parts.armL.rotation.z = Math.PI / 2;
        this.parts.armL.position.set(-0.8, 0.6, -1);
        this.group.add(this.parts.armL);
        
        // Piernas (tumbadas junto al torso)
        const legGeo = new THREE.CylinderGeometry(0.28, 0.28, 2.2, 12);
        
        // Pierna derecha
        this.parts.legR = new THREE.Mesh(legGeo, pantsMaterial);
        this.parts.legR.rotation.x = Math.PI / 2;
        this.parts.legR.position.set(0.5, 0.3, -3);
        this.group.add(this.parts.legR);
        
        // Pierna izquierda
        this.parts.legL = new THREE.Mesh(legGeo, pantsMaterial);
        this.parts.legL.rotation.x = Math.PI / 2;
        this.parts.legL.position.set(-0.5, 0.3, -3);
        this.group.add(this.parts.legL);
        
        // Zapatos
        const shoeGeo = new THREE.BoxGeometry(0.5, 0.3, 1);
        this.parts.shoeR = new THREE.Mesh(shoeGeo, shoesMaterial);
        this.parts.shoeR.position.set(0.5, 0.15, -4);
        this.group.add(this.parts.shoeR);
        
        this.parts.shoeL = new THREE.Mesh(shoeGeo, shoesMaterial);
        this.parts.shoeL.position.set(-0.5, 0.15, -4);
        this.group.add(this.parts.shoeL);
        
        // Posición: debajo de la mesa
        this.group.position.set(0, -1.5, 0);
        
        scene.add(this.group);
        this.mesh = this.group;
    },
    
    wakeUp() {
        if (this.state !== 'sleeping') return;
        
        this.state = 'waking';
        if (Audio && Audio.playRadio) Audio.playRadio();
        
        const wakeDuration = 2000;
        const startTime = Date.now();
        const startPos = this.group.position.clone();
        
        // Mover fuera de la mesa
        const endPos = new THREE.Vector3(8, 0, 5);
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / wakeDuration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            this.group.position.lerpVectors(startPos, endPos, ease);
            
            // Rotar para ponerse de pie
            this.group.rotation.x = -Math.PI / 2 * (1 - ease);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.state = 'idle';
                if (Game && Game.activateJoystick) Game.activateJoystick();
            }
        };
        
        animate();
    },
    
    move(direction) {
        if (this.state !== 'idle' && this.state !== 'walking') return;
        
        this.state = 'walking';
        this.isMoving = true;
        
        const speed = 5 * 0.016;
        const moveX = direction.x * speed;
        const moveZ = direction.y * speed;
        
        this.group.position.x += moveX;
        this.group.position.z += moveZ;
        
        const angle = Math.atan2(moveX, moveZ);
        this.group.rotation.y = angle;
    },
    
    stop() {
        this.isMoving = false;
        if (this.state === 'walking') {
            this.state = 'idle';
        }
    },
    
    update(delta) {
        this.animTime += delta;
        
        if (this.state === 'sleeping') {
            // Respiración sutil
            const breathe = Math.sin(this.animTime * 2) * 0.02;
            this.group.position.y = -1.5 + breathe;
        }
    }
};
window.Man = Man;
