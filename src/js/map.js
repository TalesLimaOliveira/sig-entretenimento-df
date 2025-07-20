class MapManager {
    constructor(containerId = 'map') {
        this.containerId = containerId;
        this.map = null;
        this.marcadores = new Map();
        this.gruposPorCategoria = new Map();
        this.categoriaAtiva = 'todos';
        this.popupAberto = null;
        this.modoAdicao = false;
        this.init();
    }

    /**
     * Inicializa o mapa
     */
    init() {
        try {
            console.log('🗺️ Inicializando MapManager...');
            
            // Verificar se o container existe
            const container = document.getElementById(this.containerId);
            if (!container) {
                throw new Error(`Container '${this.containerId}' não encontrado`);
            }
            
            // Verificar se Leaflet está disponível
            if (typeof L === 'undefined') {
                throw new Error('Leaflet não está carregado');
            }
            
            this.criarMapa();
            this.configurarCamadas();
            this.aplicarTemaInicial();
            this.configurarEventListeners();
            this.configurarControles();
            this.configurarResponsividade();
            
            console.log('✅ MapManager inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar MapManager:', error);
            throw error;
        }
    }

    /**
     * Configurar responsividade do mapa
     */
    configurarResponsividade() {
        // Redimensionar mapa quando a janela mudar de tamanho
        const resizeObserver = new ResizeObserver(() => {
            if (this.map) {
                // Aguardar um pouco para garantir que o container está com o tamanho correto
                setTimeout(() => {
                    this.map.invalidateSize();
                }, 100);
            }
        });
        
        // Observar mudanças no container do mapa
        const mapContainer = document.getElementById(this.containerId);
        if (mapContainer) {
            resizeObserver.observe(mapContainer);
        }
        
        // Listener para mudanças de orientação em dispositivos móveis
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                }
            }, 500);
        });
        
        // Listener para redimensionamento da janela
        window.addEventListener('resize', this.debounce(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        }, 250));
    }

    /**
     * Debounce utility function
     * @param {Function} func - Função a ser debounced
     * @param {number} wait - Tempo de espera em ms
     * @returns {Function} Função debounced
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Criar o mapa base com configurações responsivas
     */
    criarMapa() {
        // Configurações do mapa
        const BRASILIA_CENTER = [-15.794700, -47.890000];
        const DEFAULT_ZOOM = 11;
        const MIN_ZOOM = 10;
        const MAX_ZOOM = 18;
        
        // Limites do Distrito Federal
        const DF_BOUNDS = L.latLngBounds(
            [-16.5, -48.5], // Southwest
            [-15.3, -47.2]  // Northeast
        );

        // Criar mapa com configurações otimizadas
        this.map = L.map(this.containerId, {
            center: BRASILIA_CENTER,
            zoom: DEFAULT_ZOOM,
            zoomControl: false, // Controle customizado será adicionado depois
            attributionControl: false, // Remover controle de atribuição
            preferCanvas: true, // Melhor performance para muitos marcadores
            renderer: L.canvas() // Renderer de canvas para melhor performance
        });

        // Configurar limites e zoom
        this.map.setMaxBounds(DF_BOUNDS);
        this.map.setMinZoom(MIN_ZOOM);
        this.map.setMaxZoom(MAX_ZOOM);
        
        // Configurar opções responsivas
        this.configurarOpcoesResponsivas();
    }

    /**
     * Configurar opções responsivas do mapa
     */
    configurarOpcoesResponsivas() {
        // Detectar se é dispositivo móvel
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Configurações para mobile
            this.map.options.zoomSnap = 0.5; // Zoom mais suave
            this.map.options.zoomDelta = 0.5;
            this.map.options.wheelPxPerZoomLevel = 120;
            
            // Configurar popup para mobile
            this.map.options.maxPopupWidth = Math.min(300, window.innerWidth - 40);
        } else {
            // Configurações para desktop
            this.map.options.zoomSnap = 1;
            this.map.options.zoomDelta = 1;
            this.map.options.wheelPxPerZoomLevel = 60;
        }
    }

    /**
     * Configurar camadas base do mapa
     */
    configurarCamadas() {
        // Criar e adicionar apenas a camada de ruas
        this.camadaRuas = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: ''
        });
        
        // Adicionar camada ao mapa
        this.camadaRuas.addTo(this.map);

        // Inicializar grupos de categorias
        this.inicializarGruposCategorias();
    }

    /**
     * Inicializar grupos de categorias
     */
    inicializarGruposCategorias(pontosCustomizados = null) {
        // Limpar grupos existentes
        this.gruposPorCategoria.clear();

        // Grupo para "todos"
        this.gruposPorCategoria.set('todos', L.layerGroup().addTo(this.map));

        // Aguardar databaseManager estar disponível
        if (window.databaseManager) {
            const categorias = window.databaseManager.getCategorias();
            
            // Grupos para cada categoria
            categorias.forEach(categoria => {
                this.gruposPorCategoria.set(categoria.id, L.layerGroup());
            });

            // Carregar pontos
            const pontos = pontosCustomizados || this.obterPontosParaCarregar();
            this.carregarPontos(pontos);
        }
    }

    /**
     * Obter pontos baseado no perfil do usuário
     */
    obterPontosParaCarregar() {
        if (!window.databaseManager) return [];

        const user = window.authManager?.getCurrentUser();
        if (user && user.role === 'administrator') {
            // Admin vê confirmados + pendentes
            return [...window.databaseManager.getPontos(), ...window.databaseManager.getPontosPendentes()];
        } else {
            // Visitante/usuário vê apenas confirmados
            return window.databaseManager.getPontos();
        }
    }

    /**
     * Configurar event listeners
     */
    configurarEventListeners() {
        // Clique no mapa para adicionar pontos (só para admin)
        this.map.on('click', (e) => {
            if (authManager.isAdmin() && this.modoAdicao) {
                this.iniciarAdicaoPonto(e.latlng);
            }
        });

        // Eventos do banco de dados
        document.addEventListener('database_pontoAdicionado', (e) => {
            this.adicionarMarcador(e.detail);
        });

        document.addEventListener('database_pontoAtualizado', (e) => {
            this.atualizarMarcador(e.detail);
        });

        document.addEventListener('database_pontoRemovido', (e) => {
            this.removerMarcador(e.detail.id);
        });

        // Eventos de autenticação
        document.addEventListener('authStateChanged', (e) => {
            this.atualizarControlesAdmin(e.detail.type === 'login' && e.detail.user.role === 'administrator');
        });
    }

    /**
     * Configurar controles do mapa
     */
    configurarControles() {
        // Remover controles de zoom e escala para interface mais limpa
        // Os controles podem ser adicionados de volta se necessário

        // Controle de coordenadas (para admins)
        if (authManager.isAdmin()) {
            this.adicionarControlesCoordenadas();
        }

        // Nota: Controles de zoom, escala e localização removidos para melhorar a interface
    }

    /**
     * Alternar tema do mapa
     */
    alternarTemaMapa(temaEscuro = false) {
        try {
            // O tema escuro será aplicado via CSS na interface
            this.map.eachLayer((layer) => {
                if (layer instanceof L.TileLayer) {
                    this.map.removeLayer(layer);
                }
            });

            // Sempre usar mapa de ruas
            this.camadaRuas.addTo(this.map);
            console.log('🏙️ Mapa configurado com camada de ruas');
        } catch (error) {
            console.error('❌ Erro ao alterar tema do mapa:', error);
        }
    }

    /**
     * Aplicar tema inicial baseado nas configurações salvas
     */
    aplicarTemaInicial() {
        try {
            // Verificar tema salvo no localStorage
            const temaSalvo = localStorage.getItem('sig-df-theme') || 'dark';
            const temaEscuro = temaSalvo === 'dark';
            
            // Aplicar tema ao mapa
            this.alternarTemaMapa(temaEscuro);
            
            console.log(`🎨 Tema inicial aplicado ao mapa: ${temaEscuro ? 'escuro' : 'claro'}`);
        } catch (error) {
            console.error('❌ Erro ao aplicar tema inicial:', error);
        }
    }

    /**
     * Adicionar controle de coordenadas
     */
    adicionarControlesCoordenadas() {
        const controleCoordenadas = L.control({ position: 'bottomleft' });
        
        controleCoordenadas.onAdd = function() {
            const div = L.DomUtil.create('div', 'controle-coordenadas');
            div.style.background = 'rgba(255, 255, 255, 0.9)';
            div.style.padding = '5px 10px';
            div.style.borderRadius = '5px';
            div.style.fontSize = '12px';
            div.style.fontFamily = 'monospace';
            div.innerHTML = 'Lat: -, Lng: -';
            return div;
        };

        controleCoordenadas.addTo(this.map);

        // Atualizar coordenadas no mouse move
        this.map.on('mousemove', (e) => {
            const { lat, lng } = e.latlng;
            const div = document.querySelector('.controle-coordenadas');
            if (div) {
                div.innerHTML = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            }
        });
    }

    /**
     * Adicionar controle de localização - DESABILITADO
     * Removido para melhorar a interface e evitar sobreposições
     */
    /*
    adicionarControleLocalizacao() {
        // Função desabilitada para melhorar UX
        console.log('Controle de localização desabilitado');
    }
    */

    /**
     * Localizar usuário - DESABILITADO
     * Removido para melhorar UX e evitar sobreposições
     */
    /*
    localizarUsuario() {
        // Função desabilitada
        console.log('Localização do usuário desabilitada');
    }
    */

    /**
     * Criar ícone do usuário - DESABILITADO
     * Removido junto com a funcionalidade de localização
     */
    /*
    criarIconeUsuario() {
        // Função desabilitada
        return null;
    }
    */

    /**
     * Mostrar indicador de carregamento
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
                this.gruposPorCategoria.set('todos', L.layerGroup().addTo(this.map));
            }
            if (!this.gruposPorCategoria.has(ponto.categoria)) {
                this.gruposPorCategoria.set(ponto.categoria, L.layerGroup());
            }

            // Adicionar aos grupos
            this.gruposPorCategoria.get('todos').addLayer(marcador);
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
        // Garantir que os grupos existam
        if (!this.gruposPorCategoria.size) {
            this.inicializarGruposCategorias();
        }

        // Remover categoria atual
        if (this.gruposPorCategoria.has(this.categoriaAtiva)) {
            this.map.removeLayer(this.gruposPorCategoria.get(this.categoriaAtiva));
        }

        // Lógica especial para favoritos
        if (categoria === 'favoritos' && username) {
            this.filtrarFavoritos(username);
            return;
        }

        // Adicionar nova categoria
        if (this.gruposPorCategoria.has(categoria)) {
            this.map.addLayer(this.gruposPorCategoria.get(categoria));
            this.categoriaAtiva = categoria;
        } else {
            // Se categoria não existe, mostrar todas
            if (this.gruposPorCategoria.has('todos')) {
                this.map.addLayer(this.gruposPorCategoria.get('todos'));
                this.categoriaAtiva = 'todos';
            }
        }

        console.log(`🗺️ Filtrando por categoria: ${categoria}`);
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
            this.inicializarGruposCategorias(pontos);

            // Aplicar filtro atual
            this.filtrarPorCategoria(this.categoriaAtiva, username);

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
