/**
 * Sistema de Internacionalización (i18n) - La Catrina Pool League
 * Traducciones Español/Inglés
 */

const translations = {
    es: {
        // General
        app_name: 'La Catrina Pool League',
        app_subtitle: 'POOL LEAGUE & BILLIARDS',
        loading: 'Cargando...',
        back: '← Volver',
        back_to_table: '← Volver a la mesa',
        back_to_ranking: '← Volver al Ranking',
        logout: 'Cerrar Sesión',
        change_password: 'Cambiar Contraseña',
        
        // Navigation/Home
        nav_rules: 'Reglas de la Liga',
        nav_ranking: 'Ranking ELO',
        nav_login: 'Login / Resultados',
        nav_coming_soon: 'Próximamente',
        instructions: 'Arrastra para rotar • Haz clic en las troneras',
        
        // Login
        login_title: 'INICIAR SESIÓN',
        login_username: 'Usuario',
        login_username_placeholder: 'Tu nombre de usuario',
        login_password: 'Contraseña',
        login_password_placeholder: 'Tu contraseña',
        login_button: 'ENTRAR',
        login_view_ranking: 'Ver Ranking ELO',
        
        // Login errors
        error_loading_firebase: 'Error cargando Firebase',
        error_invalid_username_chars: 'El usuario solo puede contener letras, números, guiones y guiones bajos',
        error_username_min_length: 'El usuario debe tener al menos 3 caracteres',
        error_username_max_length: 'El usuario no puede tener más de 20 caracteres',
        error_password_min_length: 'La contraseña debe tener al menos 6 caracteres',
        error_password_max_length: 'La contraseña es demasiado larga',
        error_rate_limit: 'Por favor espera un momento antes de intentar de nuevo',
        error_max_attempts: 'Demasiados intentos fallidos. Por favor espera unos minutos.',
        error_login: 'Error al iniciar sesión',
        error_user_not_found: 'Usuario no encontrado. Contacta al administrador.',
        error_wrong_password: 'Contraseña incorrecta',
        error_invalid_email: 'Formato de usuario inválido',
        error_user_disabled: 'Esta cuenta ha sido desactivada',
        error_too_many_requests: 'Demasiados intentos fallidos. Por favor espera unos minutos.',
        error_login_generic: 'Error al iniciar sesión. Por favor intenta de nuevo.',
        
        // Resultados
        results_title: 'INTRODUCIR RESULTADO',
        results_user: 'Usuario',
        results_you: 'TÚ',
        results_opponent: 'Contrincante',
        results_select_opponent: 'Seleccionar oponente...',
        results_match_type: 'Tipo de Partido',
        results_match_type_info: '×1.0 (base) ×2.5 (máximo para finales)',
        results_result: 'Resultado',
        results_you_win: 'Yo',
        results_wins: 'GANA',
        results_opponent_win: 'Oponente',
        results_final_score: 'Marcador Final',
        results_winner: 'Ganador',
        results_loser: 'Perdedor',
        results_elo_preview: '📊 Previsualización del cambio ELO',
        results_submit: 'Enviar Resultado',
        results_success: '¡Resultado enviado! Esperando confirmación del oponente.',
        results_opponent_elo: 'ELO',
        
        // Results errors
        error_rate_limit_submission: 'Por favor espera unos segundos antes de enviar otro resultado',
        error_select_opponent: 'Por favor selecciona un oponente',
        error_select_winner: 'Por favor selecciona quién ganó el partido',
        error_select_match_type: 'Por favor selecciona el tipo de partido',
        error_invalid_match_type: 'Tipo de partido inválido',
        error_opponent_not_found: 'Oponente no encontrado',
        error_cannot_play_self: 'No puedes jugar contra ti mismo',
        error_invalid_username: 'Nombre de usuario inválido',
        error_submit_failed: 'No se pudo enviar el resultado. Por favor intenta de nuevo.',
        error_loading_data: 'Error al cargar datos',
        
        // Confirmar
        confirm_title: 'CONFIRMAR RESULTADOS',
        confirm_loading: 'Cargando partidos pendientes...',
        confirm_empty_title: 'No tienes partidos pendientes de confirmar',
        confirm_empty_subtitle: '¡Todo al día!',
        confirm_match_confirmed: '✅ Partido Confirmado',
        confirm_match_confirmed_msg: 'El resultado ha sido confirmado exitosamente.',
        confirm_match_declined: '❌ Partido Rechazado',
        confirm_match_declined_msg: 'Has rechazado el partido.',
        confirm_error: 'No se pudo confirmar el partido. Intenta de nuevo.',
        
        // Match types
        match_type_rey_mesa: 'Rey de la Mesa',
        match_type_torneo: 'Torneo',
        match_type_liga_grupos: 'Liga - Fase de Grupos',
        match_type_liga_finales: 'Liga - Playoffs',
        match_type_rey_mesa_full: 'Rey de la Mesa (×1.0)',
        match_type_torneo_full: 'Torneo (×1.5)',
        match_type_liga_grupos_full: 'Liga - Fase de Grupos (×2.0)',
        match_type_liga_finales_full: 'Liga - Playoffs (×2.5)',
        
        // Password change
        password_change_title: 'Cambiar Contraseña',
        password_current: 'Contraseña Actual',
        password_current_placeholder: 'Tu contraseña actual',
        password_new: 'Nueva Contraseña',
        password_new_placeholder: 'Mínimo 6 caracteres',
        password_confirm: 'Confirmar Nueva Contraseña',
        password_confirm_placeholder: 'Repite la nueva contraseña',
        password_cancel: 'Cancelar',
        password_change_button: 'Cambiar',
        password_change_success: '¡Contraseña actualizada correctamente!',
        password_change_error: 'Error al cambiar la contraseña',
        password_error_current_wrong: 'La contraseña actual es incorrecta',
        password_error_weak: 'La nueva contraseña es demasiado débil',
        password_error_relogin_required: 'Por seguridad, debes cerrar sesión y volver a iniciar sesión antes de cambiar la contraseña',
        password_error_all_fields: 'Por favor completa todos los campos',
        password_error_no_match: 'Las contraseñas nuevas no coinciden',
        password_error_different: 'La nueva contraseña debe ser diferente a la actual',
        password_error_no_user: 'No hay usuario autenticado',
        password_changed_toast: 'Contraseña Cambiada',
        password_changed_msg: 'Tu contraseña ha sido actualizada correctamente',
        
        // Ranking
        ranking_title: 'RANKING ELO',
        ranking_update: '🎱 Última actualización',
        ranking_loading: 'Cargando ranking...',
        ranking_position: '#',
        ranking_player: 'Jugador',
        ranking_matches: 'Partidos',
        ranking_elo: 'ELO',
        ranking_footer: 'La Catrina Pool League © 2025',
        
        // Profile
        profile_title: 'Perfil',
        profile_loading: 'Cargando perfil...',
        profile_not_found: 'Usuario no encontrado',
        profile_error: 'Error al cargar el perfil',
        profile_not_specified: 'Usuario no especificado',
        profile_level: 'Nivel {level} - {exp} XP',
        profile_stat_elo: 'ELO Rating',
        profile_stat_matches_played: 'Partidos Jugados',
        profile_stat_matches_won: 'Partidos Ganados',
        profile_stat_win_rate: '% Victorias',
        profile_stat_badges: 'Badges',
        profile_badges_earned: 'Badges Obtenidos',
        profile_badges_locked: 'Badges Bloqueados',
        profile_no_badges: 'Aún no has obtenido ningún badge. ¡Empieza a jugar!',
        profile_earned_date: 'Obtenido: {date}',
        
        // Badge categories
        badge_cat_all: 'Todos',
        badge_cat_beginner: 'Principiante',
        badge_cat_skill: 'Habilidad',
        badge_cat_consistency: 'Constancia',
        badge_cat_social: 'Social',
        badge_cat_achievement: 'Logros',
        badge_cat_streak: 'Rachas',
        badge_cat_special: 'Especial',
        badge_cat_legendary: 'Legendario',
        
        // Badge rarities
        rarity_common: 'Común',
        rarity_uncommon: 'Poco Común',
        rarity_rare: 'Raro',
        rarity_epic: 'Épico',
        rarity_legendary: 'Legendario',
        rarity_mythic: 'Mítico',
        
        // Admin
        admin_title: 'Panel de Administración',
        admin_subtitle: 'Sistema de Campeones - La Catrina Pool League',
        admin_calculate_champions: '🏆 Calcular y Otorgar Campeones',
        admin_champions_desc: 'Estos botones calculan los campeones del período anterior y otorgan los badges correspondientes.',
        admin_champion_daily: 'Campeón del Día (Ayer)',
        admin_champion_weekly: 'Campeón de la Semana (Semana Pasada)',
        admin_champion_monthly: 'Campeón del Mes (Mes Pasado)',
        admin_champion_quarterly: 'Campeón del Trimestre (Trimestre Pasado)',
        admin_champion_yearly: 'Campeón del Año (Año Pasado)',
        admin_view_ranking: '📊 Ver Ranking Actual',
        admin_select_period: 'Seleccionar período:',
        admin_period_today: 'Hoy',
        admin_period_this_week: 'Esta Semana',
        admin_period_this_month: 'Este Mes',
        admin_period_this_quarter: 'Este Trimestre',
        admin_period_this_year: 'Este Año',
        admin_select_period_loading: 'Selecciona un período para ver el ranking',
        
        // Toast notifications
        toast_success_title: '¡Éxito!',
        toast_error_title: 'Error',
        toast_warning_title: 'Advertencia',
        toast_info_title: 'Información',
        toast_badge_title: '🏆 {name}',
        toast_badge_message: '¡Nuevo logro desbloqueado! +{points} XP',
        toast_match_confirmed: 'Partido Confirmado',
        
        // ELO Categories
        elo_grandmaster: 'Gran Maestro',
        elo_master: 'Maestro',
        elo_expert: 'Experto',
        elo_skilled: 'Jugador Hábil',
        elo_rising_star: 'Estrella Emergente',
        elo_novice: 'Novato',
        
        // Badges - Names
        badge_debut: 'Debut',
        badge_first_victory: 'Primera Victoria',
        badge_rookie: 'Novato',
        badge_getting_started: 'Tomando Ritmo',
        badge_rising_star: 'Estrella Emergente',
        badge_skilled_player: 'Jugador Hábil',
        badge_expert: 'Experto',
        badge_master: 'Maestro',
        badge_grandmaster: 'Gran Maestro',
        badge_sharpshooter: 'Tirador Certero',
        badge_clutch_player: 'Jugador Clutch',
        badge_regular: 'Habitual',
        badge_dedicated: 'Dedicado',
        badge_veteran: 'Veterano',
        badge_iron_will: 'Voluntad de Hierro',
        badge_friendly: 'Amigable',
        badge_socializer: 'Socializador',
        badge_party_animal: 'Alma de la Fiesta',
        badge_welcoming_committee: 'Comité de Bienvenida',
        badge_rival: 'Rival',
        badge_nemesis: 'Némesis',
        badge_comeback_king: 'Rey del Comeback',
        badge_giant_slayer: 'Mata Gigantes',
        badge_perfectionist: 'Perfeccionista',
        badge_tournament_champion: 'Campeón de Torneo',
        badge_league_dominator: 'Dominador de Liga',
        badge_comeback_artist: 'Artista del Comeback',
        badge_variety_master: 'Maestro de la Variedad',
        badge_monthly_champion: 'Campeón del Mes',
        badge_daily_champion: 'Campeón del Día',
        badge_weekly_champion: 'Campeón de la Semana',
        badge_quarter_champion: 'Campeón del Trimestre',
        badge_yearly_champion: 'Campeón del Año',
        badge_hot_streak: 'Racha Caliente',
        badge_unstoppable: 'Imparable',
        badge_legendary_streak: 'Racha Legendaria',
        badge_consistency_master: 'Maestro de la Consistencia',
        badge_night_owl: 'Búho Nocturno',
        badge_early_bird: 'Madrugador',
        badge_weekend_warrior: 'Guerrero de Fin de Semana',
        badge_speed_demon: 'Demonio de la Velocidad',
        badge_new_year_resolution: 'Propósito de Año Nuevo',
        badge_marathon_player: 'Jugador Maratón',
        badge_time_traveler: 'Viajero del Tiempo',
        badge_club_legend: 'Leyenda del Club',
        badge_immortal: 'Inmortal',
        badge_centurion: 'Centurión',
        badge_untouchable: 'Intocable',
        badge_phoenix: 'Fénix',
        badge_billiard_god: 'Dios del Billar',
        
        // Badges - Descriptions
        badge_desc_debut: 'Juega tu primer partido',
        badge_desc_first_victory: 'Gana tu primer partido',
        badge_desc_rookie: 'Completa 5 partidos',
        badge_desc_getting_started: 'Gana 3 partidos',
        badge_desc_rising_star: 'Alcanza 1300 puntos ELO',
        badge_desc_skilled_player: 'Alcanza 1500 puntos ELO',
        badge_desc_expert: 'Alcanza 1700 puntos ELO',
        badge_desc_master: 'Alcanza 1900 puntos ELO',
        badge_desc_grandmaster: 'Alcanza 2100 puntos ELO',
        badge_desc_sharpshooter: 'Gana 10 partidos 3-0 en fase de grupos de liga',
        badge_desc_clutch_player: 'Gana 5 partidos reñidos de liga o eliminatoria por una partida',
        badge_desc_regular: 'Juega al menos 1 partido por semana durante 4 semanas',
        badge_desc_dedicated: 'Juega 50 partidos',
        badge_desc_veteran: 'Juega 100 partidos',
        badge_desc_iron_will: 'Juega todos los días durante una semana',
        badge_desc_friendly: 'Juega contra 10 oponentes diferentes',
        badge_desc_socializer: 'Juega contra 25 oponentes diferentes',
        badge_desc_party_animal: 'Juega en 5 días diferentes de la semana',
        badge_desc_welcoming_committee: 'Sé el primer oponente de 5 jugadores nuevos',
        badge_desc_rival: 'Juega 10 partidos contra el mismo oponente',
        badge_desc_nemesis: 'Mantén rivalidad equilibrada (45-55%) en 20+ partidos',
        badge_desc_comeback_king: 'Gana 3 partidos seguidos tras perderle 2 veces a un rival',
        badge_desc_giant_slayer: 'Vence a un jugador con 200+ ELO más que tú',
        badge_desc_perfectionist: 'Mantén 100% de victorias en tus primeros 5 partidos',
        badge_desc_tournament_champion: 'Gana 10 partidos de torneo',
        badge_desc_league_dominator: 'Gana 15 partidos de liga',
        badge_desc_comeback_artist: 'Remonta 5 partidos',
        badge_desc_variety_master: 'Gana al menos 3 partidos de cada tipo',
        badge_desc_monthly_champion: 'Gana más partidos que cualquier otro en un mes',
        badge_desc_daily_champion: 'Jugador con más victorias del día',
        badge_desc_weekly_champion: 'Jugador con más victorias de la semana',
        badge_desc_quarter_champion: 'Jugador con más victorias del trimestre',
        badge_desc_yearly_champion: 'Jugador con más victorias del año',
        badge_desc_hot_streak: 'Gana 3 partidos consecutivos',
        badge_desc_unstoppable: 'Gana 5 partidos consecutivos',
        badge_desc_legendary_streak: 'Gana 10 partidos consecutivos',
        badge_desc_consistency_master: 'No pierdas más de 1 partido de cada 5 durante 20 partidos',
        badge_desc_night_owl: 'Juega 10 partidos después de las 00:00',
        badge_desc_early_bird: 'Juega 10 partidos antes de las 20:00',
        badge_desc_weekend_warrior: 'Juega 20 partidos en fines de semana',
        badge_desc_speed_demon: 'Gana 5 partidas en menos de una hora',
        badge_desc_new_year_resolution: 'Juega tu primer partido del año en enero',
        badge_desc_marathon_player: 'Registra partidas durante 6 horas consecutivas',
        badge_desc_time_traveler: 'Registra una partida exactamente a las 00:34',
        badge_desc_club_legend: 'Alcanza el puesto #1 en el ranking',
        badge_desc_immortal: 'Mantente en el top 3 durante 30 días',
        badge_desc_centurion: 'Gana 100 partidos',
        badge_desc_untouchable: 'Mantén 90% de victorias con al menos 50 partidos',
        badge_desc_phoenix: 'Recupera 300+ ELO después de perder 300+',
        badge_desc_billiard_god: 'Obtén todos los demás badges',
    },
    
    en: {
        // General
        app_name: 'La Catrina Pool League',
        app_subtitle: 'POOL LEAGUE & BILLIARDS',
        loading: 'Loading...',
        back: '← Back',
        back_to_table: '← Back to Table',
        back_to_ranking: '← Back to Ranking',
        logout: 'Logout',
        change_password: 'Change Password',
        
        // Navigation/Home
        nav_rules: 'League Rules',
        nav_ranking: 'ELO Ranking',
        nav_login: 'Login / Results',
        nav_coming_soon: 'Coming Soon',
        instructions: 'Drag to rotate • Click on pockets',
        
        // Login
        login_title: 'LOGIN',
        login_username: 'Username',
        login_username_placeholder: 'Your username',
        login_password: 'Password',
        login_password_placeholder: 'Your password',
        login_button: 'ENTER',
        login_view_ranking: 'View ELO Ranking',
        
        // Login errors
        error_loading_firebase: 'Error loading Firebase',
        error_invalid_username_chars: 'Username can only contain letters, numbers, hyphens and underscores',
        error_username_min_length: 'Username must be at least 3 characters',
        error_username_max_length: 'Username cannot exceed 20 characters',
        error_password_min_length: 'Password must be at least 6 characters',
        error_password_max_length: 'Password is too long',
        error_rate_limit: 'Please wait a moment before trying again',
        error_max_attempts: 'Too many failed attempts. Please wait a few minutes.',
        error_login: 'Login error',
        error_user_not_found: 'User not found. Contact the administrator.',
        error_wrong_password: 'Incorrect password',
        error_invalid_email: 'Invalid username format',
        error_user_disabled: 'This account has been disabled',
        error_too_many_requests: 'Too many failed attempts. Please wait a few minutes.',
        error_login_generic: 'Login error. Please try again.',
        
        // Results
        results_title: 'ENTER RESULT',
        results_user: 'User',
        results_you: 'YOU',
        results_opponent: 'Opponent',
        results_select_opponent: 'Select opponent...',
        results_match_type: 'Match Type',
        results_match_type_info: '×1.0 (base) ×2.5 (maximum for finals)',
        results_result: 'Result',
        results_you_win: 'Me',
        results_wins: 'WINS',
        results_opponent_win: 'Opponent',
        results_final_score: 'Final Score',
        results_winner: 'Winner',
        results_loser: 'Loser',
        results_elo_preview: '📊 ELO Change Preview',
        results_submit: 'Submit Result',
        results_success: 'Result sent! Waiting for opponent confirmation.',
        results_opponent_elo: 'ELO',
        
        // Results errors
        error_rate_limit_submission: 'Please wait a few seconds before submitting another result',
        error_select_opponent: 'Please select an opponent',
        error_select_winner: 'Please select who won the match',
        error_select_match_type: 'Please select the match type',
        error_invalid_match_type: 'Invalid match type',
        error_opponent_not_found: 'Opponent not found',
        error_cannot_play_self: 'You cannot play against yourself',
        error_invalid_username: 'Invalid username',
        error_submit_failed: 'Could not submit result. Please try again.',
        error_loading_data: 'Error loading data',
        
        // Confirmar
        confirm_title: 'CONFIRM RESULTS',
        confirm_loading: 'Loading pending matches...',
        confirm_empty_title: 'You have no pending matches to confirm',
        confirm_empty_subtitle: 'All up to date!',
        confirm_match_confirmed: '✅ Match Confirmed',
        confirm_match_confirmed_msg: 'The result has been successfully confirmed.',
        confirm_match_declined: '❌ Match Declined',
        confirm_match_declined_msg: 'You have declined the match.',
        confirm_error: 'Could not confirm the match. Please try again.',
        
        // Match types
        match_type_rey_mesa: 'King of the Table',
        match_type_torneo: 'Tournament',
        match_type_liga_grupos: 'League - Group Stage',
        match_type_liga_finales: 'League - Playoffs',
        match_type_rey_mesa_full: 'King of the Table (×1.0)',
        match_type_torneo_full: 'Tournament (×1.5)',
        match_type_liga_grupos_full: 'League - Group Stage (×2.0)',
        match_type_liga_finales_full: 'League - Playoffs (×2.5)',
        
        // Password change
        password_change_title: 'Change Password',
        password_current: 'Current Password',
        password_current_placeholder: 'Your current password',
        password_new: 'New Password',
        password_new_placeholder: 'Minimum 6 characters',
        password_confirm: 'Confirm New Password',
        password_confirm_placeholder: 'Repeat the new password',
        password_cancel: 'Cancel',
        password_change_button: 'Change',
        password_change_success: 'Password updated successfully!',
        password_change_error: 'Error changing password',
        password_error_current_wrong: 'Current password is incorrect',
        password_error_weak: 'New password is too weak',
        password_error_relogin_required: 'For security, you must logout and login again before changing password',
        password_error_all_fields: 'Please complete all fields',
        password_error_no_match: 'New passwords do not match',
        password_error_different: 'New password must be different from current',
        password_error_no_user: 'No authenticated user',
        password_changed_toast: 'Password Changed',
        password_changed_msg: 'Your password has been updated successfully',
        
        // Ranking
        ranking_title: 'ELO RANKING',
        ranking_update: '🎱 Last updated',
        ranking_loading: 'Loading ranking...',
        ranking_position: '#',
        ranking_player: 'Player',
        ranking_matches: 'Matches',
        ranking_elo: 'ELO',
        ranking_footer: 'La Catrina Pool League © 2025',
        
        // Profile
        profile_title: 'Profile',
        profile_loading: 'Loading profile...',
        profile_not_found: 'User not found',
        profile_error: 'Error loading profile',
        profile_not_specified: 'User not specified',
        profile_level: 'Level {level} - {exp} XP',
        profile_stat_elo: 'ELO Rating',
        profile_stat_matches_played: 'Matches Played',
        profile_stat_matches_won: 'Matches Won',
        profile_stat_win_rate: 'Win %',
        profile_stat_badges: 'Badges',
        profile_badges_earned: 'Earned Badges',
        profile_badges_locked: 'Locked Badges',
        profile_no_badges: 'You have not earned any badges yet. Start playing!',
        profile_earned_date: 'Earned: {date}',
        
        // Badge categories
        badge_cat_all: 'All',
        badge_cat_beginner: 'Beginner',
        badge_cat_skill: 'Skill',
        badge_cat_consistency: 'Consistency',
        badge_cat_social: 'Social',
        badge_cat_achievement: 'Achievements',
        badge_cat_streak: 'Streaks',
        badge_cat_special: 'Special',
        badge_cat_legendary: 'Legendary',
        
        // Badge rarities
        rarity_common: 'Common',
        rarity_uncommon: 'Uncommon',
        rarity_rare: 'Rare',
        rarity_epic: 'Epic',
        rarity_legendary: 'Legendary',
        rarity_mythic: 'Mythic',
        
        // Admin
        admin_title: 'Admin Panel',
        admin_subtitle: 'Champions System - La Catrina Pool League',
        admin_calculate_champions: '🏆 Calculate and Award Champions',
        admin_champions_desc: 'These buttons calculate champions from the previous period and award corresponding badges.',
        admin_champion_daily: 'Daily Champion (Yesterday)',
        admin_champion_weekly: 'Weekly Champion (Last Week)',
        admin_champion_monthly: 'Monthly Champion (Last Month)',
        admin_champion_quarterly: 'Quarterly Champion (Last Quarter)',
        admin_champion_yearly: 'Yearly Champion (Last Year)',
        admin_view_ranking: '📊 View Current Ranking',
        admin_select_period: 'Select period:',
        admin_period_today: 'Today',
        admin_period_this_week: 'This Week',
        admin_period_this_month: 'This Month',
        admin_period_this_quarter: 'This Quarter',
        admin_period_this_year: 'This Year',
        admin_select_period_loading: 'Select a period to view ranking',
        
        // Toast notifications
        toast_success_title: 'Success!',
        toast_error_title: 'Error',
        toast_warning_title: 'Warning',
        toast_info_title: 'Information',
        toast_badge_title: '🏆 {name}',
        toast_badge_message: 'New achievement unlocked! +{points} XP',
        toast_match_confirmed: 'Match Confirmed',
        
        // ELO Categories
        elo_grandmaster: 'Grandmaster',
        elo_master: 'Master',
        elo_expert: 'Expert',
        elo_skilled: 'Skilled Player',
        elo_rising_star: 'Rising Star',
        elo_novice: 'Novice',
        
        // Badges - Names
        badge_debut: 'Debut',
        badge_first_victory: 'First Victory',
        badge_rookie: 'Rookie',
        badge_getting_started: 'Getting Started',
        badge_rising_star: 'Rising Star',
        badge_skilled_player: 'Skilled Player',
        badge_expert: 'Expert',
        badge_master: 'Master',
        badge_grandmaster: 'Grandmaster',
        badge_sharpshooter: 'Sharpshooter',
        badge_clutch_player: 'Clutch Player',
        badge_regular: 'Regular',
        badge_dedicated: 'Dedicated',
        badge_veteran: 'Veteran',
        badge_iron_will: 'Iron Will',
        badge_friendly: 'Friendly',
        badge_socializer: 'Socializer',
        badge_party_animal: 'Party Animal',
        badge_welcoming_committee: 'Welcoming Committee',
        badge_rival: 'Rival',
        badge_nemesis: 'Nemesis',
        badge_comeback_king: 'Comeback King',
        badge_giant_slayer: 'Giant Slayer',
        badge_perfectionist: 'Perfectionist',
        badge_tournament_champion: 'Tournament Champion',
        badge_league_dominator: 'League Dominator',
        badge_comeback_artist: 'Comeback Artist',
        badge_variety_master: 'Variety Master',
        badge_monthly_champion: 'Monthly Champion',
        badge_daily_champion: 'Daily Champion',
        badge_weekly_champion: 'Weekly Champion',
        badge_quarter_champion: 'Quarter Champion',
        badge_yearly_champion: 'Yearly Champion',
        badge_hot_streak: 'Hot Streak',
        badge_unstoppable: 'Unstoppable',
        badge_legendary_streak: 'Legendary Streak',
        badge_consistency_master: 'Consistency Master',
        badge_night_owl: 'Night Owl',
        badge_early_bird: 'Early Bird',
        badge_weekend_warrior: 'Weekend Warrior',
        badge_speed_demon: 'Speed Demon',
        badge_new_year_resolution: 'New Year\'s Resolution',
        badge_marathon_player: 'Marathon Player',
        badge_time_traveler: 'Time Traveler',
        badge_club_legend: 'Club Legend',
        badge_immortal: 'Immortal',
        badge_centurion: 'Centurion',
        badge_untouchable: 'Untouchable',
        badge_phoenix: 'Phoenix',
        badge_billiard_god: 'Billiard God',
        
        // Badges - Descriptions
        badge_desc_debut: 'Play your first match',
        badge_desc_first_victory: 'Win your first match',
        badge_desc_rookie: 'Complete 5 matches',
        badge_desc_getting_started: 'Win 3 matches',
        badge_desc_rising_star: 'Reach 1300 ELO points',
        badge_desc_skilled_player: 'Reach 1500 ELO points',
        badge_desc_expert: 'Reach 1700 ELO points',
        badge_desc_master: 'Reach 1900 ELO points',
        badge_desc_grandmaster: 'Reach 2100 ELO points',
        badge_desc_sharpshooter: 'Win 10 matches 3-0 in league group phase',
        badge_desc_clutch_player: 'Win 5 close league or playoff matches by one game',
        badge_desc_regular: 'Play at least 1 match per week for 4 weeks',
        badge_desc_dedicated: 'Play 50 matches',
        badge_desc_veteran: 'Play 100 matches',
        badge_desc_iron_will: 'Play every day for a week',
        badge_desc_friendly: 'Play against 10 different opponents',
        badge_desc_socializer: 'Play against 25 different opponents',
        badge_desc_party_animal: 'Play on 5 different days of the week',
        badge_desc_welcoming_committee: 'Be the first opponent for 5 new players',
        badge_desc_rival: 'Play 10 matches against the same opponent',
        badge_desc_nemesis: 'Maintain balanced rivalry (45-55%) in 20+ matches',
        badge_desc_comeback_king: 'Win 3 consecutive matches after losing twice to a rival',
        badge_desc_giant_slayer: 'Defeat a player with 200+ more ELO than you',
        badge_desc_perfectionist: 'Maintain 100% win rate in your first 5 matches',
        badge_desc_tournament_champion: 'Win 10 tournament matches',
        badge_desc_league_dominator: 'Win 15 league matches',
        badge_desc_comeback_artist: 'Come back to win 5 matches',
        badge_desc_variety_master: 'Win at least 3 matches of each type',
        badge_desc_monthly_champion: 'Win more matches than anyone else in a month',
        badge_desc_daily_champion: 'Player with most wins of the day',
        badge_desc_weekly_champion: 'Player with most wins of the week',
        badge_desc_quarter_champion: 'Player with most wins of the quarter',
        badge_desc_yearly_champion: 'Player with most wins of the year',
        badge_desc_hot_streak: 'Win 3 consecutive matches',
        badge_desc_unstoppable: 'Win 5 consecutive matches',
        badge_desc_legendary_streak: 'Win 10 consecutive matches',
        badge_desc_consistency_master: 'Don\'t lose more than 1 in every 5 matches for 20 matches',
        badge_desc_night_owl: 'Play 10 matches after midnight',
        badge_desc_early_bird: 'Play 10 matches before 8:00 PM',
        badge_desc_weekend_warrior: 'Play 20 matches on weekends',
        badge_desc_speed_demon: 'Win 5 matches in less than an hour',
        badge_desc_new_year_resolution: 'Play your first match of the year in January',
        badge_desc_marathon_player: 'Record matches for 6 consecutive hours',
        badge_desc_time_traveler: 'Record a match exactly at 00:34',
        badge_desc_club_legend: 'Reach #1 in the ranking',
        badge_desc_immortal: 'Stay in top 3 for 30 days',
        badge_desc_centurion: 'Win 100 matches',
        badge_desc_untouchable: 'Maintain 90% win rate with at least 50 matches',
        badge_desc_phoenix: 'Recover 300+ ELO after losing 300+',
        badge_desc_billiard_god: 'Obtain all other badges',
    }
};

