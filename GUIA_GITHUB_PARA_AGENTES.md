# Guía: Cómo Usar GitHub desde un Agente de IA

## Introducción

Esta guía explica cómo un agente de IA puede actualizar un repositorio de GitHub, usando como ejemplo el repositorio `pablozamit/catrinaleague2026`.

---

## Requisitos Previos

1. **Acceso al repositorio:** El agente debe tener permisos de lectura/escritura
2. **Git instalado:** El sistema donde corre el agente debe tener git disponible
3. **Node.js (opcional):** Necesario solo si el proyecto lo requiere

---

## Comandos Básicos

### 1. Configurar Git (primera vez)

```bash
git config --global user.name "Nombre del Agente"
git config --global user.email "email@example.com"
```

### 2. Clonar un repositorio

```bash
# Clonar repositorio existente
git clone https://github.com/USUARIO/REPOSITORIO.git

# Ejemplo específico
git clone https://github.com/pablozamit/catrinaleague2026.git
```

### 3. Hacer cambios y guardarlos

```bash
# Entrar en la carpeta del proyecto
cd catrinaleague2026

# Ver estado de cambios
git status

# Añadir archivos modificados
git add .
# O añadir un archivo específico:
git add index.html

# Crear commit con mensaje
git commit -m "Descripción de los cambios realizados"

# Subir cambios a GitHub
git push origin main
```

---

## Flujo de Trabajo Completo

### Paso 1: Verificar si hay cambios pendientes

```bash
git status
```

### Paso 2: Añadir los cambios

```bash
# Añadir todos los cambios
git add .

# O añadir archivos específicos
git add archivo1.html archivo2.js
```

### Paso 3: Crear commit

```bash
git commit -m "Mensaje descriptivo de los cambios"
```

### Paso 4: Subir a GitHub

```bash
git push origin main
```

---

## Ejemplo Real (Nuestro caso)

```bash
# 1. Entrar en el directorio del proyecto
cd "C:\Users\paulm\Downloads\Apps\catrina2026\catrinaleague2026"

# 2. Ver estado
git status

# 3. Añadir archivos modificados
git add index.html lab/ js/translations.js

# 4. Crear commit
git commit -m "Add lab route with player comparison system"

# 5. Subir a GitHub
git push
```

---

## Comandos Útiles

### Ver diferencias antes de hacer commit
```bash
git diff
```

### Ver historial de commits
```bash
git log --oneline -10
```

### Deshacer cambios locales
```bash
# Deshacer cambios en archivo específico
git checkout -- archivo.html

# Deshacer todos los cambios locales
git checkout .
```

### Actualizar con los últimos cambios remotos
```bash
git pull origin main
```

---

## Notas Importantes

1. **No subir secretos:** Nunca hacer commit de archivos con contraseñas, API keys, o credenciales
2. **Añadir a .gitignore:** Archivos como `.env`, `node_modules/`, etc.
3. **Mensajes claros:** Usar mensajes descriptivos en los commits
4. **Rama main:** Por defecto usamos la rama `main` (antes era `master`)

---

## Solución de Problemas

### Error: "Permission denied"
- Verificar que el agente tiene acceso al repositorio
- Configurar credentials de GitHub si es necesario

### Error: "Merge conflicts"
```bash
# Ver conflictos
git status

# Resolver conflictos manualmente, luego:
git add .
git commit -m "Resolve merge conflicts"
```

### Error: "detached HEAD"
```bash
# Volver a la rama principal
git checkout main
```

---

## Estructura Típica de un Commit

```
[Tipo] Descripción corta

- Cambio 1 realizado
- Cambio 2 realizado
- Cambio 3 realizado

Tipo puede ser:
- Add: Nuevo archivo o funcionalidad
- Fix: Corrección de bug
- Update: Actualización de algo existente
- Remove: Eliminación de algo
```

### Ejemplos de mensajes:

```bash
git commit -m "Add player comparison voting system"

git commit -m "Fix login button alignment"

git commit -m "Update Firebase database rules"
```

---

## Información del Repositorio de Ejemplo

- **Propietario:** pablozamit
- **Repositorio:** catrinaleague2026
- **URL:** https://github.com/pablozamit/catrinaleague2026
- **Web desplegada:** https://catrinaleague2026.vercel.app

---

## Conclusión

El flujo básico es:
1. `git add .` → Preparar cambios
2. `git commit -m "mensaje"` → Guardar cambios
3. `git push` → Subir a GitHub

Este proceso permite que cualquier agente de IA pueda contribuir a un proyecto en GitHub de manera controlada y versionada.
