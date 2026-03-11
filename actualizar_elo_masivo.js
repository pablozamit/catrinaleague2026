/**
 * Script para actualizar ELO masivamente sin crear partidas en el historial
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');
const { calculateEloChange } = require('./js/elo.js');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

// Resultados a procesar (ganador-perdedor)
const resultados = [
    { winner: 'amauris', loser: 'joe', tipo: 'torneo' },
    { winner: 'raul c.', loser: 'erfan', tipo: 'torneo' },
    { winner: 'erfan', loser: 'pablo', tipo: 'torneo' },
    { winner: 'johnny', loser: 'lucas', tipo: 'torneo' },
    { winner: 'johnny', loser: 'amauris', tipo: 'torneo' },
    { winner: 'joe', loser: 'lucas', tipo: 'torneo' },
    { winner: 'charles', loser: 'david', tipo: 'torneo' },
    { winner: 'fer', loser: 'jack', tipo: 'torneo' },
    { winner: 'johnny', loser: 'josh', tipo: 'torneo' },
    { winner: 'artur', loser: 'jorge', tipo: 'torneo' },
    { winner: 'fer', loser: 'charles', tipo: 'torneo' },
    { winner: 'johnny', loser: 'artur', tipo: 'torneo' },
    { winner: 'nica', loser: 'fer', tipo: 'torneo' },
    { winner: 'johnny', loser: 'pablo', tipo: 'torneo' },
    { winner: 'jonathan', loser: 'roman', tipo: 'torneo' },
    { winner: 'andres', loser: 'erfan', tipo: 'torneo' },
    { winner: 'andres', loser: 'jonathan', tipo: 'torneo' },
    { winner: 'johnny', loser: 'ed', tipo: 'torneo' },
    { winner: 'connor', loser: 'alex f.', tipo: 'torneo' },
    { winner: 'connor', loser: 'johnny', tipo: 'torneo' },
    { winner: 'connor', loser: 'andres', tipo: 'torneo' }
];

async function buscarUsuarioPorUsername(username) {
    try {
        const snapshot = await db.ref('users')
            .orderByChild('username')
            .equalTo(username)
            .once('value');
        
        const users = snapshot.val();
        
        if (!users) {
            return null;
        }
        
        // Devolver el primer usuario encontrado (debería ser único)
        const userId = Object.keys(users)[0];
        return { uid: userId, ...users[userId] };
    } catch (error) {
        console.error(`Error buscando usuario ${username}:`, error);
        return null;
    }
}

async function actualizarEloMasivo() {
    try {
        console.log('🔄 Iniciando actualización masiva de ELO...\n');
        console.log(`📊 Total de resultados a procesar: ${resultados.length}\n`);
        
        // Obtener todos los usuarios para verificar nombres
        const usersSnapshot = await db.ref('users').once('value');
        const users = usersSnapshot.val();
        
        if (!users) {
            console.log('❌ No hay usuarios en la base de datos.');
            return;
        }
        
        // Crear un mapa de usernames a uids
        const usernameToUid = {};
        const usernameToLower = {};
        
        for (const [uid, userData] of Object.entries(users)) {
            if (userData.username) {
                usernameToUid[userData.username] = uid;
                usernameToLower[userData.username.toLowerCase()] = {
                    uid,
                    username: userData.username,
                    original: userData.username
                };
            }
        }
        
        console.log('👥 Usuarios disponibles en la base de datos:');
        console.log(Object.keys(usernameToUid).join(', '));
        console.log('\n');
        
        // Verificar cada resultado
        const resultadosProcesables = [];
        const resultadosConProblemas = [];
        
        for (const resultado of resultados) {
            const winnerName = resultado.winner;
            const loserName = resultado.loser;
            
            // Buscar usuario ganador
            let winnerUser = usernameToUid[winnerName];
            
            // Si no lo encuentra exacto, intentar con lowercase
            if (!winnerUser) {
                const winnerLower = usernameToLower[winnerName.toLowerCase()];
                if (winnerLower) {
                    winnerUser = winnerLower.uid;
                    console.log(`⚠️  Ajustando ganador: "${winnerName}" -> "${winnerLower.username}"`);
                }
            }
            
            // Buscar usuario perdedor
            let loserUser = usernameToUid[loserName];
            
            // Si no lo encuentra exacto, intentar con lowercase
            if (!loserUser) {
                const loserLower = usernameToLower[loserName.toLowerCase()];
                if (loserLower) {
                    loserUser = loserLower.uid;
                    console.log(`⚠️  Ajustando perdedor: "${loserName}" -> "${loserLower.username}"`);
                }
            }
            
            if (winnerUser && loserUser) {
                resultadosProcesables.push({
                    winnerUid: winnerUser,
                    loserUid: loserUser,
                    winnerUsername: usernameToUid[winnerUser] || winnerName,
                    loserUsername: usernameToUid[loserUser] || loserName,
                    tipo: resultado.tipo
                });
            } else {
                resultadosConProblemas.push({
                    winner: winnerName,
                    loser: loserName,
                    problema: !winnerUser ? 'Ganador no encontrado' : '',
                    problema2: !loserUser ? 'Perdedor no encontrado' : ''
                });
            }
        }
        
        console.log(`✅ Resultados procesables: ${resultadosProcesables.length}`);
        console.log(`⚠️ Resultados con problemas: ${resultadosConProblemas.length}\n`);
        
        if (resultadosConProblemas.length > 0) {
            console.log('🔍 USUARIOS CON PROBLEMAS:');
            console.log('='.repeat(80));
            resultadosConProblemas.forEach(r => {
                console.log(`  - ${r.winner} vs ${r.loser}`);
                if (r.problema) console.log(`    ${r.problema}`);
                if (r.problema2) console.log(`    ${r.problema2}`);
            });
            console.log('\n');
        }
        
        if (resultadosProcesables.length === 0) {
            console.log('❌ No hay resultados procesables.');
            return;
        }
        
        console.log('🔄 Procesando resultados...\n');
        
        let cambiosRealizados = 0;
        let errores = 0;
        
        for (const resultado of resultadosProcesables) {
            try {
                // Obtener datos actuales de los usuarios
                const [winnerSnap, loserSnap] = await Promise.all([
                    db.ref(`users/${resultado.winnerUid}`).once('value'),
                    db.ref(`users/${resultado.loserUid}`).once('value')
                ]);
                
                const winnerData = winnerSnap.val();
                const loserData = loserSnap.val();
                
                if (!winnerData || !loserData) {
                    console.log(`❌ Datos no encontrados para ${resultado.winnerUsername} o ${resultado.loserUsername}`);
                    errores++;
                    continue;
                }
                
                // Calcular cambio de ELO
                const winnerElo = winnerData.elo_rating || 1200;
                const loserElo = loserData.elo_rating || 1200;
                const winnerMatches = winnerData.matches_played || 0;
                const loserMatches = loserData.matches_played || 0;
                
                const changes = calculateEloChange(
                    winnerElo,
                    loserElo,
                    winnerMatches,
                    loserMatches,
                    resultado.tipo
                );
                
                // Actualizar ELO y contadores
                const updates = {
                    elo_rating: changes.winnerElo,
                    matches_played: winnerMatches + 1,
                    matches_won: (winnerData.matches_won || 0) + 1
                };
                
                await db.ref(`users/${resultado.winnerUid}`).update(updates);
                
                const loserUpdates = {
                    elo_rating: changes.loserElo,
                    matches_played: loserMatches + 1
                };
                
                await db.ref(`users/${resultado.loserUid}`).update(loserUpdates);
                
                console.log(`✅ ${resultado.winnerUsername} (${winnerElo} -> ${changes.winnerElo}) vs ${resultado.loserUsername} (${loserElo} -> ${changes.loserElo})`);
                cambiosRealizados++;
                
            } catch (error) {
                console.log(`❌ Error procesando ${resultado.winnerUsername} vs ${resultado.loserUsername}: ${error.message}`);
                errores++;
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('\n📊 RESUMEN FINAL:');
        console.log(`- Total de resultados: ${resultados.length}`);
        console.log(`- Resultados procesados: ${resultadosProcesables.length}`);
        console.log(`- Cambios realizados: ${cambiosRealizados}`);
        console.log(`- Errores: ${errores}`);
        console.log(`- Resultados con problemas: ${resultadosConProblemas.length}`);
        
        console.log('\n✅ Actualización masiva completada.');
        
        if (resultadosConProblemas.length > 0) {
            console.log('\n⚠️  RECUERDA:');
            console.log('- Los resultados con problemas NO se procesaron');
            console.log('- Necesitas corregir los nombres de usuario e intentar de nuevo');
        }
        
    } catch (error) {
        console.error('❌ Error en la actualización masiva:', error);
        process.exit(1);
    }
}

// Ejecutar
actualizarEloMasivo().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
