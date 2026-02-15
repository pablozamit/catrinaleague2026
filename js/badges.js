/**
 * Sistema de Badges - La Catrina Pool League
 * Catálogo de 50 badges con sus requisitos
 */

const BADGE_CATALOG = [
    // === BEGINNER ===
    {
        id: 'first_match',
        name: 'Debut',
        description: 'Juega tu primer partido',
        icon: '🎯',
        category: 'BEGINNER',
        rarity: 'COMMON',
        points: 25,
        secret: false,
        check: (stats) => stats.matches_played >= 1
    },
    {
        id: 'first_victory',
        name: 'Primera Victoria',
        description: 'Gana tu primer partido',
        icon: '🏆',
        category: 'BEGINNER',
        rarity: 'COMMON',
        points: 50,
        secret: false,
        check: (stats) => stats.matches_won >= 1
    },
    {
        id: 'rookie',
        name: 'Novato',
        description: 'Completa 5 partidos',
        icon: '🌱',
        category: 'BEGINNER',
        rarity: 'COMMON',
        points: 75,
        secret: false,
        check: (stats) => stats.matches_played >= 5
    },
    {
        id: 'getting_started',
        name: 'Tomando Ritmo',
        description: 'Gana 3 partidos',
        icon: '⚡',
        category: 'BEGINNER',
        rarity: 'UNCOMMON',
        points: 100,
        secret: false,
        check: (stats) => stats.matches_won >= 3
    },

    // === SKILL ===
    {
        id: 'rising_star',
        name: 'Estrella Emergente',
        description: 'Alcanza 1300 puntos ELO',
        icon: '⭐',
        category: 'SKILL',
        rarity: 'UNCOMMON',
        points: 150,
        secret: false,
        check: (stats) => stats.elo_rating >= 1300
    },
    {
        id: 'skilled_player',
        name: 'Jugador Hábil',
        description: 'Alcanza 1500 puntos ELO',
        icon: '🎯',
        category: 'SKILL',
        rarity: 'RARE',
        points: 250,
        secret: false,
        check: (stats) => stats.elo_rating >= 1500
    },
    {
        id: 'expert',
        name: 'Experto',
        description: 'Alcanza 1700 puntos ELO',
        icon: '🎓',
        category: 'SKILL',
        rarity: 'EPIC',
        points: 400,
        secret: false,
        check: (stats) => stats.elo_rating >= 1700
    },
    {
        id: 'master',
        name: 'Maestro',
        description: 'Alcanza 1900 puntos ELO',
        icon: '👑',
        category: 'SKILL',
        rarity: 'LEGENDARY',
        points: 750,
        secret: false,
        check: (stats) => stats.elo_rating >= 1900
    },
    {
        id: 'grandmaster',
        name: 'Gran Maestro',
        description: 'Alcanza 2100 puntos ELO',
        icon: '💎',
        category: 'SKILL',
        rarity: 'MYTHIC',
        points: 1500,
        secret: false,
        check: (stats) => stats.elo_rating >= 2100
    },
    {
        id: 'sharpshooter',
        name: 'Tirador Certero',
        description: 'Gana 10 partidos 3-0 en fase de grupos de liga',
        icon: '🎯',
        category: 'SKILL',
        rarity: 'RARE',
        points: 400,
        secret: false,
        check: (stats) => (stats.perfect_liga_wins || 0) >= 10
    },
    {
        id: 'clutch_player',
        name: 'Jugador Clutch',
        description: 'Gana 5 partidos reñidos de liga o eliminatoria por una partida',
        icon: '💎',
        category: 'SKILL',
        rarity: 'EPIC',
        points: 500,
        secret: false,
        check: (stats) => (stats.clutch_wins || 0) >= 5
    },

    // === CONSISTENCY ===
    {
        id: 'regular',
        name: 'Habitual',
        description: 'Juega al menos 1 partido por semana durante 4 semanas',
        icon: '📅',
        category: 'CONSISTENCY',
        rarity: 'UNCOMMON',
        points: 200,
        secret: false,
        check: (stats) => (stats.weekly_consistency || 0) >= 4
    },
    {
        id: 'dedicated',
        name: 'Dedicado',
        description: 'Juega 50 partidos',
        icon: '💪',
        category: 'CONSISTENCY',
        rarity: 'RARE',
        points: 300,
        secret: false,
        check: (stats) => stats.matches_played >= 50
    },
    {
        id: 'veteran',
        name: 'Veterano',
        description: 'Juega 100 partidos',
        icon: '🛡️',
        category: 'CONSISTENCY',
        rarity: 'EPIC',
        points: 500,
        secret: false,
        check: (stats) => stats.matches_played >= 100
    },
    {
        id: 'iron_will',
        name: 'Voluntad de Hierro',
        description: 'Juega todos los días durante una semana',
        icon: '⚔️',
        category: 'CONSISTENCY',
        rarity: 'RARE',
        points: 350,
        secret: false,
        check: (stats) => (stats.daily_streak || 0) >= 7
    },

    // === SOCIAL ===
    {
        id: 'friendly',
        name: 'Amigable',
        description: 'Juega contra 10 oponentes diferentes',
        icon: '🤝',
        category: 'SOCIAL',
        rarity: 'UNCOMMON',
        points: 150,
        secret: false,
        check: (stats) => (stats.unique_opponents || []).length >= 10
    },
    {
        id: 'socializer',
        name: 'Socializador',
        description: 'Juega contra 25 oponentes diferentes',
        icon: '👥',
        category: 'SOCIAL',
        rarity: 'RARE',
        points: 300,
        secret: false,
        check: (stats) => (stats.unique_opponents || []).length >= 25
    },
    {
        id: 'party_animal',
        name: 'Alma de la Fiesta',
        description: 'Juega en 5 días diferentes de la semana',
        icon: '🎉',
        category: 'SOCIAL',
        rarity: 'UNCOMMON',
        points: 175,
        secret: false,
        check: (stats) => (stats.unique_weekdays || []).length >= 5
    },
    {
        id: 'welcoming_committee',
        name: 'Comité de Bienvenida',
        description: 'Sé el primer oponente de 5 jugadores nuevos',
        icon: '🤗',
        category: 'SOCIAL',
        rarity: 'RARE',
        points: 300,
        secret: false,
        check: (stats) => (stats.first_opponent_of || []).length >= 5
    },
    {
        id: 'rival',
        name: 'Rival',
        description: 'Juega 10 partidos contra el mismo oponente',
        icon: '⚔️',
        category: 'SOCIAL',
        rarity: 'UNCOMMON',
        points: 200,
        secret: false,
        check: (stats) => {
            const opponents = stats.opponent_stats || {};
            return Object.values(opponents).some(o => o.matches >= 10);
        }
    },
    {
        id: 'nemesis',
        name: 'Némesis',
        description: 'Mantén rivalidad equilibrada (45-55%) en 20+ partidos',
        icon: '⚖️',
        category: 'SOCIAL',
        rarity: 'EPIC',
        points: 600,
        secret: false,
        check: (stats) => {
            const opponents = stats.opponent_stats || {};
            return Object.values(opponents).some(o => {
                if (o.matches < 20) return false;
                const winRate = o.wins / o.matches;
                return winRate >= 0.45 && winRate <= 0.55;
            });
        }
    },

    // === ACHIEVEMENT ===
    {
        id: 'comeback_king',
        name: 'Rey del Comeback',
        description: 'Gana 3 partidos seguidos tras perderle 2 veces a un rival',
        icon: '🔄',
        category: 'ACHIEVEMENT',
        rarity: 'RARE',
        points: 250,
        secret: false,
        check: (stats) => stats.comeback_king_unlocked === true
    },
    {
        id: 'giant_slayer',
        name: 'Mata Gigantes',
        description: 'Vence a un jugador con 200+ ELO más que tú',
        icon: '⚔️',
        category: 'ACHIEVEMENT',
        rarity: 'EPIC',
        points: 500,
        secret: false,
        check: (stats) => (stats.giant_slayer_count || 0) >= 1
    },
    {
        id: 'perfectionist',
        name: 'Perfeccionista',
        description: 'Mantén 100% de victorias en tus primeros 5 partidos',
        icon: '💯',
        category: 'ACHIEVEMENT',
        rarity: 'EPIC',
        points: 400,
        secret: false,
        check: (stats) => {
            const first5 = stats.first_5_matches || [];
            return first5.length === 5 && first5.every(r => r === 'W');
        }
    },
    {
        id: 'tournament_champion',
        name: 'Campeón de Torneo',
        description: 'Gana 10 partidos de torneo',
        icon: '🏆',
        category: 'ACHIEVEMENT',
        rarity: 'LEGENDARY',
        points: 600,
        secret: false,
        check: (stats) => (stats.wins_by_type?.torneo || 0) >= 10
    },
    {
        id: 'league_dominator',
        name: 'Dominador de Liga',
        description: 'Gana 15 partidos de liga',
        icon: '👑',
        category: 'ACHIEVEMENT',
        rarity: 'LEGENDARY',
        points: 700,
        secret: false,
        check: (stats) => {
            const ligaWins = (stats.wins_by_type?.liga_grupos || 0) + (stats.wins_by_type?.liga_finales || 0);
            return ligaWins >= 15;
        }
    },
    {
        id: 'comeback_artist',
        name: 'Artista del Comeback',
        description: 'Remonta 5 partidos',
        icon: '🎭',
        category: 'ACHIEVEMENT',
        rarity: 'RARE',
        points: 400,
        secret: false,
        check: (stats) => (stats.comeback_wins || 0) >= 5
    },
    {
        id: 'variety_master',
        name: 'Maestro de la Variedad',
        description: 'Gana al menos 3 partidos de cada tipo',
        icon: '🎨',
        category: 'ACHIEVEMENT',
        rarity: 'RARE',
        points: 350,
        secret: false,
        check: (stats) => {
            const wins = stats.wins_by_type || {};
            return wins.rey_mesa >= 3 && wins.torneo >= 3 && 
                   wins.liga_grupos >= 3 && wins.liga_finales >= 3;
        }
    },
    {
        id: 'monthly_champion',
        name: 'Campeón del Mes',
        description: 'Gana más partidos que cualquier otro en un mes',
        icon: '📅',
        category: 'ACHIEVEMENT',
        rarity: 'LEGENDARY',
        points: 750,
        secret: false,
        check: (stats) => (stats.monthly_champion_count || 0) >= 1
    },
    {
        id: 'daily_champion',
        name: 'Campeón del Día',
        description: 'Jugador con más victorias del día',
        icon: '🗓️',
        category: 'ACHIEVEMENT',
        rarity: 'EPIC',
        points: 300,
        secret: false,
        check: (stats) => (stats.daily_champion_count || 0) >= 1
    },
    {
        id: 'weekly_champion',
        name: 'Campeón de la Semana',
        description: 'Jugador con más victorias de la semana',
        icon: '📆',
        category: 'ACHIEVEMENT',
        rarity: 'LEGENDARY',
        points: 500,
        secret: false,
        check: (stats) => (stats.weekly_champion_count || 0) >= 1
    },
    {
        id: 'quarter_champion',
        name: 'Campeón del Trimestre',
        description: 'Jugador con más victorias del trimestre',
        icon: '📅',
        category: 'ACHIEVEMENT',
        rarity: 'LEGENDARY',
        points: 700,
        secret: false,
        check: (stats) => (stats.quarter_champion_count || 0) >= 1
    },
    {
        id: 'yearly_champion',
        name: 'Campeón del Año',
        description: 'Jugador con más victorias del año',
        icon: '🏆',
        category: 'ACHIEVEMENT',
        rarity: 'LEGENDARY',
        points: 1000,
        secret: false,
        check: (stats) => (stats.yearly_champion_count || 0) >= 1
    },

    // === STREAK ===
    {
        id: 'hot_streak',
        name: 'Racha Caliente',
        description: 'Gana 3 partidos consecutivos',
        icon: '🔥',
        category: 'STREAK',
        rarity: 'UNCOMMON',
        points: 200,
        secret: false,
        check: (stats) => (stats.current_win_streak || 0) >= 3
    },
    {
        id: 'unstoppable',
        name: 'Imparable',
        description: 'Gana 5 partidos consecutivos',
        icon: '🚀',
        category: 'STREAK',
        rarity: 'RARE',
        points: 350,
        secret: false,
        check: (stats) => (stats.current_win_streak || 0) >= 5
    },
    {
        id: 'legendary_streak',
        name: 'Racha Legendaria',
        description: 'Gana 10 partidos consecutivos',
        icon: '⚡',
        category: 'STREAK',
        rarity: 'LEGENDARY',
        points: 800,
        secret: false,
        check: (stats) => (stats.current_win_streak || 0) >= 10
    },
    {
        id: 'consistency_master',
        name: 'Maestro de la Consistencia',
        description: 'No pierdas más de 1 partido de cada 5 durante 20 partidos',
        icon: '📊',
        category: 'STREAK',
        rarity: 'EPIC',
        points: 450,
        secret: false,
        check: (stats) => {
            const last20 = stats.last_20_results || [];
            if (last20.length < 20) return false;
            // Check in chunks of 5
            for (let i = 0; i <= 15; i += 5) {
                const chunk = last20.slice(i, i + 5);
                const losses = chunk.filter(r => r === 'L').length;
                if (losses > 1) return false;
            }
            return true;
        }
    },

    // === SPECIAL ===
    {
        id: 'night_owl',
        name: 'Búho Nocturno',
        description: 'Juega 10 partidos después de las 00:00',
        icon: '🦉',
        category: 'SPECIAL',
        rarity: 'UNCOMMON',
        points: 150,
        secret: false,
        check: (stats) => (stats.night_matches || 0) >= 10
    },
    {
        id: 'early_bird',
        name: 'Madrugador',
        description: 'Juega 10 partidos antes de las 20:00',
        icon: '🐦',
        category: 'SPECIAL',
        rarity: 'UNCOMMON',
        points: 150,
        secret: false,
        check: (stats) => (stats.early_matches || 0) >= 10
    },
    {
        id: 'weekend_warrior',
        name: 'Guerrero de Fin de Semana',
        description: 'Juega 20 partidos en fines de semana',
        icon: '⚔️',
        category: 'SPECIAL',
        rarity: 'RARE',
        points: 250,
        secret: false,
        check: (stats) => (stats.weekend_matches || 0) >= 20
    },
    {
        id: 'speed_demon',
        name: 'Demonio de la Velocidad',
        description: 'Gana 5 partidas en menos de una hora',
        icon: '💨',
        category: 'SPECIAL',
        rarity: 'RARE',
        points: 300,
        secret: false,
        check: (stats) => stats.speed_demon_unlocked === true
    },
    {
        id: 'new_year_resolution',
        name: 'Propósito de Año Nuevo',
        description: 'Juega tu primer partido del año en enero',
        icon: '🎊',
        category: 'SPECIAL',
        rarity: 'COMMON',
        points: 100,
        secret: false,
        check: (stats) => stats.new_year_resolution_unlocked === true
    },
    {
        id: 'marathon_player',
        name: 'Jugador Maratón',
        description: 'Registra partidas durante 6 horas consecutivas',
        icon: '🏃',
        category: 'SPECIAL',
        rarity: 'EPIC',
        points: 600,
        secret: false,
        check: (stats) => stats.marathon_player_unlocked === true
    },
    {
        id: 'time_traveler',
        name: 'Viajero del Tiempo',
        description: 'Registra una partida exactamente a las 00:34',
        icon: '⏰',
        category: 'SPECIAL',
        rarity: 'EPIC',
        points: 500,
        secret: true,
        check: (stats) => stats.time_traveler_unlocked === true
    },

    // === LEGENDARY ===
    {
        id: 'club_legend',
        name: 'Leyenda del Club',
        description: 'Alcanza el puesto #1 en el ranking',
        icon: '👑',
        category: 'LEGENDARY',
        rarity: 'LEGENDARY',
        points: 1000,
        secret: false,
        check: (stats) => stats.reached_rank_1 === true
    },
    {
        id: 'immortal',
        name: 'Inmortal',
        description: 'Mantente en el top 3 durante 30 días',
        icon: '💎',
        category: 'LEGENDARY',
        rarity: 'MYTHIC',
        points: 2000,
        secret: false,
        check: (stats) => (stats.consecutive_days_top3 || 0) >= 30
    },
    {
        id: 'centurion',
        name: 'Centurión',
        description: 'Gana 100 partidos',
        icon: '🏛️',
        category: 'LEGENDARY',
        rarity: 'LEGENDARY',
        points: 1200,
        secret: false,
        check: (stats) => stats.matches_won >= 100
    },
    {
        id: 'untouchable',
        name: 'Intocable',
        description: 'Mantén 90% de victorias con al menos 50 partidos',
        icon: '🛡️',
        category: 'LEGENDARY',
        rarity: 'MYTHIC',
        points: 2500,
        secret: false,
        check: (stats) => {
            if (stats.matches_played < 50) return false;
            const winRate = stats.matches_won / stats.matches_played;
            return winRate >= 0.90;
        }
    },
    {
        id: 'phoenix',
        name: 'Fénix',
        description: 'Recupera 300+ ELO después de perder 300+',
        icon: '🔥',
        category: 'LEGENDARY',
        rarity: 'LEGENDARY',
        points: 800,
        secret: true,
        check: (stats) => stats.phoenix_unlocked === true
    },
    {
        id: 'billiard_god',
        name: 'Dios del Billar',
        description: 'Obtén todos los demás badges',
        icon: '🌟',
        category: 'LEGENDARY',
        rarity: 'MYTHIC',
        points: 10000,
        secret: true,
        check: (stats) => {
            const earnedBadges = Object.keys(stats.badges || {});
            return earnedBadges.length >= 49; // 50 - 1 (este mismo)
        }
    }
];

