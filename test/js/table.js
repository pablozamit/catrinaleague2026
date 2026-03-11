// Table.js - Mesa de billar realista

const Table = {
    mesh: null,
    group: null,
    pockets: [],
    
    // Dimensiones reales (metros)
    width: 2.54,  // 9 pies
    height: 1.27,
    frameThickness: 0.15,
    legHeight: 0.8,
    
    init(scene) {
        this.group = new THREE.Group();
        
        // Materiales
        const feltMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a4d2e,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d2817,
            roughness: 0.7,
            metalness: 0.2
        });
        
        const rubberMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.6
        });
        
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.8
        });
        
        // Tablero (fieltro)
        const boardGeo = new THREE.BoxGeometry(this.width, 0.05, this.height);
        const board = new THREE.Mesh(boardGeo, feltMaterial);
        board.position.y = 0.8;
        board.receiveShadow = true;
        this.group.add(board);
        
        // Marco de madera
        const frameWidth = this.width + 0.3;
        const frameDepth = this.height + 0.3;
        const frameHeight = 0.25;
        
        // Lados largos
        const frameLongGeo = new THREE.BoxGeometry(frameWidth, frameHeight, 0.15);
        const frameLong1 = new THREE.Mesh(frameLongGeo, woodMaterial);
        frameLong1.position.set(0, 0.7, this.height/2 + 0.075);
        frameLong1.castShadow = true;
        this.group.add(frameLong1);
        
        const frameLong2 = frameLong1.clone();
        frameLong2.position.set(0, 0.7, -this.height/2 - 0.075);
        this.group.add(frameLong2);
        
        // Lados cortos
        const frameShortGeo = new THREE.BoxGeometry(0.15, frameHeight, frameDepth);
        const frameShort1 = new THREE.Mesh(frameShortGeo, woodMaterial);
        frameShort1.position.set(this.width/2 + 0.075, 0.7, 0);
        frameShort1.castShadow = true;
        this.group.add(frameShort1);
        
        const frameShort2 = frameShort1.clone();
        frameShort2.position.set(-this.width/2 - 0.075, 0.7, 0);
        this.group.add(frameShort2);
        
        // Bandas de goma (6 cojines)
        const cushionGeo1 = new THREE.BoxGeometry(this.width - 0.1, 0.15, 0.08);
        const cushion1 = new THREE.Mesh(cushionGeo1, rubberMaterial);
        cushion1.position.set(0, 0.88, this.height/2 - 0.04);
        this.group.add(cushion1);
        
        const cushion2 = cushion1.clone();
        cushion2.position.set(0, 0.88, -this.height/2 + 0.04);
        this.group.add(cushion2);
        
        const cushionGeo2 = new THREE.BoxGeometry(0.08, 0.15, this.height - 0.2);
        const cushion3 = new THREE.Mesh(cushionGeo2, rubberMaterial);
        cushion3.position.set(this.width/2 - 0.04, 0.88, 0);
        this.group.add(cushion3);
        
        const cushion4 = cushion3.clone();
        cushion4.position.set(-this.width/2 + 0.04, 0.88, 0);
        this.group.add(cushion4);
        
        // Patas (4 cilindros)
        const legGeo = new THREE.CylinderGeometry(0.08, 0.06, this.legHeight, 16);
        const legPositions = [
            [-this.width/2 + 0.2, -this.legHeight/2 + 0.4, -this.height/2 + 0.2],
            [this.width/2 - 0.2, -this.legHeight/2 + 0.4, -this.height/2 + 0.2],
            [-this.width/2 + 0.2, -this.legHeight/2 + 0.4, this.height/2 - 0.2],
            [this.width/2 - 0.2, -this.legHeight/2 + 0.4, this.height/2 - 0.2]
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, woodMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            this.group.add(leg);
        });
        
        // Troneras (6)
        const pocketGeo = new THREE.CylinderGeometry(0.07, 0.05, 0.1, 16);
        const pocketPositions = [
            { pos: [-this.width/2 + 0.05, 0.75, -this.height/2 + 0.05], id: 'tl' },
            { pos: [0, 0.75, -this.height/2 + 0.02], id: 'tc' },
            { pos: [this.width/2 - 0.05, 0.75, -this.height/2 + 0.05], id: 'tr' },
            { pos: [-this.width/2 + 0.05, 0.75, this.height/2 - 0.05], id: 'bl' },
            { pos: [0, 0.75, this.height/2 - 0.02], id: 'bc' },
            { pos: [this.width/2 - 0.05, 0.75, this.height/2 - 0.05], id: 'br' }
        ];
        
        pocketPositions.forEach(pocketData => {
            const pocket = new THREE.Mesh(pocketGeo, metalMaterial);
            pocket.position.set(...pocketData.pos);
            pocket.userData = { id: pocketData.id };
            this.pockets.push(pocket);
            this.group.add(pocket);
        });
        
        // Bola blanca
        const ballGeo = new THREE.SphereGeometry(0.06, 32, 32);
        const ballMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        const cueBall = new THREE.Mesh(ballGeo, ballMaterial);
        cueBall.position.set(0, 0.86, 0);
        cueBall.castShadow = true;
        this.group.add(cueBall);
        this.cueBall = cueBall;
        
        // Líneas de la mesa
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffffff, 
            opacity: 0.3, 
            transparent: true 
        });
        
        // Línea central
        const centerLineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.825, -this.height/2 + 0.1),
            new THREE.Vector3(0, 0.825, this.height/2 - 0.1)
        ]);
        const centerLine = new THREE.Line(centerLineGeo, lineMaterial);
        this.group.add(centerLine);
        
        // Círculo central
        const circleGeo = new THREE.RingGeometry(0.15, 0.16, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            opacity: 0.3, 
            transparent: true, 
            side: THREE.DoubleSide 
        });
        const centerCircle = new THREE.Mesh(circleGeo, circleMaterial);
        centerCircle.rotation.x = -Math.PI / 2;
        centerCircle.position.set(0, 0.825, 0);
        this.group.add(centerCircle);
        
        scene.add(this.group);
        this.mesh = this.group;
    },
    
    update(delta) {
        // Actualizar marcadores HTML basados en posición 3D
        this.updatePocketMarkers();
    },
    
    updatePocketMarkers() {
        const pocketWorldPositions = [
            { id: 'tl', pos: new THREE.Vector3(-this.width/2 + 0.05, 0.9, -this.height/2 + 0.05) },
            { id: 'tc', pos: new THREE.Vector3(0, 0.9, -this.height/2 + 0.02) },
            { id: 'tr', pos: new THREE.Vector3(this.width/2 - 0.05, 0.9, -this.height/2 + 0.05) },
            { id: 'bl', pos: new THREE.Vector3(-this.width/2 + 0.05, 0.9, this.height/2 - 0.05) },
            { id: 'bc', pos: new THREE.Vector3(0, 0.9, this.height/2 - 0.02) },
            { id: 'br', pos: new THREE.Vector3(this.width/2 - 0.05, 0.9, this.height/2 - 0.05) }
        ];
        
        pocketWorldPositions.forEach(data => {
            const marker = document.getElementById(`marker-${data.id}`);
            if (marker) {
                const screenPos = data.pos.clone();
                screenPos.project(Scene.camera);
                
                const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;
                
                if (screenPos.z < 1) {
                    marker.style.left = x + 'px';
                    marker.style.top = y + 'px';
                    marker.style.transform = 'translate(-50%, -50%)';
                    marker.classList.add('visible');
                } else {
                    marker.classList.remove('visible');
                }
            }
        });
    },
    
    getPocketPosition(id) {
        const positions = {
            'tl': new THREE.Vector3(-this.width/2 + 0.05, 0.75, -this.height/2 + 0.05),
            'tc': new THREE.Vector3(0, 0.75, -this.height/2 + 0.02),
            'tr': new THREE.Vector3(this.width/2 - 0.05, 0.75, -this.height/2 + 0.05),
            'bl': new THREE.Vector3(-this.width/2 + 0.05, 0.75, this.height/2 - 0.05),
            'bc': new THREE.Vector3(0, 0.75, this.height/2 - 0.02),
            'br': new THREE.Vector3(this.width/2 - 0.05, 0.75, this.height/2 - 0.05)
        };
        return positions[id];
    }
};
