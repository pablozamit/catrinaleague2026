# PROCEDURES.md - Procedimientos del Proyecto La Catrina Pool League

**Proyecto**: La Catrina Pool League 2026
**Última actualización**: 11 de marzo de 2026

---

## 🔄 PROCEDIMIENTOS REGULARES

### 1. Subir cambios a GitHub y desplegar en Vercel

**Cuándo usar**: Después de cada tarea completada

**Pasos**:
1. Verificar cambios: `git status`
2. Añadir archivos modificados: `git add [archivos]`
3. Hacer commit: `git commit -m "Mensaje descriptivo"`
4. Subir a GitHub: `git push origin main`

**Ejemplo**:
```bash
cd /c/Users/paulm/Downloads/Apps/catrina2026/catrinaleague2026
git add index.html
git commit -m "Mejora diseño hombre bajo la mesa"
git push origin main
```

**Nota**: Vercel despliega automáticamente desde GitHub (2-5 minutos)

---

### 2. Ocultar partidas del historial

**Cuándo usar**: Cuando se necesita reiniciar el historial

**Script**: `ocultar_historial_actual.js`

**Pasos**:
1. Ejecutar el script: `node ocultar_historial_actual.js`
2. Confirmar con 's' cuando pregunte
3. Verificar resultado: `node verificar_ocultamiento.js`

**Resultado**: Todas las partidas tendrán `hidden: true`

---

### 3. Actualizar ELO masivamente

**Cuándo usar**: Cuando hay resultados de partidas para procesar

**Script**: `actualizar_elo_masivo_final.js`

**Formato de entrada**: Array de resultados en el código

**Ejemplo**:
```javascript
const resultados = [
    { winner: 'amauris', loser: 'joe', tipo: 'torneo' },
    { winner: 'johnny', loser: 'lucas', tipo: 'torneo' },
    // ... más resultados
];
```

**Pasos**:
1. Editar el script con los resultados
2. Ejecutar: `node actualizar_elo_masivo_final.js`
3. Verificar: `node verificar_usuarios.js`

---

### 4. Verificar estado del proyecto

**Scripts disponibles**:
- `verificar_usuarios.js` - ELO y estadísticas de usuarios
- `verificar_ocultamiento.js` - Estado de ocultación de partidas
- `consultar_todas_las_partidas.js` - Listado completo de partidas

**Uso**:
```bash
node verificar_usuarios.js
node verificar_ocultamiento.js
```

---

### 5. Usar CocoIndex para búsqueda semántica

**Cuándo usar**: Cuando no conoces el nombre exacto del código

**Comandos**:
```bash
# Indexar el código (opcional, para codebases grandes)
cocoindex-code index

# Usar en OpenCode/Claude
# Escribir: "Usa cocoindex-code para buscar [descripción]"
```

**Ejemplos de consultas**:
- "Encuentra cómo se cargan las partidas en el historial"
- "Busca la función que calcula el ELO"
- "Dónde se define el filtro de partidas ocultas"

---

## ⚠️ PROCEDIMIENTOS ESPECIALES

### 1. Modificar el diseño del hombre bajo la mesa

**Ubicación del código**: `index.html` líneas 434-540 (aproximadamente)

**Características actuales**:
- Cuerpo anatómico con cuello
- Cabeza con cabello, ojos, nariz, boca
- Piernas y brazos con forma realista (12 segmentos)
- Manos con dedos
- Zapatos
- Cinturón como accesorio
- Materiales con roughness/metalness
- Posición: bajo la mesa (y = -3.7)
- Rotación: PI/6 (30 grados)

**Cambios permitidos**:
- Ajustar geometría (más realista)
- Cambiar materiales (roughness/metalness)
- Modificar pose (mantener bajo la mesa)

**Cambios NO permitidos**:
- Mover de ubicación (debe estar bajo la mesa)
- Cambiar colores (paleta original)
- Eliminar detalles (cinturón, ojos, etc.)

**Nota**: Se intentó descargar modelos GLB realistas, pero los archivos estaban corruptos. Se optó por mejorar la geometría primitiva existente.

---

### 2. Modificar la radio vintage

**Ubicación del código**: `index.html` líneas 519-600 (aproximadamente)

**Características actuales**:
- Estilo años 90
- **Apagada** (sin emisión)
- Al lado del hombre (x=1.2, y=-3.6, z=0.8)
- Grille/speaker con agujeros
- Dial con perilla giratoria
- Antena retráctil
- Clip para cinturón

