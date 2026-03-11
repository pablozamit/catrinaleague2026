/**
 * Script para verificar el estado completo de las partidas
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

async function verificarEstado() {
    try {
        console.log('🔍 Verificando estado COMPLETO de las partidas...\n');
        
        // Obtener todas las partidas
        const snapshot = await db.ref('matches').once('value');
        const partidas = snapshot.val();
        
        if (!partidas) {
            console.log('✅ No hay partidas en la base de datos.');
            return;
        }
        
        const partidasArray = Object.entries(partidas).map(([key, value]) => ({ id: key, ...value }));
        console.log(`📊 Total de partidas en Firebase: ${partidasArray.length}\n`);
        
        // Contar por estado de ocultamiento
        let ocultas = 0;
        let visibles = 0;
        let sinCampo = 0;
        
        // Contar por status
        let confirmed = 0;
        let pending = 0;
        let declined = 0;
        let sinStatus = 0;
        
        console.log('📋 DETALLE DE CADA PARTIDA:\n');
        console.log('='.repeat(100));
        
        for (const partida of partidasArray) {
            const esOculta = partida.hidden === true;
            const estadoOculto = esOculta ? '🚫 OCULTA' : (partida.hidden === false ? '👁️ VISIBLE' : '❓ SIN CAMPO');
            const status = partida.status || 'SIN STATUS';
            
            if (esOculta) ocultas++;
            else if (partida.hidden === false) visibles++;
            else sinCampo++;
            
            if (status === 'confirmed') confirmed++;
            else if (status === 'pending') pending++;
            else if (status === 'declined') declined++;
            else sinStatus++;
            
            console.log(`\nPartida: ${partida.id}`);
            console.log(`  Estado: ${estadoOculto} | Status: ${status}`);
            console.log(`  Ganador: ${partida.winner_username || 'N/A'} vs Perdedor: ${partida.loser_username || 'N/A'}`);
            console.log(`  Tipo: ${partida.match_type || 'N/A'} | Fecha: ${partida.timestamp ? new Date(partida.timestamp).toLocaleDateString('es-ES') : 'N/A'}`);
        }
        
        console.log('\n' + '='.repeat(100));
        console.log('\n📊 RESUMEN POR OCULTAMIENTO:');
        console.log(`  - Ocultas (hidden: true): ${ocultas}`);
        console.log(`  - Visibles (hidden: false): ${visibles}`);
        console.log(`  - Sin campo hidden: ${sinCampo}`);
        
        console.log('\n📊 RESUMEN POR STATUS:');
        console.log(`  - Confirmadas: ${confirmed}`);
        console.log(`  - Pendientes: ${pending}`);
        console.log(`  - Declinadas: ${declined}`);
        console.log(`  - Sin status: ${sinStatus}`);
        
        console.log('\n✅ VERIFICACIÓN COMPLETADA.');
        
        if (ocultas === partidasArray.length) {
            console.log('\n✅ ¡TODAS LAS PARTIDAS ESTÁN OCULTAS!');
            console.log('   No deberían aparecer en el historial de la web.');
        } else {
            console.log('\n⚠️  HAY PARTIDAS VISIBLES EN LA BASE DE DATOS.');
            console.log('   Estas partidas podrían aparecer en el historial.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Ejecutar
verificarEstado().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
