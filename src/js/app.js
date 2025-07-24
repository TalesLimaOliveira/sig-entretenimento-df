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
        
        // Iniciar aplicação
        this.init();
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
            this.configurarResponsividade();
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
            this.carregarDados();
            console.log('Data loaded');
            
            console.log('Finalizing initialization...');
            this.removerLoadingScreen();
            this._markAsInitialized();
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
        this.mostrarErro('Error during loading. Please reload the page.');
        this.removerLoadingScreen();
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
        console.log(`Logged user: ${user.name} (${user.role})`);
        
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
        const loginBtn = document.getElementById('header-login-btn');
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> ENTRAR';
            loginBtn.onclick = () => {
                window.loginModal.open();
            };
        }
    }

    /**
     * Update button after login
     */
    updateLoginButton(user) {
        const loginBtn = document.getElementById('header-login-btn');
        if (loginBtn) {
            const isAdmin = user.role === 'admin';
            const adminIcon = isAdmin ? '<i class="fas fa-shield-alt admin-icon"></i>' : '';
            
            loginBtn.outerHTML = `
                <button class="user-info ${isAdmin ? 'is-admin' : ''}" id="user-info-btn">
                    <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                    ${adminIcon}
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                </button>
            `;
            
            this.configureUserMenu();
        }
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
        this.addFavoritesCategory();
        this.configureUserActions();
    }

    /**
     * Add favorites category
     */
    addFavoritesCategory() {
        const favoritesBtn = document.querySelector('[data-categoria="favoritos"]');
        if (favoritesBtn) {
            favoritesBtn.classList.remove('hidden');
        }
    }

    /**
     * Update favorites button visibility based on user role
     */
    updateFavoritesVisibility(userRole) {
        const favoritesBtn = document.querySelector('[data-categoria="favoritos"]');
        if (favoritesBtn) {
            if (userRole === 'user') {
                favoritesBtn.classList.remove('hidden');
            } else {
                favoritesBtn.classList.add('hidden');
                
                if (favoritesBtn.classList.contains('active')) {
                    favoritesBtn.classList.remove('active');
                    const allBtn = document.querySelector('[data-categoria="todos"]');
                    if (allBtn) {
                        allBtn.classList.add('active');
                        this.filtrarPorCategoria('todos');
                    }
                }
            }
        }
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
     * Show user menu
     */
    showUserMenu(user) {
        if (user.role === 'administrator') {
            const option = confirm(`Hello ${user.name}!\n\nDo you want to access the administrative panel?\n\nOK = Admin Panel\nCancel = Logout`);
            if (option) {
                window.location.href = 'admin.html';
            } else {
                if (window.authManager) window.authManager.logout();
                location.reload();
            }
        } else {
            const logout = confirm(`Hello ${user.name}!\n\nDo you want to logout?`);
            if (logout) {
                if (window.authManager) window.authManager.logout();
                location.reload();
            }
        }
    }

    async configureInterface() {
        try {
            console.log('Configuring interface...');
            
            // Aguardar o DatabaseManager estar totalmente carregado
            if (window.databaseManager && window.databaseManager.init) {
                await window.databaseManager.init();
            }
            
            // Configurar menu de categorias após dados estarem carregados
            // Será chamado novamente em carregarDados() para garantir que está atualizado
            this.configurarMenuCategorias();
            this.atualizarEstatisticas();
            console.log('Interface configurada');
        } catch (error) {
            console.error('Erro ao configurar interface:', error);
            throw error;
        }
    }

    configureStatistics() {
        // !TODO: Implement application statistics configuration logic
    }

    configureEvents() {
        // Event listener para mudanças de autenticação
        document.addEventListener('authStateChanged', (e) => {
            const { type, user } = e.detail;
            if (type === 'login') {
                this.configureLoggedUser(user);
                this.recarregarDados();
            } else if (type === 'logout') {
                this.configureVisitorUser();
                this.recarregarDados();
            }
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
                this.mostrarNotificacao('Sistema de login não disponível. Recarregue a página.', 'error');
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
            this.mostrarNotificacao('Selecione um ponto para favoritar', 'warning');
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
                this.mostrarNotificacao('Sistema de login não disponível. Recarregue a página.', 'error');
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
            this.abrirModalSugestao(pontoId);
        } else {
            console.warn('Nenhum ponto selecionado para sugerir mudança');
            this.mostrarNotificacao('Selecione um ponto para sugerir mudanças', 'warning');
        }
    }

    /**
     * Recarregar dados após mudança de autenticação
     */
    recarregarDados() {
        if (window.mapManager) {
            const user = window.authManager && window.authManager.getCurrentUser ? 
                window.authManager.getCurrentUser() : null;
            window.mapManager.recarregarPontos(user ? user.role : 'visitor', user ? user.username : null);
        }
        this.atualizarEstatisticas();
    }

    /**
     * Toggle favorito
     */
    toggleFavorito(pontoId) {
        try {
            const user = window.authManager && window.authManager.getCurrentUser ? 
                window.authManager.getCurrentUser() : null;
            if (!user) return;
            
            const foiAdicionado = window.databaseManager.toggleFavorito(pontoId, user.username);
            
            // Atualizar interface
            this.atualizarBotaoFavorito(pontoId, foiAdicionado);
            
            // Mostrar feedback
            const mensagem = foiAdicionado ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!';
            this.mostrarNotificacao(mensagem, foiAdicionado ? 'success' : 'info');
            
        } catch (error) {
            console.error('Erro ao favoritar:', error);
            this.mostrarNotificacao('Erro ao atualizar favoritos', 'error');
        }
    }

    /**
     * Atualizar botão de favorito
     */
    atualizarBotaoFavorito(pontoId, isFavorito) {
        const btn = document.getElementById('btn-favorite');
        if (btn) {
            if (isFavorito) {
                btn.innerHTML = '<i class="fas fa-heart"></i> Favoritado';
                btn.classList.add('favorited');
            } else {
                btn.innerHTML = '<i class="far fa-heart"></i> Favoritar';
                btn.classList.remove('favorited');
            }
        }
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
    abrirModalSugestao(pontoId) {
        console.log(`Abrindo modal de sugestão para ponto ID: ${pontoId}`);
        this.mostrarNotificacao('Sistema de sugestões em desenvolvimento', 'info');
        // TODO: Implementar modal de sugestões
    }

    /**
     * Mostrar notificação
     */
    mostrarNotificacao(mensagem, tipo = 'info') {
        // Usar errorHandler se disponível
        if (window.errorHandler) {
            switch (tipo) {
                case 'success':
                    window.errorHandler.showSuccess(mensagem);
                    break;
                case 'error':
                    window.errorHandler.showCustomError(mensagem);
                    break;
                case 'warning':
                case 'info':
                default:
                    // Para warning e info, usar notificação simples
                    this.createSimpleNotification(mensagem, tipo);
                    break;
            }
        } else {
            // Fallback para console
            console.log(`${tipo.toUpperCase()}: ${mensagem}`);
            
            // Criar notificação simples se não há errorHandler
            this.createSimpleNotification(mensagem, tipo);
        }
    }

    /**
     * Criar notificação simples como fallback
     */
    createSimpleNotification(mensagem, tipo) {
        // Remover notificação anterior se existir
        const existingNotification = document.querySelector('.simple-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `simple-notification ${tipo}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'error' ? '#ef4444' : tipo === 'warning' ? '#f59e0b' : tipo === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            font-size: 14px;
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = mensagem;
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

    carregarDados() {
        try {
            console.log('Carregando dados...');
            
            // Verificar se os managers estão disponíveis
            if (!window.databaseManager) {
                throw new Error('DatabaseManager não está disponível');
            }
            
            if (!window.mapManager) {
                console.warn('MapManager nao disponivel, pulando renderizacao de pontos');
                this.atualizarEstatisticas();
                return;
            }
            
            // Inicializar o mapa se ainda não foi inicializado
            if (!window.mapManager.map) {
                console.log('Inicializando mapa...');
                window.mapManager.init();
            }
            
            // Renderizar pontos e atualizar estatísticas
            this.renderizarPontos();
            this.atualizarEstatisticas();
            
            // Reconfigurar menu de categorias após dados estarem carregados
            console.log('Reconfigurando menu de categorias...');
            this.configurarMenuCategorias();
            
            console.log('Dados carregados com sucesso');
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.mostrarErro('Erro ao carregar dados do mapa.');
            throw error;
        }
    }

    configurarMenuCategorias() {
        const container = document.getElementById('nav-buttons-container');
        if (!container) {
            console.warn('Container de navegação não encontrado');
            return;
        }

        const categorias = window.databaseManager.getCategorias();
        if (!categorias || categorias.length === 0) {
            console.warn('Nenhuma categoria encontrada');
            return;
        }

        // Criar botão "Todos" primeiro
        let buttonsHtml = `
            <button class="nav-btn active category-btn" data-categoria="todos">
                <i class="fas fa-globe"></i>
                <span class="nav-btn-text">Todos</span>
            </button>
        `;

        // Adicionar botão de favoritos (inicialmente oculto)
        buttonsHtml += `
            <button class="nav-btn category-btn favoritos-btn hidden" data-categoria="favoritos">
                <i class="fas fa-heart"></i>
                <span class="nav-btn-text">Favoritos</span>
            </button>
        `;

        // Gerar botões para cada categoria do JSON
        categorias
            .filter(cat => cat.id !== 'favoritos') // Favoritos já foi adicionado manualmente
            .forEach(categoria => {
                const iconClass = this.getIconClassForCategory(categoria);
                buttonsHtml += `
                    <button class="nav-btn category-btn" data-categoria="${categoria.id}">
                        <i class="${iconClass}"></i>
                        <span class="nav-btn-text">${categoria.nome}</span>
                    </button>
                `;
            });

        // Inserir HTML no container
        container.innerHTML = buttonsHtml;

        // Configurar event listeners
        container.addEventListener('click', (e) => {
            const button = e.target.closest('[data-categoria]');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                const categoria = button.dataset.categoria;
                this.filtrarPorCategoria(categoria);
            }
        });

        console.log(`Menu de navegação configurado com ${categorias.length} categorias`);
    }

    /**
     * Mapear ícones para categorias baseado no campo icone/icon do JSON
     */
    getIconClassForCategory(categoria) {
        // Primeiro tentar usar o ícone do JSON (se for classe CSS)
        if (categoria.icon && categoria.icon.startsWith('fas ')) {
            return categoria.icon;
        }
        
        // Mapear emojis para classes FontAwesome baseado no ID da categoria
        const iconMap = {
            'geral': 'fas fa-map-marker-alt',
            'esportes-lazer': 'fas fa-futbol',
            'gastronomia': 'fas fa-utensils',
            'geek-nerd': 'fas fa-gamepad',
            'alternativo': 'fas fa-palette',
            'casas-noturnas': 'fas fa-glass-cheers'
        };

        return iconMap[categoria.id] || 'fas fa-map-marker-alt';
    }

    filtrarPorCategoria(categoria) {
        try {
            console.log(`🔍 [APP] Iniciando filtro por categoria: ${categoria}`);
            this.activeCategory = categoria;
            
            // Atualizar botões de navegação com debounce para evitar múltiplos cliques
            this.atualizarBotoesCategoria(categoria);

            // Verificar se é filtro de favoritos e usuário está logado
            if (categoria === 'favoritos') {
                if (!window.authManager || !window.authManager.isAuthenticated()) {
                    console.log('🔒 [APP] Usuário não logado, abrindo modal de login');
                    // Usuário não logado tentando ver favoritos - abrir modal de login
                    window.loginModal.open({
                        pendingAction: () => this.filtrarPorCategoria('favoritos')
                    });
                    return;
                }
            }

            // Verificar se MapManager está disponível
            if (!window.mapManager) {
                console.error('❌ [APP] MapManager não disponível');
                return;
            }

            if (typeof window.mapManager.filtrarPorCategoria !== 'function') {
                console.error('❌ [APP] Método filtrarPorCategoria não encontrado no MapManager');
                return;
            }

            // Filtrar marcadores
            console.log('🗺️ [APP] Chamando MapManager.filtrarPorCategoria');
            const user = window.authManager && window.authManager.getCurrentUser ? 
                window.authManager.getCurrentUser() : null;
            window.mapManager.filtrarPorCategoria(categoria, user ? user.username : null);
            
            console.log(`✅ [APP] Filtro aplicado com sucesso: ${categoria}`);
            
        } catch (error) {
            console.error('❌ [APP] Erro ao filtrar por categoria:', error);
        }
    }

    /**
     * Atualizar estado visual dos botões de categoria
     */
    atualizarBotoesCategoria(categoriaAtiva) {
        const botoes = document.querySelectorAll('.nav-btn[data-categoria]');
        botoes.forEach(btn => {
            const isActive = btn.dataset.categoria === categoriaAtiva;
            btn.classList.toggle('active', isActive);
            
            // Adicionar atributo para acessibilidade
            btn.setAttribute('aria-pressed', isActive);
        });
    }

    renderizarPontos() {
        try {
            if (!window.mapManager) {
                console.warn('MapManager nao disponivel para renderizar pontos');
                return;
            }
            
            if (!window.databaseManager) {
                console.warn('DatabaseManager nao disponivel');
                return;
            }
            
            console.log('Iniciando renderização de pontos via app...');
            
            // Usar o método recarregarPontos do MapManager em vez de renderizar manualmente
            const user = window.authManager?.getCurrentUser();
            const userRole = user?.role || 'visitor';
            const username = user?.username || null;
            
            // Delegar para o MapManager que agora tem lógica aprimorada
            window.mapManager.recarregarPontos(userRole, username);
            
            // Ativar filtro "todos" por padrão após carregar pontos
            this.filtrarPorCategoria('todos');
            
            console.log('Renderização delegada para MapManager');
        } catch (error) {
            console.error('Erro ao renderizar pontos:', error);
        }
    }

    atualizarEstatisticas() {
        // Estatísticas removidas da interface
        // Método mantido para compatibilidade
    }

    atualizarInterfaceAdmin() {
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

    mostrarErro(mensagem) {
        console.error(mensagem);
        // Usar error handler para exibir pop-up interativo
        if (window.errorHandler) {
            window.errorHandler.showCustomError(mensagem);
        }
    }

    removerLoadingScreen() {
        try {
            const loading = document.querySelector('.loading-screen');
            if (loading) {
                document.body.classList.add('app-loaded');
                setTimeout(() => {
                    if (loading.parentNode) {
                        loading.remove();
                    }
                    // Forçar redimensionamento do mapa após a remoção do loading
                    this.forcarRedimensionamentoMapa();
                }, 500);
                console.log('Loading screen removido');
            } else {
                console.log('Loading screen nao encontrado');
                // Mesmo sem loading screen, tentar redimensionar o mapa
                this.forcarRedimensionamentoMapa();
            }
        } catch (error) {
            console.error('Erro ao remover loading screen:', error);
        }
    }

    /**
     * Força o redimensionamento do mapa para corrigir problemas de renderização inicial
     */
    forcarRedimensionamentoMapa() {
        if (window.mapManager && typeof window.mapManager.forcarRedimensionamento === 'function') {
            // Aguardar um pouco para garantir que as dimensões estão estabilizadas
            setTimeout(() => {
                window.mapManager.forcarRedimensionamento();
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
     * Configurar responsividade global da aplicação
     */
    configurarResponsividade() {
        console.log('Configurando responsividade...');
        
        // Configurar viewport meta tag se não existir
        this.configurarViewport();
        
        // Event listeners para mudanças de orientação e redimensionamento
        this.configurarEventListenersResponsivos();
        
        // Configurar comportamento touch para mobile
        this.configurarComportamentoTouch();
        
        // Aplicar classes baseadas no tamanho da tela
        this.aplicarClassesResponsivas();
        
        console.log('Responsividade configurada');
    }

    /**
     * Configurar viewport meta tag
     */
    configurarViewport() {
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    }

    /**
     * Configurar event listeners responsivos
     */
    configurarEventListenersResponsivos() {
        // Debounced resize handler
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.aplicarClassesResponsivas();
                this.ajustarLayoutParaTamanhoTela();
            }, 150);
        };
        
        // Orientation change handler
        const handleOrientationChange = () => {
            setTimeout(() => {
                this.aplicarClassesResponsivas();
                this.ajustarLayoutParaTamanhoTela();
                // Trigger map resize se existir
                this.forcarRedimensionamentoMapa();
            }, 300);
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);
    }

    /**
     * Configurar comportamento touch para dispositivos móveis
     */
    configurarComportamentoTouch() {
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
     * Aplicar classes CSS baseadas no tamanho da tela
     */
    aplicarClassesResponsivas() {
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
     * Ajustar layout para tamanho da tela
     */
    ajustarLayoutParaTamanhoTela() {
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
        this.atualizarEstatisticas();
        return true;
    }

    removerPonto(pontoId) {
        if (!this.isAdmin) return false;
        
        // Obter contexto do usuário atual
        const user = window.authManager?.getCurrentUser();
        const userRole = user?.role || 'visitor';
        
        window.databaseManager.removerPonto(pontoId, userRole);
        window.mapManager.removerMarcador(pontoId);
        this.atualizarEstatisticas();
        return true;
    }
}

// Não instanciar aqui - será feito no HTML
