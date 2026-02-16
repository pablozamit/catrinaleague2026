/**
 * Configuración Firebase - La Catrina Pool League
 * 
 * CONFIGURACIÓN: Completa estos datos desde Firebase Console
 * después de crear el proyecto.
 */

// Configuración Firebase - La Catrina Pool League
const firebaseConfig = {
    apiKey: "AIzaSyBgyARlrVo-J1qIhu49Nfvif_p7xVVFW5s",
    authDomain: "elopool-f1e62.firebaseapp.com",
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "elopool-f1e62",
    storageBucket: "elopool-f1e62.firebasestorage.app",
    messagingSenderId: "125100775441",
    appId: "1:125100775441:web:b61f62a308af5c678db9b0",
    measurementId: "G-BNZEK056MB"
};

// Inicializar Firebase
let auth, database;

function initFirebase() {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    database = firebase.database();
}

// Estado de autenticación
let currentUser = null;
let onAuthStateChangedCallback = null;

// Observador de autenticación
function onAuthStateChanged(callback) {
    onAuthStateChangedCallback = callback;
    
    if (!auth) initFirebase();
    
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        callback(user);
    });
}

// Iniciar sesión con email/password
function signIn(email, password) {
    if (!auth) initFirebase();
    return auth.signInWithEmailAndPassword(email, password);
}

// Cerrar sesión
function signOut() {
    if (!auth) initFirebase();
    return auth.signOut();
}

// Obtener usuario actual
function getCurrentUser() {
    return currentUser;
}

// ===== FUNCIONES DE BASE DE DATOS =====

// Obtener datos del usuario
function getUserData(uid) {
    return database.ref(`users/${uid}`).once('value').then(snap => snap.val());
}

// Actualizar ELO del usuario
function updateUserElo(uid, elo, matchesPlayed, matchesWon) {
    return database.ref(`users/${uid}`).update({
        elo_rating: elo,
        matches_played: matchesPlayed,
        matches_won: matchesWon
    });
}

// Crear partido pendientes
function createMatch(matchData) {
    const newMatchRef = database.ref('matches').push();
    return newMatchRef.set({
        ...matchData,
        id: newMatchRef.key,
        status: 'pending',
        created_at: firebase.database.ServerValue.TIMESTAMP
    });
}

// Obtener partidos pendientes de confirmar para un usuario
function getPendingMatches(uid) {
    return database.ref('matches')
        .orderByChild('player2_id')
        .equalTo(uid)
        .once('value')
        .then(snap => {
            const matches = snap.val();
            if (!matches) return [];
            return Object.entries(matches)
                .filter(([key, match]) => match.status === 'pending')
                .map(([key, match]) => ({ ...match, key }));
        });
}

