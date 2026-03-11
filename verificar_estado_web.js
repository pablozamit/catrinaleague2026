/**
 * Script para simular exactamente lo que ve la web en /historial/
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

// Simular exactamente el código de historial/index.html
async function simularHistorialWeb() {
    try {
        console.log('🔍 Simulando exactamente lo que ve la web en /historial/\n');
        
        // Paso 1: Obtener todas las partidas (como hace la web)
        const matchesSnap = await db.ref('matches').once('value');
        const matches = matchesSnap.val();
        
        console.log('Paso 1: Obtener todas las partidas de Firebase');
        console.log(`  Total partidas obtenidas: ${matches ? Object.keys(matches).length : 0}`);
        
        if (!matches) {
            console.log('  ✅ No hay partidas, la web mostraría "No hay partidos registrados"');
            return;
        }
        
        // Paso 2: Convertir a array y ordenar (líneas 368-375 de historial/index.html)
        const allMatches = Object.entries(matches)
            .map(([matchId, match]) => ({ 
                matchId, 
                ...match,
                sortTimestamp: match.timestamp || match.confirmed_at || match.created_at || 0
            }))
            .filter(match => match.status === 'confirmed' && !match.hidden)
            .sort((a, b) => b.sortTimestamp - a.sortTimestamp);
        
        console.log('\nPaso 2: Filtrar y ordenar partidas');
        console.log(`  Partidas confirmadas: ${Object.values(matches).filter(m => m.status === 'confirmed').length}`);
        console.log(`  Partidas ocultas: ${Object.values(matches).filter(m => m.hidden === true).length}`);
        console.log(`  Partidas visibles tras filtro: ${allMatches.length}`);
        
        // Paso 3: Generar HTML (como hace la web)
        console.log('\nPaso 3: Generar HTML para mostrar');
        
        if (allMatches.length === 0) {
            console.log('  ✅ La web mostraría: "No hay partidos registrados aún"');
            console.log('  Esto es CORRECTO (todas las partidas están ocultas).');
        } else {
            console.log(`  ⚠️ La web mostraría ${allMatches.length} partidas:`);
            console.log('='.repeat(80));
            
            allMatches.forEach((match, index) => {
                const date = new Date(match.sortTimestamp).toLocaleString('es-ES');
                const winner = match.winner_username || 'Desconocido';
                const loser = match.loser_username || 'Desconocido';
                
                console.log(`\nPartida #${index + 1}:`);
                console.log(`  ${winner} vs ${loser}`);
                console.log(`  Fecha: ${date}`);
                console.log(`  Status: ${match.status}`);
                console.log(`  Oculto: ${match.hidden || false}`);
                console.log(`  ID: ${match.matchId}`);
            });
            
            console.log('\n' + '='.repeat(80));
        }
        
        // Resumen final
        console.log('\n📊 RESUMEN FINAL:');
        console.log(`  - Partidas en Firebase: ${Object.keys(matches).length}`);
        console.log(`  - Partidas confirmadas: ${Object.values(matches).filter(m => m.status === 'confirmed').length}`);
        console.log(`  - Partidas ocultas: ${Object.values(matches).filter(m => m.hidden === true).length}`);
        console.log(`  - Partidas que la web mostraría: ${allMatches.length}`);
        
        if (allMatches.length === 0) {
            console.log('\n✅ CONCLUSIÓN: La web NO debería mostrar ninguna partida.');
            console.log('   Si muestras partidas, revisa:');
            console.log('   1. El archivo que está en Vercel');
            console.log('   2. Si hay otro archivo HTML en la raíz');
            console.log('   3. Si la URL es exactamente /historial/');
        } else {
            console.log('\n⚠️  CONCLUSIÓN: La web SÍ mostraría partidas.');
            console.log('   Hay un problema con el filtro o los datos.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Ejecutar
simularHistorialWeb().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
