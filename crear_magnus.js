// Crear magnus para Liga Otoño 2026 (Auth + DB), ELO inicial 1200
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
            email: 'magnus@catrina.local',
            password: 'magnus123',
            displayName: 'magnus'
        });
        await db.ref(`users/${userRecord.uid}`).set({
            username: 'magnus',
            elo_rating: 1200,
            matches_played: 0,
            matches_won: 0,
            email: 'magnus@catrina.local',
            created_at: admin.database.ServerValue.TIMESTAMP
        });
        console.log('✅ magnus: Auth + DB creados (ELO 1200, login magnus@catrina.local / magnus123)');
    } catch (error) {
        console.error('❌ magnus: ' + error.message);
    }
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
