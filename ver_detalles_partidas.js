/**
 * Script para ver los detalles de todas las partidas
 * Uso: node ver_detalles_partidas.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

async function verDetallesPartidas() {
    try {
        console.log('🔍 Consultando todas las partidas para ver detalles...\n');
        
        // Obtener todas las partidas
        const snapshot = await db.ref('matches').once('value');
        const partidas = snapshot.val();
        
        if (!partidas) {
            console.log('❌ No hay partidas en la base de datos.');
            return;
        }
        
        const partidasArray = Object.entries(partidas).map(([key, value]) => ({ id: key, ...value }));
        console.log(`✅ Total de partidas encontradas: ${partidasArray.length}\n`);
        
        // Mostrar detalles de cada partida
        for (const partida of partidasArray) {
            console.log(`\nPartida: ${partida.id}`);
            console.log('='.repeat(60));
            console.log('Campos disponibles:');
            console.log(JSON.stringify(partida, null, 2));
            console.log('-'.repeat(60));
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Ejecutar
verDetallesPartidas().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
