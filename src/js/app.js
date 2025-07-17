/**
 * Aplicação Principal - Pontos de Entretenimento DF
 * Orquestra todos os componentes da aplicação
 * 
 * @author Seu Nome
 * @version 1.0.0
 */

class PontosEntretenimentoApp {
    constructor() {
        this.isAdmin = false;
        this.categoriaAtiva = 'todos';
        this.stats = {
            total: 0,
            porCategoria: {}
        };
        this.init();
    }

    /**
     * Inicializar a aplicação
     */
    async init() {
        try {
            // Iniciando Pontos de Entretenimento DF...
            
            // Aguardar carregamento do DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.inicializar());
            } else {
                await this.inicializar();
            }
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
            this.mostrarErro('Erro ao carregar a aplicação. Recarregue a página.');
        }
    }

    /**
     * Processo principal de inicialização
     */
    async inicializar() {
        // Aguardar managers estarem prontos
        await this.aguardarManagers();

        // Verificar autenticação
        this.verificarAutenticacao();

        // Configurar interface
        this.configurarInterface();

        // Inicializar mapa
        await this.inicializarMapa();

        // Carregar dados
        await this.carregarDados();

        // Configurar event listeners
        this.configurarEventListeners();

        // Finalizar
        this.finalizarInicializacao();
    }

    /**
     * Aguardar managers estarem prontos
     */
    async aguardarManagers() {
        const aguardarManager = (manager, nome) => {
            return new Promise(resolve => {
                if (manager && manager.pontos !== undefined) {
                    resolve();
                } else {
                    const checkInterval = setInterval(() => {
                        if (manager && manager.pontos !== undefined) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                }
            });
        };

        // Aguardar DatabaseManager estar pronto
        await aguardarManager(window.databaseManager, 'DatabaseManager');
        
        // Pequena pausa para garantir que tudo esteja inicializado
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    /**
     * Verificar estado de autenticação
     */
    verificarAutenticacao() {
        // Verificar se é página de admin
        const isAdminPage = window.location.pathname.includes('admin.html');
        
        if (isAdminPage && window.authManager) {
            // Proteger rota administrativa
            window.authManager.protectAdminRoute();
        }

        // Verificar se usuário está logado
        if (window.authManager) {
            const usuario = window.authManager.getCurrentUser();
            if (usuario) {
                this.isAdmin = usuario.role === 'administrator';
                this.atualizarInterfaceUsuario(usuario);
            } else if (isAdminPage) {
                // Redirecionar para login se necessário
                this.mostrarModalLogin();
            }
        }
    }

    /**
     * Configurar interface inicial
     */
    configurarInterface() {
        // Configurar cabeçalho
        this.configurarCabecalho();

        // Configurar menu de categorias
        this.configurarMenuCategorias();

        // Configurar painéis de informação
        this.configurarPaineis();

        // Aplicar tema
        this.aplicarTema();
    }

    /**
     * Configurar cabeçalho
     */
    configurarCabecalho() {
        const cabecalho = document.querySelector('.header');
        if (!cabecalho) return;

        // Adicionar informações do usuário se logado
        const usuario = window.authManager ? window.authManager.getCurrentUser() : null;
        if (usuario) {
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <span class="user-name">👋 ${usuario.name}</span>
                <button class="btn btn-logout" onclick="window.app.logout()">Sair</button>
            `;
            cabecalho.appendChild(userInfo);
        }

        // Botão de login para usuários não autenticados
        if (!usuario && !this.isAdminPage()) {
            const loginBtn = document.createElement('button');
            loginBtn.className = 'btn btn-primary';
            loginBtn.textContent = 'Login Admin';
            loginBtn.onclick = () => this.mostrarModalLogin();
            cabecalho.appendChild(loginBtn);
        }
    }

    /**
     * Configurar menu de categorias
     */
    configurarMenuCategorias() {
        const menuContainer = document.querySelector('.menu-container');
        if (!menuContainer) {
            console.warn('Menu container não encontrado');
            return;
        }

        // Limpar menu existente
        menuContainer.innerHTML = '';

        // Botão "Todos"
        const btnTodos = this.criarBotaoCategoria('todos', '🌟', 'Todos', true);
        menuContainer.appendChild(btnTodos);

        // Aguardar databaseManager estar disponível
        if (window.databaseManager) {
            // Botões das categorias
            const categorias = window.databaseManager.obterCategorias();
            console.log('🔍 Categorias encontradas:', categorias);
            
            if (categorias && categorias.length > 0) {
                categorias.forEach(categoria => {
                    console.log('🔹 Criando botão para categoria:', categoria.nome);
                    const btn = this.criarBotaoCategoria(
                        categoria.id, 
                        categoria.icone, 
                        categoria.nome, 
                        false
                    );
                    menuContainer.appendChild(btn);
                });
            } else {
                console.warn('⚠️ Nenhuma categoria encontrada');
            }
        } else {
            console.warn('⚠️ DatabaseManager não disponível ainda');
        }

        // Botão para adicionar ponto (só para admin)
        if (this.isAdmin) {
            const btnAdicionar = document.createElement('button');
            btnAdicionar.className = 'category-btn adicionar';
            btnAdicionar.innerHTML = '➕ Adicionar Ponto';
            btnAdicionar.onclick = () => this.ativarModoAdicao();
            menuContainer.appendChild(btnAdicionar);
        }
    }

    /**
     * Criar botão de categoria
     * @param {string} id - ID da categoria
     * @param {string} icone - Ícone da categoria
     * @param {string} nome - Nome da categoria
     * @param {boolean} ativo - Se o botão está ativo
     * @returns {HTMLElement} Elemento do botão
     */
    criarBotaoCategoria(id, icone, nome, ativo = false) {
        const btn = document.createElement('button');
        btn.className = `category-btn ${id}${ativo ? ' active' : ''}`;
        btn.innerHTML = `${icone} ${nome}`;
        btn.onclick = () => this.filtrarCategoria(id);
        return btn;
    }

    /**
     * Configurar painéis de informação
     */
    configurarPaineis() {
        // Painéis removidos - interface simplificada
    }

    /**
     * Aplicar tema da aplicação
     */
    aplicarTema() {
        // Adicionar classes CSS dinâmicas
        document.body.classList.add('pontos-df-app');
        
        if (this.isAdmin) {
            document.body.classList.add('admin-mode');
        }

        // Configurar modo escuro (se preferência salva)
        const modoEscuro = localStorage.getItem('pontos-df-dark-mode');
        if (modoEscuro === 'true') {
            document.body.classList.add('dark-mode');
        }
    }

    /**
     * Inicializar mapa
     */
    async inicializarMapa() {
        try {
            // Aguardar elemento do mapa estar disponível
            const mapContainer = document.getElementById('map');
            if (!mapContainer) {
                throw new Error('Container do mapa não encontrado');
            }

            // Inicializar MapManager
            window.mapManager = new MapManager('map');
            
            // Mapa inicializado
        } catch (error) {
            console.error('❌ Erro ao inicializar mapa:', error);
            throw error;
        }
    }

    /**
     * Carregar dados da aplicação
     */
    async carregarDados() {
        try {
            // Reconfigurar categorias após database estar pronto
            this.configurarMenuCategorias();

            // Aguardar inicialização do banco de dados
            await new Promise(resolve => {
                if (window.databaseManager && window.databaseManager.pontos) {
                    resolve();
                } else {
                    // Aguardar inicialização
                    const checkInterval = setInterval(() => {
                        if (window.databaseManager && window.databaseManager.pontos) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                }
            });

            // Reconfigurar grupos de categorias no mapa
            if (window.mapManager) {
                window.mapManager.inicializarGruposCategorias();
                // Carregar pontos no mapa
                window.mapManager.carregarPontos();
            }

            // Dados carregados
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            throw error;
        }
    }

    /**
     * Configurar event listeners da aplicação
     */
    configurarEventListeners() {
        // Eventos de autenticação
        document.addEventListener('authStateChanged', (e) => {
            this.tratarMudancaAuth(e.detail);
        });

        // Eventos do banco de dados
        document.addEventListener('database_pontoAdicionado', () => {
            // Ponto adicionado
        });

        document.addEventListener('database_pontoRemovido', () => {
            // Ponto removido
        });

        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            this.tratarTeclado(e);
        });

        // Eventos de janela
        window.addEventListener('beforeunload', () => {
            this.salvarEstado();
        });

        // Responsividade
        window.addEventListener('resize', () => {
            this.ajustarLayout();
        });

        // Event listeners configurados
    }

    /**
     * Finalizar processo de inicialização
     */
    finalizarInicializacao() {
        // Remover loading screen se existir
        const loading = document.querySelector('.loading-screen');
        if (loading) {
            loading.remove();
        }

        // Mostrar aplicação
        document.body.classList.add('app-loaded');

        // Garantir que o mapa seja redimensionado corretamente
        if (window.mapManager && window.mapManager.map) {
            setTimeout(() => {
                window.mapManager.map.invalidateSize();
            }, 100);
        }

        // Verificar se há parâmetros na URL
        this.processarParametrosURL();

        // Aplicação inicializada com sucesso!
    }

    /**
     * Filtrar pontos por categoria
     * @param {string} categoria - Categoria a filtrar
     */
    filtrarCategoria(categoria) {
        // Atualizar botões
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const btnCategoria = document.querySelector(`.category-btn.${categoria}`);
        if (btnCategoria) {
            btnCategoria.classList.add('active');
        }

        // Filtrar no mapa
        if (window.mapManager) {
            window.mapManager.filtrarPorCategoria(categoria);
        }
        this.categoriaAtiva = categoria;

        // Salvar preferência
        localStorage.setItem('pontos-df-categoria-ativa', categoria);
    }

    /**
     * Ativar modo de adição de pontos
     */
    ativarModoAdicao() {
        if (!this.isAdmin) return;

        const btnAdicionar = document.querySelector('.category-btn.adicionar');
        const isAtivo = btnAdicionar.classList.contains('active');

        if (isAtivo) {
            // Desativar modo
            btnAdicionar.classList.remove('active');
            btnAdicionar.innerHTML = '➕ Adicionar Ponto';
            mapManager.setModoAdicao(false);
        } else {
            // Ativar modo
            btnAdicionar.classList.add('active');
            btnAdicionar.innerHTML = '❌ Cancelar';
            mapManager.setModoAdicao(true);
            
            // Mostrar instrução
            this.mostrarNotificacao(
                'Clique no mapa para adicionar um novo ponto',
                'info',
                5000
            );
        }
    }

    /**
     * Atualizar estatísticas - Removido
     */
    atualizarEstatisticas() {
        // Funcionalidade removida
    }

    /**
     * Atualizar legenda - Removido
     */
    atualizarLegenda() {
        // Funcionalidade removida
    }

    /**
     * Mostrar modal de login
     */
    mostrarModalLogin() {
        const conteudo = `
            <form id="form-login">
                <div class="form-group">
                    <label class="form-label required" for="username">Usuário</label>
                    <input type="text" id="username" class="form-input" placeholder="Digite seu usuário" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label required" for="password">Senha</label>
                    <input type="password" id="password" class="form-input" placeholder="Digite sua senha" required>
                </div>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px;">
                    <h4 style="margin: 0 0 10px 0;">Credenciais de Teste:</h4>
                    <p style="margin: 5px 0;"><strong>Admin:</strong> admin / admin123</p>
                    <p style="margin: 5px 0;"><strong>Usuário:</strong> user / user123</p>
                </div>
            </form>
        `;

        const botoes = [
            {
                texto: 'Cancelar',
                classe: 'btn-secondary',
                id: 'btn-cancelar-login'
            },
            {
                texto: '🔑 Entrar',
                classe: 'btn-primary',
                id: 'btn-login'
            }
        ];

        const modal = modalManager.criarModal('Login', conteudo, botoes);
        modalManager.mostrarModal(modal);

        // Configurar eventos
        modal.querySelector('#btn-cancelar-login').addEventListener('click', () => {
            modalManager.fecharModal();
        });

        modal.querySelector('#btn-login').addEventListener('click', () => {
            this.processarLogin(modal.querySelector('#form-login'));
        });

        // Enter para submeter
        modal.querySelector('#form-login').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.processarLogin(modal.querySelector('#form-login'));
            }
        });
    }

    /**
     * Processar login
     * @param {HTMLElement} form - Formulário de login
     */
    async processarLogin(form) {
        const username = form.username.value.trim();
        const password = form.password.value.trim();

        if (!username || !password) {
            alert('Preencha todos os campos');
            return;
        }

        const btnLogin = form.parentElement.querySelector('#btn-login');
        const textoOriginal = btnLogin.innerHTML;
        btnLogin.innerHTML = '⏳ Entrando...';
        btnLogin.disabled = true;

        try {
            const resultado = await authManager.login(username, password);
            
            if (resultado.success) {
                modalManager.fecharModal();
                this.mostrarNotificacao('Login realizado com sucesso!', 'success');
                
                // Atualizar interface
                this.isAdmin = resultado.user.role === 'administrator';
                this.atualizarInterfaceUsuario(resultado.user);
                
                // Reconfigurar interface
                this.configurarInterface();
                
            } else {
                alert(resultado.error || 'Erro no login');
                btnLogin.innerHTML = textoOriginal;
                btnLogin.disabled = false;
            }
        } catch (error) {
            alert('Erro no login: ' + error.message);
            btnLogin.innerHTML = textoOriginal;
            btnLogin.disabled = false;
        }
    }

    /**
     * Realizar logout
     */
    logout() {
        const confirmacao = confirm('Tem certeza que deseja sair?');
        if (confirmacao) {
            authManager.logout();
            this.mostrarNotificacao('Logout realizado com sucesso!', 'info');
            
            // Recarregar página para limpar estado
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    /**
     * Atualizar interface do usuário
     * @param {Object} usuario - Dados do usuário
     */
    atualizarInterfaceUsuario(usuario) {
        // Atualizar cabeçalho
        this.configurarCabecalho();
        
        // Reconfigurar menu se admin
        if (usuario.role === 'administrator') {
            this.configurarMenuCategorias();
        }
    }

    /**
     * Tratar mudança de autenticação
     * @param {Object} detail - Detalhes do evento
     */
    tratarMudancaAuth(detail) {
        if (detail.type === 'login') {
            this.isAdmin = detail.user.role === 'administrator';
            this.atualizarInterfaceUsuario(detail.user);
        } else if (detail.type === 'logout') {
            this.isAdmin = false;
        }
    }

    /**
     * Tratar eventos de teclado
     * @param {KeyboardEvent} e - Evento de teclado
     */
    tratarTeclado(e) {
        // Ctrl/Cmd + K para busca (removido - não implementado)
        // if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        //     e.preventDefault();
        //     this.mostrarBusca();
        // }

        // Escape para sair de modos especiais
        if (e.key === 'Escape') {
            this.cancelarModoEspecial();
        }

        // Teclas de número para filtros rápidos
        if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey) {
            const categorias = ['todos', ...(window.databaseManager ? window.databaseManager.obterCategorias().map(c => c.id) : [])];
            const index = parseInt(e.key) - 1;
            if (categorias[index]) {
                this.filtrarCategoria(categorias[index]);
            }
        }
    }

    /**
     * Cancelar modo especial
     */
    cancelarModoEspecial() {
        // Desativar modo de adição se ativo
        const btnAdicionar = document.querySelector('.category-btn.adicionar');
        if (btnAdicionar && btnAdicionar.classList.contains('active')) {
            this.ativarModoAdicao(); // Toggle off
        }
    }

    /**
     * Ajustar layout para responsividade
     */
    ajustarLayout() {
        // Ajustar mapa se necessário
        if (mapManager && mapManager.map) {
            setTimeout(() => {
                mapManager.map.invalidateSize();
            }, 100);
        }
    }

    /**
     * Salvar estado da aplicação
     */
    salvarEstado() {
        const estado = {
            categoriaAtiva: this.categoriaAtiva,
            centroMapa: mapManager ? mapManager.map.getCenter() : null,
            zoomMapa: mapManager ? mapManager.map.getZoom() : null,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('pontos-df-estado', JSON.stringify(estado));
    }

    /**
     * Processar parâmetros da URL
     */
    processarParametrosURL() {
        const params = new URLSearchParams(window.location.search);
        
        // Ponto específico
        const pontoId = params.get('ponto');
        if (pontoId && mapManager) {
            mapManager.centralizarEm(parseInt(pontoId));
        }

        // Categoria específica
        const categoria = params.get('categoria');
        if (categoria) {
            this.filtrarCategoria(categoria);
        }
    }

    /**
     * Mostrar notificação
     * @param {string} mensagem - Mensagem da notificação
     * @param {string} tipo - Tipo (success, error, info, warning)
     * @param {number} duracao - Duração em ms
     */
    mostrarNotificacao(mensagem, tipo = 'info', duracao = 3000) {
        // Criar elemento de notificação
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao notificacao-${tipo}`;
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getCoresNotificacao(tipo)};
            color: white;
            padding: 15px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        notificacao.textContent = mensagem;

        document.body.appendChild(notificacao);

        // Remover após duração especificada
        setTimeout(() => {
            notificacao.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notificacao.parentNode) {
                    notificacao.parentNode.removeChild(notificacao);
                }
            }, 300);
        }, duracao);
    }

    /**
     * Obter cores para notificações
     * @param {string} tipo - Tipo da notificação
     * @returns {string} Cor CSS
     */
    getCoresNotificacao(tipo) {
        const cores = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#FF9800',
            info: '#2196F3'
        };
        return cores[tipo] || cores.info;
    }

    /**
     * Mostrar erro crítico
     * @param {string} mensagem - Mensagem de erro
     */
    mostrarErro(mensagem) {
        const erro = document.createElement('div');
        erro.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(244, 67, 54, 0.9);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10002;
            text-align: center;
            padding: 20px;
        `;
        erro.innerHTML = `
            <div>
                <h1>❌ Erro</h1>
                <p style="font-size: 18px; margin: 20px 0;">${mensagem}</p>
                <button onclick="window.location.reload()" style="padding: 12px 24px; font-size: 16px; background: white; color: #f44336; border: none; border-radius: 6px; cursor: pointer;">
                    🔄 Recarregar Página
                </button>
            </div>
        `;
        document.body.appendChild(erro);
    }

    /**
     * Verificar se é página de admin
     * @returns {boolean}
     */
    isAdminPage() {
        return window.location.pathname.includes('admin.html');
    }
}

// Não inicializar aqui - será inicializado no HTML
// const app = new PontosEntretenimentoApp();

// Disponibilizar globalmente quando instanciado
// window.app = app;

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PontosEntretenimentoApp;
}