// Confirmar partido
async function confirmMatch(matchId, eloChanges) {
    try {
        // Validate inputs
        if (!matchId || !eloChanges) {
            throw new Error('Missing required parameters');
        }
        
        if (!eloChanges.winnerId || !eloChanges.loserId) {
            throw new Error('Invalid player IDs');
        }
        
        if (typeof eloChanges.winnerElo !== 'number' || typeof eloChanges.loserElo !== 'number') {
            throw new Error('Invalid ELO values');
        }
        
        const updates = {};
        const now = new Date();
        
        // Get match data first
        const matchSnap = await database.ref(`matches/${matchId}`).once('value');
        const matchData = matchSnap.val();
        
        if (!matchData) {
            throw new Error('Match not found');
        }
        
        if (matchData.status === 'confirmed') {
            throw new Error('Match already confirmed');
        }
        
        // Get current stats for both players - use Promise.all for parallel reads
        const [winnerSnap, loserSnap] = await Promise.all([
            database.ref(`users/${eloChanges.winnerId}`).once('value'),
            database.ref(`users/${eloChanges.loserId}`).once('value')
        ]);
        
        const winnerStats = winnerSnap.val();
        const loserStats = loserSnap.val();
        
        if (!winnerStats || !loserStats) {
            throw new Error('Player data not found');
        }
        
        // Actualizar partido con timestamp
        updates[`matches/${matchId}/status`] = 'confirmed';
        updates[`matches/${matchId}/confirmed_at`] = firebase.database.ServerValue.TIMESTAMP;
        updates[`matches/${matchId}/confirmed_hour`] = now.getHours();
        updates[`matches/${matchId}/confirmed_minute`] = now.getMinutes();
        updates[`matches/${matchId}/confirmed_day_of_week`] = now.getDay();
        updates[`matches/${matchId}/is_weekend`] = now.getDay() === 0 || now.getDay() === 6;
        
        // Update both players' stats
        const winnerUpdates = updatePlayerStats(winnerStats, loserStats, matchData, true, eloChanges.winnerElo, eloChanges.winnerMatches, eloChanges.winnerWins, now);
        // BUG FIX: loserWins should be passed, not loserMatches twice
        const loserWins = (loserStats.matches_won || 0); // Loser doesn't gain wins, stays the same
        const loserUpdates = updatePlayerStats(loserStats, winnerStats, matchData, false, eloChanges.loserElo, eloChanges.loserMatches, loserWins, now);
        
        // Merge updates
        Object.entries(winnerUpdates).forEach(([key, val]) => {
            updates[`users/${eloChanges.winnerId}/${key}`] = val;
        });
        Object.entries(loserUpdates).forEach(([key, val]) => {
            updates[`users/${eloChanges.loserId}/${key}`] = val;
        });
        
        // Apply all updates atomically
        await database.ref().update(updates);
        
        // Update global leaderboards (in try-catch to not fail entire operation)
        try {
            const winnerUsername = winnerStats.username || 'Unknown';
            await updateGlobalLeaderboards(eloChanges.winnerId, winnerUsername, now);
        } catch (leaderboardError) {
            console.error('Leaderboard update failed:', leaderboardError);
            // Don't throw - leaderboard is non-critical
        }
        
        // Calculate rankings and update ranking-based badges
        try {
            await updateRankingBadges();
        } catch (rankingError) {
            console.error('Ranking badges update failed:', rankingError);
            // Don't throw - ranking badges are non-critical
        }
        
        // Check badges for both players
        // IMPORTANT: Reload user data from database to include ranking badge updates (reached_rank_1, etc.)
        let winnerNewStats, loserNewStats;
        try {
            const [updatedWinnerSnap, updatedLoserSnap] = await Promise.all([
                database.ref(`users/${eloChanges.winnerId}`).once('value'),
                database.ref(`users/${eloChanges.loserId}`).once('value')
            ]);
            winnerNewStats = updatedWinnerSnap.val();
            loserNewStats = updatedLoserSnap.val();
        } catch (reloadError) {
            console.error('Failed to reload user stats:', reloadError);
            // Fallback to local stats if reload fails
            winnerNewStats = { ...winnerStats, ...winnerUpdates };
            loserNewStats = { ...loserStats, ...loserUpdates };
        }
        
        if (typeof checkBadges !== 'undefined') {
            try {
                const winnerNewBadges = checkBadges(winnerNewStats);
                const loserNewBadges = checkBadges(loserNewStats);
                
                // Award new badges
                if (winnerNewBadges.length > 0) {
                    await awardBadges(eloChanges.winnerId, winnerNewStats, winnerNewBadges);
                }
                if (loserNewBadges.length > 0) {
                    await awardBadges(eloChanges.loserId, loserNewStats, loserNewBadges);
                }
            } catch (badgeError) {
                console.error('Badge check/award failed:', badgeError);
                // Don't throw - badges are non-critical
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error confirming match:', error);
        throw new Error(`Failed to confirm match: ${error.message}`);
    }
}

// Helper function to update player statistics
function updatePlayerStats(playerStats, opponentStats, matchData, isWinner, newElo, newMatchesPlayed, newMatchesWon, now) {
    const updates = {};
    
    // Basic stats
    updates.elo_rating = newElo;
    updates.matches_played = newMatchesPlayed;
    updates.matches_won = newMatchesWon;
    
    // ELO tracking
    updates.max_elo = Math.max(playerStats.max_elo || 1200, newElo);
    updates.min_elo = Math.min(playerStats.min_elo || 1200, newElo);
    
    // Phoenix badge tracking
    if (!playerStats.elo_lowest_point || newElo < playerStats.elo_lowest_point) {
        updates.elo_lowest_point = newElo;
    }
    if (playerStats.elo_lowest_point && (playerStats.max_elo || 1200) - playerStats.elo_lowest_point >= 300) {
        if (newElo >= playerStats.elo_lowest_point + 300) {
            updates.phoenix_unlocked = true;
        }
    }
    
    // Win streak
    if (isWinner) {
        updates.current_win_streak = (playerStats.current_win_streak || 0) + 1;
        updates.max_win_streak = Math.max(playerStats.max_win_streak || 0, updates.current_win_streak);
    } else {
        updates.current_win_streak = 0;
    }
    
    // Last 20 results
    const last20 = playerStats.last_20_results || [];
    last20.push(isWinner ? 'W' : 'L');
    if (last20.length > 20) last20.shift();
    updates.last_20_results = last20;
    
    // First 5 matches
    if (!playerStats.first_5_matches || playerStats.first_5_matches.length < 5) {
        const first5 = playerStats.first_5_matches || [];
        first5.push(isWinner ? 'W' : 'L');
        updates.first_5_matches = first5;
    }
    
    // Wins by type
    const winsByType = playerStats.wins_by_type || { rey_mesa: 0, torneo: 0, liga_grupos: 0, liga_finales: 0 };
    if (isWinner) {
        winsByType[matchData.match_type] = (winsByType[matchData.match_type] || 0) + 1;
    }
    updates.wins_by_type = winsByType;
    
    // Unique opponents
    const uniqueOpponents = playerStats.unique_opponents || [];
    const opponentId = isWinner ? matchData.player2_id : matchData.player1_id;
    if (!uniqueOpponents.includes(opponentId)) {
        uniqueOpponents.push(opponentId);
    }
    updates.unique_opponents = uniqueOpponents;
    
    // Opponent stats
    const opponentStatsMap = playerStats.opponent_stats || {};
    if (!opponentStatsMap[opponentId]) {
        opponentStatsMap[opponentId] = { matches: 0, wins: 0 };
    }
    opponentStatsMap[opponentId].matches += 1;
    if (isWinner) {
        opponentStatsMap[opponentId].wins += 1;
    }
    updates.opponent_stats = opponentStatsMap;
    
    // Time-based tracking
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    updates.weekend_matches = (playerStats.weekend_matches || 0) + (isWeekend ? 1 : 0);
    updates.night_matches = (playerStats.night_matches || 0) + (hour >= 0 && hour < 6 ? 1 : 0);
    updates.early_matches = (playerStats.early_matches || 0) + (hour < 20 ? 1 : 0);
    
    // Unique weekdays
    const uniqueWeekdays = playerStats.unique_weekdays || [];
    if (!uniqueWeekdays.includes(dayOfWeek)) {
        uniqueWeekdays.push(dayOfWeek);
    }
    updates.unique_weekdays = uniqueWeekdays;
    
    // Time traveler badge (00:34)
    if (hour === 0 && now.getMinutes() === 34) {
        updates.time_traveler_unlocked = true;
    }
    
    // Daily streak
    const lastMatchDate = playerStats.last_match_date;
    const today = now.toISOString().split('T')[0];
    if (lastMatchDate) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastMatchDate === yesterdayStr) {
            updates.daily_streak = (playerStats.daily_streak || 0) + 1;
        } else if (lastMatchDate !== today) {
            updates.daily_streak = 1;
        } else {
            updates.daily_streak = playerStats.daily_streak || 1;
        }
    } else {
        updates.daily_streak = 1;
    }
    updates.last_match_date = today;
    
    // Weekly consistency
    const weekNumber = getWeekNumber(now);
    const weeklyStats = playerStats.weekly_stats || {};
    weeklyStats[weekNumber] = (weeklyStats[weekNumber] || 0) + 1;
    updates.weekly_stats = weeklyStats;
    
    // Count consecutive weeks with at least 1 match
    const weeks = Object.keys(weeklyStats).map(Number).sort((a, b) => b - a);
    let weeklyConsistency = 0;
    for (let i = 0; i < weeks.length; i++) {
        if (i === 0 || weeks[i] === weeks[i-1] - 1) {
            weeklyConsistency++;
        } else {
            break;
        }
    }
    updates.weekly_consistency = weeklyConsistency;
    
    // Giant slayer
    const eloDiff = Math.abs((playerStats.elo_rating || 1200) - (opponentStats.elo_rating || 1200));
    if (isWinner && (opponentStats.elo_rating || 1200) - (playerStats.elo_rating || 1200) >= 200) {
        updates.giant_slayer_count = (playerStats.giant_slayer_count || 0) + 1;
    }
    
    // New year resolution
    if (now.getMonth() === 0 && !playerStats.new_year_resolution_unlocked) {
        updates.new_year_resolution_unlocked = true;
    }
    
    // COMEBACK TRACKING
    const comebackHistory = playerStats.comeback_history || {};
    if (!comebackHistory[opponentId]) {
        comebackHistory[opponentId] = { consecutive_losses: 0, consecutive_wins_after_losses: 0 };
    }
    
    if (isWinner) {
        // Check if we had consecutive losses to this opponent
        if (comebackHistory[opponentId].consecutive_losses >= 2) {
            comebackHistory[opponentId].consecutive_wins_after_losses++;
            
            // Rey del Comeback: 3 wins after 2 consecutive losses
            if (comebackHistory[opponentId].consecutive_wins_after_losses >= 3) {
                if (!playerStats.comeback_king_unlocked) {
                    updates.comeback_king_unlocked = true;
                }
            }
            
            // Artista del Comeback: count all comeback wins
            updates.comeback_wins = (playerStats.comeback_wins || 0) + 1;
        }
        // Reset losses counter on win
        comebackHistory[opponentId].consecutive_losses = 0;
    } else {
        // Increment losses counter
        comebackHistory[opponentId].consecutive_losses++;
        // Reset wins after losses counter
        comebackHistory[opponentId].consecutive_wins_after_losses = 0;
    }
    updates.comeback_history = comebackHistory;
    
    // PERFECT WINS TRACKING (for sharpshooter)
    // Track 3-0 victories in liga_grupos ONLY (not liga_finales)
    if (isWinner && matchData.match_type === 'liga_grupos') {
        // Check if it was a 3-0 victory
        const winnerScore = isWinner ? matchData.player1_score : matchData.player2_score;
        const loserScore = isWinner ? matchData.player2_score : matchData.player1_score;
        
        if (winnerScore === 3 && loserScore === 0) {
            // Perfect 3-0 win in liga_grupos
            updates.perfect_liga_wins = (playerStats.perfect_liga_wins || 0) + 1;
            console.log(`🎯 Perfect 3-0 win recorded for player. Total: ${updates.perfect_liga_wins}`);
        }
    }
    
    // SPEED DEMON TRACKING
    // Track last 5 wins to check if they're within 1 hour
    if (isWinner) {
        const speedWins = playerStats.speed_wins_timestamps || [];
        speedWins.push(now.getTime());
        if (speedWins.length > 5) speedWins.shift();
        updates.speed_wins_timestamps = speedWins;
        
        // Check if 5 wins within 1 hour
        if (speedWins.length === 5) {
            const timeSpan = speedWins[4] - speedWins[0];
            if (timeSpan <= 3600000 && !playerStats.speed_demon_unlocked) { // 1 hour in ms
                updates.speed_demon_unlocked = true;
            }
        }
    }
    
    // MARATHON PLAYER TRACKING
    // Track consecutive hours of play
    const lastMatchTime = playerStats.last_match_timestamp;
    const currentTime = now.getTime();
    const marathonSession = playerStats.marathon_session || { start_time: currentTime, total_hours: 0 };
    
    if (lastMatchTime && (currentTime - lastMatchTime) <= 3600000) { // Within 1 hour
        // Still in marathon session
        const hoursInSession = (currentTime - marathonSession.start_time) / (1000 * 60 * 60);
        if (hoursInSession >= 6 && !playerStats.marathon_player_unlocked) {
            updates.marathon_player_unlocked = true;
        }
    } else {
        // New session
        marathonSession.start_time = currentTime;
        marathonSession.total_hours = 0;
    }
    updates.marathon_session = marathonSession;
    updates.last_match_timestamp = currentTime;
    
    return updates;
}

