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
                background: rgba(0, 0, 0, 0.7);
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
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
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

            .login-demo-credentials {
                background: var(--bg-tertiary);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                padding: 1rem;
                margin-top: 1rem;
                font-size: 0.85rem;
            }

            .login-demo-credentials h4 {
                margin: 0 0 0.5rem 0;
                color: var(--text-primary);
                font-size: 0.9rem;
            }

            .login-demo-credentials p {
                margin: 0.25rem 0;
                color: var(--text-secondary);
                font-family: monospace;
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
                        <button type="button" class="login-btn login-btn-secondary" id="login-cancel">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button type="submit" class="login-btn login-btn-primary" id="login-submit">
                            <i class="fas fa-sign-in-alt"></i> Entrar
                        </button>
                    </div>
                </form>
                
                <div class="login-demo-credentials">
                    <h4><i class="fas fa-info-circle"></i> Credenciais de Demo:</h4>
                    <p><strong>Admin:</strong> email: admin | senha: admin</p>
                    <p><strong>Usuário:</strong> email: user | senha: user</p>
                </div>
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

        // Botão cancelar
        document.getElementById('login-cancel').addEventListener('click', () => {
            this.close();
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

        // Autofill credenciais demo
        this.overlay.addEventListener('click', (e) => {
            if (e.target.tagName === 'P' && e.target.textContent.includes('email:')) {
                const text = e.target.textContent;
                if (text.includes('admin')) {
                    document.getElementById('login-email').value = 'admin';
                    document.getElementById('login-password').value = 'admin';
                } else if (text.includes('user')) {
                    document.getElementById('login-email').value = 'user';
                    document.getElementById('login-password').value = 'user';
                }
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
            const result = await window.authManager.login(emailInput.value.trim(), passwordInput.value);
            
            if (result.success) {
                // Login bem-sucedido
                this.close();
                this.handleLoginSuccess(result.user);
            } else {
                // Login falhou
                this.showError(result.message || 'Credenciais inválidas');
            }
        } catch (error) {
            this.showError('Erro no sistema de login: ' + error.message);
        } finally {
            // Restaurar botão
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        }
    }

    handleLoginSuccess(user) {
        // Mostrar notificação
        this.showNotification(`Bem-vindo, ${user.name}!`, 'success');
        
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

        // Atualizar interface
        this.updateUIAfterLogin(user);
        
        // Redirecionar admin se necessário
        if (user.role === 'administrator' && window.location.pathname.includes('index.html')) {
            const shouldRedirect = confirm('Deseja acessar o painel administrativo?');
            if (shouldRedirect) {
                window.location.href = 'admin.html';
            }
        }
    }

    updateUIAfterLogin(user) {
        // Atualizar botão de login no header
        const loginBtn = document.querySelector('.admin-login');
        if (loginBtn) {
            loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
            loginBtn.onclick = () => this.showUserMenu(user);
        }

        // Adicionar categoria de favoritos se for usuário comum
        if (user.role === 'user') {
            this.addFavoritesCategory();
        }

        // Disparar evento customizado
        document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
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
        // Criar menu dropdown simples
        const menu = `
            <div class="user-dropdown" style="position: absolute; top: 100%; right: 0; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.5rem; min-width: 150px; z-index: 1000;">
                <div style="padding: 0.5rem; border-bottom: 1px solid var(--border-color); font-weight: bold;">${user.name}</div>
                <button onclick="window.authManager.logout()" style="width: 100%; padding: 0.5rem; border: none; background: none; color: var(--text-primary); cursor: pointer; text-align: left;">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;
        // Implementação simples - em produção seria mais sofisticada
        alert('Menu do usuário - Clique OK para fazer logout');
        window.authManager.logout();
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
}

// Criar instância global
window.LoginModal = LoginModal;
window.loginModal = new LoginModal();
