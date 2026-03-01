/**
 * Sistema de Diagnóstico y Logging - La Catrina Pool League
 * 
 * Este sistema registra automáticamente TODAS las acciones de la aplicación
 * para diagnóstico sin requerir intervención del usuario.
 */

// Niveles de log
const LOG_LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    CRITICAL: 'critical'
};

// Categorías de log para organización
const LOG_CATEGORIES = {
    MATCH_LIFECYCLE: 'match_lifecycle',
    ELO_CALCULATION: 'elo_calculation',
    AUTHENTICATION: 'authentication',
    NAVIGATION: 'navigation',
    USER_ACTION: 'user_action',
    SYSTEM: 'system'
};

/**
 * Genera un ID único para cada sesión
 */
function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Session ID único para esta sesión
let currentSessionId = generateSessionId();

/**
 * Estructura de un log entry
 */
function createLogEntry(level, category, message, data = {}) {
    return {
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        session_id: currentSessionId,
        level: level,
        category: category,
        message: message,
        data: data,
        user_agent: navigator.userAgent,
        url: window.location.href,
        // Datos adicionales del usuario si está autenticado
        user_id: window.currentUser?.uid || null,
        username: window.currentUserData?.username || null
    };
}

/**
 * Escribe un log en Firebase
 * @param {string} level - Nivel de log (LOG_LEVELS)
 * @param {string} category - Categoría (LOG_CATEGORIES)
 * @param {string} message - Mensaje descriptivo
 * @param {object} data - Datos adicionales (opcional)
 */
async function writeLog(level, category, message, data = {}) {
    try {
        if (!window.database) {
            console.error('Firebase database no inicializado');
            return;
        }

        const logEntry = createLogEntry(level, category, message, data);

        // Log local para desarrollo
        const logPrefix = `[${logEntry.session_id}] [${level.toUpperCase()}] [${category}]`;
        const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : '';

        switch (level) {
            case LOG_LEVELS.ERROR:
            case LOG_LEVELS.CRITICAL:
                console.error(logPrefix, message, dataStr);
                break;
            case LOG_LEVELS.WARN:
                console.warn(logPrefix, message, dataStr);
                break;
            case LOG_LEVELS.DEBUG:
                console.log(logPrefix, message, dataStr);
                break;
            default:
                console.info(logPrefix, message, dataStr);
        }

        // Escribir en Firebase (async, no await para no bloquear)
        const logsRef = window.database.ref('diagnostic_logs');
        logsRef.push(logEntry).catch(err => {
            console.error('Error escribiendo log en Firebase:', err);
        });

    } catch (error) {
        console.error('Error en writeLog:', error);
    }
}

/**
 * Logs específicos para el ciclo de vida de partidos
 */
