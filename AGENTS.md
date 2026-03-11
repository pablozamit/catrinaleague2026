# REGLAS GLOBALES DEL ENTORNO (Sincronizado con GEMINI.md)

## ðŸ› ï¸ Herramientas y Skills Disponibles
Este agente tiene acceso a las siguientes capacidades globales. Si no estÃ¡n en la barra lateral, se pueden invocar directamente:
- **Scraping Avanzado:** firecrawl (contenido limpio), apify (datos estructurados).
- **Inteligencia de Audio:** local-audio-intelligence (transcripciÃ³n de .ogg/.mp3 locales via read_file).
- **Eficiencia GHL:** produpin-gohighlevel-efficiency (optimizaciÃ³n API v2).
- **RAG de Copywriting:** Servidor local en puerto 6280 (ColecciÃ³n: copywriting-global).

## ðŸ§  Memoria de Procedimientos (CRÃTICO)
Antes de empezar cualquier tarea, consulta **PROCEDURES.md** en esta carpeta para ver si ya existe un mÃ©todo optimizado para realizarla.
**FLUJO DE APRENDIZAJE:** Tras completar CUALQUIER tarea con Ã©xito, pregunta obligatoriamente: "Â¿Quieres que guarde este procedimiento en PROCEDURES.md para poder repetirlo exactamente igual a la primera la prÃ³xima vez?".

## ðŸ” Protocolos
- Scraping: Proponer Firecrawl/Apify.
- Audio: Proponer transcripciÃ³n multimodal.

---

# AGENTS.md - Guía del Proyecto

Este archivo ha sido inicializado con las reglas globales.

## 🔍 Búsqueda de Código con CocoIndex

### Configuración MCP
El proyecto tiene instalado **cocoindex-code**, un MCP para búsqueda semántica de código.

**Comando para usar:**
```bash
cocoindex-code index
```

**Uso recomendado:**
Usa cocoindex-code para búsqueda semántica cuando:
- Busques código por significado o descripción en lugar de texto exacto
- Explore partes desconocidas de la codebase
- Busques implementaciones sin conocer el nombre exacto
- Encuentres patrones de código similares o funcionalidad relacionada

**Ejemplos de consultas:**
- "Encuentra cómo se cargan las partidas en el historial"
- "Busca la función que calcula el ELO"
- "Dónde se define el filtro de partidas ocultas"
- "Cómo se maneja la autenticación de Firebase"

**Nota:** El índice se construye automáticamente en la primera consulta y se actualiza cuando cambian los archivos.
