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
        
        // Check badges for both players
        const winnerNewStats = { ...winnerStats, ...winnerUpdates };
        const loserNewStats = { ...loserStats, ...loserUpdates };
        
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
}
