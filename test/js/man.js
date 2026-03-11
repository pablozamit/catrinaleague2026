// Man.js - Hombre que duerme y se despierta

const Man = {
    mesh: null,
    group: null,
    state: 'sleeping', // sleeping, waking, walking, idle
    
    // Partes del cuerpo
    parts: {},
    
    // Animación
    animTime: 0,
    walkSpeed: 2,
    isMoving: false,
    targetPosition: null,
    
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
        
        // === POSICIÓN INICIAL: TUMBADO DEBAJO DE LA MESA ===
        // Cabeza
        const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
        this.parts.head = new THREE.Mesh(headGeo, skinMaterial);
        this.parts.head.position.set(0, 0.18, 0.3);
        this.parts.head.castShadow = true;
        this.group.add(this.parts.head);
        
        // Cuello
        const neckGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.1, 12);
        this.parts.neck = new THREE.Mesh(neckGeo, skinMaterial);
        this.parts.neck.position.set(0, 0.15, 0.2);
        this.parts.neck.rotation.x = Math.PI / 4;
        this.group.add(this.parts.neck);
        
        // Torso
        const torsoGeo = new THREE.CapsuleGeometry(0.18, 0.5, 4, 8);
        this.parts.torso = new THREE.Mesh(torsoGeo, shirtMaterial);
        this.parts.torso.position.set(0, 0.18, -0.1);
        this.parts.torso.rotation.x = Math.PI / 2;
        this.parts.torso.castShadow = true;
        this.group.add(this.parts.torso);
        
        // Brazo derecho (bajo la cabeza como almohada)
        const armGeo = new THREE.CapsuleGeometry(0.06, 0.35, 4, 8);
        this.parts.armR = new THREE.Mesh(armGeo, shirtMaterial);
        this.parts.armR.position.set(0.15, 0.12, 0.25);
        this.parts.armR.rotation.set(Math.PI/3, 0, Math.PI/4);
        this.group.add(this.parts.armR);
        
        // Brazo izquierdo (sobre el cuerpo)
        this.parts.armL = new THREE.Mesh(armGeo, shirtMaterial);
        this.parts.armL.position.set(-0.15, 0.18, -0.05);
        this.parts.armL.rotation.set(Math.PI/2, 0, -Math.PI/6);
        this.group.add(this.parts.armL);
        
        // Piernas
        const legGeo = new THREE.CapsuleGeometry(0.09, 0.45, 4, 8);
        
        // Pierna derecha (doblada)
        this.parts.legR_upper = new THREE.Mesh(legGeo, pantsMaterial);
        this.parts.legR_upper.position.set(0.12, 0.1, -0.35);
        this.parts.legR_upper.rotation.x = Math.PI / 2.5;
        this.group.add(this.parts.legR_upper);
        
        this.parts.legR_lower = new THREE.Mesh(legGeo, pantsMaterial);
        this.parts.legR_lower.position.set(0.25, 0.08, -0.55);
        this.parts.legR_lower.rotation.x = Math.PI / 2;
        this.group.add(this.parts.legR_lower);
        
        // Pierna izquierda (estirada)
        this.parts.legL = new THREE.Mesh(legGeo, pantsMaterial);
        this.parts.legL.position.set(-0.12, 0.09, -0.55);
        this.parts.legL.rotation.x = Math.PI / 2;
        this.group.add(this.parts.legL);
        
        // Zapatos
        const shoeGeo = new THREE.BoxGeometry(0.1, 0.06, 0.2);
        this.parts.shoeR = new THREE.Mesh(shoeGeo, shoesMaterial);
        this.parts.shoeR.position.set(0.35, 0.03, -0.7);
        this.group.add(this.parts.shoeR);
        
        this.parts.shoeL = new THREE.Mesh(shoeGeo, shoesMaterial);
        this.parts.shoeL.position.set(-0.12, 0.03, -0.75);
        this.group.add(this.parts.shoeL);
        
        // Posición inicial bajo la mesa
        this.group.position.set(0.3, 0, 0);
        
        scene.add(this.group);
        this.mesh = this.group;
    },
    
    wakeUp() {
        if (this.state !== 'sleeping') return;
        
        this.state = 'waking';
        Audio.playRadio();
        
        // Animación de despertar
        const wakeDuration = 3000;
        const startTime = Date.now();
        
        const startPos = this.group.position.clone();
        const startRot = this.group.rotation.clone();
        
        // Posición final: de pie al lado de la mesa
        const endPos = new THREE.Vector3(3, 0, 2);
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / wakeDuration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            // Mover hacia afuera
            this.group.position.lerpVectors(startPos, endPos, ease);
            
            // Rotar para ponerse de pie
            this.group.rotation.x = startRot.x * (1 - ease);
            this.group.rotation.y = startRot.y + (Math.PI / 2) * ease;
            
            // Animar partes del cuerpo
            this.animateWakeUpParts(progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.state = 'idle';
                this.isMoving = false;
                Game.activateJoystick();
            }
        };
        
        animate();
    },
    
    animateWakeUpParts(progress) {
        // Brazos bajan
        this.parts.armR.rotation.set(
            Math.PI/3 * (1 - progress),
            0,
            Math.PI/4 * (1 - progress) + (-Math.PI/6) * progress
        );
        
        this.parts.armL.rotation.set(
            Math.PI/2 * (1 - progress),
            0,
            -Math.PI/6 * (1 - progress) + (Math.PI/6) * progress
        );
        
        // Piernas se enderezan
        this.parts.legR_upper.rotation.x = Math.PI/2.5 * (1 - progress);
        this.parts.legR_lower.rotation.x = Math.PI/2 * (1 - progress);
        this.parts.legL.rotation.x = Math.PI/2 * (1 - progress);
        
        // Posición de zapatos
        this.parts.shoeR.position.set(
            0.2 + 0.15 * progress,
            0.03 + 0.05 * progress,
            -0.5 + 0.2 * progress
        );
        
        this.parts.shoeL.position.set(
            -0.12,
            0.03 + 0.05 * progress,
            -0.5 + 0.2 * progress
        );
    },
    
    move(direction) {
        if (this.state !== 'idle' && this.state !== 'walking') return;
        
        this.state = 'walking';
        this.isMoving = true;
        
        const speed = 3 * 0.016; // Delta time approx
        const moveX = direction.x * speed;
        const moveZ = direction.y * speed;
        
        this.group.position.x += moveX;
        this.group.position.z += moveZ;
        
        // Rotar hacia la dirección del movimiento
        const angle = Math.atan2(moveX, moveZ);
        this.group.rotation.y = angle;
        
        // Animar caminar
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
        
        // Balanceo de brazos
        this.parts.armR.rotation.z = Math.sin(time) * 0.3 + 0.3;
        this.parts.armL.rotation.z = -Math.sin(time) * 0.3 - 0.3;
        
        // Alternar piernas
        const legAngle = Math.sin(time) * 0.2;
        this.parts.legR_upper.rotation.x = legAngle;
        this.parts.legL.rotation.x = -legAngle;
        
        // Balanceo del cuerpo
        this.group.position.y = Math.abs(Math.sin(time * 2)) * 0.03;
    },
    
    update(delta) {
        this.animTime += delta;
        
        if (this.state === 'sleeping') {
            // Respiración mientras duerme
            const breathe = Math.sin(this.animTime * 2) * 0.005;
            this.group.position.y = breathe;
            
            // Movimiento sutil de brazos
            this.parts.armR.rotation.z = Math.sin(this.animTime * 1.5) * 0.02;
            this.parts.armL.rotation.z = Math.sin(this.animTime * 1.3 + 1) * 0.02;
        }
        
        if (this.state === 'idle') {
            // Parpadear ocasionalmente
            if (Math.random() < 0.01) {
                this.parts.head.scale.y = 0.9;
                setTimeout(() => {
                    this.parts.head.scale.y = 1;
                }, 150);
            }
        }
    }
};