// Get ISO week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Award badges to a player
async function awardBadges(userId, userStats, newBadges) {
    const updates = {};
    const badges = userStats.badges || {};
    const now = Date.now();
    
    for (const badge of newBadges) {
        badges[badge.id] = {
            earned_at: now,
            seen: false
        };
    }
    
    // Calculate new experience and level
    const currentExp = userStats.experience_points || 0;
    const badgePoints = newBadges.reduce((sum, b) => sum + b.points, 0);
    const newExp = currentExp + badgePoints;
    
    updates[`users/${userId}/badges`] = badges;
    updates[`users/${userId}/experience_points`] = newExp;
    
    // Calculate level
    const level = Math.floor(Math.sqrt(newExp / 100)) + 1;
    updates[`users/${userId}/level`] = level;
    
    return database.ref().update(updates);
}

// Rechazar partido
function declineMatch(matchId) {
    return database.ref(`matches/${matchId}`).update({
        status: 'declined'
    });
}

// Obtener todos los usuarios (para selectores)
function getAllUsers() {
    return database.ref('users').once('value').then(snap => {
        const users = snap.val();
        if (!users) return [];
        return Object.entries(users).map(([key, user]) => ({
            uid: key,
            ...user
        })).sort((a, b) => (b.elo_rating || 1200) - (a.elo_rating || 1200));
    });
}

