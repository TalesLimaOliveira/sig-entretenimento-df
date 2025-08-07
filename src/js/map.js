/**
 * MapManager - Gerenciador de Mapas Interativos
 * 
 * Responsabilidades:
 * - Inicializar e configurar mapa Leaflet
 * - Gerenciar marcadores e categorias
 * - Controlar responsividade e performance
 * - Filtrar pontos por categoria e usuário
 * - Gerenciar modo de adição de pontos
 * 
 * Usado por: PontosEntretenimentoApp
 * Dependências: Leaflet.js, DatabaseManager
 *
 * @author Tales Oliveira (github.com/TalesLimaOliveira)
 * @version 1.0.0
 * @note Este arquivo contém trechos de código gerados com auxílio de Inteligência Artificial.
 */
class MapManager {
    /**
     * Construtor do MapManager
     * @param {string} containerId - ID do container HTML do mapa
     */
    constructor(containerId = 'map') {
        // Configurações básicas
        this.containerId = containerId;
        this.map = null;
        
        // Marker management
        this.markers = new Map();                // Map of markers by ID  
        this.marcadores = new Map();             // Alias para compatibilidade
        this.groupsByCategory = new Map();       // Marker groups by category
        this.gruposPorCategoria = this.groupsByCategory; // Alias para compatibilidade
        this.iconCache = new Map();              // Icon cache for better performance
        
        // Application state
        this.activeCategory = 'todos';           // Currently filtered category
        this.openPopup = null;                   // ID of currently open popup
        this.additionMode = false;               // If in point addition mode
        
        // Constantes do mapa
        this.BRASILIA_CENTER = [-15.794700, -47.890000];
        this.DEFAULT_ZOOM = 11;
        this.MIN_ZOOM = 10;
        this.MAX_ZOOM = 18;
        this.DF_BOUNDS = L.latLngBounds(
            [-16.5, -48.5], // Southwest
            [-15.3, -47.2]  // Northeast
        );
        
        // Não inicializar automaticamente - aguardar DOM
        // this.init(); será chamado pelo AppInitializer
    }

    /**
     * Inicializa o mapa e todos os seus componentes
     * 
     * Fluxo de inicialização:
     * 1. Validar container e dependências
     * 2. Criar mapa base
     * 3. Configurar camadas
     * 4. Aplicar tema inicial
     * 5. Configurar eventos
     * 6. Configurar controles
     * 7. Configurar responsividade
     * 
     * Usado por: Constructor
     * @throws {Error} Se container não existir ou Leaflet não estiver carregado
     */
    init() {
        try {
            console.log('Inicializando MapManager...');
            
            // Validar pré-requisitos
            this._validarPreRequisitos();
            
            // Inicializar componentes na ordem correta
            this._criarMapa();
            this._configurarCamadas();
            this._aplicarTemaInicial();
            this._configurarEventListeners();
            this._configurarControles();
            this._configurarResponsividade();
            
            console.log('MapManager successfully initialized');
        } catch (error) {
            console.error('Error initializing MapManager:', error);
            throw error;
        }
    }

    /**
     * Valida pré-requisitos para inicialização
     * @private
     * @throws {Error} Se requisitos críticos não atendidos
     */
    _validarPreRequisitos() {
        // Verificar se Leaflet está disponível
        if (typeof L === 'undefined') {
            throw new Error('Leaflet não está carregado');
        }
        
        // Verificar se o container existe
        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error(`Container '${this.containerId}' não encontrado`);
        }
        
