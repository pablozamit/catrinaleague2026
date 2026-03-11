/**
 * Script para corregir partidas confirmadas que no tienen winner_id/loser_id
 * Uso: node corregir_partidas_confirmadas.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

async function corregirPartidas() {
    try {
        console.log('🔄 Corrigiendo partidas confirmadas...\n');
        
        // Obtener todas las partidas confirmadas
        const snapshot = await db.ref('matches')
            .orderByChild('status')
            .equalTo('confirmed')
            .once('value');
        
        const partidas = snapshot.val();
        
        if (!partidas) {
            console.log('❌ No se encontraron partidas confirmadas.');
            return;
        }
        
        const partidasArray = Object.entries(partidas).map(([key, value]) => ({ id: key, ...value }));
        console.log(`✅ Total de partidas confirmadas: ${partidasArray.length}\n`);
        
        let corregidas = 0;
        let sinCambios = 0;
        let conProblemas = 0;
        
        for (const partida of partidasArray) {
            console.log(`\nProcesando partida confirmada: ${partida.id}`);
            
            const updates = {};
            let needsCorrection = false;
            
            // Verificar si tiene winner_id y loser_id
            if (!partida.winner_id || !partida.loser_id) {
                console.log(`  ⚠️ Falta información de ganador/perdedor`);
                
                // Intentar determinar ganador/perdedor desde player1_id y player2_id
                if (partida.player1_id && partida.player2_id) {
                    // Necesitamos saber quién ganó
                    // Por ahora, no tenemos esa información, así que marcamos como problema
                    console.log(`  ❌ No se puede determinar ganador sin información adicional`);
                    conProblemas++;
                    continue;
                } else {
                    console.log(`  ❌ No hay suficiente información para corregir`);
                    conProblemas++;
                    continue;
                }
            }
            
            // Verificar si tiene usernames
            if (!partida.winner_username) {
                const username = await getUsernameById(partida.winner_id);
                if (username) {
                    updates.winner_username = username;
                    needsCorrection = true;
                    console.log(`  - Agregando winner_username: ${username}`);
                }
            }
            
            if (!partida.loser_username) {
                const username = await getUsernameById(partida.loser_id);
                if (username) {
                    updates.loser_username = username;
                    needsCorrection = true;
                    console.log(`  - Agregando loser_username: ${username}`);
                }
            }
            
            // Verificar si tiene timestamp
            if (!partida.timestamp) {
                if (partida.confirmed_at) {
                    updates.timestamp = partida.confirmed_at;
                    needsCorrection = true;
                    console.log(`  - Agregando timestamp desde confirmed_at`);
                } else if (partida.created_at) {
                    updates.timestamp = partida.created_at;
                    needsCorrection = true;
                    console.log(`  - Agregando timestamp desde created_at`);
                } else {
                    updates.timestamp = Date.now();
                    needsCorrection = true;
                    console.log(`  - ⚠️ Agregando timestamp actual`);
                }
            }
            
            // Asegurar que tiene campos player1/player2 para compatibilidad web
            if (!partida.player1_id && partida.winner_id && partida.loser_id) {
                // Determinar quién es player1 y quién es player2
                // Por ahora, asumimos que el ganador es player1
                updates.player1_id = partida.winner_id;
                updates.player1_username = partida.winner_username || await getUsernameById(partida.winner_id);
                updates.player2_id = partida.loser_id;
                updates.player2_username = partida.loser_username || await getUsernameById(partida.loser_id);
                updates.player1_score = 1; // Default para rey_mesa
                updates.player2_score = 0;
                needsCorrection = true;
                console.log(`  - Agregando campos player1/player2`);
            }
            
            if (needsCorrection) {
                try {
                    await db.ref(`matches/${partida.id}`).update(updates);
                    console.log(`  ✅ Corregida exitosamente`);
                    corregidas++;
                } catch (error) {
                    console.log(`  ❌ Error al corregir: ${error.message}`);
                    conProblemas++;
                }
            } else {
                console.log(`  - ✅ Ya está correcta`);
                sinCambios++;
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('\n📊 RESUMEN DE CORRECCIÓN:');
        console.log(`- Total de partidas confirmadas: ${partidasArray.length}`);
        console.log(`- Corregidas exitosamente: ${corregidas}`);
        console.log(`- Sin cambios (ya estaban correctas): ${sinCambios}`);
        console.log(`- Con problemas: ${conProblemas}`);
        
        console.log('\n✅ Corrección completada.');
        
    } catch (error) {
        console.error('❌ Error en la corrección:', error);
        process.exit(1);
    }
}

async function getUsernameById(uid) {
    try {
        const snapshot = await db.ref(`users/${uid}/username`).once('value');
        return snapshot.val();
    } catch (error) {
        return null;
    }
}

// Ejecutar
corregirPartidas().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
