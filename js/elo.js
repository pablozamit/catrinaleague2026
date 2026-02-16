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
    if (matchesPlayed < 30) {
        return 40;
    }
    if (elo > 2400) {
        return 10;
    }
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
    const kWinner = getKFactor(winnerElo, winnerMatches);
    const kLoser = getKFactor(loserElo, loserMatches);

    const weight = ELO_WEIGHTS[matchType] || 1.0;
    const kEffectiveWinner = kWinner * weight;
    const kEffectiveLoser = kLoser * weight;

    const expectedWinner = getExpectedScore(winnerElo, loserElo);
    const expectedLoser = getExpectedScore(loserElo, winnerElo);

    const winnerChange = Math.round(kEffectiveWinner * (1 - expectedWinner));
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
    const getName = (key, defaultName) => typeof t !== 'undefined' ? t(key) : defaultName;

    if (elo >= 2100) return { name: getName('elo_grandmaster', 'Gran Maestro'), color: '#EF4444', icon: '💎' };
    if (elo >= 1900) return { name: getName('elo_master', 'Maestro'), color: '#F59E0B', icon: '👑' };
    if (elo >= 1700) return { name: getName('elo_expert', 'Experto'), color: '#8B5CF6', icon: '🎓' };
    if (elo >= 1500) return { name: getName('elo_skilled', 'Jugador Hábil'), color: '#3B82F6', icon: '🎯' };
    if (elo >= 1300) return { name: getName('elo_rising_star', 'Estrella Emergente'), color: '#10B981', icon: '⭐' };
    return { name: getName('elo_novice', 'Novato'), color: '#9CA3AF', icon: '🌱' };
}

// Exportar funciones
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
