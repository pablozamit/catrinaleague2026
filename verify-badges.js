/**
 * Script de Verificación Periódica de Badges
 * Ejecutar diariamente a las 00:01 con cron
 * 
 * Ejemplo crontab:
 * 1 0 * * * cd /path/to/catrina2026 && node verify-badges.js >> /var/log/badges.log 2>&1
 */

const admin = require('firebase-admin');
const serviceAccount = require('./elopool-f1e62-firebase-adminsdk-fbsvc-3154d48a46.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elopool-f1e62-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

// Get yesterday's date string
function getYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

// Update ranking badges
async function updateRankingBadges() {
    console.log('🏆 Verificando badges de ranking...');
    
    const usersSnap = await db.ref('users').once('value');
    const users = usersSnap.val();
    
    if (!users) {
        console.log('No hay usuarios');
        return;
    }
    
    // Sort by ELO (descending)
    const sortedUsers = Object.entries(users)
        .map(([uid, user]) => ({ uid, ...user }))
        .sort((a, b) => (b.elo_rating || 1200) - (a.elo_rating || 1200));
    
    const updates = {};
    const today = new Date().toISOString().split('T')[0];
    const yesterday = getYesterday();
    
    // 1. Award "Leyenda del Club" to rank #1
    if (sortedUsers.length > 0) {
        const rank1User = sortedUsers[0];
        if (!rank1User.reached_rank_1) {
            console.log(`🎉 ${rank1User.username} obtiene "Leyenda del Club"`);
            updates[`users/${rank1User.uid}/reached_rank_1`] = true;
        } else {
            console.log(`👑 ${rank1User.username} mantiene "Leyenda del Club"`);
        }
    }
    
    // 2. Track "Inmortal" (consecutive days in top 3)
    const top3 = sortedUsers.slice(0, 3);
    console.log('\n💎 Top 3 del día:');
    
    for (let i = 0; i < top3.length; i++) {
        const user = top3[i];
        const currentStreak = user.consecutive_days_top3 || 0;
        const lastDate = user.last_top3_date;
        
        console.log(`  ${i + 1}. ${user.username} (ELO: ${user.elo_rating || 1200})`);
        
        if (lastDate === today) {
            console.log(`     → Ya contado hoy (${currentStreak} días)`);
            continue;
        } else if (lastDate === yesterday) {
            const newStreak = currentStreak + 1;
            updates[`users/${user.uid}/consecutive_days_top3`] = newStreak;
            updates[`users/${user.uid}/last_top3_date`] = today;
            console.log(`     → Racha incrementada: ${newStreak} días`);
            
            if (newStreak >= 30 && !user.badges?.immortal) {
                console.log(`     🎉 ¡${user.username} ha alcanzado 30 días! Badge "Inmortal" otorgado.`);
            }
        } else {
            updates[`users/${user.uid}/consecutive_days_top3`] = 1;
            updates[`users/${user.uid}/last_top3_date`] = today;
            console.log(`     → Nueva racha iniciada (1 día)`);
        }
    }
    
    // Reset streaks for users who dropped out of top 3
    console.log('\n🔄 Verificando caídas del top 3...');
    for (const [uid, user] of Object.entries(users)) {
        const isInTop3 = top3.some(u => u.uid === uid);
        const lastDate = user.last_top3_date;
        
        if (!isInTop3 && lastDate && lastDate !== today && lastDate !== yesterday) {
            // User was in top 3 but not anymore, streak already broken
            // No need to update, the check above handles it
        }
    }
    
    if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        console.log(`\n✅ ${Object.keys(updates).length} actualizaciones aplicadas`);
    } else {
        console.log('\n✅ No hay actualizaciones necesarias');
    }
}

// Check all badges for all users
async function checkAllBadges() {
    console.log('\n🔍 Verificando todos los badges...');
    
    const usersSnap = await db.ref('users').once('value');
    const users = usersSnap.val();
    
    if (!users) return;
    
    let totalNewBadges = 0;
    
    for (const [uid, user] of Object.entries(users)) {
        // Check badges that might have been missed
        const badges = user.badges || {};
        const updates = {};
        
        // Check for missed badges
        if (user.elo_rating >= 1300 && !badges.rising_star) {
            console.log(`🌟 ${user.username}: Missing "Estrella Emergente"`);
            updates[`users/${uid}/badges/rising_star`] = { earned_at: Date.now(), seen: false };
            totalNewBadges++;
        }
        
        if (user.matches_won >= 1 && !badges.first_victory) {
            console.log(`🏆 ${user.username}: Missing "Primera Victoria"`);
            updates[`users/${uid}/badges/first_victory`] = { earned_at: Date.now(), seen: false };
            totalNewBadges++;
        }
        
        if (user.matches_played >= 1 && !badges.first_match) {
            console.log(`🎯 ${user.username}: Missing "Debut"`);
            updates[`users/${uid}/badges/first_match`] = { earned_at: Date.now(), seen: false };
            totalNewBadges++;
        }
        
        // Apply updates
        if (Object.keys(updates).length > 0) {
            await db.ref().update(updates);
        }
    }
    
    console.log(`\n🎉 ${totalNewBadges} badges perdidos fueron otorgados`);
}

// Main function
async function main() {
    console.log('========================================');
    console.log('🏆 Verificación Diaria de Badges');
    console.log(new Date().toLocaleString('es-ES'));
    console.log('========================================\n');
    
    try {
        await updateRankingBadges();
        await checkAllBadges();
        
        console.log('\n✨ Verificación completada exitosamente');
    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
    
    process.exit(0);
}

// Run
main();