// ===== SISTEMA DE CAMPEONES =====

// Get period keys for organizing stats
function getPeriodKeys(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    const weekNumber = getWeekNumber(date);
    const quarter = Math.floor((month - 1) / 3) + 1; // 1-4
    
    return {
        daily: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        weekly: `${year}-W${String(weekNumber).padStart(2, '0')}`,
        monthly: `${year}-${String(month).padStart(2, '0')}`,
        quarterly: `${year}-Q${quarter}`,
        yearly: `${year}`
    };
}

// Update global leaderboards after a match
async function updateGlobalLeaderboards(winnerId, winnerUsername, matchDate) {
    const periods = getPeriodKeys(matchDate);
    const updates = {};
    
    // Update wins count for each period
    for (const [periodType, periodKey] of Object.entries(periods)) {
        const path = `leaderboards/${periodType}/${periodKey}/${winnerId}`;
        
        // Get current count
        const snap = await database.ref(path).once('value');
        const current = snap.val() || { username: winnerUsername, wins: 0 };
        
        updates[path] = {
            username: winnerUsername,
            wins: current.wins + 1,
            lastWin: matchDate.getTime()
        };
    }
    
    await database.ref().update(updates);
}

// Calculate champions for a specific period
async function calculateChampions(periodType, periodKey) {
    const leaderboardSnap = await database.ref(`leaderboards/${periodType}/${periodKey}`).once('value');
    const leaderboard = leaderboardSnap.val();
    
    if (!leaderboard) return null;
    
    // Find player(s) with most wins
    let maxWins = 0;
    let champions = [];
    
    for (const [userId, data] of Object.entries(leaderboard)) {
        if (data.wins > maxWins) {
            maxWins = data.wins;
            champions = [{ userId, ...data }];
        } else if (data.wins === maxWins) {
            champions.push({ userId, ...data });
        }
    }
    
    return {
        champions,
        maxWins,
        totalPlayers: Object.keys(leaderboard).length
    };
}

