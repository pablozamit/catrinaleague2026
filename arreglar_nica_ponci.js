// Arreglar cruce nica/ponci:
// 1. Restaurar entrada DB de nica (uid NWhdkbW9pJdeQ46paOq56wpqFMj1) -> username nica, elo 1100
// 2. Crear Auth + DB para ponci con su ELO final del PDF (1003)
const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app'
});

const NICA_UID = 'NWhdkbW9pJdeQ46paOq56wpqFMj1';

async function main() {
    const db = admin.database();

    // 1. Restaurar nica
    await db.ref(`users/${NICA_UID}`).set({
        username: 'nica',
        elo_rating: 1100,
        matches_played: 0,
        matches_won: 0,
        email: 'nica@catrina.local',
        created_at: admin.database.ServerValue.TIMESTAMP
    });
    console.log('✅ nica: entrada DB restaurada (ELO 1100) en su uid Auth');

    // 2. Crear ponci (Auth + DB)
    try {
        const userRecord = await admin.auth().createUser({
            email: 'ponci@catrina.local',
            password: 'ponci123',
            displayName: 'ponci'
        });
        await db.ref(`users/${userRecord.uid}`).set({
            username: 'ponci',
            elo_rating: 1003,
            matches_played: 0,
            matches_won: 0,
            email: 'ponci@catrina.local',
            created_at: admin.database.ServerValue.TIMESTAMP
        });
        console.log('✅ ponci: Auth + DB creados (ELO 1003, login ponci@catrina.local / ponci123)');
    } catch (error) {
        console.error('❌ ponci: ' + error.message);
    }

    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
