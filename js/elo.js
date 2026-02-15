/**
 * Sistema de Cálculo ELO - La Catrina Pool League
 * Basado en el código del repositorio elo_pool (backend/server.py)
 */

// Pesos por tipo de partido
const ELO_WEIGHTS = {
    rey_mesa: 1.0,
    torneo: 1.5,
    liga_grupos: 2.0,
    liga_finales: 2.5
};

// K-Factor base
const K_FACTOR_BASE = 20;

/**
 * Calcula el factor K efectivo basado en experiencia y ELO del jugador
 * @param {number} elo - ELO actual del jugador
 * @param {number} matchesPlayed - Partidos jugados
 * @returns {number} - K-factor efectivo
 */
function getKFactor(elo, matchesPlayed) {
    // Jugadores nuevos (< 30 partidos): K = 40
    if (matchesPlayed < 30) {
        return 40;
    }
    // Jugadores elite (ELO > 2400): K = 10
    if (elo > 2400) {
        return 10;
    }
    // Jugadores regulares: K = 20
    return 20;
}

/**
 * Calcula la probabilidad esperada de victoria
 * @param {number} playerElo - ELO del jugador
 * @param {number} opponentElo - ELO del oponente
 * @returns {number} - Probabilidad esperada (0-1)
 */
function getExpectedScore(playerElo, opponentElo) {
    return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

/**
 * Calcula el cambio de ELO después de un partido
 * @param {number} winnerElo - ELO del ganador
 * @param {number} loserElo - ELO del perdedor
 * @param {number} winnerMatches - Partidos jugados por el ganador
 * @param {number} loserMatches - Partidos jugados por el perdedor
 * @param {string} matchType - Tipo de partido
 * @returns {object} - Cambios de ELO para winner y loser
 */
function calculateEloChange(winnerElo, loserElo, winnerMatches, loserMatches, matchType) {
    // Obtener K-factor para cada jugador
    const kWinner = getKFactor(winnerElo, winnerMatches);
    const kLoser = getKFactor(loserElo, loserMatches);

    // Aplicar peso del tipo de partido
    const weight = ELO_WEIGHTS[matchType] || 1.0;
    const kEffectiveWinner = kWinner * weight;
    const kEffectiveLoser = kLoser * weight;

    // Calcular probabilidad esperada
    const expectedWinner = getExpectedScore(winnerElo, loserElo);
    const expectedLoser = getExpectedScore(loserElo, winnerElo);

    // Calcular nuevo ELO
    // Winner: ELO + K * (1 - expected)
    const winnerChange = Math.round(kEffectiveWinner * (1 - expectedWinner));
    // Loser: ELO + K * (0 - expected) = ELO - K * expected
    const loserChange = Math.round(kEffectiveLoser * (0 - expectedLoser));

    return {
        winnerElo: winnerElo + winnerChange,
        loserElo: loserElo + loserChange,
        winnerChange: winnerChange,
        loserChange: loserChange,
        expectedWinner: (expectedWinner * 100).toFixed(1),
        matchWeight: weight
    };
}

/**
 * Calcula el ELO medio del ranking
 * @param {array} players - Array de jugadores
 * @returns {number} - ELO promedio
 */
function getAverageElo(players) {
    if (!players || players.length === 0) return 1200;
    const total = players.reduce((sum, p) => sum + (p.elo || 1200), 0);
    return Math.round(total / players.length);
}

/**
 * Determina la categoría de un jugador basada en su ELO
 * @param {number} elo - ELO del jugador
 * @returns {object} - Categoría con nombre y color
 */
function getEloCategory(elo) {
    if (elo >= 2100) return { name: 'Gran Maestro', color: '#EF4444', icon: '💎' };
    if (elo >= 1900) return { name: 'Maestro', color: '#F59E0B', icon: '👑' };
    if (elo >= 1700) return { name: 'Experto', color: '#8B5CF6', icon: '🎓' };
    if (elo >= 1500) return { name: 'Jugador Hábil', color: '#3B82F6', icon: '🎯' };
    if (elo >= 1300) return { name: 'Estrella Emergente', color: '#10B981', icon: '⭐' };
    return { name: 'Novato', color: '#9CA3AF', icon: '🌱' };
}

// Firebase configuration (to be filled)
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

let firebaseDb = null;

/**
 * Inicializa Firebase (cuando esté configurado)
 */
async function initFirebase(config) {
    // Esta función se implementará cuando se configure Firebase
    console.log('Firebase initialization pending config:', config);
}

/**
 * Guarda un resultado en Firebase
 */
async function saveMatchToFirebase(matchData) {
    // Esta función se implementará cuando se configure Firebase
    console.log('Saving match to Firebase:', matchData);
}

/**
 * Obtiene todos los jugadores de Firebase
 */
async function getPlayersFromFirebase() {
    // Esta función se implementará cuando se configure Firebase
    return [];
}

/**
 * Actualiza el ELO de un jugador en Firebase
 */
async function updatePlayerElo(playerId, newElo, matchesPlayed, matchesWon) {
    // Esta función se implementará cuando se configure Firebase
    console.log('Updating player in Firebase:', { playerId, newElo, matchesPlayed, matchesWon });
}

// Exportar funciones (para uso como módulo si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getKFactor,
        getExpectedScore,
        calculateEloChange,
        getAverageElo,
        getEloCategory,
        ELO_WEIGHTS
    };
}
