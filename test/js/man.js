// Man.js - Hombre visible debajo de la mesa (Rediseño completo para mejor aspecto humano)

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
        
        // === HOMBRE REDESEÑADO - PROPORCIONES HUMANAS REALISTAS ===
        // Basado en proporciones anatómicas reales para mejor reconocibilidad
        
        // ESCALA GENERAL: 1 unidad = aproximadamente 10cm en mundo real
        // Altura total aproximada: 1.75m -> 17.5 unidades
        // Pero como está tumbado, trabajamos en longitud
        
        // Cabeza
        const headRadius = 0.9; // ~9cm de radio (18cm de diámetro)
        const headGeo = new THREE.SphereGeometry(headRadius, 24, 24);
        this.parts.head = new THREE.Mesh(headGeo, skinMaterial);
        this.parts.head.position.set(0, headRadius, 0); // Asentado en el suelo
        this.parts.head.castShadow = true;
        this.group.add(this.parts.head);
        
        // Cabello (para darle más volumen y definición)
        const hairGeo = new THREE.SphereGeometry(headRadius * 1.05, 24, 24);
        this.parts.hair = new THREE.Mesh(hairGeo, hairMaterial);
        this.parts.hair.position.set(0, 0.1, -0.05); // Ligeramente hacia adelante y arriba
        this.parts.head.add(this.parts.hair);
        
        // Ojos
        const eyeRadius = 0.08;
        const eyeGeo = new THREE.SphereGeometry(eyeRadius, 12, 12);
        this.parts.eyeL = new THREE.Mesh(eyeGeo, eyesMaterial);
        this.parts.eyeL.position.set(-0.25, 0.1, headRadius - 0.1);
        this.parts.head.add(this.parts.eyeL);
        
        this.parts.eyeR = new THREE.Mesh(eyeGeo, eyesMaterial);
        this.parts.eyeR.position.set(0.25, 0.1, headRadius - 0.1);
        this.parts.head.add(this.parts.eyeR);
        
        // Boca (pequeña barra para simular labios)
        const mouthGeo = new THREE.BoxGeometry(0.4, 0.05, 0.1);
        this.parts.mouth = new THREE.Mesh(mouthGeo, mouthMaterial);
        this.parts.mouth.position.set(0, -0.2, headRadius - 0.05);
        this.parts.head.add(this.parts.mouth);
        
        // Cuello
        const neckRadius = 0.25;
        const neckHeight = 0.4;
        const neckGeo = new THREE.CylinderGeometry(neckRadius, neckRadius, neckHeight, 12);
        this.parts.neck = new THREE.Mesh(neckGeo, skinMaterial);
        this.parts.neck.position.set(0, headRadius + neckHeight/2, 0);
        this.parts.neck.castShadow = true;
        this.group.add(this.parts.neck);
        
        // Torso (pecho y abdomen)
        // Hombros: más ancho
        const shoulderWidth = 1.2; // distancia de hombro a hombro
        // Pecho: ancho en la parte superior
        const chestWidth = 1.0;
        // Cintura: más estrecha
        const waistWidth = 0.7;
        // Cadera: ligeramente más ancho que cintura
        const hipWidth = 0.8;
        const torsoLength = 2.4; // desde cuello hasta inicio de piernas
        
        // Hombros (como una caja plana)
        const shoulderGeo = new THREE.BoxGeometry(shoulderWidth, 0.3, 0.4);
        this.parts.shoulder = new THREE.Mesh(shoulderGeo, shirtMaterial);
        this.parts.shoulder.position.set(0, headRadius + neckHeight + 0.15, -torsoLength/2 + 0.3);
        this.parts.shoulder.castShadow = true;
        this.group.add(this.parts.shoulder);
        
        // Pecho (cono invertido para dar forma de pechos)
        const chestGeo = new THREE.ConeGeometry(chestWidth/2, 0.6, 4);
        this.parts.chest = new THREE.Mesh(chestGeo, shirtMaterial);
        this.parts.chest.rotation.x = Math.PI / 2; // Acostado de lado
        this.parts.chest.rotation.z = Math.PI / 2; // Hacia arriba
        this.parts.chest.position.set(0, headRadius + neckHeight + 0.4, -torsoLength/2 + 0.8);
        this.parts.chest.castShadow = true;
        this.group.add(this.parts.chest);
        
        // Abdomen/cintura (cilindro estrechado)
        const waistGeo = new THREE.CylinderGeometry(waistWidth/2, waistWidth/2, 0.5, 12);
        this.parts.waist = new THREE.Mesh(waistGeo, pantsMaterial);
        this.parts.waist.rotation.x = Math.PI / 2;
        this.parts.waist.rotation.z = Math.PI / 2;
        this.parts.waist.position.set(0, headRadius + neckHeight + 0.7, -torsoLength/2 + 1.4);
        this.parts.waist.castShadow = true;
        this.group.add(this.parts.waist);
        
        // Cadera
        const hipGeo = new THREE.CylinderGeometry(hipWidth/2, hipWidth/2, 0.4, 12);
        this.parts.hip = new THREE.Mesh(hipGeo, pantsMaterial);
        this.parts.hip.rotation.x = Math.PI / 2;
        this.parts.hip.rotation.z = Math.PI / 2;
        this.parts.hip.position.set(0, headRadius + neckHeight + 0.9, -torsoLength/2 + 1.9);
        this.parts.hip.castShadow = true;
        this.group.add(this.parts.hip);
        
        // Brazos (simplificados pero con proporciones correctas)
        const upperArmLength = 0.8;
        const lowerArmLength = 0.7;
        const armWidth = 0.18;
        
        // Hombro izquierdo (punto de unión)
        const shoulderJointL = new THREE.Vector3(-shoulderWidth/2, headRadius + neckHeight + 0.2, -torsoLength/2 + 0.3);
        
        // Brazo superior izquierdo
        this.parts.upperArmL = new THREE.Mesh(
            new THREE.CylinderGeometry(armWidth, armWidth*0.8, upperArmLength, 12),
            shirtMaterial
        );
        this.parts.upperArmL.position.set(
            shoulderJointL.x - upperArmLength/2, 
            shoulderJointL.y, 
            shoulderJointL.z
        );
        this.parts.upperArmL.rotation.z = Math.PI / 2; // Horizontal
        this.parts.upperArmL.rotation.x = -Math.PI / 6; // Ligeramente hacia abajo
        this.group.add(this.parts.upperArmL);
        
        // Codo izquierdo
        const elbowL = new THREE.Vector3(
            shoulderJointL.x - upperArmLength, 
            shoulderJointL.y, 
            shoulderJointL.z
        );
        
        // Antebrazo izquierdo
        this.parts.lowerArmL = new THREE.Mesh(
            new THREE.CylinderGeometry(armWidth*0.8, armWidth*0.6, lowerArmLength, 12),
            shirtMaterial
        );
        this.parts.lowerArmL.position.set(
            elbowL.x - lowerArmLength/2, 
            elbowL.y, 
            elbowL.z
        );
        this.parts.lowerArmL.rotation.z = Math.PI / 2;
        this.parts.lowerArmL.rotation.x = -Math.PI / 4; // Más doblado
        this.group.add(this.parts.lowerArmL);
        
        // Mano izquierda
        this.parts.handL = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.12, 0.2),
            skinMaterial
        );
        this.parts.handL.position.set(
            elbowL.x - lowerArmLength, 
            elbowL.y - 0.06, 
            elbowL.z + 0.08
        );
        this.group.add(this.parts.handL);
        
        // Lado derecho (simétrico)
        const shoulderJointR = new THREE.Vector3(shoulderWidth/2, headRadius + neckHeight + 0.2, -torsoLength/2 + 0.3);
        
        this.parts.upperArmR = new THREE.Mesh(
            new THREE.CylinderGeometry(armWidth, armWidth*0.8, upperArmLength, 12),
            shirtMaterial
        );
        this.parts.upperArmR.position.set(
            shoulderJointR.x + upperArmLength/2, 
            shoulderJointR.y, 
            shoulderJointR.z
        );
        this.parts.upperArmR.rotation.z = -Math.PI / 2;
        this.parts.upperArmR.rotation.x = -Math.PI / 6;
        this.group.add(this.parts.upperArmR);
        
        const elbowR = new THREE.Vector3(
            shoulderJointR.x + upperArmLength, 
            shoulderJointR.y, 
            shoulderJointR.z
        );
        
        this.parts.lowerArmR = new THREE.Mesh(
            new THREE.CylinderGeometry(armWidth*0.8, armWidth*0.6, lowerArmLength, 12),
            shirtMaterial
        );
        this.parts.lowerArmR.position.set(
            elbowR.x + lowerArmLength/2, 
            elbowR.y, 
            elbowR.z
        );
        this.parts.lowerArmR.rotation.z = -Math.PI / 2;
        this.parts.lowerArmR.rotation.x = -Math.PI / 4;
        this.group.add(this.parts.lowerArmR);
        
        this.parts.handR = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.12, 0.2),
            skinMaterial
        );
        this.parts.handR.position.set(
            elbowR.x + lowerArmLength, 
            elbowR.y - 0.06, 
            elbowR.z - 0.08
        );
        this.group.add(this.parts.handR);
        
        // Piernas (similar a brazos pero más gruesas y con pies)
        const upperLegLength = 1.0;
        const lowerLegLength = 1.0;
        const legWidth = 0.22;
        const footLength = 0.3;
        const footWidth = 0.12;
        const footHeight = 0.06;
        
        // Articulación de cadera izquierda
        const hipJointL = new THREE.Vector3(-hipWidth/2, headRadius + neckHeight + 0.9, -torsoLength/2 + 1.9);
        
        // Muslo izquierdo
        this.parts.upperLegL = new THREE.Mesh(
            new THREE.CylinderGeometry(legWidth, legWidth*0.85, upperLegLength, 12),
            pantsMaterial
        );
        this.parts.upperLegL.position.set(
            hipJointL.x, 
            hipJointL.y - upperLegLength/2, 
            hipJointL.z
        );
        this.parts.upperLegL.rotation.x = Math.PI / 2; // Vertical (hacia los pies)
        this.parts.upperLegL.rotation.z = Math.PI / 2; // Hacia la derecha (para que quede hacia afuera cuando está tumbado de lado)
        this.group.add(this.parts.upperLegL);
        
        // Rodilla izquierda
        const kneeL = new THREE.Vector3(
            hipJointL.x, 
            hipJointL.y - upperLegLength, 
            hipJointL.z
        );
        
        // Pierna izquierda
        this.parts.lowerLegL = new THREE.Mesh(
            new THREE.CylinderGeometry(legWidth*0.85, legWidth*0.7, lowerLegLength, 12),
            pantsMaterial
        );
        this.parts.lowerLegL.position.set(
            kneeL.x, 
            kneeL.y - lowerLegLength/2, 
            kneeL.z
        );
        this.parts.lowerLegL.rotation.x = Math.PI / 2;
        this.parts.lowerLegL.rotation.z = Math.PI / 2;
        this.parts.lowerLegL.rotation.x -= Math.PI / 6; // Ligera flexión de rodilla
        this.group.add(this.parts.lowerLegL);
        
        // Pie izquierdo
        this.parts.footL = new THREE.Mesh(
            new THREE.BoxGeometry(footLength, footHeight, footWidth),
            shoesMaterial
        );
        this.parts.footL.position.set(
            kneeL.x, 
            kneeL.y - lowerLegLength, 
            kneeL.z - footWidth/2 - 0.02 // Ligeramente hacia afuera
        );
        this.parts.footL.rotation.x = Math.PI / 2;
        this.parts.footL.rotation.z = Math.PI / 8; // Pie ligeramente hacia afuera
        this.group.add(this.parts.footL);
        
        // Pierna derecha
        const hipJointR = new THREE.Vector3(hipWidth/2, headRadius + neckHeight + 0.9, -torsoLength/2 + 1.9);
        
        this.parts.upperLegR = new THREE.Mesh(
            new THREE.CylinderGeometry(legWidth, legWidth*0.85, upperLegLength, 12),
            pantsMaterial
        );
        this.parts.upperLegR.position.set(
            hipJointR.x, 
            hipJointR.y - upperLegLength/2, 
            hipJointR.z
        );
        this.parts.upperLegR.rotation.x = Math.PI / 2;
        this.parts.upperLegR.rotation.z = -Math.PI / 2; // Hacia la izquierda
        this.group.add(this.parts.upperLegR);
        
        const kneeR = new THREE.Vector3(
            hipJointR.x, 
            hipJointR.y - upperLegLength, 
            hipJointR.z
        );
        
        this.parts.lowerLegR = new THREE.Mesh(
            new THREE.CylinderGeometry(legWidth*0.85, legWidth*0.7, lowerLegLength, 12),
            pantsMaterial
        );
        this.parts.lowerLegR.position.set(
            kneeR.x, 
            kneeR.y - lowerLegLength/2, 
            kneeR.z
        );
        this.parts.lowerLegR.rotation.x = Math.PI / 2;
        this.parts.lowerLegR.rotation.z = -Math.PI / 2;
        this.parts.lowerLegR.rotation.x -= Math.PI / 6;
        this.group.add(this.parts.lowerLegR);
        
        this.parts.footR = new THREE.Mesh(
            new THREE.BoxGeometry(footLength, footHeight, footWidth),
            shoesMaterial
        );
        this.parts.footR.position.set(
            kneeR.x, 
            kneeR.y - lowerLegLength, 
            kneeR.z + footWidth/2 + 0.02 // Hacia afuera
        );
        this.parts.footR.rotation.x = Math.PI / 2;
        this.parts.footR.rotation.z = -Math.PI / 8;
        this.group.add(this.parts.footR);
        
        // Posicionamiento final: debajo de la mesa
        // Ajustado para que quepa cómodamente bajo una mesa estándar
        this.group.position.set(0, -1.0, 0); // Ligeramente elevado para no atravesar el suelo
        this.group.scale.set(0.9, 0.9, 0.9); // Escalado general para mejor proporción con la mesa
        
        scene.add(this.group);
        this.mesh = this.group;
    },
    
    wakeUp() {
        if (this.state !== 'sleeping') return;
        
        this.state = 'waking';
        if (Audio && Audio.playRadio) Audio.playRadio();
        
        const wakeDuration = 1800; // Un poco más rápido
        const startTime = Date.now();
        const startPos = this.group.position.clone();
        const startRot = this.group.rotation.clone();
        
        // Posición final: de pie al lado de la mesa, mirando ligeramente hacia adelante
        const endPos = new THREE.Vector3(3.5, 0, 1.5);
        const endRot = new THREE.Euler(0, 0, 0, 'XYZ');
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / wakeDuration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // easing suave
            
            // Interpolación de posición
            this.group.position.lerpVectors(startPos, endPos, ease);
            
            // Interpolación de rotación (de acostado de lado a de pie mirando adelante)
            this.group.rotation.x = THREE.MathUtils.lerp(
                startRot.x, endRot.x, ease
            );
            this.group.rotation.y = THREE.MathUtils.lerp(
                startRot.y, endRot.y, ease
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
        
        const speed = 4 * 0.016; // Velocidad ligeramente reducida para mejor control
        const moveX = direction.x * speed;
        const moveZ = direction.y * speed;
        
        this.group.position.x += moveX;
        this.group.position.z += moveZ;
        
        // Rotar hacia la dirección de movimiento con suavizado
        if (moveX !== 0 || moveZ !== 0) {
            const angle = Math.atan2(moveX, moveZ);
            // Suavizar la rotación para evitar cambios bruscos
            const currentAngle = this.group.rotation.y;
            const targetAngle = angle;
            this.group.rotation.y = THREE.MathUtils.lerp(
                currentAngle, targetAngle, 0.15
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
            // Respiración más natural y movimiento sutil de sueño
            const breatheCycle = this.animTime * 0.8;
            const breathe = Math.sin(breatheCycle) * 0.008;
            // Movimiento muy sutil de lado a lado (como si estuviera soñando)
            const drift = Math.sin(this.animTime * 0.3) * 0.003;
            this.group.position.y = -1.0 + breathe;
            this.group.position.z += drift;
            
            // Légero movimiento de los dedos para indicar vida
            if (this.parts.handL && this.parts.handR) {
                const fingerMove = Math.sin(this.animTime * 2) * 0.005;
                this.parts.handL.position.z = 0.08 + fingerMove;
                this.parts.handR.position.z = -0.08 - fingerMove;
            }
        } else if (this.state === 'idle') {
            // Micro-movimientos de espera más naturales
            const idleSway = Math.sin(this.animTime * 1.3) * 0.002;
            const idleDrift = Math.cos(this.animTime * 0.9) * 0.0015;
            this.group.position.x = idleSway;
            this.group.position.z = idleDrift;
            
            // Balanceo muy sutil de brazos
            if (this.parts.upperArmL && this.parts.upperArmR) {
                const armSway = Math.sin(this.animTime * 2) * 0.02;
                this.parts.upperArmL.rotation.z = -Math.PI / 2 + armSway;
                this.parts.upperArmR.rotation.z = Math.PI / 2 - armSway;
            }
        } else if (this.state === 'walking') {
            // Animación de caminar más natural y fluida
            const walkCycle = this.animTime * 10; // Velocidad del ciclo
            
            // Balanceo de brazos oponible a las piernas
            const armSwing = Math.sin(walkCycle) * 0.3;
            // Brazos
            this.parts.upperArmL.rotation.z = -Math.PI / 2 + armSwing;
            this.parts.lowerArmL.rotation.z = -Math.PI / 4 + Math.sin(walkCycle + Math.PI) * 0.2;
            this.parts.upperArmR.rotation.z = Math.PI / 2 - armSwing;
            this.parts.lowerArmR.rotation.z = Math.PI / 4 + Math.sin(walkCycle) * 0.2;
            
            // Piernas - fase opuesta
            const legPhase = Math.sin(walkCycle);
            // Pierna izquierda
            this.parts.upperLegL.rotation.x = Math.PI / 2 + legPhase * 0.4;
            this.parts.lowerLegL.rotation.x = Math.PI / 2 - legPhase * 0.2;
            // Pierna derecha
            this.parts.upperLegR.rotation.x = Math.PI / 2 - legPhase * 0.4;
            this.parts.lowerLegR.rotation.x = Math.PI / 2 + legPhase * 0.2;
            
            // Movimiento de cabezal balanceo muy sutil
            if (this.parts.head) {
                const headBob = Math.sin(walkCycle * 0.5) * 0.005;
                this.parts.head.position.y = 0.9 + headBob;
            }
        }
    }
};

window.Man = Man;