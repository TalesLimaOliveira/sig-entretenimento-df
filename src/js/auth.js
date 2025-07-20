/**
 * Sistema de Autenticação
 * Gerencia login, logout e controle de acesso
 * 
 * @author Seu Nome
 * @version 1.0.0
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 horas
        this.init();
    }

    /**
     * Inicializa o sistema de autenticação
     */
    init() {
        console.log('🔐 Inicializando AuthManager...');
        this.loadSession();
        this.setupEventListeners();
        console.log('✅ AuthManager inicializado com sucesso');
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Auto-logout quando a aba perde foco por muito tempo
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.markInactivity();
            }
        });

        // Verificar sessão a cada 5 minutos
        setInterval(() => {
            this.validateSession();
        }, 5 * 60 * 1000);
    }

    /**
     * Dados dos usuários do sistema
     */
    getUsers() {
        return {
            admin: {
                username: 'admin',
                password: 'admin123',
                role: 'administrator',
                name: 'Administrador do Sistema',
                email: 'admin@pontosdf.com',
                permissions: ['view', 'create', 'edit', 'delete', 'manage_users'],
                lastLogin: null
            },
            user: {
                username: 'user',
                password: 'user123',
                role: 'user',
                name: 'Usuário Comum',
                email: 'user@pontosdf.com',
                permissions: ['view'],
                lastLogin: null
            }
        };
    }

    /**
     * Realizar login
     * @param {string} username - Nome de usuário
     * @param {string} password - Senha
     * @returns {Promise<Object>} Resultado do login
     */
    async login(username, password) {
        try {
            const users = this.getUsers();
            const user = users[username];

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            if (user.password !== password) {
                throw new Error('Senha incorreta');
            }

            // Atualizar último login
            user.lastLogin = new Date().toISOString();
            
            // Criar sessão
            const sessionData = {
                user: {
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions,
                    lastLogin: user.lastLogin
                },
                loginTime: Date.now(),
                expiresAt: Date.now() + this.sessionTimeout
            };

            // Salvar sessão
            localStorage.setItem('pontosDF_session', JSON.stringify(sessionData));
            this.currentUser = sessionData.user;

            // Disparar evento de login
            this.dispatchAuthEvent('login', this.currentUser);

            return {
                success: true,
                user: this.currentUser,
                message: 'Login realizado com sucesso'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Falha na autenticação'
            };
        }
    }

    /**
     * Realizar logout
     */
    logout() {
        const user = this.currentUser;
        
        // Limpar dados da sessão
        localStorage.removeItem('pontosDF_session');
        this.currentUser = null;

        // Disparar evento de logout
        this.dispatchAuthEvent('logout', user);

        // Redirecionar para página de login se necessário
        if (this.isAdminPage()) {
            window.location.href = 'index.html';
        }
    }

    /**
     * Carregar sessão salva
     */
    loadSession() {
        try {
            const sessionData = localStorage.getItem('pontosDF_session');
            
            if (!sessionData) {
                return false;
            }

            const session = JSON.parse(sessionData);
            
            // Verificar se a sessão não expirou
            if (Date.now() > session.expiresAt) {
                this.logout();
                return false;
            }

            this.currentUser = session.user;
            return true;

        } catch (error) {
            console.error('Erro ao carregar sessão:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Validar sessão atual
     */
    validateSession() {
        const sessionData = localStorage.getItem('pontosDF_session');
        
        if (!sessionData) {
            if (this.currentUser) {
                this.logout();
            }
            return false;
        }

        try {
            const session = JSON.parse(sessionData);
            
            if (Date.now() > session.expiresAt) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    /**
     * Verificar se usuário está logado
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.currentUser !== null && this.validateSession();
    }

    /**
     * Verificar se usuário é administrador
     * @returns {boolean}
     */
    isAdmin() {
        return this.isAuthenticated() && this.currentUser.role === 'administrator';
    }

    /**
     * Verificar se usuário tem permissão específica
     * @param {string} permission - Permissão a verificar
     * @returns {boolean}
     */
    hasPermission(permission) {
        if (!this.isAuthenticated()) {
            return false;
        }

        return this.currentUser.permissions.includes(permission);
    }

    /**
     * Obter usuário atual
     * @returns {Object|null}
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Verificar se está em página administrativa
     * @returns {boolean}
     */
    isAdminPage() {
        return window.location.pathname.includes('admin.html');
    }

    /**
     * Proteger rota administrativa
     */
    protectAdminRoute() {
        if (this.isAdminPage() && !this.isAdmin()) {
            alert('Acesso negado. Apenas administradores podem acessar esta página.');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    /**
     * Marcar inatividade do usuário
     */
    markInactivity() {
        if (this.currentUser) {
            const sessionData = JSON.parse(localStorage.getItem('pontosDF_session'));
            sessionData.lastActivity = Date.now();
            localStorage.setItem('pontosDF_session', JSON.stringify(sessionData));
        }
    }

    /**
     * Estender sessão
     */
    extendSession() {
        if (this.currentUser) {
            const sessionData = JSON.parse(localStorage.getItem('pontosDF_session'));
            sessionData.expiresAt = Date.now() + this.sessionTimeout;
            localStorage.setItem('pontosDF_session', JSON.stringify(sessionData));
        }
    }

    /**
     * Disparar evento de autenticação
     * @param {string} type - Tipo do evento (login/logout)
     * @param {Object} user - Dados do usuário
     */
    dispatchAuthEvent(type, user) {
        const event = new CustomEvent('authStateChanged', {
            detail: { type, user }
        });
        document.dispatchEvent(event);
    }

    /**
     * Gerar token temporário para ações sensíveis
     * @returns {string}
     */
    generateActionToken() {
        if (!this.isAuthenticated()) {
            throw new Error('Usuário não autenticado');
        }

        const token = {
            user: this.currentUser.username,
            timestamp: Date.now(),
            expires: Date.now() + (5 * 60 * 1000), // 5 minutos
            nonce: Math.random().toString(36).substr(2, 9)
        };

        return btoa(JSON.stringify(token));
    }

    /**
     * Validar token de ação
     * @param {string} token - Token a validar
     * @returns {boolean}
     */
    validateActionToken(token) {
        try {
            const tokenData = JSON.parse(atob(token));
            
            if (Date.now() > tokenData.expires) {
                return false;
            }

            if (tokenData.user !== this.currentUser.username) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }
}

// Criar instância global
const authManager = new AuthManager();

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

// Disponibilizar globalmente
window.AuthManager = AuthManager;
window.authManager = authManager;
