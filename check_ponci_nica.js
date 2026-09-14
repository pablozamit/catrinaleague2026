// Ver estado de ponci, nica, nino en Auth y DB
const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app'
});

async function main() {
    const db = admin.database();
    const res = await admin.auth().listUsers(200);
    const snap = await db.ref('users').once('value');
    const dbu = snap.val();

    res.users.forEach(u => {
        const n = (u.email || '').split('@')[0];
        if (['ponci', 'nica', 'nino'].includes(n)) {
            const d = dbu[u.uid];
            console.log('AUTH ' + u.email + ' uid=' + u.uid + ' -> DB: ' + (d ? (d.username + ' (elo ' + d.elo_rating + ')') : 'SIN ENTRADA'));
        }
    });

    // Ver también dónde está la entrada DB de ponci/nica reales
    console.log('\n--- Entradas DB con username ponci o nica ---');
    Object.entries(dbu).forEach(([uid, u]) => {
        if (['ponci', 'nica'].includes((u.username || '').toLowerCase())) {
            console.log('DB uid=' + uid + ' username=' + u.username + ' elo=' + u.elo_rating + ' email=' + u.email);
        }
    });
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