// Award champion badges
async function awardChampionBadges(periodType) {
    const now = new Date();
    let periodKey;
    
    // Determine which period to check based on type
    switch (periodType) {
        case 'daily':
            // Check yesterday
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            periodKey = getPeriodKeys(yesterday).daily;
            break;
        case 'weekly':
            // Check last week
            const lastWeek = new Date(now);
            lastWeek.setDate(lastWeek.getDate() - 7);
            periodKey = getPeriodKeys(lastWeek).weekly;
            break;
        case 'monthly':
            // Check last month
            const lastMonth = new Date(now);
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            periodKey = getPeriodKeys(lastMonth).monthly;
            break;
        case 'quarterly':
            // Check last quarter
            const lastQuarter = new Date(now);
            lastQuarter.setMonth(lastQuarter.getMonth() - 3);
            periodKey = getPeriodKeys(lastQuarter).quarterly;
            break;
        case 'yearly':
            // Check last year
            const lastYear = new Date(now);
            lastYear.setFullYear(lastYear.getFullYear() - 1);
            periodKey = getPeriodKeys(lastYear).yearly;
            break;
    }
    
    const championData = await calculateChampions(periodType, periodKey);
    
    if (!championData || championData.champions.length === 0) {
        return;
    }
    
    // Award badges to champion(s)
    const badgeFieldMap = {
        'daily': 'daily_champion_count',
        'weekly': 'weekly_champion_count',
        'monthly': 'monthly_champion_count',
        'quarterly': 'quarter_champion_count',
        'yearly': 'yearly_champion_count'
    };
    
    const fieldName = badgeFieldMap[periodType];
    const updates = {};
    
    for (const champion of championData.champions) {
        const userSnap = await database.ref(`users/${champion.userId}`).once('value');
        const userData = userSnap.val();
        
        if (userData) {
            const currentCount = userData[fieldName] || 0;
            updates[`users/${champion.userId}/${fieldName}`] = currentCount + 1;
            
            // Record the championship win
            updates[`users/${champion.userId}/championships/${periodType}/${periodKey}`] = {
                wins: champion.wins,
                awarded_at: Date.now()
            };
        }
    }
    
    if (Object.keys(updates).length > 0) {
        await database.ref().update(updates);
        
        // Check for new badges for each champion
        if (typeof checkBadges !== 'undefined') {
            for (const champion of championData.champions) {
                const userSnap = await database.ref(`users/${champion.userId}`).once('value');
                const updatedStats = userSnap.val();
                
                const newBadges = checkBadges(updatedStats);
                if (newBadges.length > 0) {
                    await awardBadges(champion.userId, updatedStats, newBadges);
                }
            }
        }
    }
    
    return championData;
}

