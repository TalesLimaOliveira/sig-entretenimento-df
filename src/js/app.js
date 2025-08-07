/**
 * PontosEntretenimentoApp - Aplicação Principal
 * 
 * Esta classe é o ponto central de coordenação da aplicação, implementando
 * os princípios de Clean Architecture. Ela gerencia o ciclo de vida completo
 * da aplicação, desde a inicialização até o carregamento dos dados.
 * 
 * Responsabilidades Principais:
 * - Coordenar inicialização de todos os managers
 * - Gerenciar estado global da aplicação (categoria ativa, usuário, etc.)
 * - Controlar responsividade e adaptação mobile
 * - Orquestrar comunicação entre componentes
 * - Gerenciar loading e tratamento de erros
 * 
 * Fluxo de Inicialização:
 * 1. Aguardar DOM estar pronto
 * 2. Aguardar todos os managers estarem disponíveis
 * 3. Configurar responsividade
 * 4. Verificar autenticação
 * 5. Configurar interface baseada no usuário
 * 6. Configurar eventos globais
 * 7. Carregar e renderizar dados
 * 8. Remover tela de loading
 * 
 * Usado por: index.html (instanciação)
 * Dependências: DatabaseManager, AuthManager, MapManager
 *
 * @author Tales Oliveira (github.com/TalesLimaOliveira)
 * @version 1.0.0
 * @note Este arquivo contém trechos de código gerados com auxílio de Inteligência Artificial.
 */

class PontosEntretenimentoApp {
    /**
     * Construtor da aplicação principal
     * 
     * Inicializa propriedades básicas e inicia o processo de carregamento
     */
    constructor() {
        // Estado da aplicação
        this.isAdmin = false;                    // Se usuário atual é administrador
        this.activeCategory = 'todos';           // Categoria atualmente filtrada
        this.isInitialized = false;              // Se aplicação foi totalmente inicializada
        
        // Configurações de responsividade
        this.breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };
        
