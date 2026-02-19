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
            <div class="notification-dropdown" id="notificationDropdown" style="display: none;">
                <div class="dropdown-content">
                    <div class="dropdown-header">
                        <h3>Notificaciones</h3>
                        <button class="close-dropdown" id="closeNotificationDropdown">✕</button>
                    </div>
                    <div id="notificationList" class="notification-list">
                        <!-- Notifications will be loaded here -->
                    </div>
                </div>
            </div>
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
    
    // Create popup using safe DOM methods (XSS prevention)
    const popup = document.createElement('div');
    popup.className = 'badge-popup';
    
    const content = document.createElement('div');
    content.className = 'badge-popup-content';
    
    // Create heading
    const heading = document.createElement('h2');
    heading.textContent = typeof t !== 'undefined' ? t('popup_new_achievements') : '¡Nuevos Logros!';
    content.appendChild(heading);
    
    // Create badge list
    const badgeList = document.createElement('div');
    badgeList.className = 'badge-list';
    
    // Add each badge safely
    newBadges.forEach(badge => {
        const badgeItem = document.createElement('div');
        badgeItem.className = 'badge-item';
        // Validate rarity before using
        const borderColor = RARITY_COLORS[badge.rarity] || '#9CA3AF';
        badgeItem.style.borderColor = borderColor;
        
        // Badge icon (safe - emojis are safe text)
        const iconDiv = document.createElement('div');
        iconDiv.className = 'badge-icon';
        iconDiv.textContent = badge.icon; // Use textContent, not innerHTML
        badgeItem.appendChild(iconDiv);
        
        // Badge info container
        const infoDiv = document.createElement('div');
        infoDiv.className = 'badge-info';
        
        // Badge name
        const nameDiv = document.createElement('div');
        nameDiv.className = 'badge-name';
        nameDiv.textContent = typeof t !== 'undefined' ? t('badge_' + badge.id) : badge.name;
        infoDiv.appendChild(nameDiv);
        
        // Badge description
        const descDiv = document.createElement('div');
        descDiv.className = 'badge-description';
        descDiv.textContent = typeof t !== 'undefined' ? t('badge_desc_' + badge.id) : badge.description;
        infoDiv.appendChild(descDiv);
        
        // Badge points
        const pointsDiv = document.createElement('div');
        pointsDiv.className = 'badge-points';
        pointsDiv.textContent = `+${badge.points} XP`; // Safe - number to string
        infoDiv.appendChild(pointsDiv);
        
        badgeItem.appendChild(infoDiv);
        badgeList.appendChild(badgeItem);
    });
    
    content.appendChild(badgeList);
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'badge-popup-close';
    closeBtn.textContent = typeof t !== 'undefined' ? t('popup_accept') : 'Aceptar';
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', closeBadgePopup); // Use addEventListener instead of onclick
    content.appendChild(closeBtn);
    
    popup.appendChild(content);
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

            .notification-bell.dropdown-open svg {
                animation: none;
            }

            .notification-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 8px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid #d4af37;
                border-radius: 8px;
                width: 320px;
                max-height: 400px;
                overflow-y: auto;
                z-index: 10001;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }

            .dropdown-content {
                display: flex;
                flex-direction: column;
            }

            .dropdown-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                position: sticky;
                top: 0;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                z-index: 1;
            }

            .dropdown-header h3 {
                color: #d4af37;
                font-size: 14px;
                font-weight: bold;
                margin: 0;
            }

            .close-dropdown {
                background: none;
                border: none;
                color: #888;
                font-size: 16px;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
            }

            .close-dropdown:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .notification-list {
                max-height: 350px;
                overflow-y: auto;
            }

            .notification-section {
                padding: 8px 0;
            }

            .notification-section h4 {
                color: #888;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 0 16px 8px;
                padding: 4px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .notification-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                transition: background 0.2s ease;
            }

            .notification-item:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .notification-item:last-child {
                border-bottom: none;
            }

            .notification-icon {
                font-size: 20px;
                margin-right: 12px;
                flex-shrink: 0;
            }

            .notification-content {
                flex: 1;
                min-width: 0;
            }

            .notification-text {
                color: #fff;
                font-size: 13px;
                margin-bottom: 2px;
            }

            .notification-time {
                color: #888;
                font-size: 11px;
            }

            .notification-desc {
                color: #aaa;
                font-size: 12px;
            }

            .notification-action {
                padding: 6px 12px;
                background: rgba(212, 175, 55, 0.2);
                border: 1px solid rgba(212, 175, 55, 0.3);
                border-radius: 4px;
                color: #d4af37;
                font-size: 11px;
                text-decoration: none;
                white-space: nowrap;
                margin-left: 12px;
                transition: all 0.2s ease;
            }

            .notification-action:hover {
                background: rgba(212, 175, 55, 0.3);
                color: #f4d03f;
            }

            .badge-item .notification-icon {
                font-size: 24px;
            }

            .no-notifications {
                padding: 32px;
                text-align: center;
                color: #888;
                font-size: 13px;
            }

            .loading-notifications {
                padding: 32px;
                text-align: center;
                color: #888;
                font-size: 13px;
            }

            .error-notifications {
                padding: 16px;
                text-align: center;
                color: #ef4444;
                font-size: 12px;
            }

            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
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

