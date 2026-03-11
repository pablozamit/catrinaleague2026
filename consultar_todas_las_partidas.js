/**
 * Script para consultar todas las partidas en Firebase
 * Uso: node consultar_todas_las_partidas.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

async function consultarTodasPartidas() {
    try {
        console.log('🔍 Consultando todas las partidas en Firebase...\n');
        
        // Obtener todas las partidas sin filtro
        const snapshot = await db.ref('matches').once('value');
        const partidas = snapshot.val();
        
        if (!partidas) {
            console.log('❌ No se encontraron partidas en la base de datos.');
            return;
        }
        
        // Convertir a array y ordenar por timestamp (más recientes primero)
        const partidasArray = Object.entries(partidas)
            .map(([key, value]) => ({ id: key, ...value }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        console.log(`✅ Total de partidas encontradas: ${partidasArray.length}\n`);
        
        // Agrupar por estado
        const confirmadas = partidasArray.filter(p => p.confirmed === true || p.status === 'confirmed');
        const pendientes = partidasArray.filter(p => p.confirmed === false || p.status === 'pending');
        const otras = partidasArray.filter(p => !p.confirmed && p.status !== 'confirmed' && p.status !== 'pending');
        
        console.log(`📊 Resumen por estado:`);
        console.log(`   - Confirmadas: ${confirmadas.length}`);
        console.log(`   - Pendientes: ${pendientes.length}`);
        console.log(`   - Otras/Información incompleta: ${otras.length}\n`);
        
        // Mostrar detalles de todas las partidas
        console.log('📋 LISTADO COMPLETO DE PARTIDAS:\n');
        console.log('='.repeat(120));
        
        partidasArray.forEach((partida, index) => {
            console.log(`\nPartida #${index + 1} - ID: ${partida.id}`);
            console.log(`- Ganador: ${partida.winner_username || 'N/A'} (ID: ${partida.winner_id || 'N/A'})`);
            console.log(`- Perdedor: ${partida.loser_username || 'N/A'} (ID: ${partida.loser_id || 'N/A'})`);
            console.log(`- Tipo: ${partida.match_type || 'N/A'}`);
            console.log(`- Timestamp: ${partida.timestamp ? new Date(partida.timestamp).toLocaleString('es-ES') : 'N/A'}`);
            
            // Estado
            if (partida.confirmed === true || partida.status === 'confirmed') {
                console.log(`- Estado: ✅ CONFIRMADA`);
            } else if (partida.confirmed === false || partida.status === 'pending') {
                console.log(`- Estado: ⏳ PENDIENTE`);
            } else {
                console.log(`- Estado: ${partida.status || 'DESCONOCIDO'}`);
            }
            
            // ELO cambios (si existen)
            if (partida.winner_elo_change !== undefined) {
                console.log(`- Cambio ELO ganador: ${partida.winner_elo_change > 0 ? '+' : ''}${partida.winner_elo_change}`);
            }
            if (partida.loser_elo_change !== undefined) {
                console.log(`- Cambio ELO perdedor: ${partida.loser_elo_change > 0 ? '+' : ''}${partida.loser_elo_change}`);
            }
            
            console.log('-'.repeat(80));
        });
        
        console.log('\n' + '='.repeat(120));
        console.log(`\n✅ Consulta completada. ${partidasArray.length} partidas encontradas en Firebase.`);
        
    } catch (error) {
        console.error('❌ Error al consultar partidas:', error);
        process.exit(1);
    }
}

// Ejecutar
consultarTodasPartidas().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