const MatchLogger = {
    /**
     * Log cuando se crea un partido pendiente
     */
    async matchCreated(matchData, createdMatchId) {
        await writeLog(LOG_LEVELS.INFO, LOG_CATEGORIES.MATCH_LIFECYCLE, 'Partido creado (pendiente)', {
            matchId: createdMatchId,
            player1: matchData.player1_username,
            player2: matchData.player2_username,
            winner: matchData.winner_id === matchData.player1_id ? matchData.player1_username : matchData.player2_username,
            match_type: matchData.match_type,
            score: `${matchData.winner_score}-${matchData.loser_score}`,
            submitted_by: matchData.player1_id
        });
    },

    /**
     * Log cuando usuario visita página de confirmación
     */
    async confirmationPage visited(pendingMatchesCount, matchesToShow) {
        await writeLog(LOG_LEVELS.INFO, LOG_CATEGORIES.MATCH_LIFECYCLE, 'Página de confirmación visitada', {
            pending_matches_count: pendingMatchesCount,
            matches_to_show: matchesToShow,
            user_role: 'player2 (opponent)'
        });
    },

    /**
     * Log cuando usuario intenta confirmar un partido
     */
    async confirmationAttempted(matchId, matchData) {
        await writeLog(LOG_LEVELS.INFO, LOG_CATEGORIES.MATCH_LIFECYCLE, 'Intento de confirmación de partido', {
            matchId: matchId,
            player1: matchData.player1_username,
            player2: matchData.player2_username,
            current_user: window.currentUserData?.username,
            winner: matchData.winner_id === matchData.player1_id ? matchData.player1_username : matchData.player2_username
        });
    },

    /**
     * Log cuando confirmación es exitosa
     */
    async confirmationSuccess(matchId, eloChanges, oldElo, newElo) {
        await writeLog(LOG_LEVELS.INFO, LOG_CATEGORIES.ELO_CALCULATION, 'Partido confirmado exitosamente', {
            matchId: matchId,
            winner_id: eloChanges.winnerId,
            loser_id: eloChanges.loserId,
            oldElo: oldElo,
            newElo: newElo,
            eloChange: newElo - oldElo
        });
    },

    /**
     * Log cuando confirmación falla
     */
    async confirmationFailed(matchId, error) {
        await writeLog(LOG_LEVELS.ERROR, LOG_CATEGORIES.MATCH_LIFECYCLE, 'Falló confirmación de partido', {
            matchId: matchId,
            error: error.message,
            errorStack: error.stack
        });
    }
};

/**
 * Logs específicos para cálculo de ELO
 */
const EloLogger = {
    /**
     * Log cuando se inicia el cálculo de ELO
     */
    async calculationStarted(winnerElo, loserElo, winnerMatches, loserMatches, matchType) {
        await writeLog(LOG_LEVELS.DEBUG, LOG_CATEGORIES.ELO_CALCULATION, 'Cálculo de ELO iniciado', {
            winnerElo: winnerElo,
            loserElo: loserElo,
            winnerMatches: winnerMatches,
            loserMatches: loserMatches,
            matchType: matchType
        });
    },

    /**
     * Log cuando se completa el cálculo de ELO
     */
    async calculationCompleted(result) {
        await writeLog(LOG_LEVELS.INFO, LOG_CATEGORIES.ELO_CALCULATION, 'Cálculo de ELO completado', {
            winnerChange: result.winnerChange,
            loserChange: result.loserChange,
            newWinnerElo: result.winnerElo,
            newLoserElo: result.loserElo,
            expectedWinnerScore: result.expectedWinner,
            matchWeight: result.matchWeight
        });
    },

    /**
     * Log cuando se actualiza el ELO de un usuario en Firebase
     */
    async eloUpdated(userId, username, oldElo, newElo, matchesPlayed, matchesWon) {
        await writeLog(LOG_LEVELS.INFO, LOG_CATEGORIES.ELO_CALCULATION, 'ELO actualizado en Firebase', {
            userId: userId,
            username: username,
            oldElo: oldElo,
            newElo: newElo,
            eloChange: newElo - oldElo,
            matchesPlayed: matchesPlayed,
            matchesWon: matchesWon
        });
    }
};

/**
 * Logs específicos para navegación
 */
const NavigationLogger = {
    /**
     * Log cuando usuario navega entre páginas
     */
    async pageVisits(pageName) {
        await writeLog(LOG_LEVELS.INFO, LOG_CATEGORIES.NAVIGATION, 'Página visitada', {
            page: pageName,
            url: window.location.href
        });
    }
};

/**
 * Logs específicos para acciones de usuario
 */
const UserActionLogger = {
    /**
     * Log cuando usuario envía un formulario
     */
    async formSubmitted(formId, formData) {
        await writeLog(LOG_LEVELS.INFO, LOG_CATEGORIES.USER_ACTION, 'Formulario enviado', {
            formId: formId,
            formData: formData
        });
    },

    /**
     * Log cuando usuario hace clic en un botón
     */
    async buttonClicked(buttonId, buttonLabel) {
        await writeLog(LOG_LEVELS.DEBUG, LOG_CATEGORIES.USER_ACTION, 'Botón clickeado', {
            buttonId: buttonId,
            buttonLabel: buttonLabel
        });
    }
};

