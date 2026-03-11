// Script para crear modelos 3D simples en formato GLB usando Three.js
const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');
const fs = require('fs');

// Crear escena para el hombre
const manScene = new THREE.Group();

// Cuerpo (más anatómico)
const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.25, 1.2, 16);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.8 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.6;
manScene.add(body);

// Cabeza
const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 });
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 1.35;
manScene.add(head);

// Cuello
const neckGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.2, 16);
const neck = new THREE.Mesh(neckGeometry, headMaterial);
neck.position.y = 1.1;
manScene.add(neck);

// Exportar a GLB
const exporter = new GLTFExporter();
exporter.parse(manScene, (gltf) => {
    const binary = gltf instanceof ArrayBuffer ? gltf : gltf.binary;
    fs.writeFileSync('public/assets/man_simple.glb', Buffer.from(binary));
    console.log('Modelo de hombre creado: public/assets/man_simple.glb');
}, { binary: true });

// Crear escena para la radio
const radioScene = new THREE.Group();

// Cuerpo principal
const radioBodyGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.3);
const radioBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.6 });
const radioBody = new THREE.Mesh(radioBodyGeometry, radioBodyMaterial);
radioScene.add(radioBody);

// Dial
const dialGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.15);
const dialMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4 });
const dial = new THREE.Mesh(dialGeometry, dialMaterial);
dial.position.set(0.15, 0.2, 0);
radioScene.add(dial);

// Exportar a GLB
exporter.parse(radioScene, (gltf) => {
    const binary = gltf instanceof ArrayBuffer ? gltf : gltf.binary;
    fs.writeFileSync('public/assets/vintage_radio_simple.glb', Buffer.from(binary));
    console.log('Modelo de radio creado: public/assets/vintage_radio_simple.glb');
}, { binary: true });
