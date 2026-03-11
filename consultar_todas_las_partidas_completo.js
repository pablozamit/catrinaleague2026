/**
 * Script para consultar todas las partidas en Firebase con nombres de usuario
 * Uso: node consultar_todas_las_partidas_completo.js
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
        return snapshot.val() || 'N/A';
    } catch (error) {
        return 'N/A';
    }
}

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
        let partidasArray = Object.entries(partidas)
            .map(([key, value]) => ({ id: key, ...value }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        console.log(`✅ Total de partidas encontradas: ${partidasArray.length}\n`);
        
        // Obtener nombres de usuario para partidas sin username
        console.log('🔄 Obteniendo nombres de usuario...');
        for (let i = 0; i < partidasArray.length; i++) {
            const p = partidasArray[i];
            if (!p.winner_username && p.winner_id) {
                p.winner_username = await getUsernameById(p.winner_id);
            }
            if (!p.loser_username && p.loser_id) {
                p.loser_username = await getUsernameById(p.loser_id);
            }
        }
        
        // Agrupar por estado
        const confirmadas = partidasArray.filter(p => p.confirmed === true || p.status === 'confirmed');
        const pendientes = partidasArray.filter(p => p.confirmed === false || p.status === 'pending');
        const declinadas = partidasArray.filter(p => p.status === 'declined');
        const otras = partidasArray.filter(p => !p.confirmed && p.status !== 'confirmed' && p.status !== 'pending' && p.status !== 'declined');
        
        console.log(`📊 Resumen por estado:`);
        console.log(`   - Confirmadas: ${confirmadas.length}`);
        console.log(`   - Pendientes: ${pendientes.length}`);
        console.log(`   - Declinadas: ${declinadas.length}`);
        console.log(`   - Otras/Información incompleta: ${otras.length}\n`);
        
        // Mostrar detalles de todas las partidas
        console.log('📋 LISTADO COMPLETO DE PARTIDAS:\n');
        console.log('='.repeat(120));
        
        partidasArray.forEach((partida, index) => {
            console.log(`\nPartida #${index + 1} - ID: ${partida.id}`);
            console.log(`- Ganador: ${partida.winner_username} (ID: ${partida.winner_id || 'N/A'})`);
            console.log(`- Perdedor: ${partida.loser_username} (ID: ${partida.loser_id || 'N/A'})`);
            console.log(`- Tipo: ${partida.match_type || 'N/A'}`);
            console.log(`- Timestamp: ${partida.timestamp ? new Date(partida.timestamp).toLocaleString('es-ES') : 'N/A'}`);
            
            // Estado
            if (partida.confirmed === true || partida.status === 'confirmed') {
                console.log(`- Estado: ✅ CONFIRMADA`);
            } else if (partida.confirmed === false || partida.status === 'pending') {
                console.log(`- Estado: ⏳ PENDIENTE`);
            } else if (partida.status === 'declined') {
                console.log(`- Estado: ❌ DECLINADA`);
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
        
        // Mostrar estadísticas finales
        console.log('\n📊 ESTADÍSTICAS FINALES:');
        console.log(`- Partidas confirmadas: ${confirmadas.length}`);
        console.log(`- Partidas pendientes: ${pendientes.length}`);
        console.log(`- Partidas declinadas: ${declinadas.length}`);
        console.log(`- Partidas con información incompleta: ${otras.length}`);
        
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
