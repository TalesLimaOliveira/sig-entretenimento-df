/**
 * Aplicação Principal - Clean Architecture
 * 
 * Responsabilidades:
 * - Inicializar todos os gerenciadores
 * - Coordenar a aplicação
 * - Gerenciar o ciclo de vida da aplicação
 * - Controlar o loading e responsividade
 * 
 * @author Sistema de Entretenimento DF
 * @version 2.0.0
 */
class PontosEntretenimentoApp {
    constructor() {
        this.isAdmin = false;
        this.categoriaAtiva = 'todos';
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Inicialização principal da aplicação
     */
    async init() {
        try {
            console.log('🚀 Iniciando aplicação...');
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.inicializar());
            } else {
                await this.inicializar();
            }
        } catch (error) {
            console.error('❌ Erro crítico ao inicializar aplicação:', error);
            this.mostrarErro('Erro ao carregar a aplicação. Recarregue a página.');
            this.removerLoadingScreen(); // Remove loading mesmo com erro
        }
    }

    /**
     * Processo completo de inicialização
     */
    async inicializar() {
        try {
            console.log('⏳ Aguardando managers...');
            await this.aguardarManagers();
            console.log('✅ Managers carregados');

            // Configurar responsividade desde o início
            this.configurarResponsividade();
            
            console.log('🔄 Verificando autenticação...');
            this.verificarAutenticacao();
            console.log('✅ Autenticação verificada');
            
            console.log('🔄 Configurando interface...');
            this.configurarInterface();
            console.log('✅ Interface configurada');
            
            console.log('🔄 Configurando eventos...');
            this.configurarEventos();
            console.log('✅ Eventos configurados');
            
            console.log('🔄 Carregando dados...');
            await this.carregarDados();
            console.log('✅ Dados carregados');
            
            console.log('🔄 Removendo loading screen...');
            this.removerLoadingScreen();
            console.log('✅ Aplicação inicializada com sucesso!');
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Erro durante inicialização:', error);
            this.mostrarErro('Erro durante o carregamento. Recarregue a página.');
            this.removerLoadingScreen(); // Remove loading mesmo com erro
        }
    }

    /**
     * Aguarda todos os gerenciadores estarem prontos
     */
    async aguardarManagers() {
        const TIMEOUT_MS = 10000; // 10 segundos
        const CHECK_INTERVAL_MS = 50; // 50ms
        const start = Date.now();
        
        console.log('⏳ Aguardando managers...');
        
        while (Date.now() - start < TIMEOUT_MS) {
            const managersReady = this.verificarManagers();
            
            if (managersReady.allReady) {
                console.log('✅ Todos os managers estão prontos:', managersReady.ready);
                return;
            }
            
            // Verificar se pelo menos os essenciais estão prontos
            if (managersReady.hasMinimal) {
                console.log('✅ Managers essenciais prontos:', managersReady.ready);
                console.log('⚠️ Managers faltando:', managersReady.missing);
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL_MS));
        }
        
        // Se chegou aqui, houve timeout
        const managersStatus = this.verificarManagers();
        console.error('❌ Timeout ao aguardar managers. Status:', managersStatus);
        
        // Tenta continuar se tiver pelo menos os essenciais
        if (managersStatus.hasMinimal) {
            console.warn('⚠️ Continuando com managers essenciais:', managersStatus.ready);
            return;
        }
        
        throw new Error('Managers essenciais não foram carregados no tempo limite');
    }

    /**
     * Verifica quais managers estão prontos
     */
    verificarManagers() {
        const managers = {
            databaseManager: window.databaseManager,
            authManager: window.authManager,
            modalManager: window.modalManager,
            mapManager: window.mapManager,
            themeManager: window.themeManager
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
            hasMinimal: ready.includes('databaseManager') && ready.includes('themeManager')
        };
    }

    verificarAutenticacao() {
        try {
            if (window.authManager && typeof window.authManager.isAuthenticated === 'function') {
                this.isAdmin = window.authManager.isAuthenticated();
                this.atualizarInterfaceAdmin();
                console.log(`🔐 Status admin: ${this.isAdmin}`);
            } else {
                console.warn('⚠️ AuthManager não disponível');
                this.isAdmin = false;
            }
        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            this.isAdmin = false;
        }
    }

    configurarInterface() {
        try {
            console.log('🎨 Configurando interface...');
            this.configurarMenuCategorias();
            this.configurarEstatisticas();
            console.log('✅ Interface configurada');
        } catch (error) {
            console.error('❌ Erro ao configurar interface:', error);
            throw error;
        }
    }

    configurarEstatisticas() {
        // Método vazio por enquanto - estatísticas são atualizadas em atualizarEstatisticas()
    }

    configurarEventos() {
        // Eventos de categoria
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-categoria]')) {
                const categoria = e.target.dataset.categoria;
                this.filtrarPorCategoria(categoria);
            }
        });

        // Eventos de modal
        document.addEventListener('click', (e) => {
            if (e.target.matches('.admin-login')) {
                this.mostrarModalLogin();
            }
        });
    }

    async carregarDados() {
        try {
            console.log('📊 Carregando dados...');
            
            // Verificar se os managers estão disponíveis
            if (!window.databaseManager) {
                throw new Error('DatabaseManager não está disponível');
            }
            
            if (!window.mapManager) {
                console.warn('⚠️ MapManager não disponível, pulando renderização de pontos');
                this.atualizarEstatisticas();
                return;
            }
            
            // Não precisamos chamar carregarDados no databaseManager
            // pois os dados já são carregados no constructor
            this.renderizarPontos();
            this.atualizarEstatisticas();
            
            console.log('✅ Dados carregados com sucesso');
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this.mostrarErro('Erro ao carregar dados do mapa.');
            throw error;
        }
    }

    configurarMenuCategorias() {
        const menu = document.querySelector('.category-menu');
        if (!menu) return;

        const categorias = window.databaseManager.getCategorias();
        const categoriasHtml = categorias.map(cat => 
            `<button class="category-btn" data-categoria="${cat.id}">
                <i class="${cat.icon}"></i> ${cat.nome}
            </button>`
        ).join('');

        menu.innerHTML = `
            <button class="category-btn active" data-categoria="todos">
                <i class="fas fa-th"></i> Todos
            </button>
            ${categoriasHtml}
        `;
    }

    filtrarPorCategoria(categoria) {
        try {
            this.categoriaAtiva = categoria;
            
            // Atualizar botões de navegação
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.categoria === categoria);
            });

            // Filtrar marcadores se o mapa estiver disponível
            if (window.mapManager && typeof window.mapManager.filtrarPorCategoria === 'function') {
                window.mapManager.filtrarPorCategoria(categoria);
            } else {
                console.warn('⚠️ MapManager não disponível para filtrar');
            }
            
            console.log(`🔍 Filtrando por categoria: ${categoria}`);
        } catch (error) {
            console.error('❌ Erro ao filtrar por categoria:', error);
        }
    }

    renderizarPontos() {
        try {
            if (!window.mapManager) {
                console.warn('⚠️ MapManager não disponível para renderizar pontos');
                return;
            }
            
            if (!window.databaseManager) {
                console.warn('⚠️ DatabaseManager não disponível');
                return;
            }
            
            const pontos = window.databaseManager.getPontos();
            console.log(`📍 Renderizando ${pontos.length} pontos no mapa...`);
            
            // Limpar marcadores existentes primeiro
            if (typeof window.mapManager.limparMarcadores === 'function') {
                window.mapManager.limparMarcadores();
            }
            
            // Adicionar cada ponto
            pontos.forEach((ponto, index) => {
                try {
                    console.log(`📍 Adicionando ponto ${index + 1}: ${ponto.nome} (${ponto.categoria})`);
                    window.mapManager.adicionarMarcador(ponto);
                } catch (error) {
                    console.error('❌ Erro ao adicionar marcador:', ponto.nome, error);
                }
            });
            
            console.log(`✅ ${pontos.length} pontos renderizados no mapa`);
        } catch (error) {
            console.error('❌ Erro ao renderizar pontos:', error);
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
            console.log(`🎨 Interface admin atualizada (${elementos.length} elementos)`);
        } catch (error) {
            console.error('❌ Erro ao atualizar interface admin:', error);
        }
    }

    mostrarModalLogin() {
        try {
            if (window.modalManager && typeof window.modalManager.mostrar === 'function') {
                window.modalManager.mostrar('login');
            } else {
                console.warn('⚠️ ModalManager não disponível');
                alert('Sistema de login não está disponível no momento.');
            }
        } catch (error) {
            console.error('❌ Erro ao mostrar modal de login:', error);
        }
    }

    mostrarErro(mensagem) {
        console.error(mensagem);
        // Implementar notificação de erro se necessário
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
                }, 500);
                console.log('✅ Loading screen removido');
            } else {
                console.log('ℹ️ Loading screen não encontrado');
            }
        } catch (error) {
            console.error('❌ Erro ao remover loading screen:', error);
        }
    }

    /**
     * Configurar responsividade global da aplicação
     */
    configurarResponsividade() {
        console.log('📱 Configurando responsividade...');
        
        // Configurar viewport meta tag se não existir
        this.configurarViewport();
        
        // Event listeners para mudanças de orientação e redimensionamento
        this.configurarEventListenersResponsivos();
        
        // Configurar comportamento touch para mobile
        this.configurarComportamentoTouch();
        
        // Aplicar classes baseadas no tamanho da tela
        this.aplicarClassesResponsivas();
        
        console.log('✅ Responsividade configurada');
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
                if (window.mapManager && window.mapManager.map) {
                    window.mapManager.map.invalidateSize();
                }
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
        
        const ponto = window.databaseManager.adicionarPonto(dadosPonto);
        window.mapManager.adicionarMarcador(ponto);
        this.atualizarEstatisticas();
        return true;
    }

    removerPonto(pontoId) {
        if (!this.isAdmin) return false;
        
        window.databaseManager.removerPonto(pontoId);
        window.mapManager.removerMarcador(pontoId);
        this.atualizarEstatisticas();
        return true;
    }
}

// Não instanciar aqui - será feito no HTML
