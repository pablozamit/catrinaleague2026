# Ocultar Historial de Partidas

## Objetivo
Ocultar todas las partidas existentes del historial de la web, manteniendo el impacto en ELO y badges.

## Implementación

### 1. Ocultar Partidas Existentes
Ejecutar el script `ocultar_historial_actual.js`:
```bash
cd catrinaleague2026
echo "s" | node ocultar_historial_actual.js
```

Esto agrega el campo `hidden: true` a todas las partidas en Firebase.

### 2. Actualizar getUserHistory
Modificar la función `getUserHistory` en `js/firebase.js` para que ignore partidas ocultas:

```javascript
function getUserHistory(uid) {
    return database.ref('matches')
        .orderByChild('created_at')
        .once('value')
        .then(snap => {
            const matches = snap.val();
            if (!matches) return [];
            
            return Object.entries(matches)
                .filter(([key, match]) => 
                    match.status === 'confirmed' && 
                    !match.hidden &&  // <-- Agregar esta condición
                    (match.player1_id === uid || match.player2_id === uid)
                )
                .map(([key, match]) => ({ ...match, key }))
                .sort((a, b) => b.created_at - a.created_at)
                .slice(0, 20);
        });
}
```

### 3. Verificar Funcionamiento
Ejecutar el script de verificación:
```bash
node verificar_ocultamiento.js
```

## Resultados

### Partidas Existentes (10)
- ✅ Todas marcadas como `hidden: true`
- ✅ No aparecen en el historial de la web
- ✅ ELO y badges de usuarios se mantienen intactos

### Nuevas Partidas
- ✅ No tienen campo `hidden` (undefined)
- ✅ Aparecen en el historial de la web
- ✅ Impactan en ELO y badges como antes

## Script Utilizados

1. **ocultar_historial_actual.js** - Oculta todas las partidas existentes
2. **verificar_ocultamiento.js** - Verifica el estado de ocultamiento
3. **probar_getUserHistory.js** - Prueba la función getUserHistory
4. **verificar_usuarios.js** - Verifica que los datos de usuarios se mantienen

## Notas Importantes

- Las partidas ocultas siguen en la base de datos (no se borran)
- Las nuevas partidas se crean sin el campo `hidden`, por lo que son visibles
- La lógica de ocultamiento es: `!match.hidden` (true si no existe o es false)
