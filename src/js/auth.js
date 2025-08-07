/**
 * Authentication System
 * Manages login, logout and access control
 *
 * @author Tales Oliveira (github.com/TalesLimaOliveira)
 * @version 1.0.0
 * @note This file contains AI-generated code snippets
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 horas
        this.init();
    }

    /**
     * Initialize authentication system
     */
    init() {
        console.log('Initializing AuthManager...');
        this.loadSession();
        this.setupEventListeners();
        console.log('AuthManager initialized successfully');
    }

    /**
     * Configure event listeners
     */
    setupEventListeners() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.markInactivity();
            }
        });

        setInterval(() => {
            this.validateSession();
        }, 5 * 60 * 1000);
    }

    /**
     * Carregar usuários do arquivo JSON
     * @returns {Promise<Object>} Lista de usuários
     */
    async loadUsers() {
        try {
            const response = await fetch('database/usuarios.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const users = await response.json();
            console.log('AuthManager: Usuários carregados do JSON:', Object.keys(users));
            return users;
        } catch (error) {
            console.error('AuthManager: Erro ao carregar usuários do JSON:', error);
            // Fallback para usuários padrão em memória
            console.warn('AuthManager: Usando usuários padrão como fallback');
            return this.getDefaultUsers();
        }
    }

    /**
     * Usuários padrão como fallback
     */
    getDefaultUsers() {
        return {
            admin: {
                id: 'admin',
                nome: 'Administrador do Sistema',
                usuario: 'admin',
                email: 'admin@sistema.com',
                senha: 'admin',
                role: 'administrator',
                permissions: ['view', 'create', 'edit', 'delete', 'approve', 'manage_users', 'hide_points'],
                dataCriacao: new Date().toISOString(),
                ultimoLogin: null,
                ativo: true
            },
            user: {
                id: 'user',
                nome: 'Usuário Padrão',
                usuario: 'user',
                email: 'user@sistema.com',
                senha: 'user',
                role: 'user',
                permissions: ['view', 'create_pending', 'suggest_changes', 'favorite'],
                dataCriacao: new Date().toISOString(),
                ultimoLogin: null,
                ativo: true
            }
        };
    }

    /**
     * Perform login
     * @param {string} identifier - Username or email
     * @param {string} password - Password
     * @returns {Promise<Object>} Login result
     */
    async login(identifier, password) {
        try {
            const users = await this.loadUsers();
            let user = null;

            // Buscar usuário por username ou email
            for (const [key, userData] of Object.entries(users)) {
                if (userData.usuario === identifier || userData.email === identifier) {
                    user = userData;
                    break;
                }
            }

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            if (!user.ativo) {
                throw new Error('Usuário desativado');
            }

            if (user.senha !== password) {
                throw new Error('Senha incorreta');
            }

            // Atualizar último login
            user.ultimoLogin = new Date().toISOString();

            const sessionData = {
                user: {
                    id: user.id,
                    nome: user.nome,
                    usuario: user.usuario,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions,
                    ultimoLogin: user.ultimoLogin
                },
                loginTime: Date.now(),
                expiresAt: Date.now() + this.sessionTimeout
            };

            localStorage.setItem('pontosDF_session', JSON.stringify(sessionData));
            this.currentUser = sessionData.user;
            this.dispatchAuthEvent('login', this.currentUser);

            console.log('AuthManager: Login realizado com sucesso para:', user.nome);
            return {
                success: true,
                user: this.currentUser,
                message: 'Login realizado com sucesso'
            };

        } catch (error) {
            console.error('AuthManager: Erro no login:', error.message);
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
        try {
            const user = this.currentUser;
            console.log('🔓 Efetuando logout...');

            // Limpar dados da sessão
            localStorage.removeItem('pontosDF_session');
            this.currentUser = null;

            // Disparar evento de logout
            this.dispatchAuthEvent('logout', user);

            console.log('Logout completed successfully');

            // Redirecionar para página principal se estiver no admin
            if (this.isAdminPage()) {
                window.location.href = 'index.html';
            } else {
                // Se já estiver na página principal, apenas recarregar após um delay
                setTimeout(() => {
                    try {
                        window.location.reload();
                    } catch (reloadError) {
                        console.error('Erro ao recarregar página:', reloadError);
                        // Fallback: recarregar forçado
                        window.location.href = window.location.href;
                    }
                }, 500);
            }

        } catch (error) {
            console.error('Erro durante logout:', error);
            // Ainda assim tentar limpar a sessão
            localStorage.removeItem('pontosDF_session');
            this.currentUser = null;
            // Tentar recarregar mesmo com erro
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    }

    /**
     * Cadastrar novo usuário
     * @param {Object} userData - Dados do usuário
     * @returns {Promise<Object>} Resultado do cadastro
     */
    async cadastrarUsuario(userData) {
        try {
            const { nome, usuario, email, senha } = userData;

            // Validações básicas
            if (!nome || !usuario || !email || !senha) {
                throw new Error('Todos os campos são obrigatórios');
            }

            if (nome.length < 2) {
                throw new Error('Nome deve ter pelo menos 2 caracteres');
            }

            if (usuario.length < 3) {
                throw new Error('Usuário deve ter pelo menos 3 caracteres');
            }

            if (!email.includes('@')) {
                throw new Error('Email deve ter formato válido');
            }

            if (senha.length < 4) {
                throw new Error('Senha deve ter pelo menos 4 caracteres');
            }

            // Carregar usuários existentes
            const users = await this.loadUsers();

            // Verificar se usuário ou email já existem
            for (const [key, existingUser] of Object.entries(users)) {
                if (existingUser.usuario === usuario) {
                    throw new Error('Nome de usuário já existe');
                }
                if (existingUser.email === email) {
                    throw new Error('Email já está em uso');
                }
            }

            // Criar novo usuário
            const novoId = this.generateUserId(usuario);
            const novoUsuario = {
                id: novoId,
                nome: nome.trim(),
                usuario: usuario.toLowerCase().trim(),
                email: email.toLowerCase().trim(),
                senha: senha, // Em produção, seria hasheado
                role: 'user',
                permissions: ['view', 'create_pending', 'suggest_changes', 'favorite'],
                dataCriacao: new Date().toISOString(),
                ultimoLogin: null,
                ativo: true
            };

            // Adicionar à lista de usuários
            users[novoId] = novoUsuario;

            // Salvar no JSON (simulação - em produção seria servidor)
            await this.saveUsers(users);

            console.log('AuthManager: Usuário cadastrado com sucesso:', novoUsuario.nome);
            return {
                success: true,
                user: {
                    id: novoUsuario.id,
                    nome: novoUsuario.nome,
                    usuario: novoUsuario.usuario,
                    email: novoUsuario.email
                },
                message: 'Usuário cadastrado com sucesso'
            };

        } catch (error) {
            console.error('AuthManager: Erro no cadastro:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Falha no cadastro'
            };
        }
    }

    /**
     * Salvar usuários no JSON (simulação)
     * @param {Object} users - Lista de usuários
     */
    async saveUsers(users) {
        try {
            // Em produção real, isso seria uma requisição POST para o servidor
            // Por ora, salvamos no localStorage como backup
            localStorage.setItem('pontosDF_users_backup', JSON.stringify(users));
            console.log('AuthManager: Usuários salvos (simulação)', Object.keys(users).length);

            // !TODO: Implementar salvamento real no servidor
            // await fetch('/api/users', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(users)
            // });

        } catch (error) {
            console.error('AuthManager: Erro ao salvar usuários:', error);
            throw new Error('Erro ao salvar dados do usuário');
        }
    }

    /**
     * Gerar ID único para usuário
     * @param {string} usuario - Nome de usuário
     * @returns {string} ID único
     */
    generateUserId(usuario) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);
        return `${usuario}_${timestamp}_${random}`;
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
        try {
            console.log(`AuthManager: Disparando evento authStateChanged - ${type}`, user);
            const event = new CustomEvent('authStateChanged', {
                detail: { type, user }
            });
            document.dispatchEvent(event);
            console.log(`AuthManager: Evento de autenticacao disparado com sucesso: ${type}`);
            
            // Verificar se há listeners
            const listeners = document._listeners?.authStateChanged?.length || 0;
            console.log(`AuthManager: ${listeners} listeners registrados para authStateChanged`);
        } catch (error) {
            console.error('AuthManager: Erro ao disparar evento de autenticacao:', error);
            // Continuar mesmo com erro no evento
        }
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

console.log('AuthManager class defined and exported globally');