/**
 * Logs específicos para autenticación
 */
const AuthLogger = {
    /**
     * Log cuando usuario inicia sesión
     */
    async loginSuccess(userId, username) {
        await writeLog(LOG_LEVELS.INFO, LOG_CATEGORIES.AUTHENTICATION, 'Login exitoso', {
            userId: userId,
            username: username
        });
    },

    /**
     * Log cuando falla el login
     */
    async loginFailed(error) {
        await writeLog(LOG_LEVELS.WARN, LOG_CATEGORIES.AUTHENTICATION, 'Login fallido', {
            error: error.message
        });
    },

    /**
     * Log cuando usuario cierra sesión
     */
    async logout() {
        await writeLog(LOG_LEVELS.INFO, LOG_CATEGORIES.AUTHENTICATION, 'Logout', {
            sessionId: currentSessionId
        });
    }
};

/**
 * Inicializa el logging automático
 */
async function initLogging() {
    try {
        if (!window.firebase || !window.database) {
            console.warn('Firebase no inicializado - logging deshabilitado');
            return;
        }

        // Log al iniciar
        await writeLog(LOG_LEVELS.INFO, LOG_CATEGORIES.SYSTEM, 'Sistema de logging inicializado', {
            sessionId: currentSessionId,
            userAgent: navigator.userAgent
        });

        // Log automático de navegación
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop() || 'index';
        await NavigationLogger.pageVisits(pageName);

        // Escuchar errores globales
        window.addEventListener('error', async (event) => {
            await writeLog(LOG_LEVELS.ERROR, LOG_CATEGORIES.SYSTEM, 'Error global capturado', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack
            });
        });

        // Escuchar promesas rechazadas no manejadas
        window.addEventListener('unhandledrejection', async (event) => {
            await writeLog(LOG_LEVELS.ERROR, LOG_CATEGORIES.SYSTEM, 'Promesa rechazada no manejada', {
                reason: event.reason,
                promise: String(event.promise)
            });
        });

    } catch (error) {
        console.error('Error inicializando logging:', error);
    }
}

/**
 * Consulta logs recientes para diagnóstico
 * @param {number} limit - Número de logs a consultar (default: 100)
 * @param {string} category - Filtrar por categoría (opcional)
 * @param {number} hoursBack - Solo logs de las últimas X horas (opcional)
 */
async function queryRecentLogs(limit = 100, category = null, hoursBack = 24) {
    try {
        if (!window.database) {
            throw new Error('Firebase database no inicializado');
        }

        let query = window.database.ref('diagnostic_logs').limitToLast(limit);

        const snapshot = await query.once('value');
        const logs = snapshot.val();

        if (!logs) return [];

        let logsArray = Object.entries(logs)
            .map(([key, log]) => ({ key, ...log }))
            .sort((a, b) => b.timestamp - a.timestamp);

        // Filtrar por categoría si se especificó
        if (category) {
            logsArray = logsArray.filter(log => log.category === category);
        }

        // Filtrar por tiempo si se especificó
        if (hoursBack) {
            const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
            logsArray = logsArray.filter(log => log.timestamp >= cutoffTime);
        }

        return logsArray;

    } catch (error) {
        console.error('Error consultando logs:', error);
        return [];
    }
}

/**
 * Exportar funciones
 */
if (typeof window !== 'undefined') {
    window.currentSessionId = currentSessionId;
    window.LOG_LEVELS = LOG_LEVELS;
    window.LOG_CATEGORIES = LOG_CATEGORIES;
    window.writeLog = writeLog;
    window.MatchLogger = MatchLogger;
    window.EloLogger = EloLogger;
    window.NavigationLogger = NavigationLogger;
    window.UserActionLogger = UserActionLogger;
    window.AuthLogger = AuthLogger;
    window.initLogging = initLogging;
    window.queryRecentLogs = queryRecentLogs;
}
