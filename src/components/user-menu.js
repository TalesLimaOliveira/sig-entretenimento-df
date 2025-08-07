/**
 * Menu Dropdown do Usuário
 * Exibe opções diferentes para usuário comum e administrador
 */
class UserMenu {
    constructor() {
        this.menu = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createMenu();
        this.setupEventListeners();
    }

    createMenu() {
        const menuHTML = `
            <div id="user-menu" class="user-menu" style="display: none;">
                <div class="user-menu-content">
                    <!-- Conteúdo será inserido dinamicamente -->
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', menuHTML);
        this.menu = document.getElementById('user-menu');
        this.createStyles();
    }

    createStyles() {
        if (document.querySelector('#user-menu-styles')) return;

        const style = document.createElement('style');
        style.id = 'user-menu-styles';
        style.textContent = `
            .user-menu {
                position: fixed;
                z-index: 10000;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                min-width: 200px;
                opacity: 0;
                transform: translateY(-10px) scale(0.95);
                transition: all 0.2s ease;
                backdrop-filter: blur(10px);
            }

            .user-menu.open {
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            .user-menu-content {
                padding: 0.5rem;
            }

            .user-menu-header {
                padding: 1rem;
                border-bottom: 1px solid var(--border-color);
                text-align: center;
            }

            .user-menu-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--theme-gradient-button);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 0.5rem;
                color: white;
                font-weight: bold;
                font-size: 1.2rem;
            }

            .user-menu-name {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
            }

            .user-menu-role {
                font-size: 0.85rem;
                color: var(--text-secondary);
            }

            .user-menu-role.admin {
                color: var(--color-admin);
                font-weight: 500;
            }

            .user-menu-item {
                width: 100%;
                padding: 0.75rem 1rem;
                border: none;
                background: transparent;
                color: var(--text-primary);
                font-size: 0.9rem;
                text-align: left;
                cursor: pointer;
                border-radius: 6px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                transition: all 0.2s ease;
                margin-bottom: 0.25rem;
            }

            .user-menu-item:hover {
                background: var(--bg-hover);
                color: var(--text-primary);
            }

            .user-menu-item i {
                width: 16px;
                text-align: center;
                opacity: 0.7;
            }

            .user-menu-item.admin-item {
                color: var(--color-admin);
            }

            .user-menu-item.admin-item:hover {
                background: rgba(251, 191, 36, 0.1);
                color: var(--color-admin);
            }

            .user-menu-item.logout-item {
                color: var(--color-error);
                margin-top: 0.5rem;
                padding-top: 0.75rem;
                border-top: 1px solid var(--border-color);
            }

            .user-menu-item.logout-item:hover {
                background: rgba(239, 68, 68, 0.1);
                color: var(--color-error);
            }

            .user-info {
                background: rgba(255, 255, 255, 0.15);
                border: 2px solid rgba(255, 255, 255, 0.3);
                color: var(--white);
                padding: 0.5rem 1rem;
                border-radius: 25px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
                font-weight: 500;
                backdrop-filter: blur(10px);
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }

            .user-info:hover {
                background: rgba(255, 255, 255, 0.25);
                border-color: rgba(255, 255, 255, 0.5);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .user-info.is-admin {
                background: var(--gradient-admin);
                border-color: var(--color-admin);
            }

            .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 0.9rem;
            }

            .admin-icon {
                color: var(--color-admin);
                font-size: 0.9rem;
            }

            .dropdown-arrow {
                font-size: 0.8rem;
                transition: transform 0.2s ease;
            }

            .user-info.menu-open .dropdown-arrow {
                transform: rotate(180deg);
            }

