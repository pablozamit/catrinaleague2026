/**
 * NavigationComponent - La Catrina Pool League
 * Centralized navigation system for all pages.
 */

class NavigationComponent {
    constructor(options = {}) {
        this.options = {
            title: options.title || 'LA CATRINA',
            subtitle: options.subtitle || 'POOL LEAGUE & BILLIARDS',
            backLink: options.backLink || null,
            backText: options.backText || 'back', // i18n key
            showUtils: options.showUtils !== false,
            isIndex: options.isIndex || false,
            basePath: options.basePath || (options.isIndex ? './' : '../'),
            ...options
        };
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.integratePlugins();
    }

    render() {
        const { title, subtitle, backLink, backText, showUtils, isIndex } = this.options;

        const nav = document.createElement('nav');
        nav.className = `catrina-nav ${isIndex ? 'index-nav' : ''}`;

        // Left section: Back button or empty
        let leftHtml = '';
        if (backLink) {
            // Use translation if available, otherwise fallback
            const label = typeof t !== 'undefined' ? t(backText) : 'Volver';
            leftHtml = `
                <a href="${backLink}" class="nav-back">
                    <span data-i18n="${backText}">${label}</span>
                </a>
            `;
        }

        // Center section: Title
        const centerHtml = `
            <div class="nav-center">
                <a href="${isIndex ? '#' : this.options.basePath}" class="nav-title">${title}</a>
                <div class="nav-subtitle" data-i18n="app_subtitle">${subtitle}</div>
            </div>
        `;

        // Right section: Utils or Hamburger
        let rightHtml = '';
        if (showUtils) {
            rightHtml = `
                <div class="nav-utils">
                    <div id="navLangContainer"></div>
                    <div id="navBellContainer"></div>
                    <div id="navUserButtons"></div>
                </div>
                <div class="nav-hamburger" id="navHamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
        }

        nav.innerHTML = `
            <div class="nav-left">${leftHtml}</div>
            ${centerHtml}
            <div class="nav-right">${rightHtml}</div>
        `;

        // Mobile Menu
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'nav-mobile-menu';
        mobileMenu.id = 'navMobileMenu';
        mobileMenu.innerHTML = `
            <div class="nav-mobile-item" style="justify-content: center; border-bottom: 1px solid rgba(212,175,55,0.2); margin-bottom: 1rem; padding-bottom: 1rem;">
                <div id="mobileLangContainer"></div>
            </div>
            <div id="mobileUserLinks"></div>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'nav-mobile-overlay';
        overlay.id = 'navOverlay';

        // Add to body
        if (!isIndex) document.body.classList.add('has-nav');
        document.body.prepend(overlay);
        document.body.prepend(mobileMenu);
        document.body.prepend(nav);
    }

    setupEventListeners() {
        const hamburger = document.getElementById('navHamburger');
        const mobileMenu = document.getElementById('navMobileMenu');
        const overlay = document.getElementById('navOverlay');

        if (hamburger) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('open');
                mobileMenu.classList.toggle('open');
                overlay.classList.toggle('open');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                const h = document.getElementById('navHamburger');
                if (h) h.classList.remove('open');
                mobileMenu.classList.remove('open');
                overlay.classList.remove('open');
            });
        }
    }

    integratePlugins() {
        // 1. Language Selector
        const langHtml = typeof createLanguageSelector === 'function' ? createLanguageSelector() : '';
        const navLang = document.getElementById('navLangContainer');
        const mobileLang = document.getElementById('mobileLangContainer');

        if (navLang) navLang.innerHTML = langHtml;
        if (mobileLang) mobileLang.innerHTML = langHtml;

        // 2. Notification Bell
        const bellHtml = typeof createNotificationBell === 'function' ? createNotificationBell() : '';
        const navBell = document.getElementById('navBellContainer');
        if (navBell) navBell.innerHTML = bellHtml;

        // 3. Auth State
        if (typeof onAuthStateChanged === 'function') {
            onAuthStateChanged((user) => {
                this.updateUserNav(user);
            });
        }
    }

    updateUserNav(user) {
        const desktopContainer = document.getElementById('navUserButtons');
        const mobileContainer = document.getElementById('mobileUserLinks');
        if (!desktopContainer || !mobileContainer) return;

        const base = this.options.basePath;

        if (user) {
            desktopContainer.innerHTML = `
                <button class="nav-btn" onclick="signOut().then(() => location.reload())" data-i18n="logout">
                    ${typeof t !== 'undefined' ? t('logout') : 'Cerrar Sesión'}
                </button>
            `;

            mobileContainer.innerHTML = `
                <a href="${base}perfil/" class="nav-mobile-item">
                    <span>👤</span> <span data-i18n="profile_title">Perfil</span>
                </a>
                <a href="${base}resultados/" class="nav-mobile-item">
                    <span>🎱</span> <span data-i18n="nav_login">Resultados</span>
                </a>
                <a href="${base}historial/" class="nav-mobile-item">
                    <span>📜</span> <span data-i18n="nav_history">Historial</span>
                </a>
                <a href="${base}reglas/" class="nav-mobile-item">
                    <span>📖</span> <span data-i18n="nav_rules">Reglas</span>
                </a>
                <button class="nav-mobile-item" onclick="signOut().then(() => { location.href = '${base}'; })" style="margin-top: 1rem; color: #f87171; background: none; border: none; width: 100%; text-align: left;">
                    <span>🚪</span> <span data-i18n="logout">Cerrar Sesión</span>
                </button>
            `;
        } else {
            desktopContainer.innerHTML = `
                <a href="${base}login.html" class="nav-btn" data-i18n="nav_login">
                    ${typeof t !== 'undefined' ? t('nav_login') : 'Login'}
                </a>
            `;

            mobileContainer.innerHTML = `
                <a href="${base}login.html" class="nav-mobile-item">
                    <span>🔑</span> <span data-i18n="nav_login">Login</span>
                </a>
                <a href="${base}elo/" class="nav-mobile-item">
                    <span>📊</span> <span data-i18n="nav_ranking">Ranking</span>
                </a>
                <a href="${base}reglas/" class="nav-mobile-item">
                    <span>📖</span> <span data-i18n="nav_rules">Reglas</span>
                </a>
            `;
        }

        if (typeof updatePageLanguage === 'function') updatePageLanguage();
        if (typeof initNotifications === 'function' && user) initNotifications();
    }
}

// Global accessor
window.CatrinaNav = NavigationComponent;
