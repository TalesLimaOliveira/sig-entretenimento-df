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
 * @author Sistema de Entretenimento DF
 * @version 2.0.0
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
        
        // Gerenciamento de marcadores
        this.marcadores = new Map();              // Mapa de marcadores por ID
        this.gruposPorCategoria = new Map();      // Grupos de marcadores por categoria
        
        // Estado da aplicação
        this.activeCategory = 'todos';           // Categoria atualmente filtrada
        this.popupAberto = null;                 // ID do popup atualmente aberto
        this.modoAdicao = false;                 // Se está em modo de adição de pontos
        
        // Constantes do mapa
        this.BRASILIA_CENTER = [-15.794700, -47.890000];
        this.DEFAULT_ZOOM = 11;
        this.MIN_ZOOM = 10;
        this.MAX_ZOOM = 18;
        this.DF_BOUNDS = L.latLngBounds(
            [-16.5, -48.5], // Southwest
            [-15.3, -47.2]  // Northeast
        );
        
        // Inicializar
        this.init();
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
            console.log('🗺️ Inicializando MapManager...');
            
            // Validar pré-requisitos
            this._validarPreRequisitos();
            
            // Inicializar componentes na ordem correta
            this._criarMapa();
            this._configurarCamadas();
            this._aplicarTemaInicial();
            this._configurarEventListeners();
            this._configurarControles();
            this._configurarResponsividade();
            
            console.log('✅ MapManager inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar MapManager:', error);
            throw error;
        }
    }

    /**
     * Valida pré-requisitos para inicialização
     * @private
     * @throws {Error} Se requisitos não atendidos
     */
    _validarPreRequisitos() {
        // Verificar se o container existe
        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error(`Container '${this.containerId}' não encontrado`);
        }
        
        // Verificar se Leaflet está disponível
        if (typeof L === 'undefined') {
            throw new Error('Leaflet não está carregado');
        }
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
                // Aguardar um pouco para garantir que o container está dimensionado
                setTimeout(() => {
                    this.map.invalidateSize();
                }, 100);
            }
        }, 100));
        
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
            console.log(`🗺️ Container dimensions: ${rect.width}x${rect.height}`);
            
            // Se o container não tem altura, aguardar um pouco
            if (rect.height === 0) {
                console.log('⚠️ Container sem altura, aguardando...');
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
        
        // Forçar uma invalidação inicial após um breve delay
        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize(true);
                console.log('✅ Mapa inicializado e redimensionado');
            }
        }, 100);
        
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
        // Criar e adicionar camada de ruas otimizada
        this.camadaRuas = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '', // Removido para interface limpa
            loading: 'lazy', // Carregamento otimizado
            crossOrigin: true
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
     * Usado por: _configurarCamadas(), filtrarPorCategoria()
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

        // Grupo especial para "todos" (não adicionado automaticamente)
        this.gruposPorCategoria.set('todos', L.layerGroup());

        // Aguardar DatabaseManager estar disponível
        if (window.databaseManager) {
            try {
                const categorias = window.databaseManager.getCategorias();
                
                // Criar grupo para cada categoria
                categorias.forEach(categoria => {
                    this.gruposPorCategoria.set(categoria.id, L.layerGroup());
                });

                // Carregar pontos se disponíveis
                const pontos = pontosCustomizados || this._obterPontosParaCarregar();
                if (pontos && pontos.length > 0) {
                    this._carregarPontos(pontos);
                }
                
                console.log(`📍 Grupos de categorias inicializados: ${categorias.length} categorias`);
            } catch (error) {
                console.error('❌ Erro ao inicializar grupos de categorias:', error);
            }
        } else {
            console.warn('⚠️ DatabaseManager não disponível para inicializar categorias');
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
            console.warn('⚠️ DatabaseManager não disponível');
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
            console.error('❌ Erro ao obter pontos:', error);
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
    _carregarPontos(pontos) {
        try {
            console.log(`📍 Carregando ${pontos.length} pontos no mapa...`);
            
            // Limpar marcadores existentes
            this.limparMarcadores();
            
            // Adicionar cada ponto
            pontos.forEach((ponto, index) => {
                try {
                    this.adicionarMarcador(ponto);
                } catch (error) {
                    console.error(`❌ Erro ao adicionar ponto ${ponto.id || index}:`, error);
                }
            });
            
            console.log(`✅ ${pontos.length} pontos carregados com sucesso`);
        } catch (error) {
            console.error('❌ Erro ao carregar pontos:', error);
        }
    }

    /**
     * Aplica tema inicial baseado nas preferências salvas
     * 
     * Usado por: init()
     * @private
     */
    _aplicarTemaInicial() {
        try {
            // O tema será aplicado via CSS, aqui apenas configuramos o mapa
            if (window.themeManager) {
                const temaAtual = window.themeManager.getTemaAtual();
                this._aplicarTemaNoMapa(temaAtual === 'dark');
            }
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
            console.log(`🎨 Tema ${temaEscuro ? 'escuro' : 'claro'} aplicado ao mapa`);
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
            this.adicionarMarcador(e.detail);
        });

        // Ponto atualizado
        document.addEventListener('database_pontoAtualizado', (e) => {
            this.atualizarMarcador(e.detail);
        });

        // Ponto removido
        document.addEventListener('database_pontoRemovido', (e) => {
            this.removerMarcador(e.detail.id);
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
            this.recarregarPontos();
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
            
            console.log('🎛️ Controles do mapa configurados');
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
        // Implementar se necessário
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
        // Implementar se controles específicos forem adicionados
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
     * Usado por: ThemeManager, interface
     */
    alternarTemaMapa(temaEscuro = false) {
        try {
            this._aplicarTemaNoMapa(temaEscuro);
            console.log(`🎨 Tema do mapa alterado para ${temaEscuro ? 'escuro' : 'claro'}`);
        } catch (error) {
            console.error('❌ Erro ao alterar tema do mapa:', error);
        }
    }

    /**
     * Aplica tema inicial baseado nas configurações salvas
     * 
     * Método público mantido para compatibilidade com código legado
     * @deprecated Use _aplicarTemaInicial() internamente
     * Usado por: ThemeManager (legado)
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
    carregarPontos() {
        if (!window.databaseManager) {
            console.warn('DatabaseManager não disponível');
            return;
        }
        
        // Obter contexto do usuário atual
        const user = window.authManager?.getCurrentUser();
        const userRole = user?.role || 'visitor';
        const username = user?.username || null;
        
        const pontos = window.databaseManager.buscarPorCategoria('todos', userRole, username);
        
        // Limpar marcadores existentes
        this.marcadores.forEach(marcador => {
            this.map.removeLayer(marcador);
        });
        this.marcadores.clear();

        // Adicionar novos marcadores
        pontos.forEach(ponto => {
            this.adicionarMarcador(ponto);
        });

        // ${pontos.length} pontos carregados no mapa
    }

    /**
     * Limpar todos os marcadores do mapa
     */
    limparMarcadores() {
        try {
            console.log('🧹 Limpando marcadores existentes...');
            
            // Remover todos os marcadores dos grupos
            this.gruposPorCategoria.forEach((grupo, categoria) => {
                grupo.clearLayers();
            });
            
            // Limpar a lista de marcadores
            this.marcadores.clear();
            
            console.log('✅ Marcadores limpos');
        } catch (error) {
            console.error('❌ Erro ao limpar marcadores:', error);
        }
    }

    /**
     * Adicionar marcador ao mapa
     * @param {Object} ponto - Dados do ponto
     */
    adicionarMarcador(ponto) {
        try {
            if (!window.databaseManager) {
                console.warn('DatabaseManager não disponível');
                return;
            }
            
            const categoria = window.databaseManager.obterCategoria(ponto.categoria);
            if (!categoria) {
                console.warn(`⚠️ Categoria não encontrada: ${ponto.categoria}`);
                return;
            }

            // Criar ícone personalizado
            const icone = this.criarIconePersonalizado(categoria, ponto);

            // Criar coordenadas (latitude, longitude)
            // Verificar se temos coordenadas no formato array ou propriedades separadas
            let coordenadas;
            if (ponto.coordenadas && Array.isArray(ponto.coordenadas)) {
                coordenadas = ponto.coordenadas; // [latitude, longitude]
            } else if (ponto.latitude && ponto.longitude) {
                coordenadas = [ponto.latitude, ponto.longitude];
            } else {
                console.warn(`⚠️ Coordenadas inválidas para ponto: ${ponto.nome}`, ponto);
                return;
            }

            // Criar marcador
            const marcador = L.marker(coordenadas, {
                icon: icone,
                title: ponto.nome
            });

            // Configurar eventos do marcador para usar painel lateral
            marcador.on('click', () => {
                this.selecionarPonto(ponto);
            });

            // Eventos de hover para feedback visual sutil (sem mover o ícone)
            marcador.on('mouseover', () => {
                const element = marcador.getElement();
                if (element) {
                    const iconDiv = element.querySelector('div');
                    if (iconDiv) {
                        iconDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.6)';
                        iconDiv.style.filter = 'brightness(1.1)';
                        // Não alterar transform para não interferir com posicionamento do Leaflet
                    }
                }
            });

            marcador.on('mouseout', () => {
                const element = marcador.getElement();
                if (element && !element.classList.contains('marcador-selecionado')) {
                    const iconDiv = element.querySelector('div');
                    if (iconDiv) {
                        iconDiv.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
                        iconDiv.style.filter = 'brightness(1)';
                        // Não alterar transform para não interferir com posicionamento do Leaflet
                    }
                }
            });

            // Garantir que grupos existem
            if (!this.gruposPorCategoria.has('todos')) {
                this.gruposPorCategoria.set('todos', L.layerGroup());
            }
            if (!this.gruposPorCategoria.has(ponto.categoria)) {
                this.gruposPorCategoria.set(ponto.categoria, L.layerGroup());
            }

            // Adicionar APENAS ao grupo da categoria específica
            // Os grupos serão adicionados/removidos do mapa conforme o filtro ativo
            if (this.gruposPorCategoria.has(ponto.categoria)) {
                this.gruposPorCategoria.get(ponto.categoria).addLayer(marcador);
            }

            // Salvar referência
            this.marcadores.set(ponto.id, marcador);

        } catch (error) {
            console.error('❌ Erro ao adicionar marcador:', error);
        }
    }

    /**
     * Selecionar ponto e exibir no painel lateral
     * @param {Object} ponto - Dados do ponto
     */
    selecionarPonto(ponto) {
        try {
            console.log('📍 Ponto selecionado:', ponto.nome);
            
            // Incrementar visualizações
            this.incrementarViews(ponto.id);
            
            // Exibir no painel lateral
            if (window.infoPanelManager) {
                window.infoPanelManager.show(ponto);
            } else {
                console.warn('⚠️ InfoPanelManager não disponível');
            }
            
            // Destacar marcador selecionado
            this.destacarMarcadorSelecionado(ponto.id);
            
        } catch (error) {
            console.error('❌ Erro ao selecionar ponto:', error);
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
            'cultura': '🎭',
            'gastronomia': '🍴',
            'noturno': '🍺',
            'esportes': '⚽',
            'geral': '📍',
            'teatro': '🎭',
            'museu': '🏛️',
            'parque': '🌳',
            'restaurante': '🍽️',
            'bar': '🍻',
            'clube': '🎵',
            'academia': '🏋️',
            'shopping': '🛍️'
        };
        
        // Tentar encontrar por ID da categoria
        if (mapaIcones[categoria.id]) {
            return mapaIcones[categoria.id];
        }
        
        // Tentar encontrar por nome da categoria (convertido para minúsculo)
        const nomeCategoria = categoria.nome?.toLowerCase() || '';
        for (const [chave, icone] of Object.entries(mapaIcones)) {
            if (nomeCategoria.includes(chave)) {
                return icone;
            }
        }
        
        // Fallback para ícone padrão
        return '📍';
    }

    /**
     * Criar ícone personalizado
     * @param {Object} categoria - Dados da categoria
     * @returns {Object} Ícone Leaflet
     */
    criarIconePersonalizado(categoria, ponto = null) {
        // Tamanho aumentado para melhor usabilidade em touch
        const tamanho = window.innerWidth <= 768 ? 32 : 28; // Maior em mobile
        const borderWidth = window.innerWidth <= 768 ? 4 : 3;
        
        // Verificar se é ponto pendente
        const isPendente = ponto && ponto.status === 'pendente';
        const corBorda = isPendente ? '#f59e0b' : 'white'; // Borda dourada para pendentes
        const indicadorPendente = isPendente ? `
            <div style="
                position: absolute;
                top: -2px;
                right: -2px;
                width: 8px;
                height: 8px;
                background: #f59e0b;
                border-radius: 50%;
                border: 1px solid white;
                z-index: 1000;
            "></div>
        ` : '';
        
        return L.divIcon({
            className: 'marcador-personalizado',
            html: `
                <div style="
                    position: relative;
                    background-color: ${categoria?.cor || '#999'};
                    width: ${tamanho}px;
                    height: ${tamanho}px;
                    border: ${borderWidth}px solid ${corBorda};
                    border-radius: 50%;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: ${Math.floor(tamanho * 0.5)}px;
                    color: white;
                    cursor: pointer;
                    position: relative;
                    transform: none;
                ">
                    <i class="${categoria?.icon || 'fas fa-map-marker-alt'}"></i>
                    ${indicadorPendente}
                </div>
            `,
            iconSize: [tamanho, tamanho],
            iconAnchor: [tamanho / 2, tamanho / 2], // Centro do ícone nas coordenadas
            popupAnchor: [0, -(tamanho / 2)] // Popup acima do ícone
        });
    }

    /**
     * Filtrar pontos por categoria
     * @param {string} categoria - Categoria a filtrar
     */
    filtrarPorCategoria(categoria, username = null) {
        console.log(`🔍 Iniciando filtro por categoria: ${categoria}`);
        console.log(`📋 Grupos disponíveis:`, Array.from(this.gruposPorCategoria.keys()));
        
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
                console.log(`➖ Removido grupo: ${cat}`);
            }
        });
        console.log(`🗑️ Total de grupos removidos: ${gruposRemovidos}`);

        // Lógica especial para favoritos
        if (categoria === 'favoritos' && username) {
            this.filtrarFavoritos(username);
            this.categoriaAtiva = categoria;
            console.log(`✅ Filtro de favoritos aplicado para: ${username}`);
            return;
        }

        // Adicionar grupo da categoria selecionada
        if (categoria === 'todos') {
            // Mostrar todos os pontos - adicionar todos os grupos de categorias reais
            let gruposAdicionados = 0;
            this.gruposPorCategoria.forEach((grupo, cat) => {
                if (cat !== 'favoritos' && cat !== 'todos') {
                    this.map.addLayer(grupo);
                    gruposAdicionados++;
                    console.log(`➕ Adicionado grupo: ${cat} (${grupo.getLayers().length} pontos)`);
                }
            });
            this.categoriaAtiva = 'todos';
            console.log(`✅ Mostrando todos os pontos (${gruposAdicionados} grupos)`);
        } else if (this.gruposPorCategoria.has(categoria)) {
            // Mostrar apenas pontos da categoria específica
            const grupo = this.gruposPorCategoria.get(categoria);
            this.map.addLayer(grupo);
            this.categoriaAtiva = categoria;
            console.log(`✅ Mostrando pontos da categoria: ${categoria} (${grupo.getLayers().length} pontos)`);
        } else {
            // Categoria não existe, fallback para "todos"
            console.warn(`⚠️ Categoria '${categoria}' não encontrada, mostrando todos`);
            let gruposAdicionados = 0;
            this.gruposPorCategoria.forEach((grupo, cat) => {
                if (cat !== 'favoritos' && cat !== 'todos') {
                    this.map.addLayer(grupo);
                    gruposAdicionados++;
                    console.log(`➕ Adicionado grupo (fallback): ${cat} (${grupo.getLayers().length} pontos)`);
                }
            });
            this.categoriaAtiva = 'todos';
        }

        console.log(`🗺️ Filtro aplicado: ${this.categoriaAtiva}`);
    }

    /**
     * Filtrar apenas pontos favoritos do usuário
     */
    filtrarFavoritos(username) {
        // Remover todos os grupos ativos
        this.gruposPorCategoria.forEach((grupo, categoria) => {
            if (this.map.hasLayer(grupo)) {
                this.map.removeLayer(grupo);
            }
        });

        // Criar grupo temporário para favoritos
        const grupoFavoritos = L.layerGroup();
        const favoritos = window.databaseManager.getFavoritos(username);

        favoritos.forEach(ponto => {
            const marker = this.criarMarcador(ponto);
            if (marker) {
                grupoFavoritos.addLayer(marker);
            }
        });

        // Adicionar ao mapa
        this.map.addLayer(grupoFavoritos);
        this.categoriaAtiva = 'favoritos';

        // Armazenar grupo temporariamente
        this.gruposPorCategoria.set('favoritos', grupoFavoritos);

        console.log(`💕 Exibindo ${favoritos.length} pontos favoritos`);
    }

    /**
     * Recarregar pontos baseado no papel do usuário
     */
    recarregarPontos(userRole = 'visitor', username = null) {
        try {
            // Obter pontos baseado no perfil
            let pontos;
            if (userRole === 'administrator') {
                pontos = [...window.databaseManager.getPontos(), ...window.databaseManager.getPontosPendentes()];
            } else {
                pontos = window.databaseManager.getPontos(); // Apenas confirmados
            }

            // Limpar grupos existentes
            this.gruposPorCategoria.clear();
            this.pontosCarregados.clear();

            // Recriar grupos
            this._inicializarGruposCategorias(pontos);

            // Aplicar filtro atual ou "todos" se não há categoria ativa
            const categoriaParaFiltrar = this.categoriaAtiva || 'todos';
            this.filtrarPorCategoria(categoriaParaFiltrar, username);

            console.log(`🔄 Pontos recarregados para ${userRole}: ${pontos.length} pontos`);
        } catch (error) {
            console.error('Erro ao recarregar pontos:', error);
        }
    }

    /**
     * Atualizar marcador
     * @param {Object} ponto - Dados atualizados do ponto
     */
    atualizarMarcador(ponto) {
        if (this.marcadores.has(ponto.id)) {
            // Remover marcador antigo
            this.removerMarcador(ponto.id);
            
            // Adicionar marcador atualizado
            this.adicionarMarcador(ponto);
        }
    }

    /**
     * Remover marcador
     * @param {number} id - ID do ponto
     */
    removerMarcador(id) {
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
            console.log('🗺️ Forçando redimensionamento do mapa...');
            this.map.invalidateSize(true);
            
            // Segunda invalidação para garantir
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize(true);
                }
            }, 100);
        }
    }
}

// Criar instância global
let mapManager = null;

// Função para inicializar o mapa
function inicializarMapa(containerId = 'map') {
    if (!mapManager) {
        mapManager = new MapManager(containerId);
    }
    return mapManager;
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MapManager, inicializarMapa };
}

// Disponibilizar globalmente
window.MapManager = MapManager;
window.inicializarMapa = inicializarMapa;
