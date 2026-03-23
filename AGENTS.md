# AGENTS.md - Proyecto La Catrina Pool League

**Proyecto**: La Catrina Pool League 2026
**Repositorio**: https://github.com/pablozamit/catrinaleague2026
**URL Web**: https://catrinaleague2026.vercel.app

---

## 📋 ESTRUCTURA DEL PROYECTO

```
catrinaleague2026/
├── index.html                 # Portada con mesa de billar 3D
├── admin/                     # Panel de administración
├── confirmar/                 # Confirmación de resultados
├── elo/                       # Ranking ELO
├── historial/                 # Historial de partidas
├── liga/                      # Liga actual
├── perfil/                    # Perfil de usuario
├── resultados/                # Registro de resultados
├── login.html                 # Página de login
├── js/
│   ├── firebase.js           # Configuración Firebase
│   ├── elo.js                # Cálculo de ELO
│   ├── translations.js       # Traducciones i18n
│   └── ...                   # Otros scripts
└── material/                 # Imágenes y recursos
```

---

## 🔥 CAMBIOS RECIENTES IMPORTANTES

### 1. Historial de partidas OCULTO
- **Todas las partidas existentes** están marcadas con `hidden: true`
- **NO se muestran en la web** (historial está vacío)
- **ELO y badges se mantienen** (solo se oculta el historial visual)
- Para ver partidas ocultas: usa Firebase Console o scripts en `/c/Users/paulm/Downloads/Apps/catrina2026/catrinaleague2026/`

### 2. Hombre bajo la mesa - Diseño REALISTA (Geometría Primitiva Mejorada)
- **Ubicación**: `index.html` líneas 434-540 (aproximadamente)
- **Características**:
  - Cuerpo anatómico con cuello
  - Cabeza con cabello, ojos, nariz, boca
  - Piernas y brazos con forma realista (12 segmentos)
  - Manos con dedos
  - Zapatos
  - Cinturón como accesorio
  - Materiales con roughness/metalness
  - Posición: bajo la mesa (y = -3.7)
  - Rotación: PI/6 (30 grados)
- **Nota**: Se intentó descargar modelos GLB realistas, pero los archivos estaban corruptos (AccessDenied). Se optó por mejorar la geometría primitiva existente.

### 3. Radio vintage años 90 (Geometría Primitiva Mejorada)
- **Ubicación**: `index.html` líneas 519-600 (aproximadamente)
- **Características**:
  - Estilo pintor de los 90
  - Cuerpo compacto (0.35 x 0.2 x 0.15)
  - Dial con perilla giratoria
  - Antena retráctil
  - Clip para cinturón
  - Grille/speaker con agujeros
  - **Apagada** (estática, sin emisión)
  - Posición: al lado del hombre (x=1.2, y=-3.6, z=0.8)
- **Nota**: Se mejoró la geometría añadiendo detalles como grille y agujeros.

### 4. Favicon animado
- **Ubicación**: `index.html` líneas 772-837
- **Características**:
  - Bola de billar 8
  - Rotación horizontal (efecto 3D)
  - Borde dorado (branding La Catrina)
  - Actualización en tiempo real

---

## 🔧 CONFIGURACIÓN ACTUAL

### Firebase
- **Proyecto**: elopool-f1e62
- **URL**: https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app
- **Archivo de credenciales**: `elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json`

### Estadísticas de usuarios
- **Total usuarios**: 55
- **Usuarios con partidas**: 24
- **ELO actualizados**: Sí (última actualización: 11/3/2026)

### Partidas
- **Total en Firebase**: 10
- **Ocultas**: 10 (100%)
- **Confirmadas**: 5
- **Pendientes**: 4
- **Declinadas**: 1

---

## 🛠️ HERRAMIENTAS DISPONIBLES

### CocoIndex (Búsqueda semántica de código)
- **Instalado**: Sí (`cocoindex-code` v0.1.12)
- **Configuración**: `opencode.json` y `AGENTS.md`
- **Uso**: Buscar código por significado, no por texto exacto

