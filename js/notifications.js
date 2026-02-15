/**
 * Sistema de Notificaciones - La Catrina Pool League
 * Maneja notificaciones de partidos pendientes y badges nuevos
 */

// Get notification count for a user
async function getNotificationCount(userId) {
    if (!database) return { pending: 0, badges: 0, total: 0 };
    
    // Get pending matches
    const pendingMatches = await getPendingMatches(userId);
    const pendingCount = pendingMatches.length;
    
    // Get unseen badges
    const userSnap = await database.ref(`users/${userId}`).once('value');
    const userData = userSnap.val();
    const badges = userData?.badges || {};
    
    const unseenBadges = Object.values(badges).filter(b => !b.seen).length;
    
    return {
        pending: pendingCount,
        badges: unseenBadges,
        total: pendingCount + unseenBadges
    };
}

// Mark all badges as seen
async function markBadgesAsSeen(userId) {
    if (!database) return;
    
    const userSnap = await database.ref(`users/${userId}`).once('value');
    const userData = userSnap.val();
    const badges = userData?.badges || {};
    
    const updates = {};
    Object.keys(badges).forEach(badgeId => {
        if (!badges[badgeId].seen) {
            updates[`users/${userId}/badges/${badgeId}/seen`] = true;
        }
    });
    
    if (Object.keys(updates).length > 0) {
        await database.ref().update(updates);
    }
}

// Get new badges for display
async function getNewBadges(userId) {
    if (!database) return [];
    
    const userSnap = await database.ref(`users/${userId}`).once('value');
    const userData = userSnap.val();
    const userBadges = userData?.badges || {};
    
    const newBadges = [];
    Object.entries(userBadges).forEach(([badgeId, badgeData]) => {
        if (!badgeData.seen) {
            const badge = BADGE_CATALOG.find(b => b.id === badgeId);
            if (badge) {
                newBadges.push({
                    ...badge,
                    earned_at: badgeData.earned_at
                });
            }
        }
    });
    
    // Sort by earned_at (newest first)
    return newBadges.sort((a, b) => b.earned_at - a.earned_at);
}

// Create notification bell HTML
function createNotificationBell() {
    return `
        <div class="notification-bell" id="notificationBell">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
        </div>
    `;
}

// Update notification bell count
async function updateNotificationBell(userId) {
    const bell = document.getElementById('notificationBell');
    const badge = document.getElementById('notificationBadge');
    
    if (!bell || !badge) return;
    
    const counts = await getNotificationCount(userId);
    
    if (counts.total > 0) {
        badge.textContent = counts.total;
        badge.style.display = 'flex';
        bell.classList.add('has-notifications');
    } else {
        badge.style.display = 'none';
        bell.classList.remove('has-notifications');
    }
    
    // Store counts for dropdown
    bell.dataset.pending = counts.pending;
    bell.dataset.badges = counts.badges;
}

// Show notification popup for new badges
async function showBadgePopup(userId) {
    const newBadges = await getNewBadges(userId);
    
    if (newBadges.length === 0) return;
    
    // Create popup
    const popup = document.createElement('div');
    popup.className = 'badge-popup';
    popup.innerHTML = `
        <div class="badge-popup-content">
            <h2>¡Nuevos Logros!</h2>
            <div class="badge-list">
                ${newBadges.map(badge => `
                    <div class="badge-item" style="border-color: ${RARITY_COLORS[badge.rarity]}">
                        <div class="badge-icon">${badge.icon}</div>
                        <div class="badge-info">
                            <div class="badge-name">${badge.name}</div>
                            <div class="badge-description">${badge.description}</div>
                            <div class="badge-points">+${badge.points} XP</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="badge-popup-close" onclick="closeBadgePopup()">Aceptar</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Add styles if not already present
    if (!document.getElementById('badge-popup-styles')) {
        const styles = document.createElement('style');
        styles.id = 'badge-popup-styles';
        styles.textContent = `
            .badge-popup {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .badge-popup-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #d4af37;
                border-radius: 16px;
                padding: 32px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .badge-popup-content h2 {
                color: #d4af37;
                text-align: center;
                margin: 0 0 24px 0;
                font-size: 24px;
            }
            
            .badge-list {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .badge-item {
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid;
                border-radius: 12px;
                padding: 16px;
                display: flex;
                gap: 16px;
                align-items: center;
                animation: bounceIn 0.5s ease;
            }
            
            @keyframes bounceIn {
                0% { transform: scale(0.8); opacity: 0; }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .badge-icon {
                font-size: 48px;
                line-height: 1;
            }
            
            .badge-info {
                flex: 1;
            }
            
            .badge-name {
                color: #fff;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 4px;
            }
            
            .badge-description {
                color: #aaa;
                font-size: 14px;
                margin-bottom: 8px;
            }
            
            .badge-points {
                color: #d4af37;
                font-weight: bold;
            }
            
            .badge-popup-close {
                width: 100%;
                padding: 12px;
                margin-top: 24px;
                background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
                border: none;
                border-radius: 8px;
                color: #000;
                font-weight: bold;
                font-size: 16px;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            
            .badge-popup-close:hover {
                transform: scale(1.05);
            }
            
            .notification-bell {
                position: relative;
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                transition: background 0.2s ease;
            }
            
            .notification-bell:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .notification-bell svg {
                color: #fff;
                display: block;
            }
            
            .notification-bell.has-notifications svg {
                animation: ringBell 2s ease infinite;
            }
            
            @keyframes ringBell {
                0%, 100% { transform: rotate(0deg); }
                10%, 30% { transform: rotate(-15deg); }
                20%, 40% { transform: rotate(15deg); }
                50% { transform: rotate(0deg); }
            }
            
            .notification-badge {
                position: absolute;
                top: 0;
                right: 0;
                background: #ef4444;
                color: #fff;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: bold;
                border: 2px solid #1a1a2e;
            }
        `;
        document.head.appendChild(styles);
    }
}

// Close badge popup
function closeBadgePopup() {
    const popup = document.querySelector('.badge-popup');
    if (popup) {
        popup.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => popup.remove(), 300);
        
        // Mark badges as seen
        const user = getCurrentUser();
        if (user) {
            markBadgesAsSeen(user.uid);
            updateNotificationBell(user.uid);
        }
    }
}

// Initialize notifications on page load
async function initNotifications() {
    onAuthStateChanged(async (user) => {
        if (user) {
            // Update bell count
            await updateNotificationBell(user.uid);
            
            // Check for new badges and show popup
            const newBadges = await getNewBadges(user.uid);
            if (newBadges.length > 0) {
                // Small delay to let page load
                setTimeout(() => showBadgePopup(user.uid), 1000);
            }
        }
    });
}

// Export functions
if (typeof window !== 'undefined') {
    window.getNotificationCount = getNotificationCount;
    window.markBadgesAsSeen = markBadgesAsSeen;
    window.getNewBadges = getNewBadges;
    window.createNotificationBell = createNotificationBell;
    window.updateNotificationBell = updateNotificationBell;
    window.showBadgePopup = showBadgePopup;
    window.closeBadgePopup = closeBadgePopup;
    window.initNotifications = initNotifications;
}