// Get current language from localStorage or default to Spanish
function getCurrentLanguage() {
    return localStorage.getItem('catrina_language') || 'es';
}

// Set language
function setLanguage(lang) {
    if (translations[lang]) {
        localStorage.setItem('catrina_language', lang);
        updatePageLanguage();
        return true;
    }
    return false;
}

// Get translation
function t(key, replacements = {}) {
    const lang = getCurrentLanguage();
    let text = translations[lang][key] || key;
    
    // Replace placeholders
    for (const [placeholder, value] of Object.entries(replacements)) {
        text = text.replace(`{${placeholder}}`, value);
    }
    
    return text;
}

// Update all elements with data-i18n attribute
function updatePageLanguage() {
    const lang = getCurrentLanguage();
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            const text = t(key);
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    // Update document title if it has data-i18n-title
    const titleElement = document.querySelector('[data-i18n-title]');
    if (titleElement) {
        document.title = t(titleElement.getAttribute('data-i18n-title'));
    }
    
    // Update language selector
    const selector = document.getElementById('languageSelector');
    if (selector) {
        selector.value = lang;
    }
}

// Create language selector HTML
function createLanguageSelector() {
    const currentLang = getCurrentLanguage();
    return `
        <select id="languageSelector" onchange="setLanguage(this.value); updatePageLanguage();" 
                style="background: transparent; border: 1px solid #d4af37; color: #d4af37; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 14px;">
            <option value="es" ${currentLang === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
            <option value="en" ${currentLang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
        </select>
    `;
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage();
});

// Export functions
if (typeof window !== 'undefined') {
    window.translations = translations;
    window.getCurrentLanguage = getCurrentLanguage;
    window.setLanguage = setLanguage;
    window.t = t;
    window.updatePageLanguage = updatePageLanguage;
    window.createLanguageSelector = createLanguageSelector;
}
