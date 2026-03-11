#!/bin/bash
# Script para verificar la instalación de CocoIndex y configuración del proyecto

echo "========================================="
echo "VERIFICACIÓN DE INSTALACIÓN"
echo "Proyecto: La Catrina Pool League 2026"
echo "========================================="
echo ""

# 1. Verificar CocoIndex
echo "1. Verificando CocoIndex..."
if command -v cocoindex-code &> /dev/null; then
    echo "   ✅ CocoIndex instalado"
    cocoindex-code --version
else
    echo "   ❌ CocoIndex NO instalado"
fi
echo ""

# 2. Verificar archivos de configuración
echo "2. Verificando archivos de configuración..."
for file in AGENTS.md CLAUDE.md PROCEDURES.md COCOINDEX_USAGE.md README_AGENTES.md opencode.json; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file NO encontrado"
    fi
done
echo ""

# 3. Verificar repositorio Git
echo "3. Verificando repositorio Git..."
if [ -d .git ]; then
    echo "   ✅ Repositorio Git inicializado"
    git remote -v | head -2
else
    echo "   ❌ NO es un repositorio Git"
fi
echo ""

# 4. Verificar scripts de Node.js
echo "4. Verificando scripts de Node.js..."
for script in actualizar_elo_masivo_final.js ocultar_historial_actual.js verificar_usuarios.js; do
    if [ -f "$script" ]; then
        echo "   ✅ $script"
    else
        echo "   ⚠️  $script NO encontrado (opcional)"
    fi
done
echo ""

# 5. Verificar configuración de Firebase
echo "5. Verificando configuración de Firebase..."
if [ -f "elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json" ]; then
    echo "   ✅ Archivo de credenciales de Firebase"
else
    echo "   ⚠️  Archivo de credenciales NO encontrado (necesario para scripts Node.js)"
fi
echo ""

echo "========================================="
echo "VERIFICACIÓN COMPLETADA"
echo "========================================="
echo ""
echo "Para usar CocoIndex:"
echo "  cocoindex-code index"
echo ""
echo "Para usar en OpenCode:"
echo "  Abre OpenCode y el MCP estará disponible"
echo ""
echo "Documentación:"
echo "  - Lee AGENTS.md primero"
echo "  - Consulta PROCEDURES.md para procedimientos"
echo "  - Usa README_AGENTES.md para guía rápida"