// Get current leaderboard for a period
async function getCurrentLeaderboard(periodType) {
    const now = new Date();
    const periodKey = getPeriodKeys(now)[periodType];
    
    const championData = await calculateChampions(periodType, periodKey);
    
    if (!championData) {
        return { leaders: [], periodKey };
    }
    
    // Get all players sorted by wins
    const leaderboardSnap = await database.ref(`leaderboards/${periodType}/${periodKey}`).once('value');
    const leaderboard = leaderboardSnap.val();
    
    if (!leaderboard) {
        return { leaders: [], periodKey };
    }
    
    const leaders = Object.entries(leaderboard)
        .map(([userId, data]) => ({ userId, ...data }))
        .sort((a, b) => b.wins - a.wins);
    
    return { leaders, periodKey };
}

// Update ranking-based badges (Leyenda del Club, Inmortal)
async function updateRankingBadges() {
    // Get all users
    const usersSnap = await database.ref('users').once('value');
    const users = usersSnap.val();
    
    if (!users) return;
    
    // Sort by ELO (descending)
    const sortedUsers = Object.entries(users)
        .map(([uid, user]) => ({ uid, ...user }))
        .sort((a, b) => (b.elo_rating || 1200) - (a.elo_rating || 1200));
    
    const updates = {};
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // 1. Award "Leyenda del Club" to rank #1
    if (sortedUsers.length > 0) {
        const rank1User = sortedUsers[0];
        if (!rank1User.reached_rank_1) {
            console.log(`🏆 Awarding Leyenda del Club to ${rank1User.username}`);
            updates[`users/${rank1User.uid}/reached_rank_1`] = true;
        }
    }
    
    // 2. Track "Inmortal" (consecutive days in top 3)
    const top3 = sortedUsers.slice(0, 3);
    
    for (const user of top3) {
        const currentStreak = user.consecutive_days_top3 || 0;
        const lastDate = user.last_top3_date;
        
        if (lastDate === today) {
            // Already counted today, do nothing
            continue;
        } else if (lastDate === yesterdayStr) {
            // Was in top 3 yesterday too, increment streak
            updates[`users/${user.uid}/consecutive_days_top3`] = currentStreak + 1;
            updates[`users/${user.uid}/last_top3_date`] = today;
            console.log(`💎 ${user.username}: Top 3 streak ${currentStreak + 1} days`);
        } else {
            // Lost the streak or first time, reset to 1
            updates[`users/${user.uid}/consecutive_days_top3`] = 1;
            updates[`users/${user.uid}/last_top3_date`] = today;
            console.log(`💎 ${user.username}: Top 3 streak started (1 day)`);
        }
    }
    
    // Apply all updates
    if (Object.keys(updates).length > 0) {
        await database.ref().update(updates);
    }
}

