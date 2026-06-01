/**
 * Script para actualizar ELO masivamente (versión final)
 * - Crea usuarios nuevos si no existen
 * - Procesa todas las partidas
 * - No crea registros en el historial
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');
const { calculateEloChange } = require('./js/elo.js');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

// Resultados a procesar (TODOS los resultados que me diste)
const resultados = [
    // Partidas que ya se procesaron
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
    { winner: 'ponci', loser: 'fer', tipo: 'torneo' },
    { winner: 'johnny', loser: 'pablo', tipo: 'torneo' },
    { winner: 'jonathan', loser: 'roman', tipo: 'torneo' },
    { winner: 'andres', loser: 'erfan', tipo: 'torneo' },
    { winner: 'andres', loser: 'jonathan', tipo: 'torneo' },
    { winner: 'johnny', loser: 'ed', tipo: 'torneo' },
    { winner: 'connor', loser: 'alexf', tipo: 'torneo' },
    { winner: 'connor', loser: 'johnny', tipo: 'torneo' },
    { winner: 'connor', loser: 'andres', tipo: 'torneo' }
];

// Usuarios nuevos a crear
const nuevosUsuarios = [
    { username: 'raul c.', email: 'raulc@example.com' },
    { username: 'andres', email: 'andres@example.com' }
];

async function crearUsuarioNuevo(username, email) {
    try {
        console.log(` Creando usuario nuevo: ${username}...`);
        
        // Crear usuario en Authentication (si es necesario)
        // Por ahora, solo creamos en la base de datos
        
        const newUserRef = db.ref('users').push();
        const userId = newUserRef.key;
        
        const userData = {
            username: username,
            email: email,
            elo_rating: 1200,
            matches_played: 0,
            matches_won: 0,
            xp: 0,
            level: 1,
            created_at: Date.now()
        };
        
        await newUserRef.set(userData);
        
        console.log(`  ✅ Usuario creado: ${username} (ID: ${userId})`);
        return userId;
        
    } catch (error) {
        console.error(`  ❌ Error creando usuario ${username}:`, error);
        return null;
    }
}

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
        
        // Devolver el primer usuario encontrado
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
        
        // 1. Crear usuarios nuevos
        console.log('👥 Creando usuarios nuevos...\n');
        const nuevosIds = {};
        
        for (const usuario of nuevosUsuarios) {
            const userId = await crearUsuarioNuevo(usuario.username, usuario.email);
            if (userId) {
                nuevosIds[usuario.username] = userId;
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log(`\n📊 Total de resultados a procesar: ${resultados.length}\n`);
        
        // 2. Obtener todos los usuarios
        const usersSnapshot = await db.ref('users').once('value');
        const users = usersSnapshot.val();
        
        // Crear mapa de usernames a uids
        const usernameToUid = {};
        
        for (const [uid, userData] of Object.entries(users)) {
            if (userData.username) {
                usernameToUid[userData.username] = uid;
            }
        }
        
        // 3. Procesar resultados
        console.log('🔄 Procesando resultados...\n');
        
        let cambiosRealizados = 0;
        let errores = 0;
        
        for (const resultado of resultados) {
            try {
                const winnerName = resultado.winner;
                const loserName = resultado.loser;
                
                // Buscar IDs de usuarios
                let winnerUid = usernameToUid[winnerName];
                let loserUid = usernameToUid[loserName];
                
                // Si no se encuentra, usar los nuevos creados
                if (!winnerUid && nuevosIds[winnerName]) {
                    winnerUid = nuevosIds[winnerName];
                }
                if (!loserUid && nuevosIds[loserName]) {
                    loserUid = nuevosIds[loserName];
                }
                
                if (!winnerUid || !loserUid) {
                    console.log(`❌ Usuario no encontrado: ${winnerName} vs ${loserName}`);
                    errores++;
                    continue;
                }
                
                // Obtener datos actuales
                const [winnerSnap, loserSnap] = await Promise.all([
                    db.ref(`users/${winnerUid}`).once('value'),
                    db.ref(`users/${loserUid}`).once('value')
                ]);
                
                const winnerData = winnerSnap.val();
                const loserData = loserSnap.val();
                
                if (!winnerData || !loserData) {
                    console.log(`❌ Datos no encontrados para ${winnerName} o ${loserName}`);
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
                
                // Actualizar ELO y contadores del ganador
                const winnerUpdates = {
                    elo_rating: changes.winnerElo,
                    matches_played: winnerMatches + 1,
                    matches_won: (winnerData.matches_won || 0) + 1
                };
                
                await db.ref(`users/${winnerUid}`).update(winnerUpdates);
                
                // Actualizar ELO y contadores del perdedor
                const loserUpdates = {
                    elo_rating: changes.loserElo,
                    matches_played: loserMatches + 1
                };
                
                await db.ref(`users/${loserUid}`).update(loserUpdates);
                
                console.log(`✅ ${winnerName} (${winnerElo} -> ${changes.winnerElo}) vs ${loserName} (${loserElo} -> ${changes.loserElo})`);
                cambiosRealizados++;
                
            } catch (error) {
                console.log(`❌ Error procesando ${resultado.winner} vs ${resultado.loser}: ${error.message}`);
                errores++;
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('\n📊 RESUMEN FINAL:');
        console.log(`- Total de resultados: ${resultados.length}`);
        console.log(`- Cambios realizados: ${cambiosRealizados}`);
        console.log(`- Errores: ${errores}`);
        
        console.log('\n✅ Actualización masiva completada.');
        console.log('\nNota: No se crearon registros de partidas en el historial.');
        console.log('Los ELO y contadores de partidas se actualizaron directamente.');
        
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