        // Note: init() will be called by AppInitializer in index.html
    }

    /**
     * Inicialização principal da aplicação
     * 
     * Ponto de entrada que aguarda o DOM estar pronto antes de prosseguir
     * com a inicialização completa. Implementa tratamento robusto de erros.
     * 
     * Usado por: constructor
     */
    async init() {
        // Prevent double initialization
        if (this.isInitialized) {
            console.log('Application already initialized, skipping...');
            return;
        }
        
        try {
            console.log('Initializing SIG Entretenimento DF application...');
            
            // Aguardar DOM estar pronto
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this._initialize());
            } else {
                await this._initialize();
            }
        } catch (error) {
            console.error('Critical error during application initialization:', error);
            this._showInitializationError(error);
        }
    }

    /**
     * Complete sequential initialization process
     * 
     * Implements the initialization flow in well-defined stages,
     * ensuring each dependency is available before proceeding.
     * 
     * @private
     */
    async _initialize() {
        try {
            console.log('Waiting for managers...');
            await this.waitForManagers();
            console.log('Managers loaded');

            console.log('Configuring responsiveness...');
            this.configureResponsiveness();
            console.log('Responsiveness configured');
            
            console.log('Verifying authentication...');
            this.verifyAuthentication();
            console.log('Authentication verified');
            
            console.log('Configuring interface...');
            await this.configureInterface();
            console.log('Interface configured');
            
            console.log('Configuring events...');
            this.configureEvents();
            console.log('Events configured');
            
            console.log('Loading data...');
            this.loadData();
            console.log('Data loaded');
            
            console.log('Finalizing initialization...');
            this.removeLoadingScreen();
            this._markAsInitialized();
            
            // Garantir que os botões de categoria estejam visíveis após inicialização
            setTimeout(() => {
                console.log('🔄 Verificação final dos botões de categoria...');
                this.configureCategoryMenu();
                this.diagnoseCategoryButtons();
                
                // Forçar visibilidade do container e botões
                const container = document.getElementById('nav-buttons-container');
                if (container) {
                    container.style.display = 'flex !important';
                    container.style.visibility = 'visible !important';
                    container.style.opacity = '1 !important';
                    
                    const buttons = container.querySelectorAll('.nav-btn');
                    buttons.forEach(btn => {
                        btn.style.display = 'flex !important';
                        btn.style.visibility = 'visible !important';
                        btn.style.opacity = '1 !important';
                    });
                    
                    console.log(`✅ Container e ${buttons.length} botões forçados como visíveis`);
                }
            }, 200);
            
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Error during initialization:', error);
            this._showInitializationError(error);
        }
    }

    /**
     * Mark application as initialized
     * @private
     */
    _markAsInitialized() {
        this.isInitialized = true;
        document.body.classList.add('app-initialized');
    }

    /**
     * Show initialization error and remove loading
     * @private
     */
    _showInitializationError(error) {
        // Only log the error, don't show pop-up since AppInitializer handles this
        this.removeLoadingScreen();
        console.error('Critical error during application initialization:', error);
    }

    /**
     * Wait for all managers to be available
     * 
     * Implements polling with timeout to check if all necessary
     * managers have been loaded and are functional.
     * 
     * @private
     */
    async waitForManagers() {
        const TIMEOUT_MS = 10000; // 10 seconds
        const CHECK_INTERVAL_MS = 50; // 50ms
        const start = Date.now();
        
        console.log('Waiting for managers...');
        
        while (Date.now() - start < TIMEOUT_MS) {
            const managersReady = this.checkManagers();
            
            if (managersReady.allReady) {
                console.log('All managers are ready:', managersReady.ready);
                return;
            }
            
            if (managersReady.hasMinimal) {
                console.log('Essential managers ready:', managersReady.ready);
                console.log('Missing managers:', managersReady.missing);
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL_MS));
        }
        
        const managersStatus = this.checkManagers();
        console.error('Timeout waiting for managers. Status:', managersStatus);
        
        if (managersStatus.hasMinimal) {
            console.warn('Continuing with essential managers:', managersStatus.ready);
            return;
        }
        
        throw new Error('Essential managers were not loaded within time limit');
    }

    /**
     * Check which managers are ready
     */
    checkManagers() {
        const managers = {
            databaseManager: window.databaseManager,
            authManager: window.authManager,
            modalManager: window.modalManager,
            mapManager: window.mapManager
        };
        
        const ready = [];
        const missing = [];
        
        for (const [name, manager] of Object.entries(managers)) {
            if (manager && typeof manager === 'object') {
                ready.push(name);
            } else {
                missing.push(name);
            }
        }
        
        return {
            ready,
            missing,
            allReady: missing.length === 0,
            hasMinimal: ready.includes('databaseManager')
        };
    }

    verifyAuthentication() {
        try {
            if (window.authManager && window.authManager.isAuthenticated()) {
                const user = window.authManager.getCurrentUser();
                this.configureLoggedUser(user);
            } else {
                this.configureVisitorUser();
            }
        } catch (error) {
            console.error('Error verifying authentication:', error);
            this.configureVisitorUser();
        }
    }

    /**
     * Configure interface for logged user
     */
    configureLoggedUser(user) {
        console.log(`Logged user: ${user.nome} (${user.role})`);
        
        this.updateLoginButton(user);
        
        if (user.role === 'administrator') {
            this.isAdmin = true;
            this.configureAdminInterface();
        } else if (user.role === 'user') {
            this.isAdmin = false;
            this.configureUserInterface();
        }
        
        this.updateFavoritesVisibility(user.role);
    }

    /**
     * Configure interface for visitor
     */
    configureVisitorUser() {
        console.log('Visitor user');
        this.isAdmin = false;
        this.configureLoginButton();
        this.updateFavoritesVisibility('visitor');
    }

    /**
     * Configure login button for visitors
     */
    configureLoginButton() {
        console.log('Configurando botão de login para visitantes...');
        
        // Verificar se existem botões de usuário para substituir
        const desktopUserBtn = document.getElementById('desktop-user-info-btn');
        const mobileUserBtn = document.getElementById('mobile-user-info-btn');
        
        // Se existem botões de usuário, substitui-los por botões de login
        if (desktopUserBtn) {
            desktopUserBtn.outerHTML = `
                <button class="header-login-btn desktop" id="desktop-login-btn">
                    <i class="fas fa-user"></i>
                    <span class="login-btn-text">ENTRAR</span>
                </button>
            `;
        }
        
        if (mobileUserBtn) {
            mobileUserBtn.outerHTML = `
                <button class="header-login-btn mobile" id="mobile-login-btn">
                    <i class="fas fa-user"></i>
                    <span class="login-btn-text">ENTRAR</span>
                </button>
            `;
        }
        
        // Configurar botões desktop e mobile (se já existem ou foram criados agora)
        const desktopLoginBtn = document.getElementById('desktop-login-btn');
        const mobileLoginBtn = document.getElementById('mobile-login-btn');
        
        [desktopLoginBtn, mobileLoginBtn].forEach(loginBtn => {
            if (loginBtn) {
                // Garantir que o conteúdo esteja correto
                loginBtn.innerHTML = '<i class="fas fa-user"></i> <span class="login-btn-text">ENTRAR</span>';
                
                // Remover event listeners antigos e adicionar novos
                loginBtn.onclick = null;
                loginBtn.onclick = () => {
                    if (window.loginModal) {
                        window.loginModal.open();
                    } else {
                        console.error('Login modal não disponível');
                    }
                };
            }
        });
    }

    /**
     * Update button after login
     */
    updateLoginButton(user) {
        console.log('Atualizando botão de login para usuário:', user.nome, 'Role:', user.role);
        
        // Atualizar ambos os botões (desktop e mobile)
        const desktopLoginBtn = document.getElementById('desktop-login-btn');
        const mobileLoginBtn = document.getElementById('mobile-login-btn');
        
        [desktopLoginBtn, mobileLoginBtn].forEach(loginBtn => {
            if (loginBtn) {
                const isAdmin = user.role === 'administrator';
                const adminIcon = isAdmin ? '<i class="fas fa-shield-alt admin-icon"></i>' : '';
                const newId = loginBtn.id.replace('login-btn', 'user-info-btn');
                
                // Substituir o botão por um botão de usuário
                loginBtn.outerHTML = `
                    <button class="user-info ${isAdmin ? 'is-admin' : ''}" id="${newId}">
                        <div class="user-avatar">${user.nome.charAt(0).toUpperCase()}</div>
                        <span class="user-name">${user.nome}</span>
                        ${adminIcon}
                        <i class="fas fa-chevron-down dropdown-arrow"></i>
                    </button>
                `;
            }
        });
        
        this.configureUserMenu();
    }

    /**
     * Configure interface for administrator
     */
    configureAdminInterface() {
        console.log('Configuring administrator interface');
        this.addAdminButtons();
    }

    /**
     * Configure interface for regular user
     */
    configureUserInterface() {
        console.log('Configuring user interface');
        // !TODO: Implementar sistema de favoritos
        // this.addFavoritesCategory();
        this.configureUserActions();
    }

    /**
     * Add administrator buttons
     */
    addAdminButtons() {
        console.log('Adding administrator functionalities');
    }

    /**
     * Configure actions for regular user
     */
    configureUserActions() {
        console.log('Configuring user actions');
    }

    /**
     * Configure user menu
     */
    configureUserMenu() {
        console.log('Configurando menu do usuário...');
        
        // Configurar ambos os botões (desktop e mobile)
        const desktopUserBtn = document.getElementById('desktop-user-info-btn');
        const mobileUserBtn = document.getElementById('mobile-user-info-btn');
        
        [desktopUserBtn, mobileUserBtn].forEach(userInfoBtn => {
            if (userInfoBtn) {
                console.log('Configurando evento de clique para botão:', userInfoBtn.id);
                
                userInfoBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Clique no botão de usuário detectado');
                    
                    if (window.userMenu) {
                        window.userMenu.toggle(userInfoBtn);
                    } else {
                        console.error('UserMenu não disponível');
                        // Fallback para sistema antigo
                        const user = window.authManager?.getCurrentUser();
                        if (user) {
                            this.showUserMenuFallback(user);
                        }
                    }
                });
            }
        });
    }

    /**
     * Show user menu (fallback method)
     */
    showUserMenuFallback(user) {
        console.log('Usando menu de usuário fallback para:', user.nome);
        
        if (user.role === 'administrator') {
            const action = confirm(`Olá ${user.nome}!\n\nEscolha uma opção:\n\nOK - Acessar Painel Administrativo\nCancelar - Fazer Logout`);
            if (action) {
                // Ir para admin.html
                window.location.href = 'admin.html';
            } else {
                // Logout
                if (window.authManager) window.authManager.logout();
                location.reload();
            }
        } else {
            const logout = confirm(`Olá ${user.nome}!\n\nDeseja fazer logout?`);
            if (logout) {
                if (window.authManager) window.authManager.logout();
                location.reload();
            }
        }
    }

    async configureInterface() {
        try {
            console.log('Configuring interface...');
            
            // Configurar menu de categorias SEMPRE, mesmo sem DatabaseManager
            console.log('Configuring category menu (primary call)');
            this.configureCategoryMenu();
            
            // Tentar configurar estatísticas se DatabaseManager disponível
            if (window.databaseManager) {
                console.log('DatabaseManager available - updating statistics');
                this.updateStatistics();
            } else {
                console.log('DatabaseManager not available yet - will update statistics later');
            }
            
            console.log('Interface configured');
        } catch (error) {
            console.error('Erro ao configurar interface:', error);
            // Não fazer throw - continuar com interface básica
            console.log('Continuing with basic interface configuration');
        }
    }

    configureStatistics() {
        // !TODO: Implement application statistics configuration logic
    }

    configureEvents() {
        // Event listener para mudanças de autenticação
        document.addEventListener('authStateChanged', (e) => {
            try {
                const { type, user } = e.detail;
                console.log(`🔔 Evento de autenticação recebido: ${type}`);
                
                if (type === 'login') {
                    this.configureLoggedUser(user);
                    this.reloadData();
                } else if (type === 'logout') {
                    this.configureVisitorUser();
                    this.reloadData();
                }
            } catch (error) {
                console.error('Error processing authentication event:', error);
                // Try to reconfigure as visitor in case of error
                try {
                    this.configureVisitorUser();
                } catch (fallbackError) {
                    console.error('Error in configuration fallback:', fallbackError);
                }
            }
        });

        // Event listener para categorias carregadas
        document.addEventListener('database_categoriasCarregadas', (e) => {
            console.log('📂 Categorias carregadas, atualizando menu de categorias...');
            this.configureCategoryMenu();
        });

        // Configurar botões responsivos
        this.configureResponsiveButtons();

        // Nota: Event listeners para favorito e sugestão são gerenciados pelo InfoPanelManager
        // para evitar duplicação de eventos
    }

    configureResponsiveButtons() {
        // O DynamicUserButton agora gerencia os eventos de clique dos botões
        // Não precisamos mais configurar eventos manuais aqui
        // O componente se auto-inicializa e gerencia todo o comportamento
        
        // Notificar o componente sobre mudanças de estado de autenticação
        if (window.dynamicUserButton) {
            window.dynamicUserButton.updateButtonState();
        }
    }

    /**
     * Handle ação de favoritar
     */
    handleFavoriteAction(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Verificar se o usuário está autenticado
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            console.log('Usuário não autenticado - abrindo modal de login');
            
            // Verificar se loginModal existe
            if (!window.loginModal) {
                console.error('Modal de login não disponível');
                this.showNotification('Sistema de login não disponível. Recarregue a página.', 'error');
                return;
            }
            
            // Abrir modal de login com ação pendente
            window.loginModal.open({
                pendingAction: () => this.handleFavoriteAction(e)
            });
            return;
        }
        
        // Implementar lógica de favoritos para usuários logados
        const pontoId = this.getCurrentPontoId();
        if (pontoId) {
            this.toggleFavorito(pontoId);
        } else {
            console.warn('Nenhum ponto selecionado para favoritar');
            this.showNotification('Selecione um ponto para favoritar', 'warning');
        }
    }

    /**
     * Handle ação de sugerir mudança
     */
    handleSuggestAction(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Verificar se o usuário está autenticado
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            console.log('Usuário não autenticado - abrindo modal de login');
            
            // Verificar se loginModal existe
            if (!window.loginModal) {
                console.error('Modal de login não disponível');
                this.showNotification('Sistema de login não disponível. Recarregue a página.', 'error');
                return;
            }
            
            // Abrir modal de login com ação pendente
            window.loginModal.open({
                pendingAction: () => this.handleSuggestAction(e)
            });
            return;
        }
        
        // Implementar sistema de sugestões para mudanças nos pontos
        const pontoId = this.getCurrentPontoId();
        if (pontoId) {
            this.openSuggestionModal(pontoId);
        } else {
            console.warn('Nenhum ponto selecionado para sugerir mudança');
            this.showNotification('Selecione um ponto para sugerir mudanças', 'warning');
        }
    }

    /**
     * Recarregar dados após mudança de autenticação
     */
    reloadData() {
        if (window.mapManager) {
            const user = window.authManager && window.authManager.getCurrentUser ? 
                window.authManager.getCurrentUser() : null;
            window.mapManager.reloadPoints(user ? user.role : 'visitor', user ? user.username : null);
        }
        this.updateStatistics();
    }

    /**
     * Toggle favorito - FUNCIONALIDADE EM DESENVOLVIMENTO
     * !TODO: Implementar sistema completo de favoritos
     */
    toggleFavorito(pontoId) {
        // Mostrar notificação de funcionalidade em desenvolvimento
        this.showNotification('Funcionalidade em desenvolvimento', 'info');
        console.log('!TODO: Implementar sistema de favoritos - pontoId:', pontoId);
    }

    /**
     * Get current point ID
     */
    getCurrentPontoId() {
        // Tentar obter o ID do ponto a partir do painel de informações aberto
        const infoPanel = document.getElementById('info-panel');
        
        if (infoPanel && !infoPanel.classList.contains('hidden')) {
            // Primeiro: verificar se há um botão com data-ponto-id (mais confiável)
            const pontoButton = infoPanel.querySelector('[data-ponto-id]');
            if (pontoButton) {
                const pontoId = pontoButton.getAttribute('data-ponto-id');
                console.log('PontosApp: ID do ponto atual obtido:', pontoId);
                return pontoId;
            }
            
            // Fallback: tentar obter do título do painel
            const titleElement = infoPanel.querySelector('.info-panel-title');
            if (titleElement && titleElement.textContent) {
                // Buscar o ponto pelos dados carregados usando o nome
                const pontos = window.databaseManager ? window.databaseManager.getPontosConfirmados() : [];
                const ponto = pontos.find(p => p.nome === titleElement.textContent.trim());
                if (ponto) {
                    console.log('PontosApp: ID do ponto obtido via fallback:', ponto.id);
                    return ponto.id;
                }
            }
        }
        
        console.warn('PontosApp: Nenhum ponto atualmente selecionado');
        return null;
    }

    /**
     * Abrir modal de sugestão (placeholder)
     */
    openSuggestionModal(pontoId) {
        console.log(`Abrindo modal de sugestão para ponto ID: ${pontoId}`);
        this.showNotification('Sistema de sugestões em desenvolvimento', 'info');
    }

    /**
     * Show notification to user
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        try {
            // Use errorHandler if available
            if (window.errorHandler) {
                switch (type) {
                    case 'success':
                        window.errorHandler.showSuccess(message);
                        break;
                    case 'error':
                        window.errorHandler.showCustomError(message);
                        break;
                    case 'warning':
                    case 'info':
                    default:
                        // For warning and info, use simple notification
                        this.createSimpleNotification(message, type);
                        break;
                }
            } else {
                // Fallback to console
                console.log(`${type.toUpperCase()}: ${message}`);
                
                // Create simple notification if no errorHandler
                this.createSimpleNotification(message, type);
            }
        } catch (error) {
            console.error('Error showing notification:', error);
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Create simple notification as fallback
     */
    createSimpleNotification(message, type) {
        // Remove previous notification if exists
        const existingNotification = document.querySelector('.simple-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `simple-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            font-size: 14px;
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        // Remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Adicionar CSS de animação se não existir
        if (!document.querySelector('#simple-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'simple-notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    loadData() {
        try {
            console.log('Loading data...');
            
            // Verificar se os managers estão disponíveis
            if (!window.databaseManager) {
                throw new Error('DatabaseManager not available');
            }
            
            if (!window.mapManager) {
                console.warn('MapManager nao disponivel, pulando renderizacao de pontos');
                this.updateStatistics();
                return;
            }
            
            // Inicializar o mapa se ainda não foi inicializado
            if (!window.mapManager.map) {
                console.log('Inicializando mapa...');
                window.mapManager.init();
            }
            
            // Renderizar pontos e atualizar estatísticas
            this.renderPoints();
            this.updateStatistics();
            
            // Reconfigurar menu de categorias após dados estarem carregados
            console.log('Segunda chamada: reconfigurando menu de categorias...');
            this.configureCategoryMenu();
            
            // Garantir que os botões são visíveis
            setTimeout(() => {
                const container = document.getElementById('nav-buttons-container');
                const buttons = container ? container.querySelectorAll('.nav-btn') : [];
                console.log(`Verificação final: container=${!!container}, botões=${buttons.length}`);
                
                if (container) {
                    container.style.display = 'flex';
                    container.style.visibility = 'visible';
                    container.style.opacity = '1';
                    console.log('Forçada visibilidade do container de navegação');
                }
                
                buttons.forEach((btn, index) => {
                    btn.style.display = 'flex';
                    btn.style.visibility = 'visible';
                    btn.style.opacity = '1';
                    console.log(`Botão ${index + 1} forçado como visível`);
                });
            }, 100);
            
            console.log('Dados carregados com sucesso');
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            // Only show error pop-up if not during initialization
            if (this.isInitialized) {
                this.showError('Erro ao carregar dados do mapa.');
            }
            throw error;
        }
    }

    configureCategoryMenu() {
        console.log('📂 Iniciando configuração do menu de categorias...');
        
        const container = document.getElementById('nav-buttons-container');
        if (!container) {
            console.error('❌ Container de navegação não encontrado: nav-buttons-container');
            return;
        }
        console.log('✅ Container encontrado:', container);
        console.log('📍 HTML atual do container:', container.innerHTML);

        // FORÇAR criação dos botões básicos independente do DatabaseManager
        let categorias = [
            { id: 'geral', nome: 'Geral', cor: '#3b82f6', icon: 'fas fa-map-marker-alt' },
            { id: 'esportes-lazer', nome: 'Esportes e Lazer', cor: '#10b981', icon: 'fas fa-futbol' },
            { id: 'gastronomia', nome: 'Gastronomia', cor: '#f59e0b', icon: 'fas fa-utensils' },
            { id: 'geek-nerd', nome: 'Geek/Nerd', cor: '#8b5cf6', icon: 'fas fa-gamepad' },
            { id: 'casas-noturnas', nome: 'Casas Noturnas', cor: '#ef4444', icon: 'fas fa-glass-cheers' }
        ];

        // Tentar usar categorias do DatabaseManager se disponível
        if (window.databaseManager) {
            const dbCategorias = window.databaseManager.getCategorias();
            if (dbCategorias && dbCategorias.length > 0) {
                categorias = dbCategorias;
                console.log('✅ DatabaseManager disponível - categorias carregadas:', categorias.length);
            } else {
                console.log('⚠️ DatabaseManager disponível mas sem categorias - usando padrão');
            }
        } else {
            console.log('⚠️ DatabaseManager não disponível - usando categorias padrão');
        }

        console.log('✅ Configurando menu de categorias com', categorias.length, 'categorias');
        console.log('📋 Categorias:', categorias);

        // Criar botão "Todos" primeiro
        let buttonsHtml = `
            <button class="nav-btn active category-btn" data-categoria="todos" title="Todos os pontos" 
                    style="display: flex !important; visibility: visible !important; opacity: 1 !important; background: #3b82f6; border-color: #3b82f6; color: white;">
                <i class="fas fa-globe"></i>
                <span class="nav-btn-text">Todos</span>
            </button>
        `;

        // Gerar botões para cada categoria
        categorias.forEach(categoria => {
            const iconClass = this.getIconClassForCategory(categoria);
            console.log(`📍 Categoria: ${categoria.id}, Ícone: ${iconClass}, Nome: ${categoria.nome}`);
            buttonsHtml += `
                <button class="nav-btn category-btn" data-categoria="${categoria.id}" 
                        style="background: ${categoria.cor}; border-color: ${categoria.cor}; color: white; display: flex !important; visibility: visible !important; opacity: 1 !important;"
                        title="${categoria.nome}">
                    <i class="${iconClass}"></i>
                    <span class="nav-btn-text">${categoria.nome}</span>
                </button>
            `;
        });

        console.log('🔧 Inserindo HTML dos botões...');
        console.log('📝 HTML que será inserido:', buttonsHtml);
        
        // LIMPAR e inserir HTML no container
        container.innerHTML = '';
        container.innerHTML = buttonsHtml;
        
        // FORÇAR visibilidade do container
        container.style.display = 'flex';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.style.position = 'relative';
        container.style.zIndex = '1000';
        
        console.log('HTML dos botões inserido no container');
        console.log('📍 HTML resultante do container:', container.innerHTML);

        // Verificar se os botões foram realmente criados
        const buttonsCreated = container.querySelectorAll('.nav-btn');
        console.log(`${buttonsCreated.length} botões criados no DOM`);
        buttonsCreated.forEach((btn, index) => {
            console.log(`Botão ${index + 1}: ${btn.textContent.trim()} (categoria: ${btn.dataset.categoria})`);
            // FORÇAR estilos inline para cada botão
            btn.style.display = 'flex';
            btn.style.visibility = 'visible';
            btn.style.opacity = '1';
            btn.style.position = 'relative';
            btn.style.zIndex = '1001';
        });

        // Configurar event listeners
        container.addEventListener('click', (e) => {
            const button = e.target.closest('[data-categoria]');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                const categoria = button.dataset.categoria;
                console.log(`Clique na categoria: ${categoria}`);
                this.filterByCategory(categoria);
            }
        });

        console.log(`Menu de navegação configurado com ${categorias.length + 1} botões (incluindo "Todos")`);
        
        // Forçar mais uma verificação após um delay
        setTimeout(() => {
            console.log('🔄 Verificação final após delay...');
            const finalCheck = document.getElementById('nav-buttons-container');
            if (finalCheck) {
                console.log('📍 Container final check:', finalCheck.innerHTML !== '');
                console.log('📊 Botões finais visíveis:', finalCheck.querySelectorAll('.nav-btn').length);
            }
        }, 100);
    }

    /**
     * Diagnose category buttons visibility
     */
    diagnoseCategoryButtons() {
        console.log('🔍 Diagnóstico dos botões de categoria:');
        
        const container = document.getElementById('nav-buttons-container');
        if (!container) {
            console.error('❌ Container nav-buttons-container não encontrado');
            return;
        }
        
        console.log('📦 Container encontrado:');
        console.log('  - display:', window.getComputedStyle(container).display);
        console.log('  - visibility:', window.getComputedStyle(container).visibility);
        console.log('  - opacity:', window.getComputedStyle(container).opacity);
        console.log('  - innerHTML length:', container.innerHTML.length);
        
        const buttons = container.querySelectorAll('.nav-btn');
        console.log(`🔘 ${buttons.length} botões encontrados:`);
        
        buttons.forEach((btn, index) => {
            const computedStyle = window.getComputedStyle(btn);
            console.log(`  Botão ${index + 1} (${btn.textContent.trim()}):`);
            console.log(`    - display: ${computedStyle.display}`);
            console.log(`    - visibility: ${computedStyle.visibility}`);
            console.log(`    - opacity: ${computedStyle.opacity}`);
            console.log(`    - position: ${computedStyle.position}`);
            console.log(`    - z-index: ${computedStyle.zIndex}`);
        });
    }

    /**
     * Mapear ícones para categorias baseado no campo icone/icon do JSON
     */
    getIconClassForCategory(categoria) {
        // Primeiro tentar usar o ícone do JSON (se for classe CSS)
        if (categoria.icon && categoria.icon.startsWith('fas ')) {
            return categoria.icon;
        }
        
        // Se tem emoji no campo icone, usar o mapeamento FontAwesome baseado no ID
        const iconMap = {
            'geral': 'fas fa-map-marker-alt',
            'esportes-lazer': 'fas fa-futbol',
            'gastronomia': 'fas fa-utensils',
            'geek-nerd': 'fas fa-gamepad',
            'casas-noturnas': 'fas fa-glass-cheers'
        };

        return iconMap[categoria.id] || 'fas fa-map-marker-alt';
    }

    filterByCategory(categoria) {
        try {
            console.log(`Filtering by category: ${categoria}`);
            this.activeCategory = categoria;
            
            // Atualizar botões de navegação com debounce para evitar múltiplos cliques
            this.updateCategoryButtons(categoria);
            console.log(`Botões atualizados para categoria: ${categoria}`);

            // Verificar se é filtro de favoritos e usuário está logado
            if (categoria === 'favoritos') {
                if (!window.authManager || !window.authManager.isAuthenticated()) {
                    console.log('User not logged in, opening login modal');
                    // Usuário não logado tentando ver favoritos - abrir modal de login
                    window.loginModal.open({
                        pendingAction: () => this.filterByCategory('favoritos')
                    });
                    return;
                }
            }

            // Verificar se MapManager está disponível
            if (!window.mapManager) {
                console.error('MapManager not available');
                return;
            }

            if (typeof window.mapManager.filterByCategory !== 'function') {
                console.error('Method filterByCategory not found in MapManager');
                return;
            }

            // Filtrar marcadores
            console.log(`Calling MapManager.filterByCategory with: ${categoria}`);
            const user = window.authManager && window.authManager.getCurrentUser ? 
                window.authManager.getCurrentUser() : null;
            console.log(`User context:`, user ? user.username : 'anonymous');
            window.mapManager.filterByCategory(categoria, user ? user.username : null);
            
            console.log(`Filter applied successfully: ${categoria}`);
            
        } catch (error) {
            console.error('Error filtering by category:', error);
        }
    }

    /**
     * Atualizar estado visual dos botões de categoria
     */
    updateCategoryButtons(categoriaAtiva) {
        const botoes = document.querySelectorAll('.nav-btn[data-categoria]');
        botoes.forEach(btn => {
            const isActive = btn.dataset.categoria === categoriaAtiva;
            btn.classList.toggle('active', isActive);
            
            // Adicionar atributo para acessibilidade
            btn.setAttribute('aria-pressed', isActive);
        });
    }

    renderPoints() {
        try {
            if (!window.mapManager) {
                console.warn('MapManager nao disponivel para renderizar pontos');
                return;
            }
            
            if (!window.databaseManager) {
                console.warn('DatabaseManager nao disponivel');
                return;
            }
            
            console.log('Starting point rendering via app...');
            
            // Verificar se há pontos no DatabaseManager
            const pontosDisponiveis = window.databaseManager.getPontos();
            console.log(`Points available in DatabaseManager:`, pontosDisponiveis.length);
            
            if (pontosDisponiveis.length === 0) {
                console.warn('No points found in DatabaseManager');
                
                // Try to force data reload
                console.log('Attempting to force data reload...');
                window.databaseManager.loadAllData().then(() => {
                    const novospontos = window.databaseManager.getPontos();
                    console.log(`After reload: ${novospontos.length} points`);
                    if (novospontos.length > 0) {
                        this.renderPoints(); // Try again
                    }
                }).catch(error => {
                    console.error('Error reloading data:', error);
                });
                return;
            }
            
            // Mostrar alguns pontos de exemplo
            console.log('Example points:', pontosDisponiveis.slice(0, 3).map(p => ({
                id: p.id,
                nome: p.nome,
                categoria: p.categoria,
                coordenadas: p.coordenadas
            })));
            
            // Usar o método reloadPoints do MapManager em vez de renderizar manualmente
            const user = window.authManager?.getCurrentUser();
            const userRole = user?.role || 'visitor';
            const username = user?.username || null;
            
            console.log(`Contexto do usuário: ${userRole} (${username || 'anonymous'})`);
            
            // Delegar para o MapManager que agora tem lógica aprimorada
            console.log('Delegando carregamento para MapManager...');
            window.mapManager.reloadPoints(userRole, username);
            
            // Ativar filtro "todos" por padrão após carregar pontos
            setTimeout(() => {
                console.log('Aplicando filtro "todos" após carregamento...');
                this.filterByCategory('todos');
            }, 200);
            
            console.log('Renderização delegada para MapManager');
        } catch (error) {
            console.error('Error rendering points:', error);
        }
    }

    updateStatistics() {
        // Estatísticas removidas da interface
        // Método mantido para compatibilidade
    }

    updateAdminInterface() {
        try {
            const elementos = document.querySelectorAll('.admin-only');
            elementos.forEach(el => {
                el.style.display = this.isAdmin ? 'block' : 'none';
            });
            console.log(`Interface admin atualizada (${elementos.length} elementos)`);
        } catch (error) {
            console.error('Erro ao atualizar interface admin:', error);
        }
    }

    mostrarModalLogin() {
        try {
            if (window.modalManager && typeof window.modalManager.mostrar === 'function') {
                window.modalManager.mostrar('login');
            } else {
                console.warn('ModalManager nao disponivel');
                alert('Sistema de login não está disponível no momento.');
            }
        } catch (error) {
            console.error('Erro ao mostrar modal de login:', error);
        }
    }

    showError(message) {
        console.error(message);
        // Use error handler to show interactive popup
        if (window.errorHandler) {
            window.errorHandler.showCustomError(message);
        }
    }

    removeLoadingScreen() {
        try {
            const loading = document.querySelector('.loading-screen');
            if (loading) {
                document.body.classList.add('app-loaded');
                setTimeout(() => {
                    if (loading.parentNode) {
                        loading.remove();
                    }
                    // Forçar redimensionamento do mapa após a remoção do loading
                    this.forceMapResize();
                }, 500);
                console.log('Loading screen removido');
            } else {
                console.log('Loading screen nao encontrado');
                // Mesmo sem loading screen, tentar redimensionar o mapa
                this.forceMapResize();
            }
        } catch (error) {
            console.error('Erro ao remover loading screen:', error);
        }
    }

    /**
     * Força o redimensionamento do mapa para corrigir problemas de renderização inicial
     */
    forceMapResize() {
        if (window.mapManager && typeof window.mapManager.forceResize === 'function') {
            // Aguardar um pouco para garantir que as dimensões estão estabilizadas
            setTimeout(() => {
                window.mapManager.forceResize();
            }, 100);
        } else if (window.mapManager && window.mapManager.map) {
            // Fallback para método direto
            setTimeout(() => {
                try {
                    console.log('Forcando redimensionamento do mapa (fallback)...');
                    window.mapManager.map.invalidateSize(true);
                    
                    setTimeout(() => {
                        window.mapManager.map.invalidateSize(true);
                        console.log('Mapa redimensionado com sucesso');
                    }, 200);
                } catch (error) {
                    console.error('Erro ao redimensionar mapa:', error);
                }
            }, 100);
        }
    }

    /**
     * Configure global application responsiveness
     */
    configureResponsiveness() {
        console.log('Configurando responsividade...');
        
        // Configure viewport meta tag if it doesn't exist
        this.configureViewport();
        
        // Event listeners for orientation changes and resizing
        this.configureResponsiveEventListeners();
        
        // Configure touch behavior for mobile
        this.configureTouchBehavior();
        
        // Apply classes based on screen size
        this.applyResponsiveClasses();
        
        console.log('Responsividade configurada');
    }

    /**
     * Configure viewport meta tag
     */
    configureViewport() {
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    }

    /**
     * Configure responsive event listeners
     */
    configureResponsiveEventListeners() {
        // Debounced resize handler
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.applyResponsiveClasses();
                this.adjustLayoutForScreenSize();
            }, 150);
        };
        
        // Orientation change handler
        const handleOrientationChange = () => {
            setTimeout(() => {
                this.applyResponsiveClasses();
                this.adjustLayoutForScreenSize();
                // Trigger map resize se existir
                this.forceMapResize();
            }, 300);
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);
    }

    /**
     * Configure touch behavior for mobile devices
     */
    configureTouchBehavior() {
        // Melhorar performance touch em iOS
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // Prevenir zoom indesejado em double tap em alguns elementos
        const preventZoomElements = document.querySelectorAll('.nav-btn, .btn, .theme-toggle-label');
        preventZoomElements.forEach(element => {
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                element.click();
            });
        });
    }

    /**
     * Apply CSS classes based on screen size
     */
    applyResponsiveClasses() {
        const width = window.innerWidth;
        const body = document.body;
        
        // Remover classes existentes
        body.classList.remove('mobile', 'tablet', 'desktop');
        
        // Aplicar classe baseada na largura
        if (width <= 480) {
            body.classList.add('mobile');
        } else if (width <= 768) {
            body.classList.add('tablet');
        } else {
            body.classList.add('desktop');
        }
    }

    /**
     * Adjust layout for screen size
     */
    adjustLayoutForScreenSize() {
        const isMobile = window.innerWidth <= 768;
        
        // Ajustar altura do mapa
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            if (isMobile) {
                mapContainer.style.height = 'calc(100vh - 180px)';
            } else {
                mapContainer.style.height = 'calc(100vh - 120px)';
            }
        }
    }

    // API pública para admin
    adicionarPonto(dadosPonto) {
        if (!this.isAdmin) return false;
        
        // Obter contexto do usuário atual
        const user = window.authManager?.getCurrentUser();
        const userRole = user?.role || 'visitor';
        const username = user?.username || null;
        
        const ponto = window.databaseManager.adicionarPonto(dadosPonto, userRole, username);
        window.mapManager.adicionarMarcador(ponto);
        this.updateStatistics();
        return true;
    }

    removerPonto(pontoId) {
        if (!this.isAdmin) return false;
        
        // Obter contexto do usuário atual
        const user = window.authManager?.getCurrentUser();
        const userRole = user?.role || 'visitor';
        
        window.databaseManager.removerPonto(pontoId, userRole);
        window.mapManager.removerMarcador(pontoId);
        this.updateStatistics();
        return true;
    }
}

// Não instanciar aqui - será feito no HTML
