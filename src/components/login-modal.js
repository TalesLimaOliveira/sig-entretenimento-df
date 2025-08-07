/**
 * Modal de Login - Sistema de Autenticação
 */
class LoginModal {
    constructor() {
        this.isOpen = false;
        this.onLoginSuccess = null;
        this.pendingAction = null; // Ação que estava sendo executada antes do login
        this.init();
    }

    init() {
        this.createStyles();
        this.createModal();
        this.setupEventListeners();
    }

    createStyles() {
        if (document.querySelector('#login-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'login-modal-styles';
        style.textContent = `
            .login-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .login-modal-overlay.show {
                opacity: 1;
                visibility: visible;
            }
            
            .login-modal {
                background: var(--bg-primary);
                border-radius: 12px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                transform: scale(0.9) translateY(20px);
                transition: transform 0.3s ease;
                border: 1px solid var(--border-color);
            }
            
            .login-modal-overlay.show .login-modal {
                transform: scale(1) translateY(0);
            }
            
            .login-modal-header {
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .login-modal-header h2 {
                color: var(--text-primary);
                margin: 0 0 0.5rem 0;
                font-size: 1.5rem;
                font-weight: 600;
            }
            
            .login-modal-header p {
                color: var(--text-secondary);
                margin: 0;
                font-size: 0.9rem;
            }
            
            .login-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .login-form-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .login-form-group label {
                color: var(--text-primary);
                font-weight: 500;
                font-size: 0.9rem;
            }
            
            .login-form-group input {
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                font-size: 1rem;
                background: var(--bg-secondary);
                color: var(--text-primary);
                transition: border-color 0.2s ease;
            }
            
            .login-form-group input:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            
            .login-form-buttons {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .login-btn {
                flex: 1;
                padding: 0.75rem;
                border: none;
                border-radius: 6px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }
            
            .login-btn-primary {
                background: var(--primary-color);
                color: white;
            }
            
            .login-btn-primary:hover {
                background: var(--primary-hover);
                transform: translateY(-1px);
            }
            
            .login-btn-secondary {
                background: transparent;
                color: var(--text-secondary);
                border: 1px solid var(--border-color);
            }
            
            .login-btn-secondary:hover {
                background: var(--bg-hover);
                color: var(--text-primary);
            }
            
            .login-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none !important;
            }
            
            .login-error {
                background: #fee2e2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 0.75rem;
                border-radius: 6px;
                font-size: 0.9rem;
                text-align: center;
                margin-top: 1rem;
            }
            
            .login-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            @media (max-width: 480px) {
                .login-modal {
                    margin: 1rem;
                    padding: 1.5rem;
                }
                
                .login-form-buttons {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }

    createModal() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'login-modal-overlay';
        this.overlay.innerHTML = `
            <div class="login-modal">
                <div class="login-modal-header">
                    <h2><i class="fas fa-sign-in-alt"></i> Fazer Login</h2>
                    <p>Entre com suas credenciais para acessar recursos exclusivos</p>
                </div>
                <form class="login-form" id="login-form">
                    <div class="login-form-group">
                        <label for="login-email">Email/Usuário</label>
                        <input type="text" id="login-email" name="email" placeholder="Digite seu email ou usuário" required>
                    </div>
                    <div class="login-form-group">
                        <label for="login-password">Senha</label>
                        <input type="password" id="login-password" name="password" placeholder="Digite sua senha" required>
                    </div>
                    <div class="login-form-buttons">
                        <button type="button" class="login-btn login-btn-secondary" id="login-register">
                            <i class="fas fa-user-plus"></i>
                            Cadastrar
                        </button>
                        <button type="submit" class="login-btn login-btn-primary" id="login-submit">
                            <i class="fas fa-sign-in-alt"></i>
                            Entrar
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(this.overlay);
    }

    setupEventListeners() {
        // Fechar modal clicando no overlay
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Botão cadastrar - abrir modal de cadastro
        document.getElementById('login-register').addEventListener('click', () => {
            this.close(); // Fechar modal de login
            if (window.registerModal) {
                window.registerModal.open();
            } else {
                console.error('Modal de cadastro não disponível');
            }
        });

        // Form submit
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    async handleLogin() {
        const submitBtn = document.getElementById('login-submit');
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        // Limpar erros anteriores
        this.clearError();

        // Mostrar loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="login-spinner"></div> Entrando...';

        try {
            // Verificar se authManager está disponível
            if (!window.authManager) {
                throw new Error('Sistema de autenticação não carregado. Recarregue a página.');
            }

            // Verificar se o método login existe
            if (typeof window.authManager.login !== 'function') {
                throw new Error('Método de login não disponível');
            }

            const result = await window.authManager.login(
                emailInput.value.trim(),
                passwordInput.value
            );

            if (result && result.success) {
                console.log('🎯 Login bem-sucedido no modal:', result.user);
                
                // Login bem-sucedido
                this.close();
                this.handleLoginSuccess(result.user);
                
                // FORÇAR atualização da interface imediatamente
                if (window.app && typeof window.app.configureLoggedUser === 'function') {
                    console.log('🎯 Forçando atualização via app.configureLoggedUser...');
                    window.app.configureLoggedUser(result.user);
                } else {
                    console.warn('🎯 App não disponível, tentando método alternativo...');
                    // Método alternativo direto
                    this.forceButtonUpdate(result.user);
                }
            } else {
                // Login falhou
                this.showError(result ? (result.message || 'Credenciais inválidas') : 'Erro desconhecido no login');
            }

        } catch (error) {
            console.error('Erro no processo de login:', error);
            this.showError('Erro no sistema de login: ' + (error.message || 'Erro desconhecido'));
        } finally {
            // Restaurar botão
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        }
    }

    handleLoginSuccess(user) {
        console.log('🎯 LoginModal: handleLoginSuccess chamado para:', user.nome);
        
        // Mostrar notificação
        this.showNotification(`Bem-vindo, ${user.nome || user.name}!`, 'success');

        // Executar callback se existir
        if (this.onLoginSuccess) {
            this.onLoginSuccess(user);
        }

        // Executar ação pendente se existir
        if (this.pendingAction) {
            setTimeout(() => {
                this.pendingAction();
                this.pendingAction = null;
            }, 500);
        }

        // O AuthManager já disparou o evento 'authStateChanged'
        // O app.js vai gerenciar a atualização da interface
        console.log('🎯 LoginModal: Interface será atualizada via evento authStateChanged');

        // Admin permanece na página principal - acesso ao painel pelo menu
        if (user.role === 'administrator') {
            console.log('🎯 Administrator logged in - admin panel available via menu');
        }
        
        // Forçar uma verificação adicional se o app não respondeu
        setTimeout(() => {
            if (window.app && typeof window.app.configureLoggedUser === 'function') {
                console.log('🎯 LoginModal: Forçando atualização de interface via app...');
                window.app.configureLoggedUser(user);
            }
        }, 1000);
    }

    // updateUIAfterLogin - DESABILITADA para evitar conflitos com app.js
    // O app.js gerencia toda a interface via evento authStateChanged
    updateUIAfterLogin(user) {
        console.log('🎯 LoginModal: updateUIAfterLogin chamado mas desabilitado');
        // Esta função foi desabilitada para evitar conflitos
        // A interface é gerenciada pelo app.js via evento authStateChanged
        
        // Apenas disparar evento customizado adicional se necessário
        document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
    }

    /**
     * Método de fallback para forçar atualização dos botões
     */
    forceButtonUpdate(user) {
        console.log('🎯 LoginModal: Executando forceButtonUpdate para:', user.nome);
        
        const isAdmin = user.role === 'administrator';
        const userName = user.nome || user.username || 'Usuário';
        
        // Encontrar containers
        const desktopContainer = document.querySelector('.desktop-actions');
        const mobileContainer = document.querySelector('.mobile-actions');
        
        [desktopContainer, mobileContainer].forEach((container, index) => {
            if (container) {
                const containerType = index === 0 ? 'desktop' : 'mobile';
                
                // Remover botões de login existentes
                const existingButtons = container.querySelectorAll('.header-login-btn, .user-dropdown, .user-info, [id*="login-btn"], [id*="user-info"]');
                existingButtons.forEach(btn => btn.remove());
                
                // Criar novo menu de usuário
                const userMenuHTML = `
                    <div class="user-dropdown" id="${containerType}-user-dropdown">
                        <button class="user-info ${isAdmin ? 'is-admin' : ''}" id="${containerType}-user-info-btn">
                            <div class="user-avatar">
                                <i class="fas fa-user user-icon"></i>
                            </div>
                            <span class="user-name">${userName}</span>
                            <i class="fas fa-chevron-down dropdown-arrow"></i>
                        </button>
                        <div class="user-dropdown-menu" id="${containerType}-user-info-btn-menu" style="display: none;">
                            ${isAdmin ? `
                                <a href="admin.html" class="dropdown-item admin-item">
                                    <i class="fas fa-cogs"></i>
                                    <span>Gerenciar Pontos</span>
                                </a>
                            ` : ''}
                            <button class="dropdown-item logout-btn" data-action="logout">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                `;
                
                container.insertAdjacentHTML('beforeend', userMenuHTML);
                console.log(`🎯 Menu de usuário criado via fallback para ${containerType}`);
                
                // Configurar eventos do menu
                const userBtn = document.getElementById(`${containerType}-user-info-btn`);
                const menu = document.getElementById(`${containerType}-user-info-btn-menu`);
                
                if (userBtn && menu) {
                    userBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const isVisible = menu.style.display !== 'none';
                        
                        // Fechar todos os outros menus
                        document.querySelectorAll('.user-dropdown-menu').forEach(m => {
                            if (m !== menu) m.style.display = 'none';
                        });
                        
                        // Toggle do menu atual
                        menu.style.display = isVisible ? 'none' : 'block';
                        console.log(`🎯 Menu ${containerType} toggled:`, !isVisible);
                    });
                    
                    // Configurar logout
                    const logoutBtn = menu.querySelector('.logout-btn');
                    if (logoutBtn) {
                        logoutBtn.addEventListener('click', () => {
                            if (window.authManager) {
                                window.authManager.logout();
                            }
                        });
                    }
                }
            }
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                document.querySelectorAll('.user-dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                });
            }
        });
    }

    addFavoritesCategory() {
        const navContainer = document.querySelector('.nav-buttons-container');
        if (navContainer && !document.querySelector('[data-categoria="favoritos"]')) {
            const favoritesBtn = document.createElement('button');
            favoritesBtn.className = 'nav-btn category-btn';
            favoritesBtn.setAttribute('data-categoria', 'favoritos');
            favoritesBtn.innerHTML = '<i class="fas fa-heart"></i> Favoritos';
            navContainer.appendChild(favoritesBtn);
        }
    }

    showUserMenu(user) {
        // Implementação simples para teste
        console.log('Mostrando menu do usuário para:', user.nome || user.name);
        const confirmLogout = confirm(`Olá ${user.nome || user.name}!\n\nDeseja fazer logout?`);
        if (confirmLogout && window.authManager) {
            try {
                window.authManager.logout();
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                // Fallback: tentar recarregar a página
                window.location.reload();
            }
        }
    }

    showError(message) {
        this.clearError();
        
        const form = document.querySelector('.login-form');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        form.appendChild(errorDiv);
    }

    clearError() {
        const existingError = document.querySelector('.login-error');
        if (existingError) {
            existingError.remove();
        }
    }

    showNotification(message, type = 'info') {
        // Implementação simples de notificação
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 1rem;
            border-radius: 6px;
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    open(options = {}) {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.onLoginSuccess = options.onSuccess || null;
        this.pendingAction = options.pendingAction || null;

        // Limpar form
        document.getElementById('login-form').reset();
        this.clearError();

        // Mostrar modal
        this.overlay.classList.add('show');

        // Focus no primeiro input
        setTimeout(() => {
            document.getElementById('login-email').focus();
        }, 300);
    }

    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.overlay.classList.remove('show');
        this.onLoginSuccess = null;
        this.pendingAction = null;
    }

    showRegisterPlaceholder() {
        // Placeholder para funcionalidade de cadastro
        if (window.infoPanelManager?.showNotification) {
            window.infoPanelManager.showNotification('Funcionalidade de cadastro em desenvolvimento', 'info');
        } else {
            alert('Funcionalidade de cadastro em desenvolvimento');
        }
    }
}

// Criar instância global
window.LoginModal = LoginModal;
window.loginModal = new LoginModal();