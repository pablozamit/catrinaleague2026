# Mejora del diseño del hombre bajo la mesa

## Fecha de implementación
11 de marzo de 2026

## Archivos modificados
- `index.html` (portada de la web)

## Cambios realizados

### 1. Hombre bajo la mesa - Diseño realista

**Antes (líneas 433-476):**
- Geometría primitiva (cajas y cilindros simples)
- Sin detalles faciales
- Sin accesorios

**Ahora (líneas 433-516):**
- **Torso**: Más realista con cuello integrado
- **Cabeza**: Esfera de mayor resolución con:
  - Cabello (semi-esfera)
  - Ojos (dos esferas pequeñas)
  - Cuello conectando cabeza y torso
- **Piernas**: Cilindros de mayor resolución (12 segmentos vs 8)
- **Brazos**: Cilindros de mayor resolución con forma más anatómica
- **Cinturón**: Añadido como detalle realista
- **Materiales mejorados**: Roughness y metalness ajustados para realismo

### 2. Radio de pintor años 90

**Nueva sección añadida (líneas 518-571):**

**Características:**
- **Cuerpo principal**: 0.35 x 0.2 x 0.15 unidades
- **Parte superior**: Detalle en color más oscuro
- **Dial/número**: Área central para sintonización
- **Perilla giratoria**: Cilindro pequeño en lateral
- **Antena retráctil**: 0.3 unidades de altura
- **Clip para cinturón**: Detalle lateral

**Materiales:**
- Cuerpo: Gris oscuro (0x3d3d3d)
- Detalles: Gris más oscuro (0x2a2a2a)
- Antena: Gris metálico (0x666666)

**Posición:**
- Coordenadas: x=1.2, y=-3.6, z=0.8
- Rotación: -PI/4 (45 grados)
- Colocada al lado del hombre, sobre el suelo

## Detalles técnicos

### Geometría del hombre
- **Resolución**: Mayor cantidad de segmentos para suavizado
- **Jerarquía**: Uso de grupos (Group) para organizar piezas
- **Posición**: Mantenida respecto a la mesa (y=-3.7 para torso base)

### Paleta de colores
- **Mantenida**: Igual que la versión anterior
- **Piel**: 0xffdbac (tono cálido)
- **Camisa**: 0x2c3e50 (azul oscuro)
- **Pantalones**: 0x1a1a1a (negro)
- **Cabello**: 0x2d1810 (marrón oscuro)

### Iluminación
- **Sin cambios**: Mismo sistema de iluminación
- SpotLight principal
- AmbientLight
- RimLight (direccional)

## Próximos pasos sugeridos para juego

Para convertir la portada en un juego, se podrían añadir:

1. **Interactividad con el hombre**:
   - Clic para activar animación
   - Mensaje de diálogo

2. **Interactividad con la radio**:
   - Clic para "encender" (cambiar material/emisión)
   - Efectos de sonido

3. **Mecánicas de juego**:
   - Puzzle: Encontrar objetos bajo la mesa
   - Timing: Alinear something con la radio
   - Exploración: Descubrir detalles ocultos

## Verificación visual

Para ver los cambios:
1. Abrir `file:///C:/Users/paulm/Downloads/Apps/catrina2026/catrinalleague2026/index.html`
2. Arrastrar para rotar la cámara
3. Mirar bajo la mesa para ver el hombre y la radio
