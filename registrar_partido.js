// Registra un partido de liga como CONFIRMADO, replicando la logica de la app:
// - ELO con la formula exacta de js/elo.js (K variable + peso por tipo)
// - Estadisticas de updatePlayerStats de js/firebase.js
// - Registro completo en /matches con formato estandar
//
// USO: node registrar_partido.js <ganador> <perdedor> <marcadorG> <marcadorP> [tipo] [fecha]
//   Ej: node registrar_partido.js alexb nica 3 0 liga_grupos 2026-09-16
//
// NOTA: leaderboards y badges se recalculan en el proximo "confirmar" desde la web
// (son incrementales y no criticos, igual que en el flujo de la app).
const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');
const { calculateEloChange } = require('./js/elo.js');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app'
});

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Replica de updatePlayerStats (js/firebase.js) adaptada a Node
function calcStats(playerStats, opponentUid, matchData, isWinner, newElo, newPlayed, newWon, now) {
    const u = {};
    u.elo_rating = newElo;
    u.matches_played = newPlayed;
    u.matches_won = newWon;
    u.max_elo = Math.max(playerStats.max_elo || 1200, newElo);
    u.min_elo = Math.min(playerStats.min_elo || 1200, newElo);
    if (!playerStats.elo_lowest_point || newElo < playerStats.elo_lowest_point) u.elo_lowest_point = newElo;
    if (isWinner) {
        u.current_win_streak = (playerStats.current_win_streak || 0) + 1;
        u.max_win_streak = Math.max(playerStats.max_win_streak || 0, u.current_win_streak);
    } else {
        u.current_win_streak = 0;
    }
    const last20 = playerStats.last_20_results || [];
    last20.push(isWinner ? 'W' : 'L');
    if (last20.length > 20) last20.shift();
    u.last_20_results = last20;
    if (!playerStats.first_5_matches || playerStats.first_5_matches.length < 5) {
        const f5 = playerStats.first_5_matches || [];
        f5.push(isWinner ? 'W' : 'L');
        u.first_5_matches = f5;
    }
    const winsByType = playerStats.wins_by_type || { rey_mesa: 0, torneo: 0, liga_grupos: 0, liga_finales: 0 };
    if (isWinner) winsByType[matchData.match_type] = (winsByType[matchData.match_type] || 0) + 1;
    u.wins_by_type = winsByType;
    const uniqOpp = playerStats.unique_opponents || [];
    if (!uniqOpp.includes(opponentUid)) uniqOpp.push(opponentUid);
    u.unique_opponents = uniqOpp;
    const oppStats = playerStats.opponent_stats || {};
    if (!oppStats[opponentUid]) oppStats[opponentUid] = { matches: 0, wins: 0 };
    oppStats[opponentUid].matches += 1;
    if (isWinner) oppStats[opponentUid].wins += 1;
    u.opponent_stats = oppStats;
    const hour = now.getHours(), dow = now.getDay(), weekend = dow === 0 || dow === 6;
    u.weekend_matches = (playerStats.weekend_matches || 0) + (weekend ? 1 : 0);
    u.night_matches = (playerStats.night_matches || 0) + (hour >= 0 && hour < 6 ? 1 : 0);
    u.early_matches = (playerStats.early_matches || 0) + (hour < 20 ? 1 : 0);
    const uniqDays = playerStats.unique_weekdays || [];
    if (!uniqDays.includes(dow)) uniqDays.push(dow);
    u.unique_weekdays = uniqDays;
    const today = now.toISOString().split('T')[0];
    if (playerStats.last_match_date) {
        const y = new Date(now); y.setDate(y.getDate() - 1);
        const yStr = y.toISOString().split('T')[0];
        if (playerStats.last_match_date === yStr) u.daily_streak = (playerStats.daily_streak || 0) + 1;
        else if (playerStats.last_match_date !== today) u.daily_streak = 1;
        else u.daily_streak = playerStats.daily_streak || 1;
    } else {
        u.daily_streak = 1;
    }
    u.last_match_date = today;
    const weekNumber = getWeekNumber(now);
    const weeklyStats = playerStats.weekly_stats || {};
    weeklyStats[weekNumber] = (weeklyStats[weekNumber] || 0) + 1;
    u.weekly_stats = weeklyStats;
    if (isWinner && (playerStats.opponent_elo_ref || 0) - 0 >= 0) { /* giant slayer se calcula abajo */ }
    return u;
}

