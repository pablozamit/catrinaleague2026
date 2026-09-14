// Crear jugadores nuevos para Liga Otoño 2026:
// - nica: ya existe en Auth (uid NWhdkbW9pJdeQ46paOq56wpqFMj1), falta entrada en DB -> elo 1100
// - aymar (1000), florian (1400), wilkins (1400): crear Auth + DB
const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app'
});

const NICA_UID = 'NWhdkbW9pJdeQ46paOq56wpqFMj1';

const newPlayers = [
    { username: 'aymar', password: 'aymar123', elo: 1000 },
    { username: 'florian', password: 'florian123', elo: 1400 },
    { username: 'wilkins', password: 'wilkins123', elo: 1400 }
];

async function main() {
    // 1. nica: crear entrada DB en su uid existente
    const db = admin.database();
    const nicaExisting = await db.ref(`users/${NICA_UID}`).once('value');
    if (nicaExisting.exists()) {
        console.log(`nica ya tiene entrada en DB: ${JSON.stringify(nicaExisting.val())}`);
    } else {
        await db.ref(`users/${NICA_UID}`).set({
            username: 'nica',
            elo_rating: 1100,
            matches_played: 0,
            matches_won: 0,
            email: 'nica@catrina.local',
            created_at: admin.database.ServerValue.TIMESTAMP
        });
        console.log('✅ nica: entrada DB creada (uid existente), ELO 1100');
    }

    // 2. Crear Auth + DB para los nuevos
    for (const player of newPlayers) {
        try {
            const userRecord = await admin.auth().createUser({
                email: `${player.username}@catrina.local`,
                password: player.password,
                displayName: player.username
            });
            await db.ref(`users/${userRecord.uid}`).set({
                username: player.username,
                elo_rating: player.elo,
                matches_played: 0,
                matches_won: 0,
                email: `${player.username}@catrina.local`,
                created_at: admin.database.ServerValue.TIMESTAMP
            });
            console.log(`✅ ${player.username}: Auth + DB creados (ELO ${player.elo})`);
        } catch (error) {
            console.error(`❌ ${player.username}: ${error.message}`);
        }
    }

    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