const RARITY_COLORS = {
    'COMMON': '#9CA3AF',
    'UNCOMMON': '#10B981',
    'RARE': '#3B82F6',
    'EPIC': '#8B5CF6',
    'LEGENDARY': '#F59E0B',
    'MYTHIC': '#EF4444'
};

// Calcular nivel desde experiencia
function calculateLevel(experience) {
    const level = Math.floor(Math.sqrt(experience / 100)) + 1;
    const nextLevelExp = level * level * 100;
    return { level, nextLevelExp };
}

// Verificar qué badges ha ganado un usuario
function checkBadges(userStats) {
    const newBadges = [];
    const earnedBadges = Object.keys(userStats.badges || {});
    
    for (const badge of BADGE_CATALOG) {
        // Ya tiene este badge?
        if (earnedBadges.includes(badge.id)) continue;
        
        // Cumple los requisitos?
        if (badge.check(userStats)) {
            newBadges.push(badge);
        }
    }
    
    return newBadges;
}

// Calcular progreso hacia badges no obtenidos
function getBadgeProgress(userStats) {
    const earnedBadges = Object.keys(userStats.badges || {});
    const progress = [];
    
    for (const badge of BADGE_CATALOG) {
        if (earnedBadges.includes(badge.id)) continue;
        if (badge.secret) continue;
        
        // Calcular progreso aproximado para algunos badges
        let percent = 0;
        if (badge.id === 'friendly') {
            percent = Math.min(100, ((userStats.unique_opponents || []).length / 10) * 100);
        } else if (badge.id === 'dedicated') {
            percent = Math.min(100, (userStats.matches_played / 50) * 100);
        } else if (badge.id === 'hot_streak') {
            percent = Math.min(100, ((userStats.current_win_streak || 0) / 3) * 100);
        }
        
        if (percent > 0) {
            progress.push({ badge, percent });
        }
    }
    
    return progress.sort((a, b) => b.percent - a.percent);
}

if (typeof window !== 'undefined') {
    window.BADGE_CATALOG = BADGE_CATALOG;
    window.RARITY_COLORS = RARITY_COLORS;
    window.calculateLevel = calculateLevel;
    window.checkBadges = checkBadges;
    window.getBadgeProgress = getBadgeProgress;
}