**Ejemplos de uso:**
```
Usa cocoindex-code para encontrar cómo se gestionan las sesiones de usuario
```
```
Busca la función que calcula el ELO de los jugadores
```
```
Dónde se define el filtro de partidas ocultas en el historial
```

### Scripts disponibles en el directorio
- `actualizar_elo_masivo_final.js` - Actualización masiva de ELO
- `consultar_todas_las_partidas.js` - Consulta todas las partidas
- `ocultar_historial_actual.js` - Oculta partidas existentes
- `verificar_usuarios.js` - Verifica estado de usuarios

---

## 🔄 FLUJO DE TRABAJO RECOMENDADO

### 1. Antes de empezar cualquier tarea
1. **Leer AGENTS.md** (este archivo) para entender el contexto
2. **Consultar PROCEDURES.md** para ver si existe un método optimizado
3. **Usar CocoIndex** para buscar código relacionado

### 2. Después de completar una tarea
1. **Preguntar**: "¿Quieres que guarde este procedimiento en PROCEDURES.md?"
2. **Guardar** si es un procedimiento nuevo o mejorado
3. **Subir a GitHub** los cambios realizados

### 3. Si necesitas hacer cambios masivos
1. **Usar scripts de Node.js** en el directorio raíz
2. **Verificar** con `verificar_usuarios.js` o scripts similares
3. **Subir a GitHub** y esperar despliegue en Vercel

---

## ❌ COSAS QUE NO HACER

1. **NO implementar juegos** en la portada (a menos que se pida explícitamente)
2. **NO modificar la iluminación** de la escena 3D (a menos que se pida)
3. **NO cambiar la paleta de colores** (dorado #d4af37, verde #1a4d2e, etc.)
4. **NO crear registros de partidas** en el historial (están ocultas intencionadamente)
5. **NO olvidar que los cambios se suben a GitHub** (Vercel los despliega automáticamente)

---

## 📚 DOCUMENTACIÓN IMPORTANTE

### Archivos de documentación creados
- `AGENTS.md` - Este archivo (instrucciones para agentes de IA)
- `COCOINDEX_USAGE.md` - Guía de uso de CocoIndex
- `DOC_OcultarHistorial.md` - Documentación de ocultación de historial
- `DOCUMENTACION_MEJORA_HOMBRE_RADIO.md` - Mejoras visuales
- `RESUMEN_IMPLEMENTACION.md` - Resumen completo de tareas
- `VERIFICACION_FINAL.md` - Verificación de tareas completadas

### Archivos de configuración
- `opencode.json` - Configuración MCP para OpenCode
- `mcp_config.json` - Configuración MCP general

---

## 🎯 OBJETIVOS DEL PROYECTO

### Objetivos principales
1. ✅ Mostrar mesa de billar 3D en la portada
2. ✅ Hombre bajo la mesa (diseño realista)
3. ✅ Radio vintage años 90 (apagada)
4. ✅ Favicon animado de bola 8
5. ✅ Sistema de rankings ELO
6. ✅ Historial de partidas (actualmente oculto)

### Próximos pasos (solo si se piden)
- Juego interactivo en la portada
- Mejoras visuales adicionales
- Nuevas funcionalidades

---

## 🔗 ENLACES IMPORTANTES

- **Repositorio GitHub**: https://github.com/pablozamit/catrinaleague2026
- **Web desplegada**: https://catrinaleague2026.vercel.app
- **Firebase Console**: https://console.firebase.google.com/project/elopool-f1e62

---

## 💡 CONSEJOS PARA AGENTES DE IA

1. **Siempre** consulta este archivo ANTES de hacer cambios
2. **Usa CocoIndex** para buscar código relacionado
3. **No asumas** cosas sobre el proyecto - pregunta si no estás seguro
4. **Respeta** las decisiones de diseño (colores, iluminación, etc.)
5. **Documenta** los procedimientos nuevos en PROCEDURES.md
6. **Sube a GitHub** después de cada tarea completada

---

**Última actualización**: 11 de marzo de 2026
**Maintainer**: pablozamit (GitHub)

## Herramientas
- **Navegación Ultra-Rápida:** lightpanda (navegador headless en Zig, 11x más rápido, para extracción ligera de datos).
