# README_AGENTES.md - Guía para Agentes de IA

## 🚨 LEE ESTO PRIMERO ANTES DE HACER CUALQUIER COSA

### 1. Archivos de contexto (LEE ESTOS 4 ARCHIVOS)

| Archivo | Qué contiene | Cuándo leer |
|---------|--------------|-------------|
| **AGENTS.md** | Todo el proyecto, cambios recientes, configuración | **SIEMPRE PRIMERO** |
| **CLAUDE.md** | Instrucciones específicas para Claude | Si usas Claude |
| **PROCEDURES.md** | Procedimientos paso a paso | Antes de tareas complejas |
| **COCOINDEX_USAGE.md** | Cómo usar búsqueda semántica | Cuando no encuentres código |

### 2. Orden de lectura OBLIGATORIO

1. **AGENTS.md** - Entender el proyecto y cambios recientes
2. **PROCEDURES.md** - Ver si existe procedimiento optimizado
3. **Usar CocoIndex** - Buscar código relacionado si es necesario

### 3. Flujo de trabajo

**ANTES de empezar:**
```
1. Leer AGENTS.md
2. Consultar PROCEDURES.md
3. Usar CocoIndex para buscar código
```

**DESPUÉS de terminar:**
```
1. Preguntar: "¿Quieres que guarde este procedimiento en PROCEDURES.md?"
2. Subir a GitHub: git add . && git commit -m "mensaje" && git push
```

### 4. Lo que NUNCA debes hacer

❌ **NO** olvides subir cambios a GitHub (Vercel despliega automáticamente)
❌ **NO** implementes juegos sin pedir permiso explícito
❌ **NO** cambies colores, iluminación o diseño sin pedir permiso
❌ **NO** olvides que las partidas están OCULTAS intencionadamente

### 5. Comandos útiles

**Git:**
```bash
git status                    # Ver cambios
git add .                     # Añadir todo
git commit -m "mensaje"       # Hacer commit
git push origin main          # Subir a GitHub
```

**CocoIndex:**
```bash
cocoindex-code index          # Indexar código (opcional)
```

**Scripts Node.js:**
```bash
node verificar_usuarios.js    # Verificar ELO
node ocultar_historial_actual.js  # Ocultar partidas
```

### 6. Contacto

- **Repositorio**: https://github.com/pablozamit/catrinaleague2026
- **Web**: https://catrinaleague2026.vercel.app
- **Mantenedor**: pablozamit (GitHub)

---

**IMPORTANTE**: Si ves que algo no está claro en estos archivos, pregunta al usuario para actualizar la documentación.
