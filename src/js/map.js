/**
 * Gerenciador de Mapas
 * Classe responsável por gerenciar o mapa Leaflet e marcadores
 * 
 * @author Seu Nome
 * @version 1.0.0
 */

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
        this.criarMapa();
        this.configurarCamadas();
        this.configurarEventListeners();
        this.configurarControles();
        // MapManager inicializado
    }

    /**
     * Criar o mapa base
     */
    criarMapa() {
        // Configurar centro do mapa (Brasília)
        const centro = [-15.794700, -47.890000];
        const zoom = 11;

        // Criar mapa
        this.map = L.map(this.containerId, {
            center: centro,
            zoom: zoom,
            zoomControl: false, // Vamos adicionar controle customizado
            attributionControl: true
        });

        // Configurar limites do mapa (DF)
        const limites = L.latLngBounds(
            [-16.5, -48.5], // Southwest
            [-15.3, -47.2]  // Northeast
        );
        this.map.setMaxBounds(limites);
        this.map.setMinZoom(10);
        this.map.setMaxZoom(18);
    }

    /**
     * Configurar camadas base
     */
    configurarCamadas() {
        // Camada de ruas (OpenStreetMap)
        const mapaRuas = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        });

        // Camada de satélite (Google)
        const mapaSatelite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '© Google'
        });

        // Camada topográfica
        const mapaTopografico = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap'
        });

        // Adicionar camada padrão
        mapaRuas.addTo(this.map);

        // Controle de camadas
        const camadasBase = {
            "🏙️ Ruas": mapaRuas,
            "🛰️ Satélite": mapaSatelite,
            "🏔️ Topográfico": mapaTopografico
        };

        L.control.layers(camadasBase, null, {
            position: 'topright'
        }).addTo(this.map);

        // Inicializar grupos de categorias
        this.inicializarGruposCategorias();
    }

    /**
     * Inicializar grupos de categorias
     */
    inicializarGruposCategorias() {
        // Grupo para "todos"
        this.gruposPorCategoria.set('todos', L.layerGroup().addTo(this.map));

        // Aguardar databaseManager estar disponível
        if (window.databaseManager) {
            const categorias = window.databaseManager.obterCategorias();
            
            // Grupos para cada categoria
            categorias.forEach(categoria => {
                this.gruposPorCategoria.set(categoria.id, L.layerGroup());
            });
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
        // Controle de zoom customizado
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);

        // Controle de escala
        L.control.scale({
            position: 'bottomright',
            imperial: false,
            metric: true
        }).addTo(this.map);

        // Controle de coordenadas (para admins)
        if (authManager.isAdmin()) {
            this.adicionarControlesCoordenadas();
        }

        // Controle de localização
        this.adicionarControleLocalizacao();
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
     * Adicionar controle de localização
     */
    adicionarControleLocalizacao() {
        const controleLocalizacao = L.control({ position: 'topright' });
        
        controleLocalizacao.onAdd = function() {
            const div = L.DomUtil.create('div', 'controle-localizacao');
            const button = L.DomUtil.create('button', '', div);
            button.innerHTML = '📍';
            button.title = 'Minha localização';
            button.style.cssText = `
                width: 34px;
                height: 34px;
                background: white;
                border: 2px solid rgba(0,0,0,0.2);
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
            `;
            
            L.DomEvent.on(button, 'click', this.localizarUsuario.bind(this));
            return div;
        }.bind(this);

        controleLocalizacao.addTo(this.map);
    }

    /**
     * Localizar usuário
     */
    localizarUsuario() {
        if (!navigator.geolocation) {
            alert('Geolocalização não suportada pelo navegador');
            return;
        }

        const loading = this.mostrarCarregamento('Obtendo localização...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.map.setView([latitude, longitude], 15);
                
                // Adicionar marcador temporário
                const marcadorUsuario = L.marker([latitude, longitude], {
                    icon: this.criarIconeUsuario()
                }).addTo(this.map);

                // Remover após 5 segundos
                setTimeout(() => {
                    this.map.removeLayer(marcadorUsuario);
                }, 5000);

                loading.remove();
            },
            (error) => {
                loading.remove();
                let mensagem = 'Erro ao obter localização';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        mensagem = 'Permissão de localização negada';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensagem = 'Localização indisponível';
                        break;
                    case error.TIMEOUT:
                        mensagem = 'Timeout na obtenção da localização';
                        break;
                }
                
                alert(mensagem);
            }
        );
    }

    /**
     * Criar ícone do usuário
     */
    criarIconeUsuario() {
        return L.divIcon({
            className: 'icone-usuario',
            html: '<div style="background: #4285F4; width: 16px; height: 16px; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
    }

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
        
        const pontos = window.databaseManager.buscarPorCategoria('todos');
        
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
            const icone = this.criarIconePersonalizado(categoria);

            // Criar marcador
            const marcador = L.marker(ponto.coordenadas, {
                icon: icone,
                title: ponto.nome
            });

            // Criar popup
            const popup = this.criarPopup(ponto);
            marcador.bindPopup(popup);

            // Eventos do marcador
            marcador.on('popupopen', () => {
                this.popupAberto = ponto.id;
                this.incrementarViews(ponto.id);
            });

            marcador.on('popupclose', () => {
                this.popupAberto = null;
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
     * Criar ícone personalizado
     * @param {Object} categoria - Dados da categoria
     * @returns {Object} Ícone Leaflet
     */
    criarIconePersonalizado(categoria) {
        return L.divIcon({
            className: 'marcador-personalizado',
            html: `
                <div style="
                    background-color: ${categoria.cor};
                    width: 24px;
                    height: 24px;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                ">
                    ${categoria.icone}
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        });
    }

    /**
     * Criar popup para o ponto
     * @param {Object} ponto - Dados do ponto
     * @returns {string} HTML do popup
     */
    criarPopup(ponto) {
        const categoria = databaseManager.obterCategoria(ponto.categoria);
        const isAdmin = authManager.isAdmin();
        
        return `
            <div class="popup-ponto" style="min-width: 280px; max-width: 400px;">
                <div style="border-bottom: 2px solid ${categoria.cor}; padding-bottom: 10px; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: ${categoria.cor}; font-size: 18px;">
                        ${categoria.icone} ${ponto.nome}
                    </h3>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <p style="margin: 5px 0; color: #666;">
                        <strong>📍</strong> ${ponto.endereco}
                    </p>
                    <p style="margin: 5px 0; font-style: italic;">
                        ${ponto.descricao}
                    </p>
                </div>

                ${ponto.telefone ? `
                    <p style="margin: 5px 0;">
                        <strong>📞</strong> ${ponto.telefone}
                    </p>
                ` : ''}

                ${ponto.horario ? `
                    <p style="margin: 5px 0;">
                        <strong>🕒</strong> ${ponto.horario}
                    </p>
                ` : ''}

                ${ponto.preco ? `
                    <p style="margin: 5px 0;">
                        <strong>💰</strong> ${ponto.preco}
                    </p>
                ` : ''}

                ${ponto.avaliacao > 0 ? `
                    <p style="margin: 5px 0;">
                        <strong>⭐</strong> ${ponto.avaliacao}/5
                    </p>
                ` : ''}

                ${ponto.website ? `
                    <p style="margin: 5px 0;">
                        <a href="${ponto.website}" target="_blank" style="color: ${categoria.cor};">
                            🌐 Site oficial
                        </a>
                    </p>
                ` : ''}

                ${ponto.tags && ponto.tags.length > 0 ? `
                    <div style="margin-top: 10px;">
                        <small style="color: #888;">
                            Tags: ${ponto.tags.map(tag => `<span style="background: #f0f0f0; padding: 2px 6px; border-radius: 10px; margin-right: 5px;">#${tag}</span>`).join('')}
                        </small>
                    </div>
                ` : ''}

                ${isAdmin ? `
                    <div style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">
                        <button onclick="mapManager.editarPonto(${ponto.id})" style="background: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                            ✏️ Editar
                        </button>
                        <button onclick="mapManager.removerPonto(${ponto.id})" style="background: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                            🗑️ Remover
                        </button>
                    </div>
                ` : ''}

                <div style="margin-top: 10px; text-align: center;">
                    <small style="color: #ccc;">
                        ID: ${ponto.id} | Views: ${ponto.metadata?.views || 0}
                    </small>
                </div>
            </div>
        `;
    }

    /**
     * Filtrar pontos por categoria
     * @param {string} categoria - Categoria a filtrar
     */
    filtrarPorCategoria(categoria) {
        // Garantir que os grupos existam
        if (!this.gruposPorCategoria.size) {
            this.inicializarGruposCategorias();
        }

        // Remover categoria atual
        if (this.gruposPorCategoria.has(this.categoriaAtiva)) {
            this.map.removeLayer(this.gruposPorCategoria.get(this.categoriaAtiva));
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

        // Filtrando por categoria: ${categoria}
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
        const pontos = databaseManager.buscarPorProximidade(centro.lat, centro.lng, raio);
        
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
        const pontos = databaseManager.buscarPorCategoria('todos');
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
