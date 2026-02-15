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
    { username: 'artur', password: 'artur123', elo: 1810 },
    { username: 'amauris', password: 'ama123', elo: 1659 },
    { username: 'johnny', password: 'johnny123', elo: 1616 },
    { username: 'fer', password: 'fer123', elo: 1597 },
    { username: 'pablo', password: 'pablo123', elo: 1567 },
    { username: 'jack', password: 'jack123', elo: 1504 },
    { username: 'connor', password: 'connor123', elo: 1491 },
    { username: 'joe', password: 'joe123', elo: 1465 },
    { username: 'sergio', password: 'sergio123', elo: 1453 },
    { username: 'luke', password: 'luke123', elo: 1420 },
    { username: 'alvaro', password: 'alvaro123', elo: 1352 },
    { username: 'jonathan', password: 'jonathan123', elo: 1324 },
    { username: 'erfan', password: 'erfan123', elo: 1321 },
    { username: 'alexf', password: 'alexf123', elo: 1299 },
    { username: 'angel', password: 'angel123', elo: 1299 },
    { username: 'david', password: 'david123', elo: 1292 },
    { username: 'angels', password: 'angels123', elo: 1276 },
    { username: 'katee', password: 'katee123', elo: 1272 },
    { username: 'paul', password: 'paul123', elo: 1228 },
    { username: 'adri', password: 'adri123', elo: 1228 },
    { username: 'oli', password: 'oli123', elo: 1209 },
    { username: 'melina', password: 'melina123', elo: 1208 },
    { username: 'sasa', password: 'sasa123', elo: 1200 },
    { username: 'dennis', password: 'dennis123', elo: 1199 },
    { username: 'andrea', password: 'andrea123', elo: 1198 },
    { username: 'jorge', password: 'jorge123', elo: 1198 },
    { username: 'ed', password: 'ed123', elo: 1222 },
    { username: 'clint', password: 'clint123', elo: 1213 },
    { username: 'paddy', password: 'paddy123', elo: 1210 },
    { username: 'pavlo', password: 'pavlo123', elo: 1205 },
    { username: 'charles', password: 'charles123', elo: 1203 },
    { username: 'nica', password: 'nica123', elo: 1188 },
    { username: 'juanma', password: 'juanma123', elo: 1186 },
    { username: 'nino', password: 'nino123', elo: 1177 },
    { username: 'roman', password: 'roman123', elo: 1129 },
    { username: 'vicent', password: 'vicent123', elo: 1100 },
    { username: 'mina', password: 'mina123', elo: 1099 },
    { username: 'ruairi', password: 'ruairi123', elo: 1046 },
    { username: 'maxim', password: 'maxim123', elo: 1018 },
    { username: 'favio', password: 'favio123', elo: 979 },
    { username: 'lucas', password: 'lucas123', elo: 965 },
    { username: 'raul', password: 'raul123', elo: 936 },
    { username: 'luis', password: 'luis123', elo: 921 },
    { username: 'damian', password: 'damian123', elo: 903 },
    { username: 'alexandre', password: 'alexandre123', elo: 898 },
    { username: 'sol', password: 'sol123', elo: 884 },
    { username: 'danilo', password: 'danilo123', elo: 864 },
    { username: 'ruth', password: 'ruth123', elo: 815 },
    { username: 'lydia', password: 'lydia123', elo: 726 }
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
