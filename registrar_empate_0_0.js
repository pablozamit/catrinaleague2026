// Registra el 0-0 excepcional danilo-aymar (J5 derbi D):
// cuenta como partido jugado para ambos, SIN victorias, SIN puntos y SIN cambio de ELO.
const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app'
});

async function main() {
    const db = admin.database();
    const snap = await db.ref('users').once('value');
    const users = snap.val();
    let dUid = null, aUid = null, dSt = null, aSt = null;
    Object.entries(users).forEach(([uid, u]) => {
        const un = (u.username || '').toLowerCase();
        if (un === 'danilo') { dUid = uid; dSt = u; }
        if (un === 'aymar') { aUid = uid; aSt = u; }
    });
    if (!dUid || !aUid) { console.error('Faltan jugadores'); process.exit(1); }

    const now = new Date('2026-10-05T20:00:00');
    const ts = now.getTime();
    const matchRef = db.ref('matches').push();
    await matchRef.set({
        id: matchRef.key,
        player1_id: dUid,
        player1_username: dSt.username,
        player2_id: aUid,
        player2_username: aSt.username,
        player1_score: 0,
        player2_score: 0,
        winner_id: '',
        loser_id: '',
        winner_username: '',
        winner_elo_change: 0,
        loser_elo_change: 0,
        match_type: 'liga_grupos',
        status: 'confirmed',
        draw: true,
        created_at: ts,
        confirmed_at: ts,
        confirmed_hour: now.getHours(),
        confirmed_minute: now.getMinutes(),
        confirmed_day_of_week: now.getDay(),
        is_weekend: now.getDay() === 0 || now.getDay() === 6,
        registered_by: 'admin-script',
        note: 'Excepcion: 0-0 pactado, solo cuenta como jugado'
    });

    const updates = {};
    // Solo PJ + rachas/fecha; sin ELO, sin victorias, sin puntos
    [[dUid, dSt, aUid], [aUid, aSt, dUid]].forEach(([uid, st, oppUid]) => {
        updates[`users/${uid}/matches_played`] = (st.matches_played || 0) + 1;
        const last20 = st.last_20_results || [];
        last20.push('D');
        if (last20.length > 20) last20.shift();
        updates[`users/${uid}/last_20_results`] = last20;
        const uniqOpp = st.unique_opponents || [];
        if (!uniqOpp.includes(oppUid)) uniqOpp.push(oppUid);
        updates[`users/${uid}/unique_opponents`] = uniqOpp;
        updates[`users/${uid}/last_match_date`] = now.toISOString().split('T')[0];
    });
    await db.ref().update(updates);

    console.log(`✅ danilo 0-0 aymar registrado (${matchRef.key}): PJ+1 ambos, sin ELO ni puntos`);
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
