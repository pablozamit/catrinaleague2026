/**
 * Script para probar la función getUserHistory
 * Simula cómo la web leería las partidas de un usuario
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

// Simular getUserHistory de firebase.js
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
                .sort((a, b) => b.created_at - a.created_at) // Orden descendente (más reciente primero)
                .slice(0, 20); // Limitar a los últimos 20
        });
}

async function probargetUserHistory() {
    try {
        console.log('🔍 Probando getUserHistory...\n');
        
        // Probar con un usuario que tiene partidas confirmadas
        const usuarioPrueba = 'ltZ72ZtSYJPVCDfZ57zMHRWcpbg2'; // sol
        const usernamePrueba = 'sol';
        
        console.log(`Consultando historial de: ${usernamePrueba} (ID: ${usuarioPrueba})\n`);
        
        const partidas = await getUserHistory(usuarioPrueba);
        
        console.log(`✅ Partidas confirmadas encontradas: ${partidas.length}\n`);
        
        if (partidas.length > 0) {
            console.log('📋 Historial de partidas:\n');
            console.log('='.repeat(80));
            
            partidas.forEach((partida, index) => {
                const fecha = partida.timestamp ? new Date(partida.timestamp).toLocaleString('es-ES') : 'N/A';
                const esGanador = partida.winner_id === usuarioPrueba;
                const oponenteId = esGanador ? partida.loser_id : partida.winner_id;
                const oponenteNombre = esGanador ? partida.loser_username : partida.winner_username;
                const resultado = esGanador ? 'VICTORIA' : 'DERROTA';
                const cambioELO = esGanador ? 
                    (partida.winner_elo_change || 0) : 
                    (partida.loser_elo_change || 0);
                
                console.log(`\nPartida #${index + 1}:`);
                console.log(`  Fecha: ${fecha}`);
                console.log(`  Oponente: ${oponenteNombre}`);
                console.log(`  Resultado: ${resultado}`);
                console.log(`  Cambio ELO: ${cambioELO > 0 ? '+' : ''}${cambioELO}`);
                console.log(`  Tipo: ${partida.match_type}`);
            });
            
            console.log('\n' + '='.repeat(80));
        } else {
            console.log('⚠️ No se encontraron partidas confirmadas para este usuario.');
        }
        
        // También probar con otro usuario
        console.log('\n\n🔍 Probando con otro usuario...\n');
        const usuarioPrueba2 = 'xwa5IYC6uWYbRrNsuqBMG2iSBUY2'; // mina
        const usernamePrueba2 = 'mina';
        
        console.log(`Consultando historial de: ${usernamePrueba2} (ID: ${usuarioPrueba2})\n`);
        
        const partidas2 = await getUserHistory(usuarioPrueba2);
        
        console.log(`✅ Partidas confirmadas encontradas: ${partidas2.length}\n`);
        
        if (partidas2.length > 0) {
            console.log('📋 Historial de partidas:\n');
            console.log('='.repeat(80));
            
            partidas2.forEach((partida, index) => {
                const fecha = partida.timestamp ? new Date(partida.timestamp).toLocaleString('es-ES') : 'N/A';
                const esGanador = partida.winner_id === usuarioPrueba2;
                const oponenteId = esGanador ? partida.loser_id : partida.winner_id;
                const oponenteNombre = esGanador ? partida.loser_username : partida.winner_username;
                const resultado = esGanador ? 'VICTORIA' : 'DERROTA';
                const cambioELO = esGanador ? 
                    (partida.winner_elo_change || 0) : 
                    (partida.loser_elo_change || 0);
                
                console.log(`\nPartida #${index + 1}:`);
                console.log(`  Fecha: ${fecha}`);
                console.log(`  Oponente: ${oponenteNombre}`);
                console.log(`  Resultado: ${resultado}`);
                console.log(`  Cambio ELO: ${cambioELO > 0 ? '+' : ''}${cambioELO}`);
                console.log(`  Tipo: ${partida.match_type}`);
            });
            
            console.log('\n' + '='.repeat(80));
        } else {
            console.log('⚠️ No se encontraron partidas confirmadas para este usuario.');
        }
        
        console.log('\n✅ Prueba completada.');
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
        process.exit(1);
    }
}

// Ejecutar
probargetUserHistory().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
