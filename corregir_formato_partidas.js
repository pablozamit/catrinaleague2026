/**
 * Script para corregir el formato de todas las partidas
 * Uso: node corregir_formato_partidas.js
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

async function corregirPartidas() {
    try {
        console.log('🔄 Corrigiendo formato de todas las partidas...\n');
        
        // Obtener todas las partidas
        const snapshot = await db.ref('matches').once('value');
        const partidas = snapshot.val();
        
        if (!partidas) {
            console.log('❌ No hay partidas para corregir.');
            return;
        }
        
        const partidasArray = Object.entries(partidas).map(([key, value]) => ({ id: key, ...value }));
        console.log(`✅ Total de partidas encontradas: ${partidasArray.length}\n`);
        
        let corregidas = 0;
        let sinCambios = 0;
        
        for (const partida of partidasArray) {
            console.log(`\nProcesando partida: ${partida.id}`);
            
            const updates = {};
            let needsCorrection = false;
            
            // 1. Asegurar que hay campo status
            if (!partida.status) {
                if (partida.confirmed === true) {
                    updates.status = 'confirmed';
                } else if (partida.confirmed === false) {
                    updates.status = 'pending';
                } else {
                    updates.status = 'pending';
                }
                needsCorrection = true;
                console.log(`  - Agregando status: ${updates.status}`);
            }
            
            // 2. Asegurar que hay timestamp
            if (!partida.timestamp) {
                if (partida.confirmed_at) {
                    updates.timestamp = partida.confirmed_at;
                } else if (partida.created_at) {
                    updates.timestamp = partida.created_at;
                } else if (partida.submitted_at) {
                    updates.timestamp = partida.submitted_at;
                } else {
                    updates.timestamp = Date.now();
                }
                needsCorrection = true;
                console.log(`  - Agregando timestamp`);
            }
            
            // 3. Asegurar que hay loser_id y loser_username
            if (!partida.loser_id) {
                // Determinar el perdedor desde player1/player2 o winner
                if (partida.player1_id && partida.player2_id && partida.winner_id) {
                    const loserId = partida.winner_id === partida.player1_id ? partida.player2_id : partida.player1_id;
                    updates.loser_id = loserId;
                    updates.loser_username = partida.winner_id === partida.player1_id ? partida.player2_username : partida.player1_username;
                    
                    // Si no hay username, buscarlo
                    if (!updates.loser_username) {
                        const username = await getUsernameById(loserId);
                        if (username) {
                            updates.loser_username = username;
                        }
                    }
                    
                    needsCorrection = true;
                    console.log(`  - Agregando loser_id y loser_username`);
                } else if (partida.winner_id && partida.loser_username) {
                    // Ya tiene loser_username pero no loser_id (caso de register_match.js)
                    // Necesitamos buscar el ID del perdedor por el username
                    // Esto es más complejo, lo omitimos por ahora
                    console.log(`  - ⚠️ Tiene loser_username pero no loser_id (necesita búsqueda manual)`);
                }
            }
            
            // 4. Asegurar que loser_username está presente
            if (!partida.loser_username && partida.loser_id) {
                const username = await getUsernameById(partida.loser_id);
                if (username) {
                    updates.loser_username = username;
                    needsCorrection = true;
                    console.log(`  - Agregando loser_username: ${username}`);
                }
            }
            
            // 5. Asegurar que hay campos player1/player2 para compatibilidad web
            if (!partida.player1_id && partida.winner_id && partida.loser_id) {
                updates.player1_id = partida.winner_id;
                updates.player1_username = partida.winner_username || await getUsernameById(partida.winner_id);
                updates.player2_id = partida.loser_id;
                updates.player2_username = partida.loser_username || await getUsernameById(partida.loser_id);
                updates.player1_score = partida.winner_score || 1;
                updates.player2_score = partida.loser_score || 0;
                needsCorrection = true;
                console.log(`  - Agregando campos player1/player2`);
            }
            
            // 6. Asegurar que hay winner_score y loser_score
            if (!partida.winner_score && !partida.loser_score) {
                if (partida.match_type === 'rey_mesa') {
                    updates.winner_score = 1;
                    updates.loser_score = 0;
                    needsCorrection = true;
                    console.log(`  - Agregando winner_score y loser_score (rey_mesa)`);
                }
            }
            
            if (needsCorrection) {
                try {
                    await db.ref(`matches/${partida.id}`).update(updates);
                    console.log(`  ✅ Corregida exitosamente`);
                    corregidas++;
                } catch (error) {
                    console.log(`  ❌ Error al corregir: ${error.message}`);
                }
            } else {
                console.log(`  - ✅ Ya está correcta`);
                sinCambios++;
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('\n📊 RESUMEN:');
        console.log(`- Total de partidas: ${partidasArray.length}`);
        console.log(`- Corregidas: ${corregidas}`);
        console.log(`- Sin cambios: ${sinCambios}`);
        
        console.log('\n✅ Corrección completada.');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Ejecutar
corregirPartidas().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
