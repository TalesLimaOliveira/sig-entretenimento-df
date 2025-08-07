/**
 * Modal de Cadastro - Sistema de Registro de Usuários
 */
class RegisterModal {
    constructor() {
        this.isOpen = false;
        this.onRegisterSuccess = null;
        this.init();
    }

    init() {
        this.createStyles();
        this.createModal();
        this.setupEventListeners();
    }

    createStyles() {
        if (document.querySelector('#register-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'register-modal-styles';
        style.textContent = `
            .register-modal-overlay {
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

            .register-modal-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .register-modal {
                background: var(--bg-primary);
                border-radius: 12px;
                padding: 2rem;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                transform: scale(0.9) translateY(20px);
                transition: transform 0.3s ease;
                border: 1px solid var(--border-color);
                max-height: 90vh;
                overflow-y: auto;
            }

            .register-modal-overlay.show .register-modal {
                transform: scale(1) translateY(0);
            }

            .register-modal-header {
                text-align: center;
                margin-bottom: 2rem;
            }

            .register-modal-header h2 {
                color: var(--text-primary);
                margin: 0 0 0.5rem 0;
                font-size: 1.5rem;
                font-weight: 600;
            }

            .register-modal-header p {
                color: var(--text-secondary);
                margin: 0;
                font-size: 0.9rem;
            }

            .register-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .register-form-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .register-form-group label {
                color: var(--text-primary);
                font-weight: 500;
                font-size: 0.9rem;
            }

            .register-form-group input {
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                font-size: 1rem;
                background: var(--bg-secondary);
                color: var(--text-primary);
                transition: border-color 0.2s ease;
            }

            .register-form-group input:focus {
                outline: none;
                border-color: var(--primary-color);
            }

            .register-form-buttons {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }

            .register-btn {
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

            .register-btn-primary {
                background: var(--primary-color);
                color: white;
            }

            .register-btn-primary:hover {
                background: var(--primary-hover);
                transform: translateY(-1px);
            }

            .register-btn-secondary {
                background: transparent;
                color: var(--text-secondary);
                border: 1px solid var(--border-color);
            }

            .register-btn-secondary:hover {
                background: var(--bg-hover);
                color: var(--text-primary);
            }

            .register-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none !important;
            }

            .register-error {
                background: #fee2e2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 0.75rem;
                border-radius: 6px;
                font-size: 0.9rem;
                text-align: center;
                margin-top: 1rem;
            }

            .register-success {
                background: #d1fae5;
                border: 1px solid #a7f3d0;
                color: #065f46;
                padding: 0.75rem;
                border-radius: 6px;
                font-size: 0.9rem;
                text-align: center;
                margin-top: 1rem;
            }

            .register-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            .form-hint {
                font-size: 0.8rem;
                color: var(--text-secondary);
                margin-top: 0.25rem;
            }

            .login-link {
                text-align: center;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--border-color);
            }

            .login-link a {
                color: var(--primary-color);
                text-decoration: none;
                font-weight: 500;
            }

            .login-link a:hover {
                text-decoration: underline;
            }

            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }

            @media (max-width: 480px) {
                .register-modal {
                    margin: 1rem;
                    padding: 1.5rem;
                }

                .register-form-buttons {
                    flex-direction: column;
                }
            }
        `;

        document.head.appendChild(style);
    }

    createModal() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'register-modal-overlay';
        this.overlay.innerHTML = `
            <div class="register-modal">
                <div class="register-modal-header">
                    <h2><i class="fas fa-user-plus"></i> Criar Conta</h2>
                    <p>Cadastre-se para acessar recursos exclusivos da plataforma</p>
                </div>

                <form class="register-form" id="register-form">
                    <div class="register-form-group">
                        <label for="register-name">Nome Completo *</label>
                        <input type="text" id="register-name" name="name" placeholder="Digite seu nome completo" required>
                        <div class="form-hint">Mínimo 2 caracteres</div>
                    </div>

                    <div class="register-form-group">
                        <label for="register-username">Nome de Usuário *</label>
                        <input type="text" id="register-username" name="username" placeholder="Digite seu nome de usuário" required>
                        <div class="form-hint">Mínimo 3 caracteres, apenas letras e números</div>
                    </div>

                    <div class="register-form-group">
                        <label for="register-email">Email *</label>
                        <input type="email" id="register-email" name="email" placeholder="Digite seu email" required>
                        <div class="form-hint">Email válido para contato</div>
                    </div>

                    <div class="register-form-group">
                        <label for="register-password">Senha *</label>
                        <input type="password" id="register-password" name="password" placeholder="Digite sua senha" required>
                        <div class="form-hint">Mínimo 4 caracteres</div>
                    </div>

                    <div class="register-form-group">
                        <label for="register-password-confirm">Confirmar Senha *</label>
                        <input type="password" id="register-password-confirm" name="password-confirm" placeholder="Confirme sua senha" required>
                        <div class="form-hint">Digite a mesma senha novamente</div>
                    </div>

                    <div class="register-form-buttons">
                        <button type="button" class="register-btn register-btn-secondary" id="register-cancel">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button type="submit" class="register-btn register-btn-primary" id="register-submit">
                            <i class="fas fa-user-plus"></i> Cadastrar
                        </button>
                    </div>
                </form>

                <div class="login-link">
                    <span>Já tem uma conta? </span>
                    <a href="#" id="register-login-link">Fazer login</a>
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
        document.getElementById('register-cancel').addEventListener('click', () => {
            this.close();
        });

        // Link para login
        document.getElementById('register-login-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
            if (window.loginModal) {
                window.loginModal.open();
            }
        });

        // Form submit
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    async handleRegister() {
        const submitBtn = document.getElementById('register-submit');
        const nameInput = document.getElementById('register-name');
        const usernameInput = document.getElementById('register-username');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const passwordConfirmInput = document.getElementById('register-password-confirm');

        // Limpar mensagens anteriores
        this.clearMessages();

        // Validações no frontend
        if (passwordInput.value !== passwordConfirmInput.value) {
            this.showError('As senhas não coincidem');
            return;
        }

        // Mostrar loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="register-spinner"></div> Cadastrando...';

        try {
            // Verificar se authManager está disponível
            if (!window.authManager) {
                throw new Error('Sistema de autenticação não carregado. Recarregue a página.');
            }

            // Verificar se o método cadastrarUsuario existe
            if (typeof window.authManager.cadastrarUsuario !== 'function') {
                throw new Error('Função de cadastro não disponível');
            }

            const userData = {
                nome: nameInput.value.trim(),
                usuario: usernameInput.value.trim(),
                email: emailInput.value.trim(),
                senha: passwordInput.value
            };

            const result = await window.authManager.cadastrarUsuario(userData);

            if (result && result.success) {
                // Cadastro bem-sucedido
                this.showSuccess(result.message || 'Usuário cadastrado com sucesso!');

                // Limpar formulário
                document.getElementById('register-form').reset();

                // Fechar modal após delay e abrir login
                setTimeout(() => {
                    this.close();
                    if (window.loginModal) {
                        window.loginModal.open();
                    }
                }, 2000);

            } else {
                // Cadastro falhou
                this.showError(result ? (result.message || 'Erro no cadastro') : 'Erro desconhecido no cadastro');
            }

        } catch (error) {
            console.error('Erro no processo de cadastro:', error);
            this.showError('Erro no sistema de cadastro: ' + (error.message || 'Erro desconhecido'));
        } finally {
            // Restaurar botão
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Cadastrar';
        }
    }

    open() {
        this.isOpen = true;
        this.overlay.classList.add('show');

        // Focar no primeiro campo
        setTimeout(() => {
            document.getElementById('register-name').focus();
        }, 300);
    }

    close() {
        this.isOpen = false;
        this.overlay.classList.remove('show');
        this.clearMessages();
    }

    showError(message) {
        this.clearMessages();
        const form = document.querySelector('.register-form');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'register-error';
        errorDiv.textContent = message;
        form.appendChild(errorDiv);
    }

    showSuccess(message) {
        this.clearMessages();
        const form = document.querySelector('.register-form');
        const successDiv = document.createElement('div');
        successDiv.className = 'register-success';
        successDiv.textContent = message;
        form.appendChild(successDiv);
    }

    clearMessages() {
        const existingError = document.querySelector('.register-error');
        const existingSuccess = document.querySelector('.register-success');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();
    }
}

// Criar instância global
window.RegisterModal = RegisterModal;
window.registerModal = new RegisterModal();
console.log('RegisterModal inicializado e disponibilizado globalmente');