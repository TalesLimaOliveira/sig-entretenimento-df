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
            
            console.log('Configuring events...');
            this.configureEvents();
            console.log('Events configured');
            
            console.log('Verifying authentication...');
            this.verifyAuthentication();
            console.log('Authentication verified');
            
            console.log('Configuring interface...');
            await this.configureInterface();
            console.log('Interface configured');
            
            console.log('Loading data...');
            this.loadData();
            console.log('Data loaded');
            
            console.log('Finalizing initialization...');
            this.removeLoadingScreen();
            this._markAsInitialized();
            
            // Ensure category buttons are visible after initialization
            setTimeout(() => {
                console.log('Final verification of category buttons...');
                this.configureCategoryMenu();
                this.diagnoseCategoryButtons();
                
                // Configure login buttons if not yet configured
                this.ensureLoginButtonsWork();
                
                // Force visibility of container and buttons
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
                    
                    console.log(`Container and ${buttons.length} buttons forced visible`);
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
        console.log('🔐 Verificando autenticação...');
        
        try {
            if (window.authManager && window.authManager.isAuthenticated()) {
                const user = window.authManager.getCurrentUser();
                console.log('🔐 Usuário autenticado encontrado:', user);
                this.configureLoggedUser(user);
            } else {
                console.log('🔐 Nenhum usuário autenticado');
                this.configureVisitorUser();
            }
        } catch (error) {
            console.error('🔐 Erro ao verificar autenticação:', error);
            this.configureVisitorUser();
        }
        
        // Forçar uma segunda verificação após 500ms para garantir
        setTimeout(() => {
            console.log('🔐 Segunda verificação de autenticação...');
            try {
                if (window.authManager && window.authManager.isAuthenticated()) {
                    const user = window.authManager.getCurrentUser();
                    console.log('🔐 Segunda verificação - usuário autenticado:', user.nome);
                    // Só atualizar se os botões ainda estão como "ENTRAR"
                    const desktopBtn = document.getElementById('desktop-login-btn');
                    const mobileBtn = document.getElementById('mobile-login-btn');
                    if (desktopBtn || mobileBtn) {
                        console.log('🔐 Botões ainda não foram atualizados, forçando atualização...');
                        this.configureLoggedUser(user);
                    }
                }
            } catch (error) {
                console.error('🔐 Erro na segunda verificação:', error);
            }
        }, 500);
    }

    /**
     * Configure interface for logged user
     */
    configureLoggedUser(user) {
        console.log(`🔐 Configurando usuário logado: ${user.nome} (${user.role})`);
        
        // Verificar se os containers existem
        const desktopContainer = document.querySelector('.desktop-actions');
        const mobileContainer = document.querySelector('.mobile-actions');
        console.log('🔐 Containers encontrados:', {
            desktop: !!desktopContainer,
            mobile: !!mobileContainer
        });
        
        console.log('🔐 Chamando updateLoginButton...');
        this.updateLoginButton(user);
        
        if (user.role === 'administrator') {
            console.log('🔐 Configurando interface de administrador');
            this.isAdmin = true;
            this.configureAdminInterface();
        } else if (user.role === 'user') {
            console.log('🔐 Configurando interface de usuário');
            this.isAdmin = false;
            this.configureUserInterface();
        }
        
        console.log('🔐 Atualizando visibilidade de favoritos');
        // this.updateFavoritesVisibility(user.role); // Comentado - não implementado ainda
        
        // Verificar se os botões foram criados corretamente
        setTimeout(() => {
            const desktopBtn = document.getElementById('desktop-user-info-btn');
            const mobileBtn = document.getElementById('mobile-user-info-btn');
            console.log('🔐 Verificação pós-criação dos botões:', {
                desktop: !!desktopBtn,
                mobile: !!mobileBtn
            });
        }, 100);
    }

    /**
     * Configure interface for visitor
     */
    configureVisitorUser() {
        console.log('Configurando interface para visitante...');
        this.isAdmin = false;
        this.configureLoginButton();
        // this.updateFavoritesVisibility('visitor'); // Comentado - não implementado ainda
    }

    /**
     * Configure login button for visitors
     */
    configureLoginButton() {
        console.log('Configurando botão de login para visitantes...');
        
        // Garantir que botões de login existam no DOM
        this.ensureLoginButtonsExist();
        
        // Configurar eventos de clique para os botões de login
        this.setupLoginButtonEvents();
        
        // Restaurar botão de favoritos também
        this.restoreFavoriteButton();
    }

    /**
     * Garantir que botões de login existam no DOM
     */
    ensureLoginButtonsExist() {
        const desktopButton = document.getElementById('desktop-login-btn');
        const mobileButton = document.getElementById('mobile-login-btn');
        
        // Se não existirem, procurar por containers de usuário para substituir
        if (!desktopButton) {
            const desktopContainer = document.querySelector('.desktop-actions');
            if (desktopContainer) {
                // Remover qualquer conteúdo existente relacionado ao usuário
                const existingUserElements = desktopContainer.querySelectorAll('.user-dropdown, .user-info, [id*="user-info"]');
                existingUserElements.forEach(el => el.remove());
                
                // Criar novo botão de login
                const loginBtn = document.createElement('button');
                loginBtn.className = 'header-login-btn desktop';
                loginBtn.id = 'desktop-login-btn';
                loginBtn.innerHTML = `
                    <i class="fas fa-user"></i>
                    <span class="login-btn-text">ENTRAR</span>
                `;
                desktopContainer.appendChild(loginBtn);
            }
        }
        
        if (!mobileButton) {
            const mobileContainer = document.querySelector('.mobile-actions');
            if (mobileContainer) {
                // Remover qualquer conteúdo existente relacionado ao usuário
                const existingUserElements = mobileContainer.querySelectorAll('.user-dropdown, .user-info, [id*="user-info"]');
                existingUserElements.forEach(el => el.remove());
                
                // Criar novo botão de login
                const loginBtn = document.createElement('button');
                loginBtn.className = 'header-login-btn mobile';
                loginBtn.id = 'mobile-login-btn';
                loginBtn.innerHTML = `
                    <i class="fas fa-user"></i>
                    <span class="login-btn-text">ENTRAR</span>
                `;
                mobileContainer.appendChild(loginBtn);
            }
        }
    }

    /**
     * Configurar eventos dos botões de login
     */
    setupLoginButtonEvents() {
        setTimeout(() => {
            const desktopBtn = document.getElementById('desktop-login-btn');
            const mobileBtn = document.getElementById('mobile-login-btn');
            
            [desktopBtn, mobileBtn].forEach((btn, index) => {
                if (btn) {
                    // Remover listeners antigos clonando o elemento
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    
                    // Adicionar novo listener
                    newBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`Login button clicked: ${index === 0 ? 'desktop' : 'mobile'}`);
                        this.showLoginModal();
                    });
                    
                    console.log(`Login button configured: ${index === 0 ? 'desktop' : 'mobile'}`);
                }
            });
        }, 100);
    }

    /**
     * Ensure login buttons work
     */
    ensureLoginButtonsWork() {
        console.log('Checking login buttons...');
        
        const desktopBtn = document.getElementById('desktop-login-btn');
        const mobileBtn = document.getElementById('mobile-login-btn');
        
        [desktopBtn, mobileBtn].forEach((btn, index) => {
            if (btn) {
                const btnType = index === 0 ? 'desktop' : 'mobile';
                console.log(`Button ${btnType} found:`, btn);
                
                // Remove old listeners
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Add new listener
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Click detected on ${btnType} button`);
                    this.showLoginModal();
                });
                
                console.log(`Event listener configured for button ${btnType}`);
            } else {
                console.warn(`Button ${index === 0 ? 'desktop' : 'mobile'} not found`);
            }
        });
    }

    /**
     * Restaura o botão de favoritos quando usuário não está logado
     */
    restoreFavoriteButton() {
        console.log('Verificando se precisa restaurar botão de favoritos...');
        
        const navContainer = document.getElementById('nav-buttons-container');
        if (navContainer) {
            const existingFavoriteBtn = navContainer.querySelector('[data-categoria="favoritos"]');
            if (!existingFavoriteBtn) {
                console.log('Restaurando botão de favoritos...');
                // Adicionar botão de favoritos após o botão "Todos"
                const todosBtn = navContainer.querySelector('[data-categoria="todos"]');
                if (todosBtn) {
                    const favoriteBtn = `
                        <button class="nav-btn category-btn" data-categoria="favoritos" title="Favoritos" 
                                style="background: #e11d48; border-color: #e11d48; color: white; display: flex !important; visibility: visible !important; opacity: 1 !important;">
                            <i class="fas fa-heart"></i>
                            <span class="nav-btn-text">Favoritos</span>
                        </button>
                    `;
                    todosBtn.insertAdjacentHTML('afterend', favoriteBtn);
                    console.log('Favorites button restored');
                }
            }
        }
    }

    /**
     * Update button after login
     */
    updateLoginButton(user) {
        console.log('🔄 Atualizando botão de login para usuário:', user.nome, 'Role:', user.role);
        
        // Encontrar containers onde estão os botões
        const desktopContainer = document.querySelector('.desktop-actions');
        const mobileContainer = document.querySelector('.mobile-actions');
        
        console.log('🔍 Containers encontrados:', {
            desktop: !!desktopContainer,
            mobile: !!mobileContainer
        });
        
        // Configurações do usuário
        const isAdmin = user.role === 'administrator';
        const userName = user.nome || user.username || 'Usuário';
        
        console.log('� Dados do usuário:', { userName, isAdmin });
        
        // Substituir botões em ambos os containers
        [desktopContainer, mobileContainer].forEach((container, index) => {
            if (container) {
                const containerType = index === 0 ? 'desktop' : 'mobile';
                console.log(`🔧 Processando container ${containerType}:`, container);
                
                // Remover elementos existentes relacionados ao login/usuário
                const existingElements = container.querySelectorAll('.header-login-btn, .user-dropdown, .user-info, [id*="login-btn"], [id*="user-info"]');
                existingElements.forEach(el => el.remove());
                
                // Criar novo elemento de menu de usuário
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
                console.log(`✅ Menu de usuário criado para ${containerType}`);
            }
        });
        
        // Configurar o menu após substituição
        console.log('🔧 Configurando interações do menu do usuário...');
        this.configureUserMenu();
        
        // Remover botão de favoritos apenas se for administrador
        if (user.role === 'administrator') {
            console.log('🗑️ Removendo botão de favoritos (usuário admin)...');
            this.removeFavoriteButton();
        }
        
        console.log('✅ updateLoginButton concluído');
    }

    /**
     * Remove o botão de favoritos da interface quando usuário está logado
     */
    removeFavoriteButton() {
        console.log('Removendo botão de favoritos da interface (apenas para administradores)...');
        
        // Procurar e remover botão de favoritos em todas as possíveis localizações
        const favoriteButtons = document.querySelectorAll('[data-categoria="favoritos"]');
        favoriteButtons.forEach(btn => {
            console.log('Removendo botão de favoritos:', btn);
            btn.remove();
        });
        
        // Verificar se há botões de favoritos no container de navegação
        const navContainer = document.getElementById('nav-buttons-container');
        if (navContainer) {
            const favoriteBtn = navContainer.querySelector('[data-categoria="favoritos"]');
            if (favoriteBtn) {
                favoriteBtn.remove();
                console.log('Botão de favoritos removido do container de navegação (interface admin)');
            }
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
        console.log('Configurando menu suspenso do usuário...');
        
        // Configurar ambos os menus (desktop e mobile)
        const desktopUserBtn = document.getElementById('desktop-user-info-btn');
        const mobileUserBtn = document.getElementById('mobile-user-info-btn');
        
        [desktopUserBtn, mobileUserBtn].forEach(userInfoBtn => {
            if (userInfoBtn) {
                console.log('Configurando menu suspenso para botão:', userInfoBtn.id);
                
                // Usar o componente UserMenu se disponível
                if (window.userMenu && typeof window.userMenu.toggle === 'function') {
                    // Remover listeners antigos
                    const newBtn = userInfoBtn.cloneNode(true);
                    userInfoBtn.parentNode.replaceChild(newBtn, userInfoBtn);
                    
                    newBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Menu toggle via UserMenu component');
                        window.userMenu.toggle(newBtn);
                    });
                } else {
                    // Fallback para método antigo
                    console.log('UserMenu component not available, using fallback');
                    this.setupFallbackUserMenu(userInfoBtn);
                }
            }
        });
    }

    /**
     * Setup fallback user menu (método antigo como backup)
     */
    setupFallbackUserMenu(userInfoBtn) {
        const menuId = userInfoBtn.id + '-menu';
        const dropdownMenu = document.getElementById(menuId);
        
        if (dropdownMenu) {
            // Evento para mostrar/ocultar menu
            userInfoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isVisible = dropdownMenu.style.display !== 'none';
                
                // Fechar todos os outros menus
                document.querySelectorAll('.user-dropdown-menu').forEach(menu => {
                    if (menu !== dropdownMenu) {
                        menu.style.display = 'none';
                    }
                });
                
                // Toggle do menu atual
                dropdownMenu.style.display = isVisible ? 'none' : 'block';
                userInfoBtn.classList.toggle('menu-open', !isVisible);
                
                console.log('Menu suspenso toggled:', !isVisible);
            });
            
            // Configurar botão de logout no menu
            const logoutBtn = dropdownMenu.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Logout solicitado');
                    if (window.authManager) {
                        window.authManager.logout();
                        this.showNotification('Logout realizado com sucesso!', 'success');
                    }
                    
                    // Fechar menu
                    dropdownMenu.style.display = 'none';
                    userInfoBtn.classList.remove('menu-open');
                });
            }
        }
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                document.querySelectorAll('.user-dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                });
                document.querySelectorAll('.user-info').forEach(btn => {
                    btn.classList.remove('menu-open');
                });
            }
        });
    }

    /**
     * Mostrar notificação para o usuário
     */
    showNotification(message, type = 'info') {
        if (window.errorHandler?.showSimpleNotification) {
            window.errorHandler.showSimpleNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
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
        console.log('Configurando eventos de autenticação...');
        
        // Event listener para mudanças de autenticação
        document.addEventListener('authStateChanged', (e) => {
            console.log('🎯 Event authStateChanged disparado!', e);
            console.log('🎯 Event detail:', e.detail);
            
            try {
                const { type, user } = e.detail;
                console.log(`🎯 Processando evento de autenticação: ${type}`, user);
                
                if (type === 'login') {
                    console.log('🎯 Processando login...');
                    this.configureLoggedUser(user);
                    this.reloadData();
                } else if (type === 'logout') {
                    console.log('🎯 Processando logout...');
                    this.configureVisitorUser();
                    this.reloadData();
                }
            } catch (error) {
                console.error('🎯 Erro ao processar evento de autenticação:', error);
                // Try to reconfigure as visitor in case of error
                try {
                    this.configureVisitorUser();
                } catch (fallbackError) {
                    console.error('🎯 Erro no fallback de configuração:', fallbackError);
                }
            }
        });
        
        // NOVA FUNCIONALIDADE: Listener adicional para userLoggedIn
        document.addEventListener('userLoggedIn', (e) => {
            console.log('🎯 Event userLoggedIn recebido:', e.detail);
            try {
                this.configureLoggedUser(e.detail);
            } catch (error) {
                console.error('🎯 Erro ao processar userLoggedIn:', error);
            }
        });
        
        console.log('Event listener de autenticação configurado');

        // Event listener for loaded categories
        document.addEventListener('database_categoriasCarregadas', (e) => {
            console.log('Categories loaded, updating category menu...');
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
            
            // Check if managers are available
            if (!window.databaseManager) {
                throw new Error('DatabaseManager not available');
            }
            
            if (!window.mapManager) {
                console.warn('MapManager not available, skipping point rendering');
                this.updateStatistics();
                return;
            }
            
            // Initialize map if not already initialized
            if (!window.mapManager.map) {
                console.log('Initializing map...');
                window.mapManager.init();
            }
            
            // Render points and update statistics
            this.renderPoints();
            this.updateStatistics();
            
            // Reconfigure category menu after data is loaded
            console.log('Second call: reconfiguring category menu...');
            this.configureCategoryMenu();
            
            console.log('Data loaded successfully');
        } catch (error) {
            console.error('Error loading data:', error);
            // Only show error pop-up if not during initialization
            if (this.isInitialized) {
                this.showError('Error loading map data.');
            }
            throw error;
        }
    }

    configureCategoryMenu() {
        console.log('Starting category menu configuration...');
        
        const container = document.getElementById('nav-buttons-container');
        if (!container) {
            console.error('Navigation container not found: nav-buttons-container');
            return;
        }

        // Immediate render with hardcoded categories for faster loading
        const defaultCategories = [
            { id: 'geral', nome: 'Geral', icon: 'fas fa-theater-masks', cor: '#6c757d' },
            { id: 'esportes-lazer', nome: 'Esportes', icon: 'fas fa-running', cor: '#28a745' },
            { id: 'gastronomia', nome: 'Gastronomia', icon: 'fas fa-utensils', cor: '#dc3545' },
            { id: 'geek-nerd', nome: 'Geek', icon: 'fas fa-gamepad', cor: '#6f42c1' },
            { id: 'casas-noturnas', nome: 'Casas Noturnas', icon: 'fas fa-glass-cheers', cor: '#6610f2' }
        ];

        // Render immediately for fast user experience
        this.renderCategoryButtons(defaultCategories);

        // Try to get from DatabaseManager in background
        if (window.databaseManager && window.databaseManager.getCategorias) {
            const categories = window.databaseManager.getCategorias() || [];
            if (categories.length > 0) {
                console.log('DatabaseManager categories available, updating:', categories.length);
                this.renderCategoryButtons(categories);
            }
        }

        // Load from JSON as fallback (async, non-blocking)
        this.loadCategoriesDirectly().then(cats => {
            if (cats && cats.length > 0) {
                console.log('Categories loaded from JSON, final update:', cats.length);
                this.renderCategoryButtons(cats);
            }
        }).catch(error => {
            console.error('Error loading categories from JSON:', error);
        });
    }

    async loadCategoriesDirectly() {
        try {
            const response = await fetch('./database/categorias.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const categories = await response.json();
            console.log('Categories loaded directly from JSON:', categories);
            return categories;
        } catch (error) {
            console.error('Error loading categories directly:', error);
            return [];
        }
    }

    renderCategoryButtons(categories) {
        const container = document.getElementById('nav-buttons-container');
        if (!container) {
            console.error('Container not found during rendering');
            return;
        }

        // Create "All" button first (always present)
        let buttonsHtml = `
            <button class="nav-btn category-btn" data-categoria="todos" title="Todos os pontos">
                <i class="fas fa-globe"></i>
                <span class="nav-btn-text">Todos</span>
            </button>
        `;

        // Generate buttons for categories
        categories.forEach(categoria => {
            const iconClass = categoria.icon || 'fas fa-map-marker-alt';
            const corCategoria = categoria.cor || '#6c757d';
            
            buttonsHtml += `
                <button class="nav-btn category-btn" data-categoria="${categoria.id}" 
                        data-color="${corCategoria}" title="${categoria.nome}">
                    <i class="${iconClass}"></i>
                    <span class="nav-btn-text">${categoria.nome}</span>
                </button>
            `;
        });
        
        // Insert HTML into container
        container.innerHTML = buttonsHtml;
        
        // Configure event listeners (only once)
        if (!container.hasAttribute('data-listeners-configured')) {
            container.addEventListener('click', (e) => {
                const button = e.target.closest('[data-categoria]');
                if (button) {
                    e.preventDefault();
                    e.stopPropagation();
                    const categoria = button.dataset.categoria;
                    this.filterByCategory(categoria);
                }
            });
            container.setAttribute('data-listeners-configured', 'true');
        }
        
        // Set initial active state
        this.updateCategoryButtons(this.activeCategory);
    }

    /**
     * Diagnose category buttons visibility
     */
    diagnoseCategoryButtons() {
        console.log('Category buttons diagnostic:');
        
        const container = document.getElementById('nav-buttons-container');
        if (!container) {
            console.error('Container nav-buttons-container not found');
            return;
        }
        
        console.log('Container found:');
        console.log('  - display:', window.getComputedStyle(container).display);
        console.log('  - visibility:', window.getComputedStyle(container).visibility);
        console.log('  - opacity:', window.getComputedStyle(container).opacity);
        console.log('  - innerHTML length:', container.innerHTML.length);
        
        const buttons = container.querySelectorAll('.nav-btn');
        console.log(`${buttons.length} buttons found:`);
        
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
        // Usar o ícone diretamente do banco de dados
        if (categoria.icon) {
            console.log(`Usando ícone do banco para ${categoria.id}: ${categoria.icon}`);
            return categoria.icon;
        }
        
        // Fallback only if there's no icon in database (shouldn't happen)
        console.warn(`Category ${categoria.id} without icon in database, using fallback`);
        return 'fas fa-map-marker-alt';
    }

    filterByCategory(categoria) {
        try {
            console.log(`Filtering by category: ${categoria}`);
            this.activeCategory = categoria;
            
            // Update navigation buttons immediately
            this.updateCategoryButtons(categoria);

            // Check if it's favorites filter and user is logged in
            if (categoria === 'favoritos') {
                if (!window.authManager || !window.authManager.isAuthenticated()) {
                    console.log('User not logged in, opening login modal');
                    window.loginModal.open({
                        pendingAction: () => this.filterByCategory('favoritos')
                    });
                    return;
                }
            }

            // Check if MapManager is available
            if (!window.mapManager) {
                console.error('MapManager not available');
                return;
            }

            if (typeof window.mapManager.filterByCategory !== 'function') {
                console.error('Method filterByCategory not found in MapManager');
                return;
            }

            // Filter markers
            console.log(`Calling MapManager.filterByCategory with: ${categoria}`);
            const user = window.authManager && window.authManager.getCurrentUser ? 
                window.authManager.getCurrentUser() : null;
            window.mapManager.filterByCategory(categoria, user ? user.username : null);
            
        } catch (error) {
            console.error('Error filtering by category:', error);
        }
    }

    /**
     * Atualizar estado visual dos botões de categoria
     */
    updateCategoryButtons(categoriaAtiva) {
        const buttons = document.querySelectorAll('.nav-btn[data-categoria]');
        buttons.forEach(btn => {
            const isActive = btn.dataset.categoria === categoriaAtiva;
            
            if (isActive) {
                // Active button styling
                btn.classList.add('active');
                btn.style.background = '#3b82f6'; // Primary blue for active
                btn.style.borderColor = '#3b82f6';
                btn.style.color = 'white';
                btn.style.transform = 'scale(1.05)';
                btn.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.4)';
            } else {
                // Inactive button styling
                btn.classList.remove('active');
                const originalColor = btn.dataset.color || '#6c757d';
                btn.style.background = originalColor;
                btn.style.borderColor = originalColor;
                btn.style.color = 'white';
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
            }
            
            // Set accessibility attribute
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

    showLoginModal() {
        try {
            console.log('showLoginModal called');
            
            // Check if LoginModal is available directly
            if (window.loginModal && typeof window.loginModal.open === 'function') {
                console.log('Using window.loginModal.open()');
                window.loginModal.open();
                return;
            }
            
            // Fallback to modalManager
            if (window.modalManager && typeof window.modalManager.mostrar === 'function') {
                console.log('Using window.modalManager.mostrar()');
                window.modalManager.mostrar('login');
                return;
            }
            
            // Fallback to alternative system
            console.warn('ModalManager and LoginModal not available, using fallback');
            
            // Criar modal simples como fallback
            const modalHtml = `
                <div id="temp-login-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 400px; width: 90%;">
                        <h3>Login</h3>
                        <form id="temp-login-form">
                            <div style="margin-bottom: 1rem;">
                                <label>Usuário:</label>
                                <input type="text" id="temp-username" style="width: 100%; padding: 0.5rem; margin-top: 0.5rem;" placeholder="Digite: admin ou user">
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label>Senha:</label>
                                <input type="password" id="temp-password" style="width: 100%; padding: 0.5rem; margin-top: 0.5rem;" placeholder="Digite: admin ou user">
                            </div>
                            <div style="display: flex; gap: 1rem;">
                                <button type="submit" style="flex: 1; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 4px;">Entrar</button>
                                <button type="button" onclick="document.getElementById('temp-login-modal').remove()" style="flex: 1; padding: 0.75rem; background: #6b7280; color: white; border: none; border-radius: 4px;">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Configurar form
            document.getElementById('temp-login-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('temp-username').value;
                const password = document.getElementById('temp-password').value;
                
                if (username === 'admin' && password === 'admin') {
                    console.log('Admin login successful');
                    if (window.authManager) {
                        window.authManager.login({ 
                            id: 'admin', 
                            nome: 'Administrador', 
                            role: 'administrator',
                            usuario: 'admin'
                        });
                    }
                    document.getElementById('temp-login-modal').remove();
                } else if (username === 'user' && password === 'user') {
                    console.log('User login successful');
                    if (window.authManager) {
                        window.authManager.login({ 
                            id: 'user', 
                            nome: 'Usuário', 
                            role: 'user',
                            usuario: 'user'
                        });
                    }
                    document.getElementById('temp-login-modal').remove();
                } else {
                    alert('Credenciais inválidas! Use: admin/admin ou user/user');
                }
            });
            
        } catch (error) {
            console.error('Error showing login modal:', error);
            alert('Erro no sistema de login: ' + error.message);
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
    
    // FUNÇÕES DE TESTE/DEBUG
    testLogin(username, password) {
        console.log('🧪 TESTE: Iniciando login para:', username);
        if (window.authManager && window.authManager.login) {
            window.authManager.login(username, password).then(result => {
                console.log('🧪 TESTE: Resultado do login:', result);
                if (result.success) {
                    console.log('🧪 TESTE: Forçando atualização da interface...');
                    this.configureLoggedUser(result.user);
                }
            });
        }
    }
    
    testLogout() {
        console.log('🧪 TESTE: Fazendo logout...');
        if (window.authManager && window.authManager.logout) {
            window.authManager.logout();
        }
    }
    
    checkAuthStatus() {
        const isAuth = window.authManager ? window.authManager.isAuthenticated() : false;
        const user = isAuth ? window.authManager.getCurrentUser() : null;
        console.log('🧪 TESTE: Status de autenticação:', {
            authenticated: isAuth,
            user: user ? `${user.nome} (${user.role})` : null
        });
        return { authenticated: isAuth, user };
    }
}

// Não instanciar aqui - será feito no HTML

// Função global para testes
window.testLogin = function(username = 'admin', password = 'admin') {
    console.log('🧪 Função global testLogin chamada');
    if (window.app && window.app.testLogin) {
        window.app.testLogin(username, password);
    } else if (window.authManager) {
        window.authManager.login(username, password).then(result => {
            console.log('🧪 Login direto resultado:', result);
            if (result.success && window.app) {
                window.app.configureLoggedUser(result.user);
            }
        });
    } else {
        console.error('🧪 AuthManager não disponível');
    }
};

window.testLogout = function() {
    console.log('🧪 Função global testLogout chamada');
    if (window.app && window.app.testLogout) {
        window.app.testLogout();
    } else if (window.authManager) {
        window.authManager.logout();
        setTimeout(() => window.location.reload(), 500);
    } else {
        console.error('🧪 AuthManager não disponível');
    }
};

window.checkAuthStatus = function() {
    console.log('🧪 Função global checkAuthStatus chamada');
    if (window.app && window.app.checkAuthStatus) {
        return window.app.checkAuthStatus();
    } else {
        const isAuth = window.authManager ? window.authManager.isAuthenticated() : false;
        const user = isAuth ? window.authManager.getCurrentUser() : null;
        console.log('🧪 Status direto:', { authenticated: isAuth, user });
        return { authenticated: isAuth, user };
    }
};
