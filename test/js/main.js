// Main.js - Punto de entrada

window.addEventListener('DOMContentLoaded', () => {
    console.log('🎱 Iniciando La Catrina 3D...');
    console.log('Version: 1.0.0');
    console.log('Engine: Three.js');
    console.log('Stack: WebGL + Tone.js');
    
    // Inicializar en orden
    try {
        // 1. Escena y renderer
        Scene.init();
        console.log('✅ Scene inicializado');
        
        // 2. Mesa
        Table.init(Scene.scene);
        console.log('✅ Table creado');
        
        // 3. Hombre
        Man.init(Scene.scene);
        console.log('✅ Man creado');
        
        // 4. Radio
        Radio.init(Scene.scene);
        console.log('✅ Radio creada');
        
        // 5. Audio
        Audio.init();
        console.log('✅ Audio inicializado');
        
        // 6. Joystick
        Joystick.init();
        console.log('✅ Joystick inicializado');
        
        // 7. Game logic
        Game.init();
        console.log('✅ Game inicializado');
        
        // Ocultar loading
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 500);
            }
            
            // Mostrar marcadores
            document.querySelectorAll('.pocket-marker').forEach(m => {
                m.classList.add('visible');
            });
            
            console.log('✅ Escena completamente cargada');
            console.log('📖 Instrucciones:');
            console.log(' - Arrastra para rotar la cámara');
            console.log(' - Click en troneras para navegar');
            console.log(' - Pulsa la radio para jugar');
            
        }, 1500);
        
    } catch (error) {
        console.error('❌ Error al cargar:', error);
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = 'Error al cargar la escena<br><small>Revisa la consola</small>';
            loading.style.color = '#ff6666';
        }
    }
});

// Prevenir comportamientos no deseados en móvil
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

// Prevenir zoom en móvil
document.addEventListener('touchmove', (e) => {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });

// Favicon animado
const faviconCanvas = document.createElement('canvas');
faviconCanvas.width = 32;
faviconCanvas.height = 32;
const faviconCtx = faviconCanvas.getContext('2d');

function updateFavicon() {
    const time = Date.now() * 0.005;
    const rotation = Math.sin(time) * 0.15;
    
    faviconCtx.clearRect(0, 0, 32, 32);
    
    const cx = 16;
    const cy = 16;
    const radius = 14;
    
    const gradient = faviconCtx.createRadialGradient(
        cx - 3, cy - 3, 0,
        cx, cy, radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#ffffff');
    gradient.addColorStop(0.5, '#0a0a0a');
    gradient.addColorStop(1, '#000000');
    
    faviconCtx.beginPath();
    faviconCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    faviconCtx.fillStyle = gradient;
    faviconCtx.fill();
    
    faviconCtx.save();
    faviconCtx.translate(cx, cy);
    faviconCtx.scale(1 + rotation * 0.5, 1);
    faviconCtx.translate(-cx, -cy);
    
    faviconCtx.fillStyle = '#ffffff';
    faviconCtx.font = 'bold 14px Arial';
    faviconCtx.textAlign = 'center';
    faviconCtx.textBaseline = 'middle';
    faviconCtx.fillText('8', cx, cy + 1);
    
    faviconCtx.restore();
    
    faviconCtx.beginPath();
    faviconCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    faviconCtx.strokeStyle = '#d4af37';
    faviconCtx.lineWidth = 2;
    faviconCtx.stroke();
    
    const link = document.getElementById('favicon');
    if (link) {
        link.href = faviconCanvas.toDataURL('image/png');
    }
    
    requestAnimationFrame(updateFavicon);
}

updateFavicon();
