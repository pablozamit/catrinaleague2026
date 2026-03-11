# Juego "La Búsqueda" - Portada de La Catrina Pool League

## Fecha de implementación
11 de marzo de 2026

## Archivos modificados
- `index.html` (portada de la web)

## Mecánicas del juego

### Objetivo
Encontrar al hombre bajo la mesa y su radio vintage para ganar puntos.

### Jugabilidad
1. **Fase 1**: Buscar al hombre bajo la mesa
   - Haz clic en el hombre para encontrarlo
   - Puntos: 100
   - Mensaje: "Detective"

2. **Fase 2**: Buscar la radio vintage
   - Solo disponible después de encontrar al hombre
   - Haz clic en la radio para encontrarla
   - Puntos: 200
   - Mensaje: "Cazador de Secretos"

### Puntuación
- Hombre encontrado: +100 puntos
- Radio encontrada: +200 puntos
- Total máximo: 300 puntos

## Elementos visuales añadidos

### 1. Indicador de estado del juego
- Ubicación: Parte superior central
- Muestra el estado actual:
  - "🔍 Busca al hombre bajo la mesa..."
  - "📻 Ahora busca la radio vintage..."
  - "🎉 ¡Has encontrado todo! Score: [puntos]"

### 2. Panel de logros
- Ubicación: Parte inferior central
- Aparece al desbloquear logros:
  - "🏆 Detective" - Encontrar al hombre
  - "🏆 Cazador de Secretos" - Encontrar ambos objetos

### 3. Mensaje de bienvenida
- Aparece al cargar la página
- Muestra instrucciones del juego
- Botón para empezar a jugar

### 4. Efectos visuales
- **Ripple effect**: Onda expansiva al hacer clic en objetos
  - Color dorado para el hombre
  - Color verde para la radio
- **Escala**: Los objetos se agrandan ligeramente al ser clickeados

## Código implementado

### Estado del juego (gameState)
```javascript
const gameState = {
    foundMan: false,      // ¿Encontrado el hombre?
    foundRadio: false,    // ¿Encontrada la radio?
    clicks: 0,            // Total de clics
    startTime: Date.now(), // Tiempo de inicio
    score: 0              // Puntuación total
};
```

### Sistema de logros (achievements)
```javascript
const achievements = {
    firstFind: false,     // Primer objeto encontrado
    bothFound: false,     // Ambos objetos encontrados
    perfectScore: false   // Puntuación perfecta
};
```

### Funciones principales
1. `updateGameIndicator()`: Actualiza el texto del indicador
2. `onGameClick()`: Maneja los clics en objetos clickeables
3. `createRippleEffect()`: Crea efecto visual al hacer clic
4. `showAchievement()`: Muestra logros desbloqueados

## Interactividad

### Objetos clickeables
- **Hombre bajo la mesa**: Clic para encontrar (100 puntos)
- **Radio vintage**: Clic para encontrar (200 puntos, requiere encontrar al hombre primero)

### Restricciones
- La radio solo es clickeable después de encontrar al hombre
- Los clics en la radio antes de tiempo no cuentan

## Estilos visuales

### Colores del juego
- **Dorado (#d4af37)**: Para el hombre y logros principales
- **Verde (#4ade80)**: Para la radio y éxito
- **Fondo oscuro**: Para todos los paneles del juego

### Animaciones
- **Ripple**: Onda expansiva que crece y desaparece
- **Scale**: Los objetos se agrandan al ser clickeados
- **Fade**: Mensajes aparecen/desaparecen suavemente

## Integración con la web existente

### Elementos que se mantienen
- ✅ Iluminación original de la escena
- ✅ Controles de cámara (arrastrar para rotar)
- ✅ Troneras navegables (reglas, ranking, liga, historial)
- ✅ Paleta de colores original
- ✅ Mensaje de carga

### Elementos añadidos
- ✅ Sistema de juego con puntuación
- ✅ Indicador de estado
- ✅ Panel de logros
- ✅ Mensaje de bienvenida
- ✅ Efectos visuales

## Próximos pasos sugeridos

Para expandir el juego, se podrían añadir:
1. **Temporizador**: Límite de tiempo para encontrar objetos
2. **Niveles**: Diferentes dificultades con más objetos
3. **Bonus**: Puntos extra por rapidez
4. **Sonido**: Efectos de audio al encontrar objetos
5. **Múltiples escenas**: Diferentes ubicaciones en el bar

## Verificación

Para probar el juego:
1. Abrir `file:///C:/Users/paulm/Downloads/Apps/catrina2026/catrinalleague2026/index.html`
2. Leer el mensaje de bienvenida y hacer clic en "¡JUGAR!"
3. Arrastrar la cámara para ver bajo la mesa
4. Hacer clic en el hombre (puntos: 100)
5. Hacer clic en la radio (puntos: 200)
6. Ver la puntuación total en el indicador
