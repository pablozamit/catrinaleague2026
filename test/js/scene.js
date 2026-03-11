// Scene.js - Configuración base de Three.js

const Scene = {
    scene: null,
    camera: null,
    renderer: null,
    clock: new THREE.Clock(),
    
    // Controles
    isRotating: false,
    previousMousePosition: { x: 0, y: 0 },
    cameraAngle: 0,
    cameraHeight: 12,
    cameraRadius: 18,
    
    init() {
        // Escena
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 10, 50);
        
        // Cámara
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 12, 18);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Luces
        this.setupLights();
        
        // Eventos
        this.setupEvents();
        
        // Iniciar loop
        this.animate();
    },
    
    setupLights() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        // Luz spot principal (sobre la mesa)
        const spotLight = new THREE.SpotLight(0xffeebb, 1.5);
        spotLight.position.set(0, 20, 5);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        spotLight.decay = 2;
        spotLight.distance = 50;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;
        this.scene.add(spotLight);
        
        // Luz de borde (dorada)
        const rimLight = new THREE.DirectionalLight(0xd4af37, 0.5);
        rimLight.position.set(-10, 10, -10);
        this.scene.add(rimLight);
        
        // Luz bajo la mesa (para el hombre)
        this.underTableLight = new THREE.PointLight(0xffffff, 0.3, 8);
        this.underTableLight.position.set(0, -2, 0);
        this.scene.add(this.underTableLight);
    },
    
    setupEvents() {
        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Mouse para rotar cámara
        document.addEventListener('mousedown', (e) => {
            if (e.target.closest('#joystick-zone')) return; // No rotar si está en joystick
            this.isRotating = true;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        document.addEventListener('mouseup', () => {
            this.isRotating = false;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isRotating || Game.state === 'game') return;
            
            const deltaMove = {
                x: e.clientX - this.previousMousePosition.x,
                y: e.clientY - this.previousMousePosition.y
            };
            
            this.cameraAngle -= deltaMove.x * 0.01;
            this.cameraHeight += deltaMove.y * 0.05;
            this.cameraHeight = Math.max(5, Math.min(20, this.cameraHeight));
            
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
            this.updateCameraPosition();
        });
        
        // Touch events para móvil
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('#joystick-zone')) return;
            if (e.touches && e.touches[0]) {
                this.isRotating = true;
                this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        }, { passive: false });
        
        document.addEventListener('touchend', () => {
            this.isRotating = false;
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.isRotating || Game.state === 'game' || !e.touches || !e.touches[0]) return;
            
            const deltaMove = {
                x: e.touches[0].clientX - this.previousMousePosition.x,
                y: e.touches[0].clientY - this.previousMousePosition.y
            };
            
            this.cameraAngle -= deltaMove.x * 0.01;
            this.cameraHeight += deltaMove.y * 0.05;
            this.cameraHeight = Math.max(5, Math.min(20, this.cameraHeight));
            
            this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            this.updateCameraPosition();
        }, { passive: false });
    },
    
    updateCameraPosition() {
        this.camera.position.x = Math.sin(this.cameraAngle) * this.cameraRadius;
        this.camera.position.z = Math.cos(this.cameraAngle) * this.cameraRadius;
        this.camera.position.y = this.cameraHeight;
        this.camera.lookAt(0, 0, 0);
    },
    
    setGameCamera(position, lookAt) {
        // Suave transición a cámara de juego
        const startPos = this.camera.position.clone();
        const targetPos = new THREE.Vector3(...position);
        const startTarget = new THREE.Vector3(0, 0, 0);
        const endTarget = new THREE.Vector3(...lookAt);
        
        let progress = 0;
        const duration = 2000; // 2 segundos
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPos, targetPos, ease);
            const currentLookAt = new THREE.Vector3().lerpVectors(startTarget, endTarget, ease);
            this.camera.lookAt(currentLookAt);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    },
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Actualizar componentes
        if (Table.mesh) Table.update(delta);
        if (Man.mesh) Man.update(delta);
        if (Radio.mesh) Radio.update(delta);
        
        this.renderer.render(this.scene, this.camera);
    }
};
