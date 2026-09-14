// Listar usuarios de Firebase Auth para ver si nica/aymar/florian/wilkins/dani existen
const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app'
});

async function main() {
    const listUsers = await admin.auth().listUsers(200);
    console.log(`Total Auth users: ${listUsers.users.length}\n`);
    const target = ['nica', 'aymar', 'florian', 'wilkins', 'dani', 'charles', 'roman'];
    listUsers.users.forEach(u => {
        const uname = (u.email || '').split('@')[0];
        if (target.includes(uname)) {
            console.log(`AUTH EXISTE: ${u.email} | uid: ${u.uid} | displayName: ${u.displayName}`);
        }
    });
    console.log('\n--- (solo se listan los relevantes) ---');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
