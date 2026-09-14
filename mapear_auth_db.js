// Mapear todos los Auth users con su entrada en DB para detectar cruces
const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app'
});

async function main() {
    const db = admin.database();
    const [authRes, dbSnap] = await Promise.all([
        admin.auth().listUsers(200),
        db.ref('users').once('value')
    ]);
    const dbUsers = dbSnap.val();

    console.log('=== AUTH USERS SIN ENTRADA EN DB ===');
    authRes.users.forEach(u => {
        if (!dbUsers[u.uid]) {
            console.log(`${u.email} (uid: ${u.uid}) displayName: ${u.displayName}`);
        }
    });

    console.log('\n=== MISMATCHES: Auth email != DB username ===');
    authRes.users.forEach(u => {
        const dbu = dbUsers[u.uid];
        if (dbu) {
            const authName = (u.email || '').split('@')[0];
            if (dbu.username && dbu.username.toLowerCase() !== authName.toLowerCase()) {
                console.log(`uid ${u.uid}: AUTH=${u.email} pero DB username=${dbu.username} (email DB: ${dbu.email})`);
            }
        }
    });

    console.log('\n=== DB ENTRIES SIN AUTH ===');
    const authUids = new Set(authRes.users.map(u => u.uid));
    Object.entries(dbUsers).forEach(([uid, u]) => {
        if (!authUids.has(uid)) {
            console.log(`DB uid ${uid}: username=${u.username}, email=${u.email}`);
        }
    });

    console.log(`\nTotal Auth: ${authRes.users.length}, Total DB: ${Object.keys(dbUsers).length}`);
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
