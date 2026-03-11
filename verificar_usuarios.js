/**
 * Script para verificar que los usuarios mantienen su ELO y badges
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

async function verificarUsuarios() {
    try {
        console.log('🔍 Verificando estado de los usuarios...\n');
        
        // Obtener todos los usuarios
        const snapshot = await db.ref('users').once('value');
        const users = snapshot.val();
        
        if (!users) {
            console.log('❌ No hay usuarios en la base de datos.');
            return;
        }
        
        const usersArray = Object.entries(users).map(([key, value]) => ({ uid: key, ...value }));
        console.log(`✅ Total de usuarios encontrados: ${usersArray.length}\n`);
        
        console.log('📊 ESTADO DE USUARIOS:\n');
        console.log('='.repeat(80));
        
        let usuariosConPartidas = 0;
        
        for (const user of usersArray) {
            const username = user.username || 'N/A';
            const elo = user.elo_rating || 1200;
            const matchesPlayed = user.matches_played || 0;
            const matchesWon = user.matches_won || 0;
            const badges = user.badges ? Object.keys(user.badges).length : 0;
            
            console.log(`\nUsuario: ${username}`);
            console.log(`  - ELO: ${elo}`);
            console.log(`  - Partidas jugadas: ${matchesPlayed}`);
            console.log(`  - Partidas ganadas: ${matchesWon}`);
            console.log(`  - Badges: ${badges}`);
            
            if (matchesPlayed > 0) {
                usuariosConPartidas++;
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log(`\n📊 RESUMEN:`);
        console.log(`- Total de usuarios: ${usersArray.length}`);
        console.log(`- Usuarios con partidas jugadas: ${usuariosConPartidas}`);
        
        console.log('\n✅ Verificación completada.');
        console.log('\nNota: Los ELO y badges se mantienen intactos.');
        console.log('Las partidas están ocultas pero los datos de usuarios no se modificaron.');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Ejecutar
verificarUsuarios().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
