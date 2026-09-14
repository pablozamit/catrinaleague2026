// Crear dani para Liga Otoño 2026 (Auth + DB), ELO inicial 1100
const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app'
});

async function main() {
    const db = admin.database();
    try {
        const userRecord = await admin.auth().createUser({
            email: 'dani@catrina.local',
            password: 'dani123',
            displayName: 'dani'
        });
        await db.ref(`users/${userRecord.uid}`).set({
            username: 'dani',
            elo_rating: 1100,
            matches_played: 0,
            matches_won: 0,
            email: 'dani@catrina.local',
            created_at: admin.database.ServerValue.TIMESTAMP
        });
        console.log('✅ dani: Auth + DB creados (ELO 1100, login dani@catrina.local / dani123)');
    } catch (error) {
        console.error('❌ dani: ' + error.message);
    }
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
