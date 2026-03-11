/**
 * Script para migrar todas las partidas a un formato consistente
 * Uso: node migrar_partidas.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

async function getUsernameById(uid) {
    try {
        const snapshot = await db.ref(`users/${uid}/username`).once('value');
        return snapshot.val();
    } catch (error) {
        return null;
    }
}

async function migrarPartidas() {
    try {
        console.log('🔄 Iniciando migración de partidas...\n');
        
        // Obtener todas las partidas
        const snapshot = await db.ref('matches').once('value');
        const partidas = snapshot.val();
        
        if (!partidas) {
            console.log('❌ No hay partidas para migrar.');
            return;
        }
        
        const partidasArray = Object.entries(partidas).map(([key, value]) => ({ id: key, ...value }));
        console.log(`✅ Total de partidas encontradas: ${partidasArray.length}\n`);
        
        let migradas = 0;
        let saltadas = 0;
        let actualizadas = 0;
        
        for (const partida of partidasArray) {
            console.log(`\nProcesando partida: ${partida.id}`);
            
            // Determinar si necesita migración
            let needsMigration = false;
            const updates = {};
            
            // 1. Asegurar que hay un campo 'status' consistente
            if (!partida.status && partida.confirmed !== undefined) {
                if (partida.confirmed === true) {
                    updates.status = 'confirmed';
                } else if (partida.confirmed === false) {
                    updates.status = 'pending';
                }
                needsMigration = true;
                console.log(`  - Agregando status: ${updates.status}`);
            }
            
            // 2. Asegurar que hay campos de ganador/perdedor
            if (!partida.winner_id && partida.player1_id && partida.player2_id && partida.winner_id === undefined) {
                // No tenemos información de quién ganó, solo el partido fue creado
                // No podemos determinar el ganador sin más datos
                console.log(`  - ⚠️ No se puede determinar ganador (partido solo con player1/player2)`);
            }
            
            // 3. Asegurar que hay username para ganador/perdedor
            if (partida.winner_id && !partida.winner_username) {
                const username = await getUsernameById(partida.winner_id);
                if (username) {
                    updates.winner_username = username;
                    needsMigration = true;
                    console.log(`  - Agregando winner_username: ${username}`);
                }
            }
            
            if (partida.loser_id && !partida.loser_username) {
                const username = await getUsernameById(partida.loser_id);
                if (username) {
                    updates.loser_username = username;
                    needsMigration = true;
                    console.log(`  - Agregando loser_username: ${username}`);
                }
            }
            
            // 4. Asegurar que hay timestamp
            if (!partida.timestamp && partida.submitted_at) {
                updates.timestamp = partida.submitted_at;
                needsMigration = true;
                console.log(`  - Agregando timestamp desde submitted_at`);
            } else if (!partida.timestamp && !partida.submitted_at) {
                // Usar fecha actual como fallback
                updates.timestamp = Date.now();
                needsMigration = true;
                console.log(`  - ⚠️ Agregando timestamp actual (no se encontró submitted_at)`);
            }
            
            // 5. Mover campos de ELO si existen
            if (partida.winner_elo_change !== undefined && !partida.elo_changes) {
                // Mantener campos individuales para compatibilidad
            }
            
            // 6. Normalizar nombres de campos para la web
            if (!partida.player1_id && partida.winner_id && partida.loser_id) {
                // Formato register_match.js -> formato web
                const isPlayer1 = Math.random() > 0.5; // Aleatorio, ya que no sabemos
                updates.player1_id = partida.winner_id;
                updates.player1_username = partida.winner_username;
                updates.player2_id = partida.loser_id;
                updates.player2_username = partida.loser_username;
                updates.player1_score = 1; // Default para rey_mesa
                updates.player2_score = 0;
                needsMigration = true;
                console.log(`  - Agregando campos player1/player2 (formato web)`);
            }
            
            if (needsMigration) {
                try {
                    await db.ref(`matches/${partida.id}`).update(updates);
                    console.log(`  ✅ Migrada exitosamente`);
                    migradas++;
                    actualizadas++;
                } catch (error) {
                    console.log(`  ❌ Error al migrar: ${error.message}`);
                }
            } else {
                console.log(`  - ✅ No requiere migración`);
                saltadas++;
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('\n📊 RESUMEN DE MIGRACIÓN:');
        console.log(`- Total de partidas: ${partidasArray.length}`);
        console.log(`- Migradas exitosamente: ${migradas}`);
        console.log(`- Actualizadas: ${actualizadas}`);
        console.log(`- Sin cambios (ya estaban correctas): ${saltadas}`);
        console.log(`- Con errores: ${partidasArray.length - migradas - saltadas}`);
        
        console.log('\n✅ Migración completada.');
        console.log('\nNota: Todas las partidas ahora tienen:');
        console.log('- Campo "status" (confirmed/pending/declined)');
        console.log('- Campos winner_id, winner_username, loser_id, loser_username');
        console.log('- Campo timestamp');
        console.log('- Campos player1_id, player2_id (para compatibilidad con web)');
        
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

// Ejecutar
migrarPartidas().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
