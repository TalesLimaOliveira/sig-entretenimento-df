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

        // Animação de entrada
        requestAnimationFrame(() => {
            this.menu.classList.add('open');
        });
    }

    close() {
        this.menu.classList.remove('open');
        this.isOpen = false;

        // Aguarda animação antes de esconder
        setTimeout(() => {
            if (!this.isOpen) {
                this.menu.style.display = 'none';
            }
        }, 200);
    }

    updateMenuContent(user) {
        const isAdmin = user.role === 'administrator';
        const menuContent = this.menu.querySelector('.user-menu-content');

        const menuItems = isAdmin ? [
            {
                icon: 'fas fa-tachometer-alt',
                label: 'Dashboard',
                action: () => this.openDashboard()
            },
            {
                icon: 'fas fa-plus-circle',
                label: 'Adicionar Ponto',
                action: () => this.addPoint()
            },
            {
                icon: 'fas fa-broom',
                label: 'Limpar Cache',
                action: () => this.clearCache()
            },
            {
                icon: 'fas fa-sign-out-alt',
                label: 'Sair',
                action: () => this.logout(),
                class: 'logout'
            }
        ] : [
            {
                icon: 'fas fa-plus-circle',
                label: 'Adicionar Ponto',
                action: () => this.addPoint()
            },
            {
                icon: 'fas fa-broom',
                label: 'Limpar Cache',
                action: () => this.clearCache()
            },
            {
                icon: 'fas fa-sign-out-alt',
                label: 'Sair',
                action: () => this.logout(),
                class: 'logout'
            }
        ];

        menuContent.innerHTML = menuItems.map(item => `
            <button class="user-menu-item ${item.class || ''}" data-action="${item.label}">
                <i class="${item.icon}"></i>
                <span>${item.label}</span>
            </button>
        `).join('');

        // Adicionar event listeners aos itens
        menuItems.forEach((item, index) => {
            const button = menuContent.children[index];
            button.addEventListener('click', () => {
                item.action();
                this.close();
            });
        });
    }

    positionMenu(buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        const menuWidth = 200;
        const menuHeight = 160;

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
        if (window.location.pathname !== '/admin.html') {
            window.location.href = '/admin.html';
        }
    }

    addPoint() {
        // Implementar abertura do formulário de adicionar ponto
        if (window.addPointModal) {
            window.addPointModal.open();
        } else {
            this.showNotification('Funcionalidade em desenvolvimento', 'info');
        }
    }

    async clearCache() {
        try {
            if (window.databaseManager?.limparCache) {
                const result = window.databaseManager.limparCache();
                this.showNotification('Cache limpo com sucesso!', 'success');
                
                // Recarregar a página após um pequeno delay
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                // Fallback: limpar localStorage
                localStorage.clear();
                this.showNotification('Cache local limpo!', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error('Erro ao limpar cache:', error);
            this.showNotification('Erro ao limpar cache', 'error');
        }
    }

    logout() {
        if (window.authManager?.logout) {
            window.authManager.logout();
            this.showNotification('Logout realizado com sucesso', 'success');
        }
    }

    showNotification(message, type = 'info') {
        if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Inicializar globalmente
window.userMenu = new UserMenu();
