// Table.js - Mesa de billar (escala similar a index.html)

const Table = {
    mesh: null,
    group: null,
    pockets: [],
    
    // Dimensiones en escala visual (misma proporción que index.html)
    width: 14,    // Tablero jugable
    height: 7,    // Tablero jugable
    frameThickness: 0.8,
    frameHeight: 0.6,
    legHeight: 4, // Patas más altas para ver bajo la mesa
    
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
        
        // Tablero (fieltro) - BoxGeometry(width, height, depth)
        const boardGeo = new THREE.BoxGeometry(this.width, 0.3, this.height);
        const board = new THREE.Mesh(boardGeo, feltMaterial);
        board.position.y = 0.15;
        board.receiveShadow = true;
        this.group.add(board);
        
        // Marco de madera
        const frameWidth = this.width + this.frameThickness * 2;
        const frameDepth = this.height + this.frameThickness * 2;
        
        // Lados largos
        const frameLongGeo = new THREE.BoxGeometry(frameWidth, this.frameHeight, this.frameThickness);
        const frameLong1 = new THREE.Mesh(frameLongGeo, woodMaterial);
        frameLong1.position.set(0, this.frameHeight/2, this.height/2 + this.frameThickness/2);
        frameLong1.castShadow = true;
        this.group.add(frameLong1);
        
        const frameLong2 = frameLong1.clone();
        frameLong2.position.set(0, this.frameHeight/2, -this.height/2 - this.frameThickness/2);
        this.group.add(frameLong2);
        
        // Lados cortos
        const frameShortGeo = new THREE.BoxGeometry(this.frameThickness, this.frameHeight, frameDepth);
        const frameShort1 = new THREE.Mesh(frameShortGeo, woodMaterial);
        frameShort1.position.set(this.width/2 + this.frameThickness/2, this.frameHeight/2, 0);
        frameShort1.castShadow = true;
        this.group.add(frameShort1);
        
        const frameShort2 = frameShort1.clone();
        frameShort2.position.set(-this.width/2 - this.frameThickness/2, this.frameHeight/2, 0);
        this.group.add(frameShort2);
        
        // Bandas de goma (6 cojines)
        const cushionHeight = 0.5;
        const cushionThickness = 0.4;
        
        // Cojines largos
        const cushionLongGeo = new THREE.BoxGeometry(this.width, cushionHeight, cushionThickness);
        const cushion1 = new THREE.Mesh(cushionLongGeo, rubberMaterial);
        cushion1.position.set(0, this.frameHeight + cushionHeight/2, this.height/2 - cushionThickness/2);
        this.group.add(cushion1);
        
        const cushion2 = cushion1.clone();
        cushion2.position.set(0, this.frameHeight + cushionHeight/2, -this.height/2 + cushionThickness/2);
        this.group.add(cushion2);
        
        // Cojines cortos
        const cushionShortGeo = new THREE.BoxGeometry(cushionThickness, cushionHeight, this.height);
        const cushion3 = new THREE.Mesh(cushionShortGeo, rubberMaterial);
        cushion3.position.set(this.width/2 - cushionThickness/2, this.frameHeight + cushionHeight/2, 0);
        this.group.add(cushion3);
        
        const cushion4 = cushion3.clone();
        cushion4.position.set(-this.width/2 + cushionThickness/2, this.frameHeight + cushionHeight/2, 0);
        this.group.add(cushion4);
        
        // Patas (4 cilindros) - Más altas para ver bajo la mesa
        const legGeo = new THREE.CylinderGeometry(0.4, 0.3, this.legHeight, 16);
        const legPositions = [
            [-6, -this.legHeight/2 + 0.3, -2.5],
            [6, -this.legHeight/2 + 0.3, -2.5],
            [-6, -this.legHeight/2 + 0.3, 2.5],
            [6, -this.legHeight/2 + 0.3, 2.5]
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, woodMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            this.group.add(leg);
        });
        
        // Troneras (6) - Más grandes para ser visibles
        const pocketGeo = new THREE.CylinderGeometry(0.5, 0.4, 0.6, 16);
        const pocketPositions = [
            { pos: [-7, 0.5, -3.5], id: 'tl' },
            { pos: [0, 0.5, -3.5], id: 'tc' },
            { pos: [7, 0.5, -3.5], id: 'tr' },
            { pos: [-7, 0.5, 3.5], id: 'bl' },
            { pos: [0, 0.5, 3.5], id: 'bc' },
            { pos: [7, 0.5, 3.5], id: 'br' }
        ];
        
        pocketPositions.forEach(pocketData => {
            const pocket = new THREE.Mesh(pocketGeo, metalMaterial);
            pocket.position.set(...pocketData.pos);
            pocket.userData = { id: pocketData.id };
            this.pockets.push(pocket);
            this.group.add(pocket);
        });
        
        // Bola blanca
        const ballGeo = new THREE.SphereGeometry(0.25, 32, 32);
        const ballMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        const cueBall = new THREE.Mesh(ballGeo, ballMaterial);
        cueBall.position.set(0, 0.4, 0);
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
            new THREE.Vector3(0, 0.16, -this.height/2 + 0.5),
            new THREE.Vector3(0, 0.16, this.height/2 - 0.5)
        ]);
        const centerLine = new THREE.Line(centerLineGeo, lineMaterial);
        this.group.add(centerLine);
        
        // Círculo central
        const circleGeo = new THREE.RingGeometry(0.4, 0.42, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            opacity: 0.3,
            transparent: true,
            side: THREE.DoubleSide
        });
        const centerCircle = new THREE.Mesh(circleGeo, circleMaterial);
        centerCircle.rotation.x = -Math.PI / 2;
        centerCircle.position.set(0, 0.16, 0);
        this.group.add(centerCircle);
        
        scene.add(this.group);
        this.mesh = this.group;
    },
    
    update(delta) {
        this.updatePocketMarkers();
    },
    
    updatePocketMarkers() {
        const pocketWorldPositions = [
            { id: 'tl', pos: new THREE.Vector3(-7, 0.9, -3.5) },
            { id: 'tc', pos: new THREE.Vector3(0, 0.9, -3.5) },
            { id: 'tr', pos: new THREE.Vector3(7, 0.9, -3.5) },
            { id: 'bl', pos: new THREE.Vector3(-7, 0.9, 3.5) },
            { id: 'bc', pos: new THREE.Vector3(0, 0.9, 3.5) },
            { id: 'br', pos: new THREE.Vector3(7, 0.9, 3.5) }
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
            'tl': new THREE.Vector3(-7, 0.5, -3.5),
            'tc': new THREE.Vector3(0, 0.5, -3.5),
            'tr': new THREE.Vector3(7, 0.5, -3.5),
            'bl': new THREE.Vector3(-7, 0.5, 3.5),
            'bc': new THREE.Vector3(0, 0.5, 3.5),
            'br': new THREE.Vector3(7, 0.5, 3.5)
        };
        return positions[id];
    }
};
window.Table = Table;