// Initialize all ranking badges for existing users
// Call this function from browser console to fix missing badges: await initializeRankingBadges()
async function initializeRankingBadges() {
    console.log('🏆 Inicializando badges de ranking...');
    
    const usersSnap = await database.ref('users').once('value');
    const users = usersSnap.val();
    
    if (!users) {
        console.log('No hay usuarios');
        return;
    }
    
    // Sort by ELO (descending)
    const sortedUsers = Object.entries(users)
        .map(([uid, user]) => ({ uid, ...user }))
        .sort((a, b) => (b.elo_rating || 1200) - (a.elo_rating || 1200));
    
    console.log('\n📊 Ranking actual:');
    sortedUsers.slice(0, 5).forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.username} - ELO: ${user.elo_rating || 1200}`);
    });
    
    // Award Leyenda del Club to #1
    if (sortedUsers.length > 0) {
        const rank1User = sortedUsers[0];
        console.log(`\n👑 #1 del ranking: ${rank1User.username}`);
        
        // Verificar si ya tiene el badge (no solo el campo reached_rank_1)
        const hasBadge = rank1User.badges && rank1User.badges.club_legend;
        
        if (!hasBadge) {
            console.log(`🎉 Otorgando "Leyenda del Club" a ${rank1User.username}`);
            
            // Primero asegurar que reached_rank_1 está en true
            await database.ref(`users/${rank1User.uid}/reached_rank_1`).set(true);
            
            // Esperar un momento para asegurar que se guardó
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Recargar datos del usuario
            const userSnap = await database.ref(`users/${rank1User.uid}`).once('value');
            const userData = userSnap.val();
            
            // Crear el badge manualmente si checkBadges no funciona
            const now = Date.now();
            const badgeUpdate = {};
            
            // Asegurar que existe el objeto badges
            const currentBadges = userData.badges || {};
            currentBadges.club_legend = {
                earned_at: now,
                seen: false
            };
            
            badgeUpdate[`users/${rank1User.uid}/badges`] = currentBadges;
            badgeUpdate[`users/${rank1User.uid}/reached_rank_1`] = true;
            
            // Actualizar XP y nivel
            const currentExp = userData.experience_points || 0;
            const newExp = currentExp + 1000; // 1000 puntos por Leyenda del Club
            badgeUpdate[`users/${rank1User.uid}/experience_points`] = newExp;
            
            const level = Math.floor(Math.sqrt(newExp / 100)) + 1;
            badgeUpdate[`users/${rank1User.uid}/level`] = level;
            
            // Aplicar todas las actualizaciones
            await database.ref().update(badgeUpdate);
            
            console.log(`✅ Badge "Leyenda del Club" otorgado a ${rank1User.username}`);
            console.log(`   - XP ganada: 1000`);
            console.log(`   - Nivel actual: ${level}`);
        } else {
            console.log(`✅ ${rank1User.username} ya tiene "Leyenda del Club"`);
        }
    }
    
    console.log('\n✅ Inicialización completada');
    console.log('Recarga la página del perfil para ver los cambios');
}

// ===== EXPORTAR =====

if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
    window.initFirebase = initFirebase;
    window.onAuthStateChanged = onAuthStateChanged;
    window.signIn = signIn;
    window.signOut = signOut;
    window.getCurrentUser = getCurrentUser;
    window.getUserData = getUserData;
    window.updateUserElo = updateUserElo;
    window.createMatch = createMatch;
    window.getPendingMatches = getPendingMatches;
    window.confirmMatch = confirmMatch;
    window.declineMatch = declineMatch;
    window.getAllUsers = getAllUsers;
    window.awardBadges = awardBadges;
    window.updatePlayerStats = updatePlayerStats;
    window.getWeekNumber = getWeekNumber;
    window.getPeriodKeys = getPeriodKeys;
    window.updateGlobalLeaderboards = updateGlobalLeaderboards;
    window.calculateChampions = calculateChampions;
    window.awardChampionBadges = awardChampionBadges;
    window.getCurrentLeaderboard = getCurrentLeaderboard;
    window.updateRankingBadges = updateRankingBadges;
    window.initializeRankingBadges = initializeRankingBadges;
}
