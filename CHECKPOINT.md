# CHECKPOINT - Proyecto La Catrina Pool League

## Fecha del checkpoint
14 de Febrero 2026

## Estado actual del proyecto

### Estructura del repositorio
```
catrinaleague2026/
├── index.html          # Página principal con mesa 3D (Three.js)
├── reglas/
│   └── index.html      # Reglas de la liga
├── elo/
│   └── index.html      # Ranking ELO
├── material/
│   ├── ESPECIFICACIONES.txt
│   ├── imagen1.jpeg    # Mesa de billar (foto)
│   ├── imagen2.jpeg    # Fondo de bar (foto)
│   └── imagen4.jpeg    # Bola blanca (foto)
├── sounds/
│   └── (vacío - necesita ball-roll.mp3 y ball-pocket.mp3)
├── node_modules/
├── package.json
└── .git/
```

### Funcionalidades implementadas

#### Página principal (index.html)
- **Mesa de billar 3D** con Three.js:
  - Geometría completa (tablero, marco, patas, bandas)
  - Iluminación dinámica (spotlight, ambiental, rim light)
  - Sombras reales
  - Materiales PBR (fieltro, madera, goma, bola)
- **Cámara orbital**: Arrastrar para rotar alrededor de la mesa
- **6 troneras** con marcadores HTML:
  - 📋 Reglas (superior izquierda)
  - 🏆 Ranking ELO (superior centro)
  - 🔒 4 troneras bloqueadas
- **Interacción**: Click en troneras para navegar
- **Animación de bola**: Se mueve hacia la tronera seleccionada
- **Fondo**: Foto del bar con overlay oscuro
- **UI**: Header con título, instrucciones, marcadores flotantes

#### Página de Reglas (/reglas/)
- Contenido original de "Pirate Pool League"
- Reglas en español e inglés
- Gráficos con Chart.js
- Diseño responsive

#### Página de Ranking ELO (/elo/)
- Ranking de 52 jugadores
- Fecha de actualización: 26/12/2025
- ELO con cambios respecto a actualización anterior
- Top 3 destacados
- Estilo oscuro con dorado

### Tecnologías utilizadas
- **Three.js r128** (3D WebGL)
- **HTML5 + CSS3** (UI y estilos)
- **JavaScript vanilla** (interactividad)
- **Git** (control de versiones)

### Pendientes / Mejoras futuras
1. **Sonidos**: Agregar ball-roll.mp3 y ball-pocket.mp3 en carpeta sounds/
2. **Mejoras visuales 3D**:
   - Mejores texturas para madera y fieltro
   - Iluminación más dramática
   - Efectos de partículas (polvo)
   - Reflejos más realistas en la bola
3. **Optimización**: Reducir polígonos para móviles
4. **Responsive**: Mejor adaptación a pantallas pequeñas
5. **Nuevas funcionalidades**:
   - Animación de caída mejorada
   - Efectos de sonido sincronizados
   - Más secciones desbloqueables

### Último commit
`b06b037` - Agrega marcadores HTML sobre troneras 3D

### URL del proyecto
https://catrinaleague2026.vercel.app

### Repositorio GitHub
https://github.com/pablozamit/catrinaleague2026

---

## CÓMO CONTINUAR DESDE ESTE CHECKPOINT

### Para retomar el trabajo:
1. Clonar el repositorio: `git clone https://github.com/pablozamit/catrinaleague2026.git`
2. Instalar dependencias: `npm install` (si se usa Three.js desde npm)
3. O simplemente abrir index.html en un servidor web

### Archivos clave para modificar:
- **index.html**: Página principal con Three.js
- **reglas/index.html**: Contenido de reglas
- **elo/index.html**: Contenido del ranking
- **material/**: Imágenes y recursos

### Mejoras sugeridas a discutir:
1. Texturas de alta calidad para la mesa
2. Iluminación tipo "lámpara de billar"
3. Modelo 3D más detallado de troneras
4. Efectos de post-procesado (bloom, profundidad de campo)
5. Interacción táctil mejorada

---

## Notas importantes
- El proyecto usa Three.js desde CDN (no requiere build)
- Las troneras usan Raycaster para detección de clicks
- Los marcadores HTML se sincronizan con posición 3D en tiempo real
- Compatible con mouse y touch (móviles)