**Cambios permitidos**:
- Detalles visuales
- Posición relativa al hombre

**Cambios NO permitidos**:
- Encenderla (debe estar apagada)
- Mover lejos del hombre

---

### 3. Modificar el favicon animado

**Ubicación del código**: `index.html` líneas 772-837

**Características actuales**:
- Bola de billar 8
- Rotación horizontal
- Borde dorado

**Cambios permitidos**:
- Velocidad de rotación
- Colores (dentro de paleta)

**Cambios NO permitidos**:
- Eliminar animación
- Cambiar a estático

---

### 4. Mejorar geometría primitiva (cuando no hay modelos GLB)

**Cuándo usar**: Cuando los modelos 3D externos no están disponibles o están corruptos

**Procedimiento**:
1. **Identificar el objeto**: Hombre bajo la mesa o radio vintage
2. **Añadir detalles geométricos**:
   - **Hombre**: Dedos, zapatos, nariz, boca, mejillas
   - **Radio**: Grille, agujeros, botones adicionales
3. **Ajustar materiales**: Roughness, metalness, colores
4. **Probar iluminación**: Añadir luces puntuales si es necesario
5. **Verificar posición**: Mantener bajo la mesa o al lado del hombre
6. **Subir a GitHub**: Commit y push con mensaje descriptivo

**Ejemplo de código para añadir dedos**:
```javascript
const fingerGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.15, 8);
for (let i = 0; i < 4; i++) {
    const finger1 = new THREE.Mesh(fingerGeo, skinMaterial);
    finger1.rotation.z = Math.PI / 2;
    finger1.position.set(1.35 + i * 0.05, -3.7, 0.25);
    manGroup.add(finger1);
}
```

**Nota**: Esta solución es temporal. Cuando haya modelos GLB válidos, reemplazar con GLTFLoader.

---

## 📝 PROCEDIMIENTOS DE DOCUMENTACIÓN

### 1. Añadir nuevo procedimiento

**Cuándo usar**: Después de completar una tarea compleja

**Pasos**:
1. Preguntar al usuario: "¿Quieres que guarde este procedimiento en PROCEDURES.md?"
2. Si sí, escribir el procedimiento en este archivo
3. Incluir:
   - Título descriptivo
   - Cuándo usar
   - Pasos detallados
   - Ejemplos de código
   - Notas importantes

---

### 2. Actualizar AGENTS.md

**Cuándo usar**: Cuando hay cambios importantes en el proyecto

**Contenido a añadir**:
- Nuevas funcionalidades
- Cambios en estructura
- Nuevos scripts disponibles
- Cambios en configuración

---

## 🔧 COMANDOS ÚTILES

### Git
```bash
# Ver estado
git status

# Ver diferencias
git diff

# Añadir todo
git add .

# Hacer commit
git commit -m "mensaje"

# Subir a GitHub
git push origin main

# Ver historial
git log --oneline -10
```

### Node.js
```bash
# Ejecutar script
node nombre_script.js

# Ver versión
node --version

# Instalar paquete
npm install nombre-paquete
```

### CocoIndex
```bash
# Indexar código
cocoindex-code index

# Ver versión
cocoindex-code --version
```

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### Error: "git push" falla con error 403
**Solución**: Verificar que tienes acceso al repositorio en GitHub

### Error: CocoIndex no funciona
**Solución**: Ejecutar `cocoindex-code index` primero

### Error: Firebase no conecta
**Solución**: Verificar que el archivo de credenciales está en la raíz

### Error: Partidas no se ocultan
**Solución**: Ejecutar `ocultar_historial_actual.js` con confirmación 's'

---

## 📚 ARCHIVOS DE REFERENCIA

- **AGENTS.md**: Instrucciones para agentes de IA
- **CLAUDE.md**: Instrucciones específicas para Claude
- **COCOINDEX_USAGE.md**: Guía de uso de CocoIndex
- **DOCUMENTACION_*.md**: Documentación de cambios específicos

---

## ✅ CHECKLIST ANTES DE FINALIZAR TAREA

- [ ] ¿He leído AGENTS.md?
- [ ] ¿He consultado PROCEDURES.md?
- [ ] ¿He usado CocoIndex para buscar código relacionado?
- [ ] ¿He probado los cambios localmente?
- [ ] ¿He subido los cambios a GitHub?
- [ ] ¿He preguntado si guardar el procedimiento?

---

**Mantenedor**: pablozamit
**Última revisión**: 11 de marzo de 2026
