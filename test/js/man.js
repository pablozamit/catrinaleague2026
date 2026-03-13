// Man.js - Hombre visible debajo de la mesa (Versión mejorada con más detalle)

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
        
        // Materiales mejorados
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0x8d5524,
            roughness: 0.6,
            metalness: 0.1
        });
        
        const shirtMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const pantsMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.7,
            metalness: 0.1
        });
        
        const shoesMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.5,
            metalness: 0.3
        });
        
        const hairMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c1a0e,
            roughness: 0.9,
            metalness: 0.0
        });
        
        const eyesMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.0
        });
        
        const mouthMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            roughness: 0.8,
            metalness: 0.0
        });
        
        // === HOMBRE MEJORADO - PROPORCIONES ANATÓMICAS ===
        // Escalado para que quepa bajo la mesa pero con mejor detalle
        
        // Cabeza (más detallada)
        const headGeo = new THREE.SphereGeometry(0.45, 24, 24);
        this.parts.head = new THREE.Mesh(headGeo, skinMaterial);
        this.parts.head.position.set(0, 0.8, 0);
        this.parts.head.castShadow = true;
        this.group.add(this.parts.head);
        
        // Cabello (simple pero efectivo)
        const hairGeo = new THREE.SphereGeometry(0.48, 24, 24);
        hairGeo.translate(0, 0.05, -0.1); // ligeramente hacia adelante y arriba
        this.parts.hair = new THREE.Mesh(hairGeo, hairMaterial);
        this.parts.hair.castShadow = true;
        this.parts.head.add(this.parts.hair); // Adjuntado a la cabeza para que rote con ella
        
        // Ojos
        const eyeGeo = new THREE.SphereGeometry(0.06, 12, 12);
        this.parts.eyeL = new THREE.Mesh(eyeGeo, eyesMaterial);
        this.parts.eyeL.position.set(-0.15, 0.1, 0.3);
        this.parts.head.add(this.parts.eyeL);
        
        this.parts.eyeR = new THREE.Mesh(eyeGeo, eyesMaterial);
        this.parts.eyeR.position.set(0.15, 0.1, 0.3);
        this.parts.head.add(this.parts.eyeR);
        
        // Boca (pequeña caja)
        const mouthGeo = new THREE.BoxGeometry(0.15, 0.05, 0.1);
        this.parts.mouth = new THREE.Mesh(mouthGeo, mouthMaterial);
        this.parts.mouth.position.set(0, -0.1, 0.35);
        this.parts.head.add(this.parts.mouth);
        
        // Cuello
        const neckGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.3, 12);
        this.parts.neck = new THREE.Mesh(neckGeo, skinMaterial);
        this.parts.neck.position.set(0, 0.5, 0);
        this.parts.neck.castShadow = true;
        this.group.add(this.parts.neck);
        
        // Torso (mejorado - más ancho en pecho, estrecho en cintura)
        const torsoGeo = new THREE.ConeGeometry(0.25, 0.4, 4); // cono invertido para pecho
        this.parts.torsoUpper = new THREE.Mesh(torsoGeo, shirtMaterial);
        this.parts.torsoUpper.rotation.x = Math.PI / 2; // Horizontal
        this.parts.torsoUpper.rotation.z = Math.PI / 2; // De lado
        this.parts.torsoUpper.position.set(0, 0.3, -0.8);
        this.parts.torsoUpper.castShadow = true;
        this.group.add(this.parts.torsoUpper);
        
        const torsoLowerGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.6, 12); // cintura a cadera
        this.parts.torsoLower = new THREE.Mesh(torsoLowerGeo, pantsMaterial);
        this.parts.torsoLower.rotation.x = Math.PI / 2;
        this.parts.torsoLower.rotation.z = Math.PI / 2;
        this.parts.torsoLower.position.set(0, 0.3, -1.4);
        this.parts.torsoLower.castShadow = true;
        this.group.add(this.parts.torsoLower);
        
        // Hombros
        const shoulderGeo = new THREE.SphereGeometry(0.18, 12, 12);
        this.parts.shoulderL = new THREE.Mesh(shoulderGeo, shirtMaterial);
        this.parts.shoulderL.position.set(-0.25, 0.5, -0.6);
        this.group.add(this.parts.shoulderL);
        
        this.parts.shoulderR = new THREE.Mesh(shoulderGeo, shirtMaterial);
        this.parts.shoulderR.position.set(0.25, 0.5, -0.6);
        this.group.add(this.parts.shoulderR);
        
        // Brazos (con codos y manos simples)
        const upperArmGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.6, 12);
        const lowerArmGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.5, 12);
        const handGeo = new THREE.SphereGeometry(0.12, 10, 10);
        
        // Brazo izquierdo
        this.parts.upperArmL = new THREE.Mesh(upperArmGeo, shirtMaterial);
        this.parts.upperArmL.position.set(-0.3, 0.4, -0.8);
        this.parts.upperArmL.rotation.z = -Math.PI / 4;
        this.group.add(this.parts.upperArmL);
        
        this.parts.lowerArmL = new THREE.Mesh(lowerArmGeo, shirtMaterial);
        this.parts.lowerArmL.position.set(-0.4, 0.2, -1.1);
        this.parts.lowerArmL.rotation.z = -Math.PI / 4;
        this.parts.lowerArmL.rotation.x = Math.PI / 6;
        this.group.add(this.parts.lowerArmL);
        
        this.parts.handL = new THREE.Mesh(handGeo, skinMaterial);
        this.parts.handL.position.set(-0.45, 0.1, -1.3);
        this.parts.handL.rotation.z = -Math.PI / 4;
        this.group.add(this.parts.handL);
        
        // Brazo derecho (como almohada)
        this.parts.upperArmR = new THREE.Mesh(upperArmGeo, shirtMaterial);
        this.parts.upperArmR.position.set(0.3, 0.6, -0.2);
        this.parts.upperArmR.rotation.z = Math.PI / 4;
        this.group.add(this.parts.upperArmR);
        
        this.parts.lowerArmR = new THREE.Mesh(lowerArmGeo, shirtMaterial);
        this.parts.lowerArmR.position.set(0.4, 0.5, 0.1);
        this.parts.lowerArmR.rotation.z = Math.PI / 4;
        this.parts.lowerArmR.rotation.x = -Math.PI / 6;
        this.group.add(this.parts.lowerArmR);
        
        this.parts.handR = new THREE.Mesh(handGeo, skinMaterial);
        this.parts.handR.position.set(0.45, 0.4, 0.3);
        this.parts.handR.rotation.z = Math.PI / 4;
        this.group.add(this.parts.handR);
        
        // Piernas (con rodillas y pies)
        const upperLegGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.7, 12);
        const lowerLegGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.6, 12);
        const footGeo = new THREE.BoxGeometry(0.25, 0.08, 0.4);
        
        // Pierna izquierda
        this.parts.upperLegL = new THREE.Mesh(upperLegGeo, pantsMaterial);
        this.parts.upperLegL.position.set(-0.2, 0.1, -1.6);
        this.parts.upperLegL.rotation.x = Math.PI / 2;
        this.parts.upperLegL.rotation.z = Math.PI / 2;
        this.group.add(this.parts.upperLegL);
        
        this.parts.lowerLegL = new THREE.Mesh(lowerLegGeo, pantsMaterial);
        this.parts.lowerLegL.position.set(-0.2, -0.1, -2.1);
        this.parts.lowerLegL.rotation.x = Math.PI / 2;
        this.parts.lowerLegL.rotation.z = Math.PI / 2;
        this.parts.lowerLegL.rotation.x -= Math.PI / 6; // ligera flexión de rodilla
        this.group.add(this.parts.lowerLegL);
        
        this.parts.footL = new THREE.Mesh(footGeo, shoesMaterial);
        this.parts.footL.position.set(-0.2, -0.3, -2.5);
        this.parts.footL.rotation.x = Math.PI / 2;
        this.parts.footL.rotation.z = Math.PI / 2;
        this.group.add(this.parts.footL);
        
        // Pierna derecha
        this.parts.upperLegR = new THREE.Mesh(upperLegGeo, pantsMaterial);
        this.parts.upperLegR.position.set(0.2, 0.1, -1.6);
        this.parts.upperLegR.rotation.x = Math.PI / 2;
        this.parts.upperLegR.rotation.z = -Math.PI / 2;
        this.group.add(this.parts.upperLegR);
        
        this.parts.lowerLegR = new THREE.Mesh(lowerLegGeo, pantsMaterial);
        this.parts.lowerLegR.position.set(0.2, -0.1, -2.1);
        this.parts.lowerLegR.rotation.x = Math.PI / 2;
        this.parts.lowerLegR.rotation.z = -Math.PI / 2;
        this.parts.lowerLegR.rotation.x -= Math.PI / 6; // ligera flexión de rodilla
        this.group.add(this.parts.lowerLegR);
        
        this.parts.footR = new THREE.Mesh(footGeo, shoesMaterial);
        this.parts.footR.position.set(0.2, -0.3, -2.5);
        this.parts.footR.rotation.x = Math.PI / 2;
        this.parts.footR.rotation.z = -Math.PI / 2;
        this.group.add(this.parts.footR);
        
        // Posición: debajo de la mesa (ajustada para mejor visualización)
        this.group.position.set(0, -1.2, 0);
        this.group.scale.set(0.8, 0.8, 0.8); // ligeramente escalado para proporción
        
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
        const startRot = this.group.rotation.clone();
        
        // Posición final (de pie al lado de la mesa)
        const endPos = new THREE.Vector3(4, 0, 2);
        const endRot = new THREE.Euler(0, 0, 0, 'XYZ');
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / wakeDuration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // easing suave
            
            // Interpolación de posición
            this.group.position.lerpVectors(startPos, endPos, ease);
            
            // Interpolación de rotación (de acostado a de pie)
            this.group.rotation.x = THREE.MathUtils.lerp(
                startRot.x, endRot.x, ease
            );
            this.group.rotation.z = THREE.MathUtils.lerp(
                startRot.z, endRot.z, ease
            );
            
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
        
        const speed = 5 * 0.016; // velocidad por frame (asumiendo 60fps)
        const moveX = direction.x * speed;
        const moveZ = direction.y * speed;
        
        this.group.position.x += moveX;
        this.group.position.z += moveZ;
        
        // Rotar hacia la dirección de movimiento
        if (moveX !== 0 || moveZ !== 0) {
            const angle = Math.atan2(moveX, moveZ);
            // Suavizar la rotación
            const currentAngle = this.group.rotation.y;
            const targetAngle = angle;
            this.group.rotation.y = THREE.MathUtils.lerp(
                currentAngle, targetAngle, 0.2
            );
        }
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
            // Respiración sutil y movimiento de sueño
            const breathe = Math.sin(this.animTime * 1.5) * 0.01;
            const slightMove = Math.sin(this.animTime * 0.7) * 0.005;
            this.group.position.y = -1.2 + breathe;
            this.group.position.z += slightMove;
        } else if (this.state === 'idle') {
            // Micro-movimientos de espera
            const idleSway = Math.sin(this.animTime * 2) * 0.003;
            this.group.position.x = idleSway;
            this.group.position.z = Math.cos(this.animTime * 1.5) * 0.002;
        } else if (this.state === 'walking') {
            // Animación de caminar básica
            const walkCycle = this.animTime * 8;
            // Balanceo de brazos
            this.parts.upperArmL.rotation.z = -Math.PI / 4 + Math.sin(walkCycle) * 0.5;
            this.parts.lowerArmL.rotation.z = -Math.PI / 4 + Math.sin(walkCycle + Math.PI) * 0.3;
            this.parts.upperArmR.rotation.z = Math.PI / 4 + Math.sin(walkCycle + Math.PI) * 0.5;
            this.parts.lowerArmR.rotation.z = Math.PI / 4 + Math.sin(walkCycle) * 0.3;
            // Movimiento de piernas
            this.parts.upperLegL.rotation.x = Math.PI / 2 + Math.sin(walkCycle) * 0.4;
            this.parts.lowerLegL.rotation.x = Math.PI / 2 - Math.sin(walkCycle) * 0.2;
            this.parts.upperLegR.rotation.x = Math.PI / 2 + Math.sin(walkCycle + Math.PI) * 0.4;
            this.parts.lowerLegR.rotation.x = Math.PI / 2 - Math.sin(walkCycle + Math.PI) * 0.2;
        }
    }
};

window.Man = Man;