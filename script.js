// script.js - Núcleo principal de funcionalidades

class KOOWEXACore {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.setupAccessibility();
    }

    setupEventListeners() {
        // Menú principal
        this.setupMenuToggle();
        
        // Modales
        this.setupModals();
        
        // Botones principales
        this.setupMainButtons();
        
        // Navegación por teclado
        this.setupKeyboardNavigation();
    }

    setupMenuToggle() {
        const menuToggle = document.getElementById('menuToggle');
        const menuItems = document.getElementById('menuItems');
        let isMenuOpen = false;

        if (menuToggle && menuItems) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isMenuOpen) {
                    menuItems.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    menuToggle.setAttribute('aria-label', 'Abrir menú');
                } else {
                    menuItems.classList.add('active');
                    menuToggle.innerHTML = '<i class="fas fa-times"></i>';
                    menuToggle.setAttribute('aria-label', 'Cerrar menú');
                }
                isMenuOpen = !isMenuOpen;
            });

            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (isMenuOpen && !menuToggle.contains(e.target) && !menuItems.contains(e.target)) {
                    menuItems.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    menuToggle.setAttribute('aria-label', 'Abrir menú');
                    isMenuOpen = false;
                }
            });

            // Cerrar menú con Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isMenuOpen) {
                    menuItems.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    menuToggle.setAttribute('aria-label', 'Abrir menú');
                    isMenuOpen = false;
                }
            });
        }
    }

    setupModals() {
        const modals = [
            { btn: 'docsBtn', modal: 'docsModal', close: 'docsClose' },
            { btn: 'plansBtn', modal: 'plansModal', close: 'plansClose' },
            { btn: 'shareBtn', modal: 'shareModal', close: 'shareClose' },
            { btn: 'posterBtn', modal: 'posterModal', close: 'posterClose' }
        ];

        modals.forEach(({ btn, modal, close }) => {
            const btnElement = document.getElementById(btn);
            const modalElement = document.getElementById(modal);
            const closeElement = document.getElementById(close);

            if (btnElement && modalElement) {
                btnElement.addEventListener('click', () => {
                    modalElement.style.display = 'block';
                    if (closeElement) closeElement.focus();
                });
            }

            if (closeElement && modalElement) {
                closeElement.addEventListener('click', () => {
                    modalElement.style.display = 'none';
                });
            }

            if (modalElement) {
                modalElement.addEventListener('click', (e) => {
                    if (e.target === modalElement) {
                        modalElement.style.display = 'none';
                    }
                });
            }
        });

        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modals.forEach(({ modal }) => {
                    const modalElement = document.getElementById(modal);
                    if (modalElement && modalElement.style.display === 'block') {
                        modalElement.style.display = 'none';
                    }
                });
            }
        });
    }

    setupMainButtons() {
        // Botón comenzar
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                window.location.href = 'mailto:koowexa@gmail.com?subject=Quiero comenzar con KOOWEXA&body=Hola, estoy interesado en sus servicios digitales para emprendedores.';
            });
        }
    }

    setupKeyboardNavigation() {
        const buttons = document.querySelectorAll('button, .menu-btn, .social-link, .email-btn');
        buttons.forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }

    setupAccessibility() {
        // Mejorar accesibilidad para lectores de pantalla
        document.addEventListener('DOMContentLoaded', () => {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
            }
        });
    }

    initializeComponents() {
        // Inicializar APIs si existen
        if (window.KOOWEXA_API) {
            window.KOOWEXA_API.initialize();
        }

        // Inicializar analytics
        this.trackPageView();
    }

    trackPageView() {
        if (window.KOOWEXA_API && window.KOOWEXA_API.getAPI('analytics')) {
            window.KOOWEXA_API.getAPI('analytics').trackPageView(window.location.pathname);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            max-width: 300px;
        `;
        
        if (type === 'success') {
            notification.style.background = 'var(--success)';
        } else if (type === 'warning') {
            notification.style.background = '#d97706';
        } else {
            notification.style.background = 'var(--accent-blue)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.koowexaCore = new KOOWEXACore();
});