async function main() {
    const [winnerName, loserName, sW, sL, type, dateStr] = process.argv.slice(2);
    if (!winnerName || !loserName || sW === undefined || sL === undefined) {
        console.error('USO: node registrar_partido.js <ganador> <perdedor> <marcadorG> <marcadorP> [tipo] [fecha]');
        process.exit(1);
    }
    const matchType = type || 'liga_grupos';
    const now = dateStr ? new Date(dateStr + 'T20:00:00') : new Date();
    const scoreW = parseInt(sW, 10), scoreL = parseInt(sL, 10);

    const db = admin.database();
    const snap = await db.ref('users').once('value');
    const users = snap.val();

    let winnerUid = null, loserUid = null, winnerStats = null, loserStats = null;
    Object.entries(users).forEach(([uid, u]) => {
        const un = (u.username || '').toLowerCase();
        if (un === winnerName.toLowerCase()) { winnerUid = uid; winnerStats = u; }
        if (un === loserName.toLowerCase()) { loserUid = uid; loserStats = u; }
    });
    if (!winnerUid || !loserUid) {
        console.error('No encontrados:', !winnerUid ? winnerName : '', !loserUid ? loserName : '');
        process.exit(1);
    }

    const wElo = winnerStats.elo_rating || 1200;
    const lElo = loserStats.elo_rating || 1200;
    const wPlayed = winnerStats.matches_played || 0;
    const lPlayed = loserStats.matches_played || 0;

    const elo = calculateEloChange(wElo, lElo, wPlayed, lPlayed, matchType);

    // Registro del partido (formato estandar de la app, ya confirmado)
    const matchRef = db.ref('matches').push();
    const matchId = matchRef.key;
    const ts = now.getTime();
    await matchRef.set({
        id: matchId,
        player1_id: winnerUid,
        player1_username: winnerStats.username,
        player2_id: loserUid,
        player2_username: loserStats.username,
        player1_score: scoreW,
        player2_score: scoreL,
        winner_id: winnerUid,
        loser_id: loserUid,
        winner_username: winnerStats.username,
        winner_elo_change: elo.winnerChange,
        loser_elo_change: elo.loserChange,
        winner_new_elo: elo.winnerElo,
        loser_new_elo: elo.loserElo,
        match_type: matchType,
        status: 'confirmed',
        created_at: ts,
        confirmed_at: ts,
        confirmed_hour: now.getHours(),
        confirmed_minute: now.getMinutes(),
        confirmed_day_of_week: now.getDay(),
        is_weekend: now.getDay() === 0 || now.getDay() === 6,
        registered_by: 'admin-script'
    });

    // Estadisticas de ambos
    const matchData = { match_type: matchType, player1_id: winnerUid, player2_id: loserUid, player1_score: scoreW, player2_score: scoreL };
    const wUpd = calcStats(winnerStats, loserUid, { ...matchData, player1_id: winnerUid, player2_id: loserUid }, true, elo.winnerElo, wPlayed + 1, (winnerStats.matches_won || 0) + 1, now);
    const lUpd = calcStats(loserStats, winnerUid, { ...matchData, player1_id: winnerUid, player2_id: loserUid }, false, elo.loserElo, lPlayed + 1, (loserStats.matches_won || 0), now);
    // Giant slayer (necesita ELO del rival)
    if (lElo - wElo >= 200) wUpd.giant_slayer_count = (winnerStats.giant_slayer_count || 0) + 1;
    // Perfect 3-0 en liga_grupos
    if (matchType === 'liga_grupos' && scoreW === 3 && scoreL === 0) {
        wUpd.perfect_liga_wins = (winnerStats.perfect_liga_wins || 0) + 1;
    }

    const updates = {};
    Object.entries(wUpd).forEach(([k, v]) => { updates[`users/${winnerUid}/${k}`] = v; });
    Object.entries(lUpd).forEach(([k, v]) => { updates[`users/${loserUid}/${k}`] = v; });
    await db.ref().update(updates);

    console.log(`✅ ${winnerStats.username} ${scoreW}-${scoreL} ${loserStats.username} (${matchType})`);
    console.log(`   ${winnerStats.username}: ${wElo} → ${elo.winnerElo} (${elo.winnerChange >= 0 ? '+' : ''}${elo.winnerChange})`);
    console.log(`   ${loserStats.username}: ${lElo} → ${elo.loserElo} (${elo.loserChange >= 0 ? '+' : ''}${elo.loserChange})`);
    console.log(`   Partido: ${matchId}`);
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