            @media (max-width: 768px) {
                .user-menu {
                    min-width: 180px;
                    right: 10px !important;
                    left: auto !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.user-menu') && !e.target.closest('.user-info')) {
                this.close();
            }
        });

        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    toggle(buttonElement) {
        if (this.isOpen) {
            this.close();
        } else {
            this.open(buttonElement);
        }
    }

    open(buttonElement) {
        const user = window.authManager?.getCurrentUser();
        if (!user) return;

        this.updateMenuContent(user);
        this.positionMenu(buttonElement);
        this.menu.style.display = 'block';
        this.isOpen = true;

        // Adicionar classe ao botão para indicar menu aberto
        buttonElement.classList.add('menu-open');

        // Animação de entrada
        requestAnimationFrame(() => {
            this.menu.classList.add('open');
        });
    }

    close() {
        // Remover classe de todos os botões de usuário
        document.querySelectorAll('.user-info').forEach(btn => {
            btn.classList.remove('menu-open');
        });

        this.menu.classList.remove('open');
        this.isOpen = false;

        // Aguardar animação antes de esconder
        setTimeout(() => {
            if (!this.isOpen) {
                this.menu.style.display = 'none';
            }
        }, 200);
    }

    updateMenuContent(user) {
        const isAdmin = user.role === 'administrator';
        const menuContent = this.menu.querySelector('.user-menu-content');
        
        // Header do menu com informações do usuário
        const headerHTML = `
            <div class="user-menu-header">
                <div class="user-menu-avatar">${user.nome.charAt(0).toUpperCase()}</div>
                <div class="user-menu-name">${user.nome}</div>
                <div class="user-menu-role ${isAdmin ? 'admin' : ''}">${isAdmin ? 'Administrador' : 'Usuário'}</div>
            </div>
        `;

        const menuItems = isAdmin ? [
            { icon: 'fas fa-tachometer-alt', label: 'Painel Administrativo', action: () => this.openDashboard(), class: 'admin-item' },
            { icon: 'fas fa-plus-circle', label: 'Adicionar Ponto', action: () => this.addPoint() },
            { icon: 'fas fa-sign-out-alt', label: 'Sair', action: () => this.logout(), class: 'logout-item' }
        ] : [
            { icon: 'fas fa-plus-circle', label: 'Adicionar Ponto', action: () => this.addPoint() },
            { icon: 'fas fa-sign-out-alt', label: 'Sair', action: () => this.logout(), class: 'logout-item' }
        ];

        const itemsHTML = menuItems.map(item => 
            `<button class="user-menu-item ${item.class || ''}" data-action="${item.label}">
                <i class="${item.icon}"></i>
                <span>${item.label}</span>
            </button>`
        ).join('');

        menuContent.innerHTML = headerHTML + itemsHTML;

        // Adicionar event listeners aos itens
        menuItems.forEach((item, index) => {
            const button = menuContent.querySelectorAll('.user-menu-item')[index];
            button.addEventListener('click', () => {
                item.action();
                this.close();
            });
        });
    }

    positionMenu(buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        const menuWidth = 200;
        const menuHeight = 240; // Aumentado para acomodar header
        
        let left = rect.left;
        let top = rect.bottom + 8;

        // Ajustar se sair da tela
        if (left + menuWidth > window.innerWidth) {
            left = rect.right - menuWidth;
        }
        
        if (top + menuHeight > window.innerHeight) {
            top = rect.top - menuHeight - 8;
        }

        this.menu.style.left = `${Math.max(8, left)}px`;
        this.menu.style.top = `${Math.max(8, top)}px`;
    }

    openDashboard() {
        // Usar caminho relativo correto
        if (window.location.pathname.endsWith('admin.html')) {
            // Já está no dashboard
            return;
        }
        window.location.href = 'admin.html';
    }

    addPoint() {
        // TODO: Implement add point form opening for users
        if (window.addPointModal) {
            window.addPointModal.open();
        } else {
            this.showNotification('Funcionalidade em desenvolvimento', 'info');
        }
    }

    logout() {
        if (window.authManager?.logout) {
            window.authManager.logout();
            this.showNotification('Logout realizado com sucesso', 'success');
            
            // Recarregar a página automaticamente após um breve delay
            setTimeout(() => {
                window.location.reload();
            }, 800);
        }
    }

    showNotification(message, type = 'info') {
        // Tentar usar o sistema de notificação do ErrorHandler primeiro
        if (window.errorHandler?.showSimpleNotification) {
            window.errorHandler.showSimpleNotification(message, type);
        } else if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification(message, type);
        } else {
            // Fallback simples
            console.log(`${type.toUpperCase()}: ${message}`);
            
            // Criar notificação visual simples
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                padding: 1rem;
                border-radius: 6px;
                z-index: 10001;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // Remover após 3 segundos
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }
}

// Inicializar globalmente
window.UserMenu = UserMenu;
window.userMenu = new UserMenu();
console.log('UserMenu inicializado e disponibilizado globalmente');