// Load notifications into dropdown
async function loadNotifications(userId) {
    const list = document.getElementById('notificationList');
    if (!list) return;

    list.innerHTML = '<div class="loading-notifications">Cargando...</div>';

    try {
        // Get pending matches
        const pendingMatches = await getPendingMatches(userId);

        // Get new badges
        const newBadges = await getNewBadges(userId);

        let html = '';

        // Pending matches section
        if (pendingMatches.length > 0) {
            html += '<div class="notification-section"><h4>Partidos Pendientes</h4>';
            html += pendingMatches.map(match => {
                const opponentName = match.player1_id === userId ? match.player2_username : match.player1_username;
                return `
                    <div class="notification-item">
                        <div class="notification-icon">🎱</div>
                        <div class="notification-content">
                            <div class="notification-text">Confirmar partido contra ${opponentName}</div>
                            <div class="notification-time">Hace poco tiempo</div>
                        </div>
                        <a href="../confirmar/" class="notification-action">Confirmar</a>
                    </div>
                `;
            }).join('');
            html += '</div>';
        }

        // Badges section
        if (newBadges.length > 0) {
            html += '<div class="notification-section"><h4>Nuevos Badges</h4>';
            html += newBadges.map(badge => `
                <div class="notification-item badge-item">
                    <div class="notification-icon">${badge.icon}</div>
                    <div class="notification-content">
                        <div class="notification-text">¡Nuevo badge: ${badge.name}!</div>
                        <div class="notification-desc">${badge.description}</div>
                    </div>
                </div>
            `).join('');
            html += '</div>';
        }

        // No notifications
        if (html === '') {
            html = '<div class="no-notifications">No tienes notificaciones</div>';
        }

        list.innerHTML = html;
    } catch (error) {
        console.error('Error loading notifications:', error);
        list.innerHTML = '<div class="error-notifications">Error cargando notificaciones</div>';
    }
}

// Toggle notification dropdown
function toggleNotificationDropdown() {
    const bell = document.getElementById('notificationBell');
    const dropdown = document.getElementById('notificationDropdown');
    if (!bell || !dropdown) return;

    const isOpen = dropdown.style.display === 'block';

    if (isOpen) {
        dropdown.style.display = 'none';
        bell.classList.remove('dropdown-open');
    } else {
        const user = getCurrentUser();
        if (user) {
            loadNotifications(user.uid);
            dropdown.style.display = 'block';
            bell.classList.add('dropdown-open');
        }
    }
}

// Close notification dropdown
function closeNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    const bell = document.getElementById('notificationBell');
    if (dropdown) dropdown.style.display = 'none';
    if (bell) bell.classList.remove('dropdown-open');
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
    window.loadNotifications = loadNotifications;
    window.toggleNotificationDropdown = toggleNotificationDropdown;
    window.closeNotificationDropdown = closeNotificationDropdown;
}

// Auto-initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add click handler to notification bell
    setTimeout(() => {
        const bell = document.getElementById('notificationBell');
        if (bell && !bell.hasListener) {
            bell.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleNotificationDropdown();
            });
            bell.hasListener = true;
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const bell = document.getElementById('notificationBell');
            const dropdown = document.getElementById('notificationDropdown');
            if (bell && dropdown) {
                if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
                    closeNotificationDropdown();
                }
            }
        });

        // Close button handler
        const closeBtn = document.getElementById('closeNotificationDropdown');
        if (closeBtn && !closeBtn.hasListener) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeNotificationDropdown();
            });
            closeBtn.hasListener = true;
        }
    }, 1000);
});
