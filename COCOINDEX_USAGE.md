# Uso de CocoIndex en Catrina League 2026

## Instalación (ya realizada)

```bash
uv tool install --upgrade cocoindex-code --prerelease explicit --with "cocoindex>=1.0.0a24"
```

## Configuración

El MCP `cocoindex-code` está configurado en:
- `opencode.json` (para OpenCode)
- `AGENTS.md` (instrucciones para el agente)

## Cómo usarlo

### 1. Indexar el código (opcional, para codebases grandes)
```bash
cocoindex-code index
```

### 2. Búsqueda semántica

**Desde OpenCode (o tu cliente de IA):**

No necesitas comandos manuales. Tu cliente de IA automáticamente usará el MCP cuando sea útil.

**Ejemplos de consultas:**
```
Usa cocoindex-code para encontrar cómo se gestionan las sesiones de usuario
```

```
Busca la función que calcula el ELO de los jugadores
```

```
Dónde se define el filtro de partidas ocultas en el historial
```

```
Encuentra el código que registra un nuevo partido
```

### 3. Buscar específicamente

El MCP proporciona una herramienta `search` que puedes usar:

```python
# Ejemplo de uso programático (si tu cliente lo soporta)
search(
    query="cómo se cargan las partidas en el historial",
    limit=10,
    refresh_index=True
)
```

## Características del índice

- **Lenguajes soportados**: Python, JS/TS, HTML, CSS, JSON, YAML, Markdown, etc.
- **Actualización automática**: El índice se actualiza cuando cambian los archivos
- **Búsqueda semántica**: Encuentra código por significado, no solo por texto exacto

## Archivos indexados

El índice incluye:
- Todo el código en `catrinaleague2026/`
- Excluye: `node_modules/`, `dist/`, `__pycache__/`

## Ejemplos prácticos para este proyecto

1. **Encontrar el historial de partidas**
   ```
   Busca el código que carga el historial de partidas del jugador
   ```

2. **Encontrar el cálculo de ELO**
   ```
   Encuentra la función que calcula el cambio de ELO
   ```

3. **Encontrar la configuración de Firebase**
   ```
   Busca la configuración de Firebase en js/firebase.js
   ```

4. **Encontrar el filtro de partidas ocultas**
   ```
   Busca el código que filtra partidas ocultas en getUserHistory
   ```

## Notas

- No necesitas API keys (usa modelo local por defecto)
- El índice es local y privado
- Funciona con cualquier cliente de IA que soporte MCP
