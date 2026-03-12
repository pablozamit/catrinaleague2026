// Radio.js - Radio vintage escala proporcional

const Radio = {
    mesh: null,
    group: null,
    isOn: false,
    light: null,
    onActivate: null,
    parts: {},
    
  // Escala: radio ~25cm real → ~1.4 unidades (×0.4)
  scale: 0.4,
    
    init(scene) {
        this.group = new THREE.Group();
        const s = this.scale;
        
        // Materiales
        const caseMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
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
        const caseGeo = new THREE.BoxGeometry(1.4 * s, 0.9 * s, 0.5 * s);
        this.parts.case = new THREE.Mesh(caseGeo, caseMaterial);
        this.parts.case.castShadow = true;
        this.parts.case.receiveShadow = true;
        this.group.add(this.parts.case);
        
        // Rejilla del altavoz
        const grillGeo = new THREE.PlaneGeometry(0.9 * s, 0.6 * s);
        this.parts.grill = new THREE.Mesh(grillGeo, grillMaterial);
        this.parts.grill.position.set(-0.3 * s, 0, 0.26 * s);
        this.group.add(this.parts.grill);
        
        // Agujeros en la rejilla
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                const holeGeo = new THREE.CircleGeometry(0.04 * s, 8);
                const hole = new THREE.Mesh(holeGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
                hole.position.set((-0.5 + i * 0.14) * s, (0.25 - j * 0.17) * s, 0.28 * s);
                this.group.add(hole);
            }
        }
        
        // Dial/Perilla
        const dialGeo = new THREE.CylinderGeometry(0.12 * s, 0.12 * s, 0.08 * s, 16);
        this.parts.dial = new THREE.Mesh(dialGeo, knobMaterial);
        this.parts.dial.rotation.x = Math.PI / 2;
        this.parts.dial.position.set(0.5 * s, 0.15 * s, 0.27 * s);
        this.group.add(this.parts.dial);
        
        // Indicador de encendido
        const indicatorGeo = new THREE.CircleGeometry(0.07 * s, 16);
        this.parts.indicator = new THREE.Mesh(indicatorGeo, lightMaterial);
        this.parts.indicator.position.set(0.5 * s, -0.1 * s, 0.28 * s);
        this.group.add(this.parts.indicator);
        
        // Antena
        const antennaGeo = new THREE.CylinderGeometry(0.01 * s, 0.01 * s, 0.4 * s, 8);
        this.parts.antenna = new THREE.Mesh(antennaGeo, new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.2
        }));
        this.parts.antenna.position.set(-0.6 * s, 0.55 * s, 0);
        this.parts.antenna.rotation.z = -Math.PI / 6;
        this.group.add(this.parts.antenna);
        
        // Asa
        const handleGeo = new THREE.TorusGeometry(0.4 * s, 0.03 * s, 8, 16, Math.PI);
        this.parts.handle = new THREE.Mesh(handleGeo, knobMaterial);
        this.parts.handle.position.set(0, 0.5 * s, 0);
        this.parts.handle.rotation.z = Math.PI;
        this.group.add(this.parts.handle);
        
        // Luz
        this.light = new THREE.PointLight(0xffaa00, 0, 15);
        this.light.position.set(0, 1 * s, 0);
        this.group.add(this.light);
        
    // Posición: junto al hombre, bajo la mesa (escala grande)
    this.group.position.set(3, -1.8, 1);
        this.group.rotation.y = -Math.PI / 4;
        
        // Interactividad
        this.parts.case.userData = { isRadio: true };
        this.parts.grill.userData = { isRadio: true };
        
        this.setupInteraction(scene);
        
        scene.add(this.group);
        this.mesh = this.group;
    },
    
    setupInteraction(scene) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        const onClick = (event) => {
            if (Game && Game.state !== 'landing') return;
            
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, Scene.camera);
            const intersects = raycaster.intersectObjects(this.group.children);
            
            if (intersects.length > 0) {
                this.activate();
            }
        };
        
        const onTouch = (event) => {
            if (Game && Game.state !== 'landing') return;
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
        
        this.parts.indicator.material.emissive.setHex(0xff0000);
        this.parts.indicator.material.emissiveIntensity = 2;
        
        this.light.intensity = 1;
        
        this.animateKnob();
        this.createSoundWaves();
        
        if (this.onActivate) {
            setTimeout(() => {
                this.onActivate();
            }, 500);
        }
    },
    
    animateKnob() {
        const startRot = this.parts.dial.rotation.y;
        const targetRot = startRot + Math.PI * 2;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / 300, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            this.parts.dial.rotation.y = startRot + (targetRot - startRot) * ease;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    },
    
    createSoundWaves() {
        const s = this.scale;
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const waveGeo = new THREE.RingGeometry(0.5 * s, 0.8 * s, 32);
                const waveMat = new THREE.MeshBasicMaterial({
                    color: 0xd4af37,
                    transparent: true,
                    opacity: 0.8,
                    side: THREE.DoubleSide
                });
                const wave = new THREE.Mesh(waveGeo, waveMat);
                wave.position.copy(this.group.position);
                wave.position.y += 0.5 * s;
                wave.rotation.x = -Math.PI / 2;
                Scene.scene.add(wave);
                
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
            const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.2;
            this.light.intensity = pulse;
        }
    }
};
window.Radio = Radio;
