/**
 * Sistema de Notificaciones Toast - La Catrina Pool League
 * Notificaciones elegantes con estilo dorado y animaciones suaves
 */

(function() {
    'use strict';

    // Contenedor único para todas las notificaciones
    let toastContainer = null;
    let toastIdCounter = 0;
    const activeToasts = new Map();

    // Configuración por defecto
    const defaultConfig = {
        position: 'top-right',
        duration: 5000,
        showProgress: true,
        pauseOnHover: true,
        closeOnClick: true,
        newestOnTop: false
    };

    // Configuración actual (puede ser modificada)
    let currentConfig = { ...defaultConfig };

    /**
     * Inicializa el contenedor de toasts
     */
    function initContainer() {
        if (toastContainer) return;

        toastContainer = document.createElement('div');
        toastContainer.id = 'catrina-toast-container';
        toastContainer.setAttribute('aria-live', 'polite');
        toastContainer.setAttribute('aria-atomic', 'true');
        
        // Aplicar estilos base
        Object.assign(toastContainer.style, {
            position: 'fixed',
            zIndex: '99999',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        });

        // Posicionamiento según configuración
        updateContainerPosition();

        document.body.appendChild(toastContainer);

        // Agregar estilos CSS si no existen
        if (!document.getElementById('catrina-toast-styles')) {
            injectStyles();
        }
    }

    /**
     * Actualiza la posición del contenedor
     */
    function updateContainerPosition() {
        if (!toastContainer) return;

        const positions = {
            'top-left': { top: '20px', left: '20px', right: 'auto', bottom: 'auto' },
            'top-center': { top: '20px', left: '50%', right: 'auto', bottom: 'auto', transform: 'translateX(-50%)' },
            'top-right': { top: '20px', right: '20px', left: 'auto', bottom: 'auto' },
            'bottom-left': { bottom: '20px', left: '20px', right: 'auto', top: 'auto' },
            'bottom-center': { bottom: '20px', left: '50%', right: 'auto', top: 'auto', transform: 'translateX(-50%)' },
            'bottom-right': { bottom: '20px', right: '20px', left: 'auto', top: 'auto' }
        };

        const pos = positions[currentConfig.position] || positions['top-right'];
        Object.assign(toastContainer.style, pos);
    }

    /**
     * Inyecta los estilos CSS necesarios
     */
    function injectStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'catrina-toast-styles';
        styleSheet.textContent = `
            /* Contenedor de toasts */
            #catrina-toast-container {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            /* Toast individual */
            .catrina-toast {
                pointer-events: auto;
                min-width: 300px;
                max-width: 450px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #d4af37;
                border-radius: 16px;
                padding: 16px 20px;
                box-shadow: 
                    0 10px 40px rgba(0, 0, 0, 0.4),
                    0 0 20px rgba(212, 175, 55, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                position: relative;
                overflow: hidden;
                cursor: pointer;
                
                /* Animación de entrada */
                animation: catrinaToastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                
                /* Transiciones suaves */
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            /* Efecto hover */
            .catrina-toast:hover {
                transform: translateY(-4px);
                box-shadow: 
                    0 15px 50px rgba(0, 0, 0, 0.5),
                    0 0 30px rgba(212, 175, 55, 0.25),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15);
            }

            /* Animación de entrada */
            @keyframes catrinaToastSlideIn {
                0% {
                    opacity: 0;
                    transform: translateX(100px) scale(0.9);
                }
                70% {
                    transform: translateX(-10px) scale(1.02);
                }
                100% {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
            }

            /* Animación de salida */
            @keyframes catrinaToastSlideOut {
                0% {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateX(100px) scale(0.9);
                }
            }

            .catrina-toast.closing {
                animation: catrinaToastSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            /* Estructura interna del toast */
            .catrina-toast-content {
                display: flex;
                align-items: flex-start;
                gap: 14px;
            }

            /* Icono del toast */
            .catrina-toast-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
                background: rgba(212, 175, 55, 0.15);
                border: 2px solid rgba(212, 175, 55, 0.4);
            }

            /* Textos del toast */
            .catrina-toast-text {
                flex: 1;
                min-width: 0;
            }

            .catrina-toast-title {
                color: #d4af37;
                font-size: 16px;
                font-weight: 700;
                margin: 0 0 6px 0;
                line-height: 1.3;
                letter-spacing: 0.5px;
            }

            .catrina-toast-message {
                color: #e0e0e0;
                font-size: 14px;
                margin: 0;
                line-height: 1.5;
                opacity: 0.9;
            }

            /* Botón de cerrar */
            .catrina-toast-close {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 24px;
                height: 24px;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                color: #888;
                font-size: 16px;
                line-height: 1;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                opacity: 0;
            }

            .catrina-toast:hover .catrina-toast-close {
                opacity: 1;
            }

            .catrina-toast-close:hover {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
                transform: scale(1.1);
            }

            /* Barra de progreso */
            .catrina-toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #d4af37 0%, #f4d03f 100%);
                border-radius: 0 0 0 14px;
                transition: width 0.1s linear;
            }

            .catrina-toast:hover .catrina-toast-progress {
                animation-play-state: paused;
            }

            /* Tipos de toast */
            .catrina-toast.success {
                border-color: #4ade80;
                box-shadow: 
                    0 10px 40px rgba(0, 0, 0, 0.4),
                    0 0 20px rgba(74, 222, 128, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }

            .catrina-toast.success .catrina-toast-icon {
                background: rgba(74, 222, 128, 0.15);
                border-color: rgba(74, 222, 128, 0.4);
            }

            .catrina-toast.success .catrina-toast-title {
                color: #4ade80;
            }

            .catrina-toast.success .catrina-toast-progress {
                background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%);
            }

            .catrina-toast.error {
                border-color: #f87171;
                box-shadow: 
                    0 10px 40px rgba(0, 0, 0, 0.4),
                    0 0 20px rgba(248, 113, 113, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }

            .catrina-toast.error .catrina-toast-icon {
                background: rgba(248, 113, 113, 0.15);
                border-color: rgba(248, 113, 113, 0.4);
            }

            .catrina-toast.error .catrina-toast-title {
                color: #f87171;
            }

            .catrina-toast.error .catrina-toast-progress {
                background: linear-gradient(90deg, #f87171 0%, #ef4444 100%);
            }

            .catrina-toast.warning {
                border-color: #fbbf24;
                box-shadow: 
                    0 10px 40px rgba(0, 0, 0, 0.4),
                    0 0 20px rgba(251, 191, 36, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }

            .catrina-toast.warning .catrina-toast-icon {
                background: rgba(251, 191, 36, 0.15);
                border-color: rgba(251, 191, 36, 0.4);
            }

            .catrina-toast.warning .catrina-toast-title {
                color: #fbbf24;
            }

            .catrina-toast.warning .catrina-toast-progress {
                background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
            }

            .catrina-toast.info {
                border-color: #60a5fa;
                box-shadow: 
                    0 10px 40px rgba(0, 0, 0, 0.4),
                    0 0 20px rgba(96, 165, 250, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }

            .catrina-toast.info .catrina-toast-icon {
                background: rgba(96, 165, 250, 0.15);
                border-color: rgba(96, 165, 250, 0.4);
            }

            .catrina-toast.info .catrina-toast-title {
                color: #60a5fa;
            }

            .catrina-toast.info .catrina-toast-progress {
                background: linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%);
            }

            /* Animación de brillo dorado */
            .catrina-toast::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(212, 175, 55, 0.1),
                    transparent
                );
                transition: left 0.5s ease;
            }

            .catrina-toast:hover::before {
                left: 100%;
            }

            /* Responsive */
            @media (max-width: 480px) {
                #catrina-toast-container {
                    left: 10px !important;
                    right: 10px !important;
                    top: 10px !important;
                    bottom: auto !important;
                    transform: none !important;
                }

                .catrina-toast {
                    min-width: auto;
                    max-width: none;
                    width: 100%;
                }
            }

            /* Reducir movimiento para accesibilidad */
            @media (prefers-reduced-motion: reduce) {
                .catrina-toast {
                    animation: none;
                    opacity: 1;
                    transform: none;
                }
                
                .catrina-toast.closing {
                    animation: none;
                    opacity: 0;
                }
            }
        `;

        document.head.appendChild(styleSheet);
    }

    /**
     * Crea y muestra un toast
     */
    function show(options = {}) {
        initContainer();

        const id = ++toastIdCounter;
        const config = { ...currentConfig, ...options };

        // Crear elemento toast
        const toast = document.createElement('div');
        toast.className = `catrina-toast ${options.type || 'default'}`;
        toast.id = `catrina-toast-${id}`;
        toast.setAttribute('role', 'alert');

        // Iconos según tipo
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            default: '🎱'
        };

        const icon = options.icon || icons[options.type] || icons.default;

        // Construir contenido
        let contentHTML = `
            <div class="catrina-toast-content">
                <div class="catrina-toast-icon" aria-hidden="true">${icon}</div>
                <div class="catrina-toast-text">
                    ${options.title ? `<h4 class="catrina-toast-title">${escapeHtml(options.title)}</h4>` : ''}
                    ${options.message ? `<p class="catrina-toast-message">${escapeHtml(options.message)}</p>` : ''}
                </div>
            </div>
            <button class="catrina-toast-close" aria-label="Cerrar notificación">×</button>
        `;

        if (config.showProgress && config.duration > 0) {
            contentHTML += `<div class="catrina-toast-progress" style="width: 100%;"></div>`;
        }

        toast.innerHTML = contentHTML;

        // Event listeners
        let remainingTime = config.duration;
        let startTime = Date.now();
        let timerId = null;
        let isPaused = false;

        const closeToast = () => {
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
            }
            
            toast.classList.add('closing');
            activeToasts.delete(id);

            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        };

        // Cerrar al hacer click
        if (config.closeOnClick) {
            toast.addEventListener('click', (e) => {
                if (e.target.closest('.catrina-toast-close')) {
                    e.stopPropagation();
                }
                closeToast();
            });

            // Botón cerrar específico
            const closeBtn = toast.querySelector('.catrina-toast-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeToast();
                });
            }
        }

        // Pausar al hacer hover
        if (config.pauseOnHover && config.duration > 0) {
            toast.addEventListener('mouseenter', () => {
                isPaused = true;
            });

            toast.addEventListener('mouseleave', () => {
                isPaused = false;
                startTime = Date.now() - (config.duration - remainingTime);
            });
        }

        // Barra de progreso
        const progressBar = toast.querySelector('.catrina-toast-progress');
        if (progressBar && config.duration > 0) {
            const updateProgress = () => {
                if (isPaused) return;
                
                const elapsed = Date.now() - startTime;
                remainingTime = Math.max(0, config.duration - elapsed);
                const progress = (remainingTime / config.duration) * 100;
                
                progressBar.style.width = `${progress}%`;

                if (remainingTime <= 0) {
                    closeToast();
                }
            };

            timerId = setInterval(updateProgress, 50);
        } else if (config.duration > 0) {
            // Sin barra de progreso, usar timeout simple
            timerId = setTimeout(closeToast, config.duration);
        }

        // Agregar al contenedor
        if (config.newestOnTop) {
            toastContainer.insertBefore(toast, toastContainer.firstChild);
        } else {
            toastContainer.appendChild(toast);
        }

        activeToasts.set(id, { element: toast, close: closeToast });

        return {
            id,
            close: closeToast
        };
    }

    /**
     * Escapa HTML para prevenir XSS
     */
    function escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Métodos de conveniencia para diferentes tipos
     */
    const CatrinaToast = {
        // Configuración global
        configure(options) {
            currentConfig = { ...currentConfig, ...options };
            updateContainerPosition();
            return this;
        },

        // Mostrar toast genérico
        show,

        // Métodos específicos por tipo
        success(message, title, options = {}) {
            return show({
                type: 'success',
                title: title || (typeof t !== 'undefined' ? t('toast_success_title') : '¡Éxito!'),
                message,
                ...options
            });
        },

        error(message, title, options = {}) {
            return show({
                type: 'error',
                title: title || (typeof t !== 'undefined' ? t('toast_error_title') : 'Error'),
                message,
                duration: options.duration || 8000, // Más tiempo para errores
                ...options
            });
        },

        warning(message, title, options = {}) {
            return show({
                type: 'warning',
                title: title || (typeof t !== 'undefined' ? t('toast_warning_title') : 'Advertencia'),
                message,
                ...options
            });
        },

        info(message, title, options = {}) {
            return show({
                type: 'info',
                title: title || (typeof t !== 'undefined' ? t('toast_info_title') : 'Información'),
                message,
                ...options
            });
        },

        // Toast especial para badges
        badge(badgeName, badgeIcon, points, options = {}) {
            const title = typeof t !== 'undefined' 
                ? t('toast_badge_title', {name: badgeName}) 
                : `🏆 ${badgeName}`;
                
            const message = typeof t !== 'undefined'
                ? t('toast_badge_message', {points: points})
                : `¡Nuevo logro desbloqueado! +${points} XP`;

            return show({
                type: 'default',
                title: title,
                message: message,
                icon: badgeIcon || '🏆',
                duration: options.duration || 6000,
                ...options
            });
        },

        // Toast para partidos
        match(message, title, type = 'success', options = {}) {
            const defaultTitle = type === 'success' 
                ? (typeof t !== 'undefined' ? t('toast_match_confirmed') : 'Partido Confirmado')
                : (typeof t !== 'undefined' ? t('toast_error_title') : 'Error');

            return show({
                type,
                title: title || defaultTitle,
                message,
                icon: type === 'success' ? '🎱' : '⚠',
                ...options
            });
        },

        // Cerrar todos los toasts
        clearAll() {
            activeToasts.forEach((toast) => {
                toast.close();
            });
            activeToasts.clear();
        },

        // Cerrar toast específico
        dismiss(id) {
            const toast = activeToasts.get(id);
            if (toast) {
                toast.close();
            }
        }
    };

    // Exponer globalmente
    if (typeof window !== 'undefined') {
        window.CatrinaToast = CatrinaToast;
    }

})();
