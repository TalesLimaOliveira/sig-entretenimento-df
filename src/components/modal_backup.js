/**
 * Modal Manager - Clean Version
 */
class ModalManager {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        console.log('📱 Inicializando ModalManager...');
        this.criarEstilos();
        this.configurarEventos();
        console.log('✅ ModalManager inicializado com sucesso');
    }

    criarEstilos() {
        if (document.querySelector('#modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .modal-overlay.show {
                opacity: 1;
            }

            .modal {
                background: var(--bg-primary);
                border-radius: 8px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }

            .modal-overlay.show .modal {
                transform: scale(1);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border);
            }

            .modal-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--text-primary);
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--text-secondary);
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.3s ease;
            }

            .modal-close:hover {
                background: var(--bg-secondary);
            }

            .modal-body {
                margin-bottom: 1.5rem;
            }

            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--border);
            }

            .form-group {
                margin-bottom: 1rem;
            }

            .form-label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: var(--text-primary);
            }

            .form-input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--border);
                border-radius: 4px;
                font-size: 1rem;
                background: var(--bg-primary);
                color: var(--text-primary);
                transition: border-color 0.3s ease;
            }

            .form-input:focus {
                outline: none;
                border-color: var(--primary);
            }

            .btn-secondary {
                background: var(--gray);
                color: var(--white);
            }
        `;
        document.head.appendChild(style);
    }

    configurarEventos() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close') || e.target.matches('.modal-overlay')) {
                this.fechar();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalAtivo) {
                this.fechar();
            }
        });
    }

    mostrar(tipo, dados = {}) {
        this.fechar(); // Fechar modal anterior se existir

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = this.getModalHTML(tipo, dados);

        document.body.appendChild(overlay);
        this.modalAtivo = overlay;

        // Animar entrada
        setTimeout(() => overlay.classList.add('show'), 10);

        // Configurar formulário se for de login
        if (tipo === 'login') {
            this.configurarFormularioLogin(overlay);
        }
    }

    fechar() {
        if (!this.modalAtivo) return;

        this.modalAtivo.classList.remove('show');
        setTimeout(() => {
            if (this.modalAtivo && this.modalAtivo.parentNode) {
                this.modalAtivo.parentNode.removeChild(this.modalAtivo);
            }
            this.modalAtivo = null;
        }, 300);
    }

    getModalHTML(tipo, dados) {
        switch (tipo) {
            case 'login':
                return `
                    <div class="modal">
                        <div class="modal-header">
                            <h2 class="modal-title">Login Administrativo</h2>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="login-form">
                                <div class="form-group">
                                    <label class="form-label">Usuário:</label>
                                    <input type="text" class="form-input" name="usuario" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Senha:</label>
                                    <input type="password" class="form-input" name="senha" required>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary modal-close">Cancelar</button>
                            <button type="submit" form="login-form" class="btn btn-primary">Entrar</button>
                        </div>
                    </div>
                `;

            default:
                return `
                    <div class="modal">
                        <div class="modal-header">
                            <h2 class="modal-title">Modal</h2>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p>Conteúdo do modal</p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary modal-close">OK</button>
                        </div>
                    </div>
                `;
        }
    }

    configurarFormularioLogin(overlay) {
        const form = overlay.querySelector('#login-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const usuario = formData.get('usuario');
            const senha = formData.get('senha');
            
            if (window.authManager.login(usuario, senha)) {
                this.fechar();
                window.app.verificarAutenticacao();
            } else {
                alert('Credenciais inválidas');
            }
        });
    }
}
