// CREDENCIALES ELIMINADAS (11-oct-2026): los valores reales van en config local NO versionada (.env / variables de entorno).
/**
 * Script para importar usuarios a Firebase
 * 
 * USO:
 * 1. npm install firebase-admin
 * 2. Ve a Firebase Console → Configuración → Cuentas de servicio
 * 3. Genera una nueva clave privada y guárdala como serviceAccount.json
 * 4. node import-users.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

// Lista de jugadores con sus contraseñas
const players = [
    { username: 'artur', password: ', elo: 1810 },
    { username: 'amauris', password: ', elo: 1659 },
    { username: 'johnny', password: ', elo: 1616 },
    { username: 'fer', password: ', elo: 1597 },
    { username: 'pablo', password: ', elo: 1567 },
    { username: 'jack', password: ', elo: 1504 },
    { username: 'connor', password: ', elo: 1491 },
    { username: 'joe', password: ', elo: 1465 },
    { username: 'sergio', password: ', elo: 1453 },
    { username: 'luke', password: ', elo: 1420 },
    { username: 'alvaro', password: ', elo: 1352 },
    { username: 'jonathan', password: ', elo: 1324 },
    { username: 'erfan', password: ', elo: 1321 },
    { username: 'alexf', password: ', elo: 1299 },
    { username: 'angel', password: ', elo: 1299 },
    { username: 'david', password: ', elo: 1292 },
    { username: 'angels', password: ', elo: 1276 },
    { username: 'katee', password: ', elo: 1272 },
    { username: 'paul', password: ', elo: 1228 },
    { username: 'adri', password: ', elo: 1228 },
    { username: 'oli', password: ', elo: 1209 },
    { username: 'melina', password: ', elo: 1208 },
    { username: 'sasa', password: ', elo: 1200 },
    { username: 'dennis', password: ', elo: 1199 },
    { username: 'andrea', password: ', elo: 1198 },
    { username: 'jorge', password: ', elo: 1198 },
    { username: 'ed', password: ', elo: 1222 },
    { username: 'clint', password: ', elo: 1213 },
    { username: 'paddy', password: ', elo: 1210 },
    { username: 'pavlo', password: ', elo: 1205 },
    { username: 'charles', password: ', elo: 1203 },
    { username: 'nica', password: ', elo: 1188 },
    { username: 'juanma', password: ', elo: 1186 },
    { username: 'nino', password: ', elo: 1177 },
    { username: 'roman', password: ', elo: 1129 },
    { username: 'vicent', password: ', elo: 1100 },
    { username: 'mina', password: ', elo: 1099 },
    { username: 'ruairi', password: ', elo: 1046 },
    { username: 'maxim', password: ', elo: 1018 },
    { username: 'favio', password: ', elo: 979 },
    { username: 'lucas', password: ', elo: 965 },
    { username: 'raul', password: ', elo: 936 },
    { username: 'luis', password: ', elo: 921 },
    { username: 'damian', password: ', elo: 903 },
    { username: 'alexandre', password: ', elo: 898 },
    { username: 'sol', password: ', elo: 884 },
    { username: 'danilo', password: ', elo: 864 },
    { username: 'ruth', password: ', elo: 815 },
    { username: 'lydia', password: ', elo: 726 }
];

async function importUsers() {
    console.log('🚀 Importando usuarios a Firebase...\n');
    
    let success = 0;
    let failed = 0;
    
    for (const player of players) {
        try {
            // 1. Crear usuario en Auth
            const userRecord = await admin.auth().createUser({
                email: `${player.username}@catrina.local`,
                password: player.password,
                displayName: player.username
            });
            
            // 2. Crear entrada en Realtime Database
            await admin.database().ref(`users/${userRecord.uid}`).set({
                username: player.username,
                elo_rating: player.elo,
                matches_played: 0,
                matches_won: 0,
                email: `${player.username}@catrina.local`,
                created_at: new Date().toISOString()
            });
            
            console.log(`✅ ${player.username} (ELO: ${player.elo})`);
            success++;
        } catch (error) {
            console.error(`❌ ${player.username}: ${error.message}`);
            failed++;
        }
    }
    
    console.log(`\n📊 Resultado: ${success} ok, ${failed} errores`);
}

importUsers().catch(console.error);
