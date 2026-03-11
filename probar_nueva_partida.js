/**
 * Script para probar que las nuevas partidas sí aparecen en el historial
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

// Simular getUserHistory de firebase.js (con la corrección)
function getUserHistory(uid) {
    return db.ref('matches')
        .orderByChild('created_at')
        .once('value')
        .then(snap => {
            const matches = snap.val();
            if (!matches) return [];
            
            return Object.entries(matches)
                .filter(([key, match]) => 
                    match.status === 'confirmed' && 
                    !match.hidden && 
                    (match.player1_id === uid || match.player2_id === uid)
                )
                .map(([key, match]) => ({ ...match, key }))
                .sort((a, b) => b.created_at - a.created_at)
                .slice(0, 20);
        });
}

async function crearPartidaDePrueba() {
    try {
        console.log('🔄 Creando una partida de prueba...\n');
        
        // Crear una nueva partida usando createMatch (simulado)
        const newMatchRef = db.ref('matches').push();
        const matchId = newMatchRef.key;
        
        const partidaDePrueba = {
            player1_id: 'sol',
            player1_username: 'sol',
            player2_id: 'mina',
            player2_username: 'mina',
            winner_id: 'sol',
            winner_username: 'sol',
            loser_id: 'mina',
            loser_username: 'mina',
            match_type: 'rey_mesa',
            submitted_by: 'sol',
            submitted_at: Date.now(),
            created_at: Date.now(),
            timestamp: Date.now(),
            player1_score: 1,
            player2_score: 0,
            winner_score: 1,
            loser_score: 0,
            status: 'confirmed',
            winner_elo_change: 10,
            loser_elo_change: -10
            // Nota: No se establece hidden: true, así que debería aparecer en el historial
        };
        
        await newMatchRef.set(partidaDePrueba);
        console.log(`✅ Partida de prueba creada con ID: ${matchId}`);
        
        // Verificar que la partida no tiene campo hidden
        const snapshot = await db.ref(`matches/${matchId}`).once('value');
        const partida = snapshot.val();
        console.log(`\nCampos de la partida creada:`);
        console.log(`- hidden: ${partida.hidden}`);
        console.log(`- status: ${partida.status}`);
        
        // Verificar que aparece en el historial de 'sol'
        console.log(`\n🔍 Verificando historial de 'sol'...\n`);
        const historialSol = await getUserHistory('sol');
        
        console.log(`✅ Partidas confirmadas en historial de 'sol': ${historialSol.length}`);
        
        if (historialSol.length > 0) {
            const ultimaPartida = historialSol[0];
            console.log(`\nÚltima partida en historial:`);
            console.log(`- ID: ${ultimaPartida.id}`);
            console.log(`- Oponente: ${ultimaPartida.loser_username}`);
            console.log(`- Fecha: ${new Date(ultimaPartida.timestamp).toLocaleString('es-ES')}`);
            console.log(`- Oculta: ${ultimaPartida.hidden || 'false'}`);
            
            if (ultimaPartida.id === matchId) {
                console.log(`\n✅ La nueva partida SÍ aparece en el historial.`);
            } else {
                console.log(`\n⚠️ La nueva partida no es la última, pero sí está en el historial.`);
            }
        } else {
            console.log(`\n❌ La nueva partida NO aparece en el historial.`);
        }
        
        // Limpiar: eliminar la partida de prueba
        console.log(`\n🔄 Eliminando partida de prueba...`);
        await db.ref(`matches/${matchId}`).remove();
        console.log(`✅ Partida de prueba eliminada.`);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Ejecutar
crearPartidaDePrueba().then(() => {
    console.log('\n✅ Prueba completada.');
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
