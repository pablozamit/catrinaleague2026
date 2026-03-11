// Radio.js - Radio interactiva vintage

const Radio = {
    mesh: null,
    group: null,
    isOn: false,
    light: null,
    onActivate: null,
    
    // Partes
    parts: {},
    
    init(scene) {
        this.group = new THREE.Group();
        
        // Materiales
        const caseMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,  // Marrón vintage
            roughness: 0.6,
            metalness: 0.3
        });
        
        const grillMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.8
        });
        
        const knobMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.9
        });
        
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0x000000,
            emissiveIntensity: 0
        });
        
        // Cuerpo del radio
        const caseGeo = new THREE.BoxGeometry(0.3, 0.2, 0.12);
        this.parts.case = new THREE.Mesh(caseGeo, caseMaterial);
        this.parts.case.castShadow = true;
        this.parts.case.receiveShadow = true;
        this.group.add(this.parts.case);
        
        // Rejilla del altavoz
        const grillGeo = new THREE.PlaneGeometry(0.18, 0.12);
        this.parts.grill = new THREE.Mesh(grillGeo, grillMaterial);
        this.parts.grill.position.set(-0.05, 0, 0.061);
        this.group.add(this.parts.grill);
        
        // Agujeros en la rejilla (detalles)
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                const holeGeo = new THREE.CircleGeometry(0.008, 8);
                const hole = new THREE.Mesh(holeGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
                hole.position.set(-0.1 + i * 0.025, 0.04 - j * 0.03, 0.065);
                this.group.add(hole);
            }
        }
        
        // Dial/Perilla de volumen
        const dialGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16);
        this.parts.dial = new THREE.Mesh(dialGeo, knobMaterial);
        this.parts.dial.rotation.x = Math.PI / 2;
        this.parts.dial.position.set(0.1, 0.05, 0.065);
        this.group.add(this.parts.dial);
        
        // Indicador de encendido (luz)
        const indicatorGeo = new THREE.CircleGeometry(0.015, 16);
        this.parts.indicator = new THREE.Mesh(indicatorGeo, lightMaterial);
        this.parts.indicator.position.set(0.1, -0.02, 0.065);
        this.group.add(this.parts.indicator);
        
        // Antena (plegada)
        const antennaGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.08, 8);
        this.parts.antenna = new THREE.Mesh(antennaGeo, new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.2
        }));
        this.parts.antenna.position.set(-0.12, 0.12, 0);
        this.parts.antenna.rotation.z = -Math.PI / 6;
        this.group.add(this.parts.antenna);
        
        // Asa del radio
        const handleGeo = new THREE.TorusGeometry(0.08, 0.005, 8, 16, Math.PI);
        this.parts.handle = new THREE.Mesh(handleGeo, knobMaterial);
        this.parts.handle.position.set(0, 0.12, 0);
        this.parts.handle.rotation.z = Math.PI;
        this.group.add(this.parts.handle);
        
        // Luz puntual cuando está encendida
        this.light = new THREE.PointLight(0xffaa00, 0, 3);
        this.light.position.set(0, 0.2, 0);
        this.group.add(this.light);
        
        // Posición: junto al hombre, bajo la mesa
        this.group.position.set(0.8, 0.12, 0.3);
        this.group.rotation.y = -Math.PI / 4;
        
        // Hacer interactivo
        this.parts.case.userData = { isRadio: true };
        this.parts.grill.userData = { isRadio: true };
        this.parts.dial.userData = { isRadio: true };
        
        // Raycaster para clicks
        this.setupInteraction(scene);
        
        scene.add(this.group);
        this.mesh = this.group;
    },
    
    setupInteraction(scene) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        const onClick = (event) => {
            if (Game.state !== 'landing') return;
            
            // Calcular posición del mouse
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, Scene.camera);
            const intersects = raycaster.intersectObjects(this.group.children);
            
            if (intersects.length > 0) {
                // Click en el radio
                this.activate();
            }
        };
        
        const onTouch = (event) => {
            if (Game.state !== 'landing') return;
            if (!event.changedTouches || !event.changedTouches[0]) return;
            
            mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, Scene.camera);
            const intersects = raycaster.intersectObjects(this.group.children);
            
            if (intersects.length > 0) {
                event.preventDefault();
                this.activate();
            }
        };
        
        document.addEventListener('click', onClick);
        document.addEventListener('touchend', onTouch, { passive: false });
    },
    
    activate() {
        if (this.isOn) return;
        
        this.isOn = true;
        
        // Encender luz
        this.parts.indicator.material.emissive.setHex(0xff0000);
        this.parts.indicator.material.emissiveIntensity = 2;
        
        // Luz de ambiente del radio
        this.light.intensity = 1;
        
        // Animar perilla
        this.animateKnob();
        
        // Efecto de ondas de sonido visuales
        this.createSoundWaves();
        
        // Callback para activar el juego
        if (this.onActivate) {
            setTimeout(() => {
                this.onActivate();
            }, 500);
        }
    },
    
    animateKnob() {
        const startRot = this.parts.dial.rotation.y;
        const targetRot = startRot + Math.PI * 2;
        const duration = 300;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            this.parts.dial.rotation.y = startRot + (targetRot - startRot) * ease;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    },
    
    createSoundWaves() {
        // Crear anillos visuales que se expanden
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const waveGeo = new THREE.RingGeometry(0.1, 0.15, 32);
                const waveMat = new THREE.MeshBasicMaterial({
                    color: 0xd4af37,
                    transparent: true,
                    opacity: 0.8,
                    side: THREE.DoubleSide
                });
                const wave = new THREE.Mesh(waveGeo, waveMat);
                wave.position.copy(this.group.position);
                wave.position.y += 0.1;
                wave.rotation.x = -Math.PI / 2;
                Scene.scene.add(wave);
                
                // Animar expansión
                const animateWave = () => {
                    wave.scale.multiplyScalar(1.02);
                    waveMat.opacity -= 0.01;
                    
                    if (waveMat.opacity > 0) {
                        requestAnimationFrame(animateWave);
                    } else {
                        Scene.scene.remove(wave);
                    }
                };
                
                animateWave();
            }, i * 200);
        }
    },
    
    update(delta) {
        if (this.isOn) {
            // Pulso sutil de la luz
            const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.2;
            this.light.intensity = pulse;
        }
    }
};