        // Remover verificação rígida do DOM - permitir inicialização mesmo se ainda carregando
        // A inicialização pode prosseguir desde que o container exista
        console.log('Pré-requisitos validados - container encontrado e Leaflet disponível');
    }

    /**
     * Configura responsividade completa do mapa
     * 
     * Implementa:
     * - ResizeObserver para redimensionamento do container
     * - Listener para mudanças de orientação
     * - Debounced resize handler
     * - Configurações responsivas do mapa
     * 
     * Usado por: init()
     * @private
     */
    _configurarResponsividade() {
        // ResizeObserver para mudanças no container
        this._configurarResizeObserver();
        
        // Listeners para mudanças de orientação e janela
        this._configurarEventListenersResponsivos();
        
        // Aplicar configurações responsivas baseadas no tamanho atual
        this._aplicarConfiguracoesMobile();
    }

    /**
     * Configura ResizeObserver para o container do mapa
     * @private
     */
    _configurarResizeObserver() {
        if (!ResizeObserver) return;
        
        const resizeObserver = new ResizeObserver(this._debounce(() => {
            if (this.map) {
                // Aguardar minimamente para garantir que o container está dimensionado
                setTimeout(() => {
                    this.map.invalidateSize();
                }, 50); // Reduzido de 100ms para 50ms
            }
        }, 50)); // Reduzido de 100ms para 50ms
        
        const mapContainer = document.getElementById(this.containerId);
        if (mapContainer) {
            resizeObserver.observe(mapContainer);
        }
    }

    /**
     * Configura event listeners responsivos
     * @private
     */
    _configurarEventListenersResponsivos() {
        // Mudanças de orientação em dispositivos móveis
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                    this._aplicarConfiguracoesMobile();
                }
            }, 500);
        });
        
        // Redimensionamento da janela
        window.addEventListener('resize', this._debounce(() => {
            if (this.map) {
                this.map.invalidateSize();
                this._aplicarConfiguracoesMobile();
            }
        }, 250));
    }

    /**
     * Função utilitária de debounce para otimizar performance
     * @private
     * @param {Function} func - Função a ser debounced
     * @param {number} wait - Tempo de espera em ms
     * @returns {Function} Função debounced
     */
    _debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Cria o mapa base com configurações otimizadas
     * 
     * Configurações aplicadas:
     * - Centro em Brasília
     * - Limites do Distrito Federal
     * - Controles customizados
     * - Renderer Canvas para performance
     * 
     * Usado por: init()
     * @private
     */
    _criarMapa() {
        // Verificar se o container tem dimensões válidas
        const container = document.getElementById(this.containerId);
        if (container) {
            const rect = container.getBoundingClientRect();
            console.log(`Container dimensions: ${rect.width}x${rect.height}`);
            
            // Se o container não tem altura, aguardar um pouco
            if (rect.height === 0) {
                console.log('Container without height, waiting...');
                setTimeout(() => this._criarMapa(), 100);
                return;
            }
        }

        // Criar mapa com configurações otimizadas
        this.map = L.map(this.containerId, {
            center: this.BRASILIA_CENTER,
            zoom: this.DEFAULT_ZOOM,
            zoomControl: false,              // Controle customizado será adicionado
            attributionControl: false,       // Removido para interface limpa
            preferCanvas: true,              // Melhor performance para muitos marcadores
            renderer: L.canvas(),            // Renderer de canvas otimizado
            maxBounds: this.DF_BOUNDS,       // Limitar área navegável
            minZoom: this.MIN_ZOOM,
            maxZoom: this.MAX_ZOOM
        });
        
        // Forçar uma invalidação inicial otimizada (reduzido delay)
        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize(true);
                console.log('Map initialized and resized');
            }
        }, 50); // Reduzido de 100ms para 50ms
        
        // Aplicar configurações responsivas iniciais
        this._aplicarConfiguracoesMobile();
    }

    /**
     * Aplica configurações específicas para dispositivos móveis
     * @private
     */
    _aplicarConfiguracoesMobile() {
        if (!this.map) return;
        
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Configurações para mobile: zoom mais suave
            this.map.options.zoomSnap = 0.5;
            this.map.options.zoomDelta = 0.5;
            this.map.options.wheelPxPerZoomLevel = 120;
            
            // Popup responsivo
            this.map.options.maxPopupWidth = Math.min(300, window.innerWidth - 40);
        } else {
            // Configurações para desktop: zoom preciso
            this.map.options.zoomSnap = 1;
            this.map.options.zoomDelta = 1;
            this.map.options.wheelPxPerZoomLevel = 60;
            
            // Popup maior para desktop
            this.map.options.maxPopupWidth = 400;
        }
    }

    /**
     * Configura as camadas base do mapa
     * 
     * Implementa:
     * - Camada de tiles OpenStreetMap
     * - Inicialização dos grupos de categorias
     * - Carregamento inicial dos pontos
     * 
     * Usado por: init()
     * @private
     */
    _configurarCamadas() {
        // Criar e adicionar camada de ruas otimizada para carregamento rápido
        this.camadaRuas = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '', // Removido para interface limpa
            loading: 'lazy', // Carregamento otimizado
            crossOrigin: true,
            keepBuffer: 2, // Manter buffer menor para economizar memória
            updateWhenIdle: true, // Atualizar apenas quando parado
            updateWhenZooming: false, // Não atualizar durante zoom para melhor performance
            updateInterval: 150 // Reduzir frequência de atualizações
        });
        
        this.camadaRuas.addTo(this.map);

        // Inicializar grupos de categorias
        this._inicializarGruposCategorias();
    }

    /**
     * Inicializa grupos de marcadores por categoria
     * 
     * Cria um LayerGroup para cada categoria disponível,
     * permitindo filtros eficientes por categoria
     * 
     * @param {Array} pontosCustomizados - Pontos específicos para carregar (opcional)
     * Usado por: _configurarCamadas(), filterByCategory()
     * @private
     */
    _inicializarGruposCategorias(pontosCustomizados = null) {
        // Limpar grupos existentes do mapa
        this.gruposPorCategoria.forEach(grupo => {
            if (this.map.hasLayer(grupo)) {
                this.map.removeLayer(grupo);
            }
        });
        this.gruposPorCategoria.clear();

        // Criar grupos básicos
        this._criarGruposBasicos();

        // Aguardar DatabaseManager estar disponível
        if (window.databaseManager) {
            try {
                const categorias = window.databaseManager.getCategorias();
                
                // Criar grupo para cada categoria do banco
                categorias.forEach(categoria => {
                    if (!this.gruposPorCategoria.has(categoria.id)) {
                        this.gruposPorCategoria.set(categoria.id, L.layerGroup());
                    }
                });

                // Carregar pontos se disponíveis
                const pontos = pontosCustomizados || this._obterPontosParaCarregar();
                if (pontos && pontos.length > 0) {
                    this._loadPoints(pontos);
                }
                
                console.log(`Category groups initialized: ${this.gruposPorCategoria.size} groups`);
            } catch (error) {
                console.error('Error initializing category groups:', error);
            }
        } else {
            console.warn('DatabaseManager not available to initialize categories');
        }
    }

    /**
     * Obtém pontos para carregar baseado no perfil do usuário
     * 
     * Lógica de acesso:
     * - Administrator: vê pontos confirmados + pendentes
     * - User/Visitor: vê apenas pontos confirmados
     * 
     * @returns {Array} Lista de pontos para carregar
     * Usado por: _inicializarGruposCategorias(), recarregarPontos()
     * @private
     */
    _obterPontosParaCarregar() {
        if (!window.databaseManager) {
            console.warn('DatabaseManager not available');
            return [];
        }

        try {
            const user = window.authManager?.getCurrentUser();
            
            if (user && user.role === 'administrator') {
                // Admin vê todos os pontos (confirmados + pendentes)
                const confirmados = window.databaseManager.getPontos();
                const pendentes = window.databaseManager.getPontosPendentes();
                return [...confirmados, ...pendentes];
            } else {
                // Visitante/usuário vê apenas confirmados
                return window.databaseManager.getPontos();
            }
        } catch (error) {
            console.error('Error getting points:', error);
            return [];
        }
    }

    /**
     * Carrega pontos no mapa criando marcadores apropriados
     * 
     * @param {Array} pontos - Lista de pontos a serem carregados
     * Usado por: _inicializarGruposCategorias(), recarregarPontos()
     * @private
     */
    _loadPoints(pontos) {
        try {
            console.log(`📍 Loading ${pontos.length} points on map...`);
            console.log('Dados dos pontos:', pontos);
            
            // Limpar marcadores existentes
            this.clearMarkers();
            
            // Inicializar grupos primeiro se necessário
            if (this.gruposPorCategoria.size === 0) {
                console.log('🔧 Criando grupos básicos...');
                this._criarGruposBasicos();
            }
            
            // Check if map is ready
            if (!this.map) {
                console.error('Map is not initialized');
                return;
            }
            
            console.log(`Mapa pronto, processando ${pontos.length} pontos...`);
            
            // Adicionar cada ponto
            pontos.forEach((ponto, index) => {
                try {
                    console.log(`Processando ponto ${index + 1}/${pontos.length}: ${ponto.nome} (ID: ${ponto.id})`);
                    this.addMarker(ponto);
                } catch (error) {
                    console.error(`❌ Erro ao adicionar ponto ${ponto.id || index}:`, error);
                }
            });

            // Debug: mostrar quantos pontos foram adicionados por categoria
            console.log(`Pontos carregados por categoria:`);
            this.gruposPorCategoria.forEach((grupo, categoria) => {
                if (categoria !== 'todos') {
                    console.log(`  - ${categoria}: ${grupo.getLayers().length} pontos`);
                }
            });
            
            console.log(`Total de ${pontos.length} pontos processados`);
            console.log(`📍 Total de marcadores criados: ${this.marcadores.size}`);
            
        } catch (error) {
            console.error('❌ Erro ao carregar pontos:', error);
        }
    }
    
    /**
     * Cria grupos básicos necessários
     * @private
     */
    _criarGruposBasicos() {
        // !TODO: Implementar sistema de favoritos
        // const gruposNecessarios = ['todos', 'favoritos', 'geral', 'esportes-lazer', 
        //                            'gastronomia', 'geek-nerd', 'casas-noturnas'];
        const gruposNecessarios = ['todos', 'geral', 'esportes-lazer', 
                                   'gastronomia', 'geek-nerd', 'casas-noturnas'];
        
        gruposNecessarios.forEach(categoria => {
            if (!this.gruposPorCategoria.has(categoria)) {
                this.gruposPorCategoria.set(categoria, L.layerGroup());
            }
        });
    }

    /**
     * Aplica tema inicial baseado nas preferências salvas
     * 
     * Usado por: init()
     * @private
     */
    _aplicarTemaInicial() {
        try {
            // Sempre aplicar tema escuro
            this._aplicarTemaNoMapa(true);
        } catch (error) {
            console.error('❌ Erro ao aplicar tema inicial:', error);
        }
    }

    /**
     * Aplica tema específico no mapa
     * 
     * @param {boolean} temaEscuro - Se deve aplicar tema escuro
     * @private
     */
    _aplicarTemaNoMapa(temaEscuro = false) {
        try {
            // Para manter simplicidade, mantemos sempre a camada de ruas
            // O tema escuro será aplicado via CSS na interface
            console.log(`Tema ${temaEscuro ? 'escuro' : 'claro'} aplicado ao mapa`);
        } catch (error) {
            console.error('❌ Erro ao aplicar tema no mapa:', error);
        }
    }

    /**
     * Configura event listeners principais do mapa
     * 
     * Implementa listeners para:
     * - Cliques no mapa (modo adição)
     * - Eventos do banco de dados
     * - Mudanças de autenticação
     * 
     * Usado por: init()
     * @private
     */
    _configurarEventListeners() {
        // Click no mapa para adicionar pontos (apenas admin em modo adição)
        this.map.on('click', (e) => {
            if (this._isAdminEmModoAdicao()) {
                this._iniciarAdicaoPonto(e.latlng);
            }
        });

        // Eventos do sistema de dados
        this._configurarEventosDatabase();
        
        // Eventos de autenticação
        this._configurarEventosAuth();
    }

    /**
     * Configura eventos relacionados ao banco de dados
     * @private
     */
    _configurarEventosDatabase() {
        // Ponto adicionado
        document.addEventListener('database_pontoAdicionado', (e) => {
            this.addMarker(e.detail);
        });

        // Ponto atualizado
        document.addEventListener('database_pontoAtualizado', (e) => {
            this.atualizarMarcador(e.detail);
        });

        // Ponto removido
        document.addEventListener('database_pontoRemovido', (e) => {
            this.removeMarker(e.detail.id);
        });

        // Categorias carregadas/atualizadas - recarregar marcadores
        document.addEventListener('database_categoriasCarregadas', () => {
            console.log('Categorias carregadas, recarregando marcadores...');
            this.recarregarMarcadores();
        });
    }

    /**
     * Configura eventos relacionados à autenticação
     * @private
     */
    _configurarEventosAuth() {
        document.addEventListener('authStateChanged', (e) => {
            const isAdmin = e.detail.type === 'login' && 
                           e.detail.user?.role === 'administrator';
            this._atualizarControlesAdmin(isAdmin);
            
            // Recarregar pontos baseado no novo contexto de usuário
            this.reloadPoints();
        });
    }

    /**
     * Verifica se o usuário é admin e está em modo adição
     * @returns {boolean}
     * @private
     */
    _isAdminEmModoAdicao() {
        return window.authManager?.isAdmin?.() && this.modoAdicao;
    }

    /**
     * Configura controles específicos do mapa
     * 
     * Remove controles desnecessários para interface limpa
     * Adiciona controles específicos para administradores
     * 
     * Usado por: init()
     * @private
     */
    _configurarControles() {
        try {
            // Remover controles padrão para interface mais limpa
            // Os controles de zoom são removidos intencionalmente
            
            // Adicionar controles específicos para admins
            if (window.authManager?.isAdmin?.()) {
                this._adicionarControlesAdmin();
            }
            
            console.log('Controles do mapa configurados');
        } catch (error) {
            console.error('❌ Erro ao configurar controles:', error);
        }
    }

    /**
     * Adiciona controles específicos para administradores
     * @private
     */
    _adicionarControlesAdmin() {
        // Controle de coordenadas para facilitar adição de pontos
        this._adicionarControleCoordenadas();
    }

    /**
     * Adiciona controle de coordenadas para admins
     * @private
     */
    _adicionarControleCoordenadas() {
        // !TODO: Implement specific map controls if needed
        // Por enquanto, coordenadas são mostradas no console no click
    }

    /**
     * Atualiza controles baseado no status de admin
     * 
     * @param {boolean} isAdmin - Se o usuário é administrador
     * Usado por: _configurarEventosAuth()
     * @private
     */
    _atualizarControlesAdmin(isAdmin) {
        try {
            if (isAdmin) {
                this._adicionarControlesAdmin();
            } else {
                this._removerControlesAdmin();
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar controles admin:', error);
        }
    }

    /**
     * Remove controles específicos de administrador
     * @private
     */
    _removerControlesAdmin() {
        // !TODO: Implement removal of specific controls if added
        // Por enquanto, apenas desabilita modo de adição
        this.modoAdicao = false;
    }

    // ==========================================
    // MÉTODOS PÚBLICOS - INTERFACE PRINCIPAL
    // ==========================================

    /**
     * Alterna tema do mapa (método público)
     * 
     * @param {boolean} temaEscuro - Se deve aplicar tema escuro
     * Usado por: interface
     */
    alternarTemaMapa(temaEscuro = false) {
        try {
            this._aplicarTemaNoMapa(temaEscuro);
            console.log(`Tema do mapa alterado para ${temaEscuro ? 'escuro' : 'claro'}`);
        } catch (error) {
            console.error('❌ Erro ao alterar tema do mapa:', error);
        }
    }

    /**
     * Aplica tema inicial baseado nas configurações salvas
     * 
     * Método público mantido para compatibilidade com código legado
     * @deprecated Use _aplicarTemaInicial() internamente
     * Usado por: interface
     */
    aplicarTemaInicial() {
        this._aplicarTemaInicial();
    }

    /**
     * Adiciona controle de coordenadas para administradores
     * 
     * Exibe coordenadas em tempo real para facilitar adição de pontos
     * Usado por: _adicionarControlesAdmin()
     */
    adicionarControlesCoordenadas() {
        try {
            const controleCoordenadas = L.control({ position: 'bottomleft' });
            
            controleCoordenadas.onAdd = function() {
                const div = L.DomUtil.create('div', 'controle-coordenadas');
                div.style.cssText = `
                    background: rgba(255, 255, 255, 0.9);
                    padding: 5px 10px;
                    border-radius: 5px;
                    fontSize: 12px;
                    fontFamily: monospace;
                    border: 1px solid #ccc;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;
                div.innerHTML = 'Lat: -, Lng: -';
                return div;
            };

            controleCoordenadas.addTo(this.map);

            // Atualizar coordenadas no movimento do mouse
            this.map.on('mousemove', (e) => {
                const { lat, lng } = e.latlng;
                const div = document.querySelector('.controle-coordenadas');
                if (div) {
                    div.innerHTML = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
                }
            });
            
            console.log('📍 Controle de coordenadas adicionado');
        } catch (error) {
            console.error('❌ Erro ao adicionar controle de coordenadas:', error);
        }
    }

    // ==========================================
    // MÉTODOS DE CARREGAMENTO E EXIBIÇÃO
    // ==========================================

    /**
     * Mostra indicador de carregamento
     */
    mostrarCarregamento(texto = 'Carregando...') {
        const div = document.createElement('div');
        div.className = 'loading-overlay';
        div.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-size: 18px;
        `;
        div.innerHTML = `
            <div style="text-align: center;">
                <div style="border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #3498db; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto 10px;"></div>
                ${texto}
            </div>
        `;
        
        // Adicionar animação CSS
        if (!document.querySelector('#loading-animation-style')) {
            const style = document.createElement('style');
            style.id = 'loading-animation-style';
            style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(div);
        return div;
    }

    /**
     * Carregar todos os pontos no mapa
     */
    loadPoints() {
        if (!window.databaseManager) {
            console.warn('DatabaseManager não disponível');
            return;
        }
        
        // Obter contexto do usuário atual
        const user = window.authManager?.getCurrentUser();
        const userRole = user?.role || 'visitor';
        const username = user?.username || null;
        
        const pontos = window.databaseManager.buscarPorCategoria('todos', userRole, username);
        
        // Mostrar feedback visual imediato
        this._mostrarCarregamento(true);
        
        // Limpar marcadores existentes
        this.marcadores.forEach(marcador => {
            this.map.removeLayer(marcador);
        });
        this.marcadores.clear();

        // Carregar em lotes para melhor performance
        this._loadPointsInBatches(pontos);
    }

    /**
     * Limpar cache de ícones (útil quando categorias são atualizadas)
     */
    limparCacheIcones() {
        this.iconCache.clear();
        if (this._iconeCache) {
            this._iconeCache.clear();
        }
        console.log('Cache de ícones limpo');
    }

    /**
     * Recarregar todos os marcadores com ícones atualizados
     */
    recarregarMarcadores() {
        this.limparCacheIcones();
        // Recarregar pontos para aplicar novos ícones
        if (window.databaseManager) {
            this.carregarPontos();
        }
    }

    /**
     * Limpar todos os marcadores do mapa
     */
    clearMarkers() {
        try {
            console.log('🧹 Limpando marcadores existentes...');
            
            // Remover grupos do mapa e limpar suas camadas
            this.gruposPorCategoria.forEach((grupo, categoria) => {
                if (this.map.hasLayer(grupo)) {
                    this.map.removeLayer(grupo);
                    console.log(`➖ Grupo ${categoria} removido do mapa`);
                }
                grupo.clearLayers();
            });
            
            // Limpar todas as referências
            this.gruposPorCategoria.clear();
            this.marcadores.clear();
            
            console.log('Marcadores limpos');
        } catch (error) {
            console.error('❌ Erro ao limpar marcadores:', error);
        }
    }

    /**
     * Adicionar marcador ao mapa
     * @param {Object} ponto - Dados do ponto
     */
    addMarker(ponto) {
        try {
            if (!ponto || !ponto.id || !ponto.nome) {
                console.warn('Dados do ponto inválidos:', ponto);
                return;
            }

            // Verificar se já existe um marcador para este ponto
            if (this.marcadores && this.marcadores.has(ponto.id)) {
                console.log(`Marcador já existe para ponto ${ponto.id}, ignorando...`);
                return;
            }

            console.log(`📍 Adicionando marcador: ${ponto.nome} (ID: ${ponto.id})`);
            
            // Verificar coordenadas
            let coordenadas;
            if (ponto.coordenadas && Array.isArray(ponto.coordenadas) && ponto.coordenadas.length === 2) {
                coordenadas = ponto.coordenadas; // [latitude, longitude]
            } else if (ponto.latitude && ponto.longitude) {
                coordenadas = [ponto.latitude, ponto.longitude];
            } else {
                console.warn(`❌ Coordenadas inválidas para ponto: ${ponto.nome}`, ponto.coordenadas);
                return;
            }

            // Obter categoria ou usar padrão
            let categoria = null;
            if (window.databaseManager && window.databaseManager.obterCategoria) {
                categoria = window.databaseManager.obterCategoria(ponto.categoria);
            }
            
            if (!categoria) {
                console.warn(`⚠️ Categoria não encontrada: ${ponto.categoria}, usando padrão`);
                categoria = { 
                    id: ponto.categoria || 'geral', 
                    cor: '#3b82f6', 
                    icon: 'fas fa-map-marker-alt',
                    nome: ponto.categoria || 'Geral'
                };
            }
            
            // Criar ícone
            const isPendente = ponto.status === 'pendente';
            console.log(`Criando ícone para categoria: ${categoria.id} (pendente: ${isPendente})`);
            const icone = this._criarIconeOtimizado(categoria, isPendente);
            
            // Criar marcador
            const marcador = L.marker(coordenadas, {
                icon: icone,
                title: ponto.nome,
                riseOnHover: true
            });

            // Configurar eventos do marcador
            marcador.on('click', (e) => {
                e.originalEvent?.stopPropagation();
                this.selecionarPonto(ponto);
            });

            // Eventos de hover simples
            marcador.on('mouseover', () => {
                const element = marcador.getElement();
                if (element) {
                    const iconDiv = element.querySelector('.marker-icon');
                    if (iconDiv) {
                        iconDiv.style.transform = 'scale(1.1)';
                        iconDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.6)';
                    }
                }
            });

            marcador.on('mouseout', () => {
                const element = marcador.getElement();
                if (element && !element.classList.contains('marcador-selecionado')) {
                    const iconDiv = element.querySelector('.marker-icon');
                    if (iconDiv) {
                        iconDiv.style.transform = 'scale(1)';
                        iconDiv.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
                    }
                }
            });

            // Garantir que os grupos existam
            this._criarGruposBasicos();

            // Inicializar Map se necessário
            if (!this.marcadores) {
                this.marcadores = new Map();
            }

            // Adicionar ao grupo da categoria específica
            const categoriaId = categoria.id;
            if (!this.gruposPorCategoria.has(categoriaId)) {
                this.gruposPorCategoria.set(categoriaId, L.layerGroup());
            }
            const grupoCategoriaAtual = this.gruposPorCategoria.get(categoriaId);
            grupoCategoriaAtual.addLayer(marcador);
            
            // Adicionar também ao grupo "todos"
            if (!this.gruposPorCategoria.has('todos')) {
                this.gruposPorCategoria.set('todos', L.layerGroup());
            }
            const grupoTodos = this.gruposPorCategoria.get('todos');
            grupoTodos.addLayer(marcador);

            // *** IMPORTANTE: Adicionar os grupos ao mapa para que os marcadores apareçam ***
            if (!this.map.hasLayer(grupoCategoriaAtual)) {
                grupoCategoriaAtual.addTo(this.map);
                console.log(`Grupo da categoria ${categoriaId} adicionado ao mapa`);
            }
            
            if (!this.map.hasLayer(grupoTodos)) {
                grupoTodos.addTo(this.map);
                console.log('Grupo "todos" adicionado ao mapa');
            }

            // Salvar referência do marcador
            this.marcadores.set(ponto.id, marcador);
            
            console.log(`Marcador adicionado: ${ponto.nome} na categoria ${categoriaId}`);
            
            // Debug: Verificar se o marcador foi adicionado corretamente aos grupos
            console.log(`Debug grupos após adicionar marcador:`);
            console.log(`  - Grupo ${categoriaId}: ${grupoCategoriaAtual.getLayers().length} marcadores`);
            console.log(`  - Grupo todos: ${grupoTodos.getLayers().length} marcadores`);
            console.log(`  - Total marcadores salvos: ${this.marcadores.size}`);

        } catch (error) {
            console.error('❌ Erro ao adicionar marcador:', error, ponto);
        }
    }

    /**
     * Selecionar ponto e exibir no painel lateral
     * @param {Object} ponto - Dados do ponto
     */
    selecionarPonto(ponto) {
        try {
            console.log('Point selected:', ponto.nome);
            
            // Increment views
            this.incrementarViews(ponto.id);
            
            // Highlight selected marker
            this.destacarMarcadorSelecionado(ponto.id);
            
            // Show info panel - unified logic for all environments
            this.showInfoPanel(ponto);
            
        } catch (error) {
            console.error('Error selecting point:', error);
        }
    }

    /**
     * Unified info panel display - works for both file:// and http://
     */
    showInfoPanel(ponto) {
        // Try InfoPanelManager first (standard approach)
        if (window.infoPanelManager && typeof window.infoPanelManager.show === 'function') {
            try {
                window.infoPanelManager.show(ponto);
                return;
            } catch (error) {
                console.log('InfoPanelManager failed, using direct approach:', error.message);
            }
        }

        // Direct DOM manipulation - guaranteed to work everywhere
        this.renderInfoPanelDirect(ponto);
    }

    /**
     * Direct DOM rendering of info panel - unified approach
     */
    renderInfoPanelDirect(ponto) {
        const panel = document.getElementById('info-panel');
        const title = document.getElementById('info-panel-title');
        const body = document.getElementById('info-panel-body');
        const image = document.getElementById('info-panel-image');
        const placeholder = document.querySelector('.info-panel-image-placeholder');

        if (!panel || !title || !body) {
            console.error('Info panel elements not found');
            return;
        }

        // Set title
        title.textContent = ponto.nome || 'Local';

        // Handle image
        if (ponto.imagem && image && placeholder) {
            image.src = ponto.imagem;
            image.style.display = 'block';
            placeholder.style.display = 'none';
            image.onerror = () => {
                image.style.display = 'none';
                placeholder.style.display = 'flex';
            };
        } else if (placeholder) {
            if (image) image.style.display = 'none';
            placeholder.style.display = 'flex';
        }

        // Build content - same format for all environments
        body.innerHTML = `
            <div class="info-panel-section">
                <div class="info-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <div class="info-detail-content">
                        <h4>Endereço</h4>
                        <p>${ponto.endereco || 'Endereço não informado'}</p>
                    </div>
                </div>
            </div>
            
            ${ponto.categoria ? `
                <div class="info-panel-section">
                    <div class="info-detail">
                        <i class="fas fa-tag"></i>
                        <div class="info-detail-content">
                            <h4>Categoria</h4>
                            <p>${ponto.categoria}</p>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${ponto.descricao ? `
                <div class="info-panel-section">
                    <div class="info-detail">
                        <i class="fas fa-info-circle"></i>
                        <div class="info-detail-content">
                            <h4>Descrição</h4>
                            <p>${ponto.descricao}</p>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${ponto.contato ? `
                <div class="info-panel-section">
                    <div class="info-detail">
                        <i class="fas fa-phone"></i>
                        <div class="info-detail-content">
                            <h4>Contato</h4>
                            <p>${ponto.contato}</p>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="info-panel-actions">
                <button class="info-action-btn secondary" onclick="console.log('Route functionality')">
                    <i class="fas fa-route"></i>
                    <span>Como Chegar</span>
                </button>
                <button class="info-action-btn primary" onclick="console.log('Favorite functionality')" data-ponto-id="${ponto.id}">
                    <i class="fas fa-heart"></i>
                    <span>Favoritar</span>
                </button>
            </div>
        `;

        // Show panel - same animation for all environments
        document.body.classList.add('body-with-info-panel');
        panel.classList.remove('hidden');
        
        requestAnimationFrame(() => {
            panel.classList.add('visible');
        });

        // Setup close button - unified for all environments
        this.setupInfoPanelClose(panel);
    }

    /**
     * Setup close button for info panel
     */
    setupInfoPanelClose(panel) {
        const closeBtn = document.getElementById('info-panel-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                panel.classList.remove('visible');
                setTimeout(() => {
                    panel.classList.add('hidden');
                    document.body.classList.remove('body-with-info-panel');
                }, 300);
            };
        }
    }

    /**
     * Destacar marcador selecionado
     * @param {number} pontoId - ID do ponto
     */
    destacarMarcadorSelecionado(pontoId) {
        // Remover destaque de outros marcadores
        this.marcadores.forEach((marcador, id) => {
            const element = marcador.getElement();
            if (element) {
                element.classList.remove('marcador-selecionado');
            }
        });

        // Destacar marcador atual
        const marcadorAtual = this.marcadores.get(pontoId);
        if (marcadorAtual) {
            const element = marcadorAtual.getElement();
            if (element) {
                element.classList.add('marcador-selecionado');
            }
        }
    }

    /**
     * Obter ícone legível para categoria
     * @param {Object} categoria - Dados da categoria
     * @returns {string} Emoji ou ícone legível
     */
    obterIconeLegivel(categoria) {
        if (!categoria) return '📍';
        
        // Mapear categorias para emojis legíveis
        const mapaIcones = {
            'geral': '🎭',
            'esportes-lazer': '⚽',
            'gastronomia': '🍽️',
            'geek-nerd': '🎮',
            'casas-noturnas': '🍻'
            // !TODO: Implementar sistema de favoritos
            // 'favoritos': '❤️'
        };
        
        // Tentar encontrar por ID da categoria
        if (mapaIcones[categoria.id]) {
            return mapaIcones[categoria.id];
        }
        
        // Fallback para ícone padrão
        return '📍';
    }

    /**
     * Filtrar pontos por categoria
     * @param {string} categoria - Categoria a filtrar
     */
    filterByCategory(categoria, username = null) {
        console.log(`Iniciando filtro por categoria: ${categoria}`);
        console.log(`Grupos disponíveis:`, Array.from(this.gruposPorCategoria.keys()));
        
        // Garantir que os grupos existam
        if (!this.gruposPorCategoria.size) {
            console.log('📍 Inicializando grupos de categorias...');
            this._inicializarGruposCategorias();
        }

        // Remover TODOS os grupos ativos do mapa primeiro
        let gruposRemovidos = 0;
        this.gruposPorCategoria.forEach((grupo, cat) => {
            if (this.map.hasLayer(grupo)) {
                this.map.removeLayer(grupo);
                gruposRemovidos++;
                console.log(`➖ Removido grupo: ${cat} (${grupo.getLayers().length} pontos)`);
            }
        });
        console.log(`Total de grupos removidos: ${gruposRemovidos}`);

        // !TODO: Implementar sistema de favoritos
        // Lógica especial para favoritos
        // if (categoria === 'favoritos' && username) {
        //     this.filtrarFavoritos(username);
        //     this.activeCategory = categoria;
        //     console.log(`Filtro de favoritos aplicado para: ${username}`);
        //     return;
        // }
        
        if (categoria === 'favoritos') {
            console.log('Sistema de favoritos em desenvolvimento');
            return;
        }

        // Adicionar grupo da categoria selecionada
        if (categoria === 'todos') {
            // Mostrar todos os pontos - adicionar todos os grupos de categorias reais
            let gruposAdicionados = 0;
            let totalPontos = 0;
            this.gruposPorCategoria.forEach((grupo, cat) => {
                if (cat !== 'favoritos' && cat !== 'todos') {
                    this.map.addLayer(grupo);
                    gruposAdicionados++;
                    totalPontos += grupo.getLayers().length;
                    console.log(`➕ Adicionado grupo: ${cat} (${grupo.getLayers().length} pontos)`);
                }
            });
            this.activeCategory = 'todos';
            console.log(`Mostrando todos os pontos (${gruposAdicionados} grupos, ${totalPontos} pontos total)`);
        } else if (this.gruposPorCategoria.has(categoria)) {
            // Mostrar apenas pontos da categoria específica
            const grupo = this.gruposPorCategoria.get(categoria);
            this.map.addLayer(grupo);
            this.activeCategory = categoria;
            console.log(`Mostrando pontos da categoria: ${categoria} (${grupo.getLayers().length} pontos)`);
        } else {
            // Categoria não existe, fallback para "todos"
            console.warn(`⚠️ Categoria '${categoria}' não encontrada, mostrando todos`);
            let gruposAdicionados = 0;
            let totalPontos = 0;
            this.gruposPorCategoria.forEach((grupo, cat) => {
                if (cat !== 'favoritos' && cat !== 'todos') {
                    this.map.addLayer(grupo);
                    gruposAdicionados++;
                    totalPontos += grupo.getLayers().length;
                    console.log(`➕ Adicionado grupo (fallback): ${cat} (${grupo.getLayers().length} pontos)`);
                }
            });
            this.activeCategory = 'todos';
        }

        console.log(`Filtro aplicado: ${this.activeCategory}`);
        
        // Verificar quantos pontos estão visíveis no mapa
        let pontosVisiveis = 0;
        this.gruposPorCategoria.forEach((grupo, cat) => {
            if (this.map.hasLayer(grupo)) {
                pontosVisiveis += grupo.getLayers().length;
            }
        });
        console.log(`Total de pontos visíveis: ${pontosVisiveis}`);
        
        // Notificar sobre o resultado do filtro
        this.showFilterNotification(categoria, pontosVisiveis);
    }

    /**
     * Mostrar notificação sobre o resultado do filtro
     * @param {string} categoria - Categoria filtrada
     * @param {number} quantidade - Quantidade de pontos visíveis
     */
    showFilterNotification(categoria, quantidade) {
        try {
            let message = '';
            
            if (categoria === 'todos') {
                message = `Exibindo todos os pontos (${quantidade} locais)`;
            } else if (categoria === 'favoritos') {
                message = quantidade > 0 ? 
                    `Seus favoritos (${quantidade} locais)` : 
                    'Você ainda não possui favoritos';
            } else {
                // Obter nome da categoria do banco de dados
                const categoriaInfo = window.databaseManager?.obterCategoria(categoria);
                const nomeCategoria = categoriaInfo ? categoriaInfo.nome : categoria;
                
                message = quantidade > 0 ? 
                    `${nomeCategoria}: ${quantidade} ${quantidade === 1 ? 'local' : 'locais'}` :
                    `Nenhum local encontrado em ${nomeCategoria}`;
            }

            // Usar sistema de notificação se disponível
            if (window.infoPanelManager && typeof window.infoPanelManager.showNotification === 'function') {
                const type = quantidade > 0 ? 'info' : 'warning';
                window.infoPanelManager.showNotification(message, type);
            } else {
                console.log(`📊 ${message}`);
            }
            
        } catch (error) {
            console.error('Erro ao exibir notificação de filtro:', error);
        }
    }

    /**
     * Filtrar apenas pontos favoritos do usuário - FUNCIONALIDADE EM DESENVOLVIMENTO
     * !TODO: Implementar sistema completo de favoritos
     */
    filtrarFavoritos(username) {
        console.log('!TODO: Implementar filtrarFavoritos - username:', username);
        console.log('Sistema de favoritos em desenvolvimento');
        // Função temporariamente desabilitada
        return;
    }

    /**
     * Recarregar pontos baseado no papel do usuário
     * Otimizado com carregamento em lotes
     */
    reloadPoints(userRole = 'visitor', username = null) {
        try {
            console.log(`Recarregando pontos para ${userRole}...`);
            
            // Verificar se o mapa foi inicializado
            if (!this.map) {
                console.warn('⚠️ Mapa não foi inicializado, inicializando agora...');
                this.init();
                if (!this.map) {
                    console.error('❌ Falha ao inicializar o mapa');
                    return;
                }
            }
            
            // Verificar se o DatabaseManager está disponível
            if (!window.databaseManager) {
                console.error('❌ DatabaseManager não disponível');
                return;
            }
            
            // Mostrar indicador de carregamento
            this._mostrarCarregamento(true);
            
            // UNIFIED: Get points based on user profile (all users see confirmed + hidden)
            let pontos;
            if (userRole === 'administrator') {
                // Admins see everything: confirmed + pending + hidden
                const confirmados = window.databaseManager.getPontos() || [];
                const pendentes = window.databaseManager.getPontosPendentes() || [];
                pontos = [...confirmados, ...pendentes];
            } else {
                // Regular users see confirmed + hidden (unified with Python server)
                pontos = window.databaseManager.getPontos() || [];
            }

            console.log(`📦 ${pontos.length} pontos obtidos do banco de dados`);

            // Debug: mostrar alguns pontos de exemplo
            if (pontos.length > 0) {
                console.log('Exemplo de pontos:', pontos.slice(0, 3).map(p => ({
                    id: p.id, 
                    nome: p.nome, 
                    categoria: p.categoria,
                    coordenadas: p.coordenadas,
                    ativo: p.ativo
                })));
                
                // Verificar se há coordenadas válidas
                const pontosComCoordenadas = pontos.filter(p => 
                    p.coordenadas && Array.isArray(p.coordenadas) && p.coordenadas.length === 2
                );
                console.log(`📍 Pontos com coordenadas válidas: ${pontosComCoordenadas.length}`);
            } else {
                console.warn('⚠️ Nenhum ponto encontrado no DatabaseManager');
                
                // Tentar forçar recarregamento do DatabaseManager
                if (window.databaseManager.carregarTodosDados) {
                    console.log('Tentando recarregar dados do DatabaseManager...');
                    window.databaseManager.loadAllData().then(() => {
                        console.log('Dados recarregados, tentando novamente...');
                        setTimeout(() => this.reloadPoints(userRole, username), 100);
                    }).catch(error => {
                        console.error('❌ Erro ao recarregar DatabaseManager:', error);
                        this._mostrarCarregamento(false);
                    });
                    return;
                } else {
                    this._mostrarCarregamento(false);
                    return;
                }
            }

            // Limpar estado anterior completamente
            console.log('Limpando estado anterior...');
            this.clearMarkers();
            this.limparCacheIcones();

            // Recriar grupos básicos
            console.log('📁 Criando grupos básicos...');
            this._criarGruposBasicos();
            
            // Se não há pontos, finalizar aqui
            if (pontos.length === 0) {
                console.log('Nenhum ponto para carregar');
                this._finalizarCarregamento(0);
                return;
            }
            
            // Carregar pontos em lotes para melhor performance
            console.log('📍 Iniciando carregamento em lotes...');
            this._loadPointsInBatches(pontos);

        } catch (error) {
            console.error('❌ Erro ao recarregar pontos:', error);
            this._mostrarCarregamento(false);
        }
    }

    /**
     * Atualizar marcador
     * @param {Object} ponto - Dados atualizados do ponto
     */
    atualizarMarcador(ponto) {
        if (this.marcadores.has(ponto.id)) {
            // Remover marcador antigo
            this.removeMarker(ponto.id);
            
            // Adicionar marcador atualizado
            this.addMarker(ponto);
        }
    }

    /**
     * Remover marcador
     * @param {number} id - ID do ponto
     */
    removeMarker(id) {
        if (this.marcadores.has(id)) {
            const marcador = this.marcadores.get(id);
            
            // Remover de todos os grupos
            this.gruposPorCategoria.forEach(grupo => {
                grupo.removeLayer(marcador);
            });
            
            // Remover do mapa
            this.map.removeLayer(marcador);
            
            // Remover da referência
            this.marcadores.delete(id);
        }
    }

    /**
     * Incrementar visualizações do ponto
     * @param {number} id - ID do ponto
     */
    incrementarViews(id) {
        const ponto = databaseManager.obterPonto(id);
        if (ponto && ponto.metadata) {
            ponto.metadata.views = (ponto.metadata.views || 0) + 1;
            databaseManager.salvarNoLocalStorage();
        }
    }

    /**
     * Iniciar modo de adição de ponto
     * @param {Object} latlng - Coordenadas do clique
     */
    iniciarAdicaoPonto(latlng) {
        if (!authManager.isAdmin()) {
            return;
        }

        // Disparar evento para abrir modal de adição
        const event = new CustomEvent('abrirModalAdicao', {
            detail: {
                coordenadas: [latlng.lat, latlng.lng]
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Ativar/desativar modo de adição
     * @param {boolean} ativo - Se o modo deve estar ativo
     */
    setModoAdicao(ativo) {
        this.modoAdicao = ativo;
        
        // Alterar cursor do mapa
        if (ativo) {
            this.map.getContainer().style.cursor = 'crosshair';
        } else {
            this.map.getContainer().style.cursor = '';
        }
    }

    /**
     * Centralizar mapa em ponto específico
     * @param {number} id - ID do ponto
     */
    centralizarEm(id) {
        const ponto = databaseManager.obterPonto(id);
        if (ponto) {
            this.map.setView(ponto.coordenadas, 16);
            
            // Abrir popup do marcador
            if (this.marcadores.has(id)) {
                this.marcadores.get(id).openPopup();
            }
        }
    }

    /**
     * Editar ponto (placeholder para integração com modal)
     * @param {number} id - ID do ponto
     */
    editarPonto(id) {
        const event = new CustomEvent('editarPonto', {
            detail: { id }
        });
        document.dispatchEvent(event);
    }

    /**
     * Remover ponto com confirmação
     * @param {number} id - ID do ponto
     */
    async removerPonto(id) {
        const ponto = databaseManager.obterPonto(id);
        if (!ponto) return;

        const confirmacao = confirm(`Tem certeza que deseja remover "${ponto.nome}"?`);
        if (confirmacao) {
            try {
                await databaseManager.deletarPonto(id);
                alert('Ponto removido com sucesso!');
            } catch (error) {
                alert('Erro ao remover ponto: ' + error.message);
            }
        }
    }

    /**
     * Atualizar controles administrativos
     * @param {boolean} isAdmin - Se o usuário é admin
     */
    atualizarControlesAdmin(isAdmin) {
        if (isAdmin && !document.querySelector('.controle-coordenadas')) {
            this.adicionarControlesCoordenadas();
        }
    }

    /**
     * Buscar pontos próximos à posição atual
     * @param {number} raio - Raio em km
     */
    buscarProximos(raio = 2) {
        const centro = this.map.getCenter();
        
        // Obter contexto do usuário atual
        const user = window.authManager?.getCurrentUser();
        const userRole = user?.role || 'visitor';
        const username = user?.username || null;
        
        const pontos = databaseManager.buscarPorProximidade(centro.lat, centro.lng, raio, userRole, username);
        
        // Destacar pontos próximos
        this.destacarPontos(pontos.map(p => p.id));
        
        return pontos;
    }

    /**
     * Destacar pontos específicos
     * @param {Array} ids - IDs dos pontos a destacar
     */
    destacarPontos(ids) {
        // Remover destaques anteriores
        this.marcadores.forEach(marcador => {
            marcador.setOpacity(0.5);
        });

        // Destacar pontos selecionados
        ids.forEach(id => {
            if (this.marcadores.has(id)) {
                this.marcadores.get(id).setOpacity(1);
            }
        });

        // Restaurar opacidade após 5 segundos
        setTimeout(() => {
            this.marcadores.forEach(marcador => {
                marcador.setOpacity(1);
            });
        }, 5000);
    }

    /**
     * Centralizar mapa em Brasília
     */
    centralizarBrasilia() {
        const centro = [-15.794700, -47.890000];
        this.map.setView(centro, 11);
    }

    /**
     * Obter bounds de todos os pontos
     * @returns {Object} Bounds do Leaflet
     */
    obterBoundsPontos() {
        // Obter contexto do usuário atual
        const user = window.authManager?.getCurrentUser();
        const userRole = user?.role || 'visitor';
        const username = user?.username || null;
        
        const pontos = databaseManager.buscarPorCategoria('todos', userRole, username);
        if (pontos.length === 0) return null;

        const coordenadas = pontos.map(p => p.coordenadas);
        return L.latLngBounds(coordenadas);
    }

    /**
     * Ajustar zoom para mostrar todos os pontos
     */
    ajustarZoomParaTodos() {
        const bounds = this.obterBoundsPontos();
        if (bounds) {
            this.map.fitBounds(bounds, { padding: [20, 20] });
        }
    }

    /**
     * Força redimensionamento do mapa - útil após mudanças de layout
     */
    forcarRedimensionamento() {
        if (this.map) {
            console.log('Forçando redimensionamento do mapa...');
            this.map.invalidateSize(true);
            
            // Segunda invalidação para garantir
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize(true);
                }
            }, 100);
        }
    }

    /**
     * Mostrar/Ocultar indicador de carregamento do mapa (otimizado)
     * @private
     */
    _mostrarCarregamento(mostrar) {
        const mapContainer = document.getElementById(this.containerId);
        if (!mapContainer) return;
        
        let loadingIndicator = mapContainer.querySelector('.map-loading');
        
        if (mostrar && !loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'map-loading';
            loadingIndicator.innerHTML = `
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    z-index: 1000;
                    font-size: 14px;
                    font-family: Arial, sans-serif;
                ">
                    ⚡ Carregando...
                </div>
            `;
            mapContainer.appendChild(loadingIndicator);
        } else if (!mostrar && loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    /**
     * Carregar pontos em lotes para melhor performance
     * @private
     */
    _loadPointsInBatches(pontos) {
        const BATCH_SIZE = 100; // Aumentado de 50 para 100 pontos por vez para carregamento mais rápido
        const BATCH_DELAY = 5; // Reduzido de 10ms para 5ms entre cada lote
        
        let indice = 0;
        const totalPontos = pontos.length;
        
        const processarLote = () => {
            const loteAtual = pontos.slice(indice, indice + BATCH_SIZE);
            
            // Processar lote atual
            loteAtual.forEach(ponto => {
                try {
                    this.addMarker(ponto);
                } catch (error) {
                    console.error(`Erro ao adicionar ponto ${ponto.id}:`, error);
                }
            });
            
            indice += BATCH_SIZE;
            
            // Atualizar progresso visual
            const progresso = Math.min(100, Math.round((indice / totalPontos) * 100));
            this._atualizarProgressoCarregamento(progresso);
            
            // Processar próximo lote ou finalizar
            if (indice < totalPontos) {
                setTimeout(processarLote, BATCH_DELAY);
            } else {
                this._finalizarCarregamento(totalPontos);
            }
        };
        
        // Iniciar processamento
        console.log(`📍 Iniciando carregamento de ${totalPontos} pontos em lotes...`);
        processarLote();
    }

    /**
     * Atualizar progresso do carregamento
     * @private
     */
    _atualizarProgressoCarregamento(progresso) {
        const mapContainer = document.getElementById(this.containerId);
        const loadingIndicator = mapContainer?.querySelector('.map-loading span');
        if (loadingIndicator) {
            loadingIndicator.textContent = `Carregando pontos... ${progresso}%`;
        }
    }

    /**
     * Finalizar carregamento com feedback
     * @private
     */
    _finalizarCarregamento(totalPontos) {
        console.log(`${totalPontos} pontos carregados com sucesso`);
        
        // Aplicar filtro para garantir que os marcadores sejam visíveis
        setTimeout(() => {
            const categoriaAtual = this.activeCategory || 'todos';
            console.log(`Aplicando filtro final: ${categoriaAtual}`);
            this.filterByCategory(categoriaAtual);
        }, 50);
        
        // Remover indicador de carregamento rapidamente (otimização)
        setTimeout(() => {
            this._mostrarCarregamento(false);
        }, 100); // Reduzido de 500ms para 100ms
        
        // Dispatch evento de carregamento completo
        window.dispatchEvent(new CustomEvent('mapaPontosCarregados', { 
            detail: { totalPontos } 
        }));
    }

    /**
     * Cache de ícones para evitar recriação desnecessária
     * @private
     */
    _obterIconeCache(categoria, isPendente = false) {
        const cacheKey = `${categoria.id}_${isPendente}_${window.innerWidth <= 768 ? 'mobile' : (window.innerWidth <= 1024 ? 'tablet' : 'desktop')}`;
        
        if (!this._iconeCache) {
            this._iconeCache = new Map();
        }
        
        if (!this._iconeCache.has(cacheKey)) {
            const icone = this._criarIconeOtimizado(categoria, isPendente);
            this._iconeCache.set(cacheKey, icone);
        }
        
        return this._iconeCache.get(cacheKey);
    }

    /**
     * Criar ícone otimizado (simplificado e mais robusto)
     * @private
     */
    _criarIconeOtimizado(categoria, isPendente = false) {
        // Tamanhos responsivos
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 1024;
        
        let tamanho, fontSize;
        if (isMobile) {
            tamanho = 48;
            fontSize = 26;
        } else if (isTablet) {
            tamanho = 42;
            fontSize = 22;
        } else {
            tamanho = 38;
            fontSize = 20;
        }
        
        const cor = categoria?.cor || '#3b82f6';
        const icon = categoria?.icon || 'fas fa-map-marker-alt';
        const opacity = isPendente ? 0.7 : 1;
        const borderStyle = isPendente ? 'dashed' : 'solid';
        
        return L.divIcon({
            className: 'marcador-otimizado',
            html: `
                <div class="marker-icon" style="
                    width: ${tamanho}px !important;
                    height: ${tamanho}px !important;
                    background-color: ${cor};
                    color: white;
                    border-radius: 50%;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border: 3px ${borderStyle} white !important;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.4) !important;
                    font-size: ${fontSize}px !important;
                    opacity: ${opacity};
                    cursor: pointer !important;
                    position: relative !important;
                    z-index: 1000 !important;
                    transition: all 0.2s ease !important;
                ">
                    <i class="${icon}" style="
                        color: white !important;
                        font-size: ${fontSize}px !important;
                        line-height: 1 !important;
                        pointer-events: none !important;
                    "></i>
                </div>
            `,
            iconSize: [tamanho, tamanho],
            iconAnchor: [tamanho / 2, tamanho / 2],
            popupAnchor: [0, -tamanho / 2],
            className: 'marcador-leaflet'
        });
    }
}

// Criar instância global sem inicializar automaticamente
const mapManager = new MapManager();

// Função para inicializar o mapa após DOM estar pronto
function inicializarMapa(containerId = 'map') {
    if (!mapManager.map) {
        mapManager.init();
    }
    return mapManager;
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MapManager, inicializarMapa };
}

// Disponibilizar globalmente
window.MapManager = MapManager;
window.mapManager = mapManager;
window.inicializarMapa = inicializarMapa;

// Adicionar CSS otimizado para marcadores
if (!document.querySelector('#map-markers-css')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'map-markers-css';
    styleSheet.textContent = `
        .marcador-otimizado {
            overflow: visible !important;
            z-index: 1000 !important;
        }
        
        .marcador-otimizado .marker-icon {
            width: 100%;
            height: 100%;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
            overflow: visible !important;
            position: relative;
        }
        
        .marcador-otimizado .marker-icon:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            z-index: 1001;
        }
        
        .marcador-otimizado .marker-icon i {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        }
        
        /* Garantir visibilidade em todos os dispositivos */
        .leaflet-marker-icon.marcador-otimizado {
            overflow: visible !important;
            z-index: 1000 !important;
        }
        
        /* Correção para marcadores cortados */
        .leaflet-marker-pane {
            overflow: visible !important;
        }
        
        .leaflet-map-pane {
            overflow: visible !important;
        }
    `;
    document.head.appendChild(styleSheet);
}
