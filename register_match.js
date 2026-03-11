/**
 * Script para registrar un partido y actualizar ELO
 * Uso: node register_match.js winner_username loser_username match_type
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');
const { calculateEloChange } = require('./js/elo.js');

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

async function getUserByUsername(username) {
    const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');
    const users = snapshot.val();
    
    if (!users) {
        throw new Error(`Usuario ${username} no encontrado`);
    }
    
    // Devolver el primer usuario encontrado (debería ser único)
    const userId = Object.keys(users)[0];
    return { uid: userId, ...users[userId] };
}

async function updateUserElo(userId, newElo, matchesPlayed, matchesWon) {
    const updates = {
        elo_rating: newElo,
        matches_played: matchesPlayed,
        matches_won: matchesWon
    };
    
    await db.ref(`users/${userId}`).update(updates);
    console.log(`✅ ELO actualizado para ${userId}: ${newElo}`);
}

async function registerMatch(winnerUsername, loserUsername, matchType = 'rey_mesa') {
    try {
        console.log(`🔍 Buscando usuarios...`);
        
        // 1. Obtener datos de los usuarios
        const winner = await getUserByUsername(winnerUsername);
        const loser = await getUserByUsername(loserUsername);
        
        console.log(`📊 Datos actuales:`);
        console.log(`  ${winner.username}: ELO ${winner.elo_rating}, ${winner.matches_played} partidos`);
        console.log(`  ${loser.username}: ELO ${loser.elo_rating}, ${loser.matches_played} partidos`);
        
        // 2. Calcular cambio de ELO
        const changes = calculateEloChange(
            winner.elo_rating,
            loser.elo_rating,
            winner.matches_played || 0,
            loser.matches_played || 0,
            matchType
        );
        
        console.log(`📈 Cambios de ELO:`);
        console.log(`  ${winner.username}: ${winner.elo_rating} → ${changes.winnerElo} (${changes.winnerChange >= 0 ? '+' : ''}${changes.winnerChange})`);
        console.log(`  ${loser.username}: ${loser.elo_rating} → ${changes.loserElo} (${changes.loserChange >= 0 ? '+' : ''}${changes.loserChange})`);
        
        // 3. Actualizar ELO del ganador (primero)
        await updateUserElo(
            winner.uid,
            changes.winnerElo,
            (winner.matches_played || 0) + 1,
            (winner.matches_won || 0) + 1
        );
        
        // 4. Actualizar ELO del perdedor (después)
        await updateUserElo(
            loser.uid,
            changes.loserElo,
            (loser.matches_played || 0) + 1,
            loser.matches_won || 0
        );
        
        // 5. Registrar el partido en el historial
        const matchId = db.ref('matches').push().key;
        await db.ref(`matches/${matchId}`).set({
            match_id: matchId,
            winner_id: winner.uid,
            winner_username: winner.username,
            loser_id: loser.uid,
            loser_username: loser.username,
            match_type: matchType,
            winner_elo_change: changes.winnerChange,
            loser_elo_change: changes.loserChange,
            winner_elo_before: winner.elo_rating,
            winner_elo_after: changes.winnerElo,
            loser_elo_before: loser.elo_rating,
            loser_elo_after: changes.loserElo,
            timestamp: Date.now(),
            confirmed: false
        });
        
        console.log(`📝 Partido registrado con ID: ${matchId}`);
        console.log(`🎉 ¡Partido registrado correctamente!`);
        
        return {
            success: true,
            matchId,
            winner: {
                username: winner.username,
                oldElo: winner.elo_rating,
                newElo: changes.winnerElo,
                change: changes.winnerChange
            },
            loser: {
                username: loser.username,
                oldElo: loser.elo_rating,
                newElo: changes.loserElo,
                change: changes.loserChange
            }
        };
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Ejecutar si se llama desde línea de comandos
if (process.argv[2] && process.argv[3]) {
    const winner = process.argv[2];
    const loser = process.argv[3];
    const matchType = process.argv[4] || 'rey_mesa';
    
    console.log(`🚀 Registrando partido: ${winner} vs ${loser} (gana ${winner})`);
    console.log(`   Tipo: ${matchType}`);
    console.log('');
    
    registerMatch(winner, loser, matchType).then(() => {
        process.exit(0);
    }).catch(() => {
        process.exit(1);
    });
} else {
    console.log('Uso: node register_match.js <ganador> <perdedor> [tipo_partido]');
    console.log('Ejemplo: node register_match.js amauris joe rey_mesa');
}

// Exportar para uso programático
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerMatch };
}