/**
 * Script para verificar la API de Firebase directamente
 * Simula lo que ve la web en https://catrinaleague2026.vercel.app/historial/
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

async function verificarAPI() {
    try {
        console.log('🔍 Verificando API de Firebase...\n');
        
        // Obtener todas las partidas (como lo haría la web)
        const snapshot = await db.ref('matches').once('value');
        const matches = snapshot.val();
        
        if (!matches) {
            console.log('✅ No hay partidas en la base de datos.');
            return;
        }
        
        console.log(`📊 Total de partidas en Firebase: ${Object.keys(matches).length}\n`);
        
        // Simular el filtro que usa la web (historial/index.html línea 374)
        const matchesArray = Object.entries(matches)
            .map(([matchId, match]) => ({ 
                matchId, 
                ...match,
                sortTimestamp: match.timestamp || match.confirmed_at || match.created_at || 0
            }))
            .filter(match => match.status === 'confirmed' && !match.hidden)
            .sort((a, b) => b.sortTimestamp - a.sortTimestamp);
        
        console.log(`📊 Partidas que aparecerían en /historial/: ${matchesArray.length}\n`);
        
        if (matchesArray.length === 0) {
            console.log('✅ PERFECTO: No hay partidas visibles en el historial.');
            console.log('   Esto es lo que debería verse en la web.');
        } else {
            console.log('⚠️  ATENCIÓN: Hay partidas visibles en el historial:');
            console.log('='.repeat(80));
            
            matchesArray.forEach((match, index) => {
                console.log(`\nPartida #${index + 1}:`);
                console.log(`  ID: ${match.matchId}`);
                console.log(`  Ganador: ${match.winner_username || 'N/A'}`);
                console.log(`  Perdedor: ${match.loser_username || 'N/A'}`);
                console.log(`  Status: ${match.status}`);
                console.log(`  Oculto: ${match.hidden || 'false'}`);
                console.log(`  Fecha: ${new Date(match.sortTimestamp).toLocaleString('es-ES')}`);
            });
            
            console.log('\n' + '='.repeat(80));
        }
        
        // Verificar estadísticas
        const totalPartidas = Object.keys(matches).length;
        const partidasOcultas = Object.values(matches).filter(m => m.hidden === true).length;
        const partidasConfirmadas = Object.values(matches).filter(m => m.status === 'confirmed').length;
        const partidasConfirmadasNoOcultas = Object.values(matches).filter(m => m.status === 'confirmed' && !m.hidden).length;
        
        console.log('\n📊 ESTADÍSTICAS:');
        console.log(`  - Total partidas en Firebase: ${totalPartidas}`);
        console.log(`  - Partidas ocultas: ${partidasOcultas}`);
        console.log(`  - Partidas confirmadas: ${partidasConfirmadas}`);
        console.log(`  - Partidas confirmadas NO ocultas: ${partidasConfirmadasNoOcultas}`);
        
        if (partidasConfirmadasNoOcultas === 0) {
            console.log('\n✅ CONCLUSIÓN: No hay partidas visibles en el historial.');
            console.log('   Si la web muestra partidas, es por caché del navegador o de Vercel.');
        } else {
            console.log('\n⚠️  CONCLUSIÓN: Hay partidas visibles en el historial.');
            console.log('   Revisa el código de la web o limpia la caché.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Ejecutar
verificarAPI().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
