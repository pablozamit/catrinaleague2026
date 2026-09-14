// Dump completo de usuarios para hacer equivalencias con la lista de participantes
const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app'
});

const db = admin.database();

async function main() {
    const snapshot = await db.ref('users').once('value');
    const users = snapshot.val();

    console.log('=== TODOS LOS CAMPOS DE USUARIO (muestra de uno) ===');
    const firstKey = Object.keys(users)[0];
    console.log(JSON.stringify(users[firstKey], null, 2).substring(0, 2000));

    console.log('\n=== LISTADO: username | full_name | email | elo ===');
    Object.entries(users).forEach(([uid, u]) => {
        console.log(`${u.username} | ${u.full_name || u.fullName || u.name || '---'} | ${u.email || '---'} | ${u.elo_rating || u.elo || '---'}`);
    });

    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
