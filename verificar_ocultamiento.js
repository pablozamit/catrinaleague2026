/**
 * Script para verificar que el ocultamiento funciona correctamente
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

async function verificarOcultamiento() {
    try {
        console.log('🔍 Verificando estado de ocultamiento de partidas...\n');
        
        // Obtener todas las partidas
        const snapshot = await db.ref('matches').once('value');
        const partidas = snapshot.val();
        
        if (!partidas) {
            console.log('❌ No hay partidas en la base de datos.');
            return;
        }
        
        const partidasArray = Object.entries(partidas).map(([key, value]) => ({ id: key, ...value }));
        console.log(`✅ Total de partidas encontradas: ${partidasArray.length}\n`);
        
        // Contar partidas ocultas y visibles
        let ocultas = 0;
        let visibles = 0;
        let sinCampo = 0;
        
        console.log('📊 DETALLE POR PARTIDA:\n');
        console.log('='.repeat(80));
        
        for (const partida of partidasArray) {
            const esOculta = partida.hidden === true;
            const estado = esOculta ? '🚫 OCULTA' : '👁️ VISIBLE';
            const campo = partida.hidden !== undefined ? `hidden: ${partida.hidden}` : 'hidden: no definido';
            
            console.log(`\nPartida: ${partida.id}`);
            console.log(`  Estado: ${estado}`);
            console.log(`  ${campo}`);
            console.log(`  Status: ${partida.status || 'N/A'}`);
            console.log(`  Ganador: ${partida.winner_username || 'N/A'}`);
            console.log(`  Perdedor: ${partida.loser_username || 'N/A'}`);
            
            if (esOculta) {
                ocultas++;
            } else if (partida.hidden === false) {
                visibles++;
            } else {
                sinCampo++;
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('\n📊 RESUMEN:');
        console.log(`- Total de partidas: ${partidasArray.length}`);
        console.log(`- Ocultas (hidden: true): ${ocultas}`);
        console.log(`- Visibles (hidden: false): ${visibles}`);
        console.log(`- Sin campo hidden: ${sinCampo}`);
        
        if (ocultas === partidasArray.length) {
            console.log('\n✅ ¡Todas las partidas están ocultas!');
        } else if (sinCampo === partidasArray.length) {
            console.log('\n⚠️ Ninguna partida tiene el campo hidden.');
        } else {
            console.log('\n⚠️ Hay partidas mixtas (algunas ocultas, otras visibles).');
        }
        
        // Verificar getUserHistory
        console.log('\n' + '='.repeat(80));
        console.log('\n🔍 Verificando getUserHistory...\n');
        
        // Obtener algún usuario con partidas
        const usuariosSnapshot = await db.ref('users').once('value');
        const usuarios = usuariosSnapshot.val();
        
        // Buscar un usuario que tenga partidas confirmadas
        let usuarioConPartidas = null;
        for (const [uid, userData] of Object.entries(usuarios)) {
            if (userData.matches_played && userData.matches_played > 0) {
                usuarioConPartidas = { uid, ...userData };
                break;
            }
        }
        
        if (usuarioConPartidas) {
            console.log(`Probando con usuario: ${usuarioConPartidas.username} (${usuarioConPartidas.uid})`);
            
            // Simular getUserHistory
            const historial = partidasArray.filter(p => 
                p.status === 'confirmed' && 
                !p.hidden && 
                (p.player1_id === usuarioConPartidas.uid || p.player2_id === usuarioConPartidas.uid)
            );
            
            console.log(`Partidas confirmadas y visibles en historial: ${historial.length}`);
            
            if (historial.length === 0) {
                console.log('✅ Correcto: el historial está vacío (todas las partidas están ocultas).');
            } else {
                console.log('⚠️ Hay partidas visibles en el historial.');
            }
        } else {
            console.log('No se encontró ningún usuario con partidas jugadas.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Ejecutar
verificarOcultamiento().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
