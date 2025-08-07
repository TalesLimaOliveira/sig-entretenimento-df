/**
 * Gerenciador Administrativo - Pontos de Entretenimento DF
 * Funcionalidades específicas para o painel administrativo
 */
class AdminManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortBy = 'nome';
        this.sortOrder = 'asc';
        this.filters = {
            categoria: 'todos',
            search: '',
            status: 'todos'
        };
        this.charts = {};
        this.init();
    }

    /**
     * Inicializar o gerenciador administrativo
     */
    async init() {
        try {
            console.log('🚀 Inicializando AdminManager...');

            // Verificar permissões
            if (!window.authManager) {
                console.error('❌ AuthManager não está disponível');
                throw new Error('AuthManager não inicializado');
            }

            const isAuthenticated = window.authManager.isAuthenticated();
            const currentUser = window.authManager.getCurrentUser();
            
            console.log('👤 Usuário autenticado:', isAuthenticated);
            console.log('📋 Usuário atual:', currentUser);

            // Se não há usuário logado, fazer login automático como admin para desenvolvimento
            if (!isAuthenticated) {
                console.log('🔐 Nenhum usuário logado, tentando login automático de admin...');
                try {
                    await window.authManager.login('admin', 'admin');
                    console.log('✅ Login automático de admin realizado');
                } catch (loginError) {
                    console.error('❌ Falha no login automático:', loginError);
                    this.redirectToLogin();
                    return;
                }
            }

            if (!window.authManager.isAdmin()) {
                console.warn('⚠️ Usuário não é administrador');
                this.redirectToLogin();
                return;
            }

            console.log('✅ Permissões confirmadas - usuário é admin');

            // Configurar interface
            this.setupInterface();
            
            // Carregar dados iniciais
            await this.loadInitialData();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Inicializar mapa admin
            this.initializeAdminMap();
            
            // Remover tela de loading
            this.hideLoadingScreen();
            
            console.log('✅ AdminManager inicializado com sucesso');
        } catch (error) {
            console.error('💥 Erro crítico durante inicialização do AdminManager:', error);
            this.showNotification('Erro ao inicializar painel administrativo', 'error');
            this.hideLoadingScreen();
        }
    }

    /**
     * Configurar interface administrativa
     */
    setupInterface() {
        // Atualizar informações do usuário
        this.updateUserInfo();
        
        // Mostrar tab inicial
        this.showTab('dashboard');
        
        // Configurar tooltips
        this.setupTooltips();
    }

    /**
     * Carregar dados iniciais
     */
    async loadInitialData() {
        try {
            console.log('📊 Iniciando carregamento de dados...');
            
            // Carregar estatísticas
            await this.loadStatistics();
            
            // Carregar dados das tabs
            await this.loadTabData();
            
            // Inicializar gráficos
            this.initializeCharts();
            
            // Atualizar contadores
            this.atualizarContadores();
            
            console.log('✅ Dados iniciais carregados');
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this.showNotification('Erro ao carregar dados', 'error');
            throw error;
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Eventos de navegação
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-tab')) {
                const tab = e.target.dataset.tab;
                this.showTab(tab);
            }
        });

        // Eventos de filtros
        document.getElementById('filter-categoria')?.addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('search-pontos')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.applyFilters();
        });

        // Eventos de ordenação
        document.getElementById('sort-pontos')?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.applyFilters();
        });

        // Eventos de paginação
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="prev-page"]')) {
                this.previousPage();
            } else if (e.target.matches('[data-action="next-page"]')) {
                this.nextPage();
            }
        });

        // Eventos de modal
        document.addEventListener('click', (e) => {
            if (e.target.matches('.action-btn-edit')) {
                const id = e.target.dataset.id;
                this.editItem(id);
            } else if (e.target.matches('.action-btn-delete')) {
                const id = e.target.dataset.id;
                this.deleteItem(id);
            }
        });
    }

    /**
     * Mostrar tab específica
     * @param {string} tabName - Nome da tab
     */
    showTab(tabName) {
        // Remover active de todas as tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Ativar tab atual
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        const tabContent = document.getElementById(`tab-${tabName}`);
        
        if (tabButton) tabButton.classList.add('active');
        if (tabContent) tabContent.classList.add('active');
        
        this.currentTab = tabName;

        // Carregar dados específicos da tab
        this.loadTabSpecificData(tabName);
    }

    /**
     * Carregar dados específicos de uma tab
     * @param {string} tabName - Nome da tab
     */
    loadTabSpecificData(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.loadStatistics();
                this.initializeCharts();
                break;
            case 'pontos':
                this.mostrarPontosConfirmados();
                this.populateFilters();
                break;
            case 'pendentes':
                this.mostrarPontosPendentes();
                break;
            case 'ocultos':
                this.mostrarPontosOcultos();
                break;
            case 'sugestoes':
                this.mostrarSugestoes();
                break;
            case 'usuarios':
                this.loadUsersData();
                break;
            case 'relatorios':
                this.loadReportsData();
                break;
        }

        // Atualizar contadores sempre que trocar de aba
        this.atualizarContadores();
    }

    /**
     * Mostrar pontos confirmados (principais)
     */
    mostrarPontosConfirmados() {
        const pontosConfirmados = window.databaseManager?.confirmedPoints || [];
        
        const html = `
            <div class="admin-section">
                <div class="section-header">
                    <h2><i class="fas fa-map-marker-alt"></i> Pontos Confirmados</h2>
                    <p>Total: ${pontosConfirmados.length} pontos ativos no mapa</p>
                    <button class="btn btn-primary" onclick="window.addPointModal?.open()">
                        <i class="fas fa-plus"></i> Adicionar Ponto
                    </button>
                </div>
                
                ${pontosConfirmados.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-map-marker-alt"></i>
                        <h3>Nenhum ponto confirmado</h3>
                        <p>Adicione o primeiro ponto ao sistema!</p>
                        <button class="btn btn-primary" onclick="window.addPointModal?.open()">
                            <i class="fas fa-plus"></i> Adicionar Primeiro Ponto
                        </button>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Categoria</th>
                                    <th>Endereço</th>
                                    <th>Data Criação</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pontosConfirmados.map(ponto => `
                                    <tr>
                                        <td>${ponto.id}</td>
                                        <td>
                                            <strong>${ponto.nome}</strong>
                                            ${ponto.descricao ? `<br><small class="text-muted">${ponto.descricao.substring(0, 50)}${ponto.descricao.length > 50 ? '...' : ''}</small>` : ''}
                                        </td>
                                        <td><span class="badge badge-primary">${this.getCategoryName(ponto.categoria)}</span></td>
                                        <td>${ponto.endereco || 'Sem endereço'}</td>
                                        <td>${new Date(ponto.dataCriacao || ponto.dataAdicao || Date.now()).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                            <div class="btn-group">
                                                <button class="btn btn-info btn-sm" onclick="adminManager.visualizarPonto(${ponto.id})" title="Visualizar">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-warning btn-sm" onclick="adminManager.editarPonto(${ponto.id})" title="Editar">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-secondary btn-sm" onclick="adminManager.ocultarPonto(${ponto.id})" title="Ocultar">
                                                    <i class="fas fa-eye-slash"></i>
                                                </button>
                                                <button class="btn btn-danger btn-sm" onclick="adminManager.deletarPonto(${ponto.id})" title="Deletar">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
        
        this.renderTabContent(html);
    }

    /**
     * Mostrar pontos pendentes de aprovação
     */
    mostrarPontosPendentes() {
        const pontosPendentes = window.databaseManager?.pendingPoints || [];
        
        const html = `
            <div class="admin-section">
                <div class="section-header">
                    <h2><i class="fas fa-clock"></i> Pontos Pendentes de Aprovação</h2>
                    <p>Total: ${pontosPendentes.length} pontos aguardando aprovação</p>
                </div>
                
                ${pontosPendentes.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-check-circle"></i>
                        <h3>Nenhum ponto pendente</h3>
                        <p>Todos os pontos foram revisados!</p>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Categoria</th>
                                    <th>Enviado por</th>
                                    <th>Data</th>
                                    <th>Localização</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pontosPendentes.map(ponto => `
                                    <tr>
                                        <td>
                                            <strong>${ponto.nome}</strong>
                                            ${ponto.descricao ? `<br><small class="text-muted">${ponto.descricao.substring(0, 80)}${ponto.descricao.length > 80 ? '...' : ''}</small>` : ''}
                                        </td>
                                        <td><span class="badge badge-info">${this.getCategoryName(ponto.categoria)}</span></td>
                                        <td>${ponto.adicionadoPor || 'Anônimo'}</td>
                                        <td>${new Date(ponto.dataAdicao || ponto.dataCriacao || Date.now()).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                            ${ponto.endereco || 'Sem endereço'}<br>
                                            <small class="text-muted">
                                                ${ponto.coordenadas ? `${ponto.coordenadas[0].toFixed(4)}, ${ponto.coordenadas[1].toFixed(4)}` : 'Sem coordenadas'}
                                            </small>
                                        </td>
                                        <td>
                                            <div class="btn-group-vertical btn-group-sm">
                                                <button class="btn btn-success btn-sm" onclick="adminManager.aprovarPonto(${ponto.id})" title="Aprovar">
                                                    <i class="fas fa-check"></i> Aprovar
                                                </button>
                                                <button class="btn btn-info btn-sm" onclick="adminManager.visualizarPonto(${ponto.id})" title="Visualizar">
                                                    <i class="fas fa-eye"></i> Ver Detalhes
                                                </button>
                                                <button class="btn btn-danger btn-sm" onclick="adminManager.rejeitarPonto(${ponto.id})" title="Rejeitar">
                                                    <i class="fas fa-times"></i> Rejeitar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
        
        this.renderTabContent(html);
    }

    /**
     * Mostrar pontos ocultos
     */
    mostrarPontosOcultos() {
        const pontosOcultos = window.databaseManager?.hiddenPoints || [];
        
        const html = `
            <div class="admin-section">
                <div class="section-header">
                    <h2><i class="fas fa-eye-slash"></i> Pontos Ocultos</h2>
                    <p>Total: ${pontosOcultos.length} pontos ocultos</p>
                </div>
                
                ${pontosOcultos.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-eye"></i>
                        <h3>Nenhum ponto oculto</h3>
                        <p>Todos os pontos estão visíveis!</p>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Categoria</th>
                                    <th>Data Ocultação</th>
                                    <th>Motivo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pontosOcultos.map(ponto => `
                                    <tr>
                                        <td>
                                            <strong>${ponto.nome}</strong>
                                            ${ponto.descricao ? `<br><small class="text-muted">${ponto.descricao.substring(0, 50)}${ponto.descricao.length > 50 ? '...' : ''}</small>` : ''}
                                        </td>
                                        <td><span class="badge badge-secondary">${this.getCategoryName(ponto.categoria)}</span></td>
                                        <td>${ponto.dataOcultacao ? new Date(ponto.dataOcultacao).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                        <td>${ponto.motivoOcultacao || 'Não informado'}</td>
                                        <td>
                                            <div class="btn-group">
                                                <button class="btn btn-success btn-sm" onclick="adminManager.restaurarPonto(${ponto.id})" title="Restaurar">
                                                    <i class="fas fa-undo"></i> Restaurar
                                                </button>
                                                <button class="btn btn-info btn-sm" onclick="adminManager.visualizarPonto(${ponto.id})" title="Ver">
                                                    <i class="fas fa-eye"></i> Ver
                                                </button>
                                                <button class="btn btn-danger btn-sm" onclick="adminManager.deletarPontoPermanente(${ponto.id})" title="Deletar Permanentemente">
                                                    <i class="fas fa-trash-alt"></i> Deletar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
        
        this.renderTabContent(html);
    }

    /**
     * Aprovar ponto pendente
     */
    aprovarPonto(pontoId) {
        if (confirm('Aprovar este ponto? Ele ficará visível no mapa.')) {
            try {
                const resultado = window.databaseManager.aprovarPonto(pontoId, 'administrator');
                this.showNotification('Ponto aprovado com sucesso!', 'success');
                this.mostrarPontosPendentes(); // Recarregar lista
                this.atualizarContadores();
                
                console.log('✅ Ponto aprovado:', resultado);
            } catch (error) {
                console.error('❌ Erro ao aprovar ponto:', error);
                this.showNotification('Erro ao aprovar ponto: ' + error.message, 'error');
            }
        }
    }

    /**
     * Rejeitar ponto pendente (mover para ocultos)
     */
    rejeitarPonto(pontoId) {
        const motivo = prompt('Informe o motivo da rejeição (opcional):') || 'Rejeitado pelo administrador';
        
        if (confirm('Rejeitar este ponto? Ele será movido para pontos ocultos.')) {
            try {
                const resultado = window.databaseManager.ocultarPonto(pontoId, 'administrator');
                
                // Adicionar motivo da ocultação
                if (resultado) {
                    resultado.motivoOcultacao = motivo;
                    window.databaseManager.saveAllData();
                }
                
                this.showNotification('Ponto rejeitado e ocultado', 'warning');
                this.mostrarPontosPendentes(); // Recarregar lista
                this.atualizarContadores();
                
                console.log('⚠️ Ponto rejeitado:', resultado);
            } catch (error) {
                console.error('❌ Erro ao rejeitar ponto:', error);
                this.showNotification('Erro ao rejeitar ponto: ' + error.message, 'error');
            }
        }
    }

    /**
     * Ocultar ponto confirmado
     */
    ocultarPonto(pontoId) {
        const motivo = prompt('Informe o motivo para ocultar este ponto (opcional):') || 'Ocultado pelo administrador';
        
        if (confirm('Ocultar este ponto? Ele não ficará mais visível no mapa.')) {
            try {
                const resultado = window.databaseManager.ocultarPonto(pontoId, 'administrator');
                
                // Adicionar motivo da ocultação
                if (resultado) {
                    resultado.motivoOcultacao = motivo;
                    window.databaseManager.saveAllData();
                }
                
                this.showNotification('Ponto ocultado com sucesso', 'warning');
                this.mostrarPontosConfirmados(); // Recarregar lista
                this.atualizarContadores();
                
                console.log('👁️‍🗨️ Ponto ocultado:', resultado);
            } catch (error) {
                console.error('❌ Erro ao ocultar ponto:', error);
                this.showNotification('Erro ao ocultar ponto: ' + error.message, 'error');
            }
        }
    }

    /**
     * Restaurar ponto oculto
     */
    restaurarPonto(pontoId) {
        if (confirm('Restaurar este ponto? Ele ficará visível novamente no mapa.')) {
            try {
                const resultado = window.databaseManager.restaurarPonto(pontoId, 'administrator');
                this.showNotification('Ponto restaurado com sucesso!', 'success');
                this.mostrarPontosOcultos(); // Recarregar lista
                this.atualizarContadores();
                
                console.log('🔄 Ponto restaurado:', resultado);
            } catch (error) {
                console.error('❌ Erro ao restaurar ponto:', error);
                this.showNotification('Erro ao restaurar ponto: ' + error.message, 'error');
            }
        }
    }

    /**
     * Deletar ponto permanentemente
     */
    deletarPonto(pontoId) {
        const ponto = window.databaseManager.getPontoById(pontoId);
        if (!ponto) return;

        if (confirm(`ATENÇÃO: Deletar permanentemente o ponto "${ponto.nome}"?\n\nEsta ação NÃO pode ser desfeita!`)) {
            try {
                const sucesso = window.databaseManager.deletarPonto(pontoId, 'administrator');
                
                if (sucesso) {
                    this.showNotification('Ponto deletado permanentemente!', 'success');
                    
                    // Recarregar a lista atual
                    if (this.currentTab === 'pontos') {
                        this.mostrarPontosConfirmados();
                    } else if (this.currentTab === 'pendentes') {
                        this.mostrarPontosPendentes();
                    } else if (this.currentTab === 'ocultos') {
                        this.mostrarPontosOcultos();
                    }
                    
                    this.atualizarContadores();
                    
                    console.log('🗑️ Ponto deletado permanentemente:', pontoId);
                } else {
                    this.showNotification('Erro ao deletar ponto', 'error');
                }
            } catch (error) {
                console.error('❌ Erro ao deletar ponto:', error);
                this.showNotification('Erro ao deletar ponto: ' + error.message, 'error');
            }
        }
    }

    /**
     * Deletar ponto permanentemente (alias para compatibilidade)
     */
    deletarPontoPermanente(pontoId) {
        this.deletarPonto(pontoId);
    }

    /**
     * Visualizar detalhes de um ponto
     */
    visualizarPonto(pontoId) {
        const ponto = window.databaseManager.getPontoById(pontoId);
        if (!ponto) {
            this.showNotification('Ponto não encontrado', 'error');
            return;
        }

        const statusInfo = this.getStatusInfo(ponto);
        
        const conteudo = `
            <div class="point-details">
                <div class="point-header">
                    <h4>${ponto.nome}</h4>
                    <span class="badge ${statusInfo.class}">${statusInfo.text}</span>
                </div>
                
                <div class="point-info">
                    <div class="info-group">
                        <label><i class="fas fa-tag"></i> Categoria:</label>
                        <span>${this.getCategoryName(ponto.categoria)}</span>
                    </div>
                    
                    <div class="info-group">
                        <label><i class="fas fa-map-marker-alt"></i> Endereço:</label>
                        <span>${ponto.endereco || 'Não informado'}</span>
                    </div>
                    
                    <div class="info-group">
                        <label><i class="fas fa-info-circle"></i> Descrição:</label>
                        <span>${ponto.descricao || 'Sem descrição'}</span>
                    </div>
                    
                    <div class="info-group">
                        <label><i class="fas fa-phone"></i> Telefone:</label>
                        <span>${ponto.telefone || 'Não informado'}</span>
                    </div>
                    
                    <div class="info-group">
                        <label><i class="fas fa-clock"></i> Horário:</label>
                        <span>${ponto.horario || 'Não informado'}</span>
                    </div>
                    
                    <div class="info-group">
                        <label><i class="fas fa-dollar-sign"></i> Preço:</label>
                        <span>${ponto.preco || 'Não informado'}</span>
                    </div>
                    
                    <div class="info-group">
                        <label><i class="fas fa-globe"></i> Coordenadas:</label>
                        <span>${ponto.coordenadas ? `${ponto.coordenadas[0].toFixed(6)}, ${ponto.coordenadas[1].toFixed(6)}` : 'Não informado'}</span>
                    </div>
                    
                    <div class="info-group">
                        <label><i class="fas fa-user"></i> Adicionado por:</label>
                        <span>${ponto.adicionadoPor || 'Anônimo'}</span>
                    </div>
                    
                    <div class="info-group">
                        <label><i class="fas fa-calendar"></i> Data de Criação:</label>
                        <span>${new Date(ponto.dataCriacao || ponto.dataAdicao || Date.now()).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    ${ponto.tags && ponto.tags.length > 0 ? `
                        <div class="info-group">
                            <label><i class="fas fa-tags"></i> Tags:</label>
                            <div class="tags-list">
                                ${ponto.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${ponto.imagem ? `
                        <div class="info-group">
                            <label><i class="fas fa-image"></i> Imagem:</label>
                            <div class="image-preview">
                                <img src="${ponto.imagem.url}" alt="${ponto.imagem.description || ponto.nome}" style="max-width: 100%; height: auto; border-radius: 4px;">
                                <small class="text-muted">${ponto.imagem.description || 'Sem descrição'}</small>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        const acoes = [
            {
                texto: 'Fechar',
                classe: 'btn-secondary',
                acao: () => this.fecharModal()
            }
        ];

        this.mostrarModal(`Detalhes: ${ponto.nome}`, conteudo, acoes);
    }

    /**
     * Editar ponto
     */
    editarPonto(pontoId) {
        const ponto = window.databaseManager.getPontoById(pontoId);
        if (!ponto) {
            this.showNotification('Ponto não encontrado', 'error');
            return;
        }

        // Usar o modal de adicionar ponto em modo edição
        if (window.addPointModal) {
            window.addPointModal.open({
                isEditMode: true,
                pointData: ponto,
                onSave: (novosDados) => {
                    try {
                        const pontoAtualizado = window.databaseManager.atualizarPonto(pontoId, novosDados);
                        this.showNotification('Ponto atualizado com sucesso!', 'success');
                        
                        // Recarregar a lista atual
                        this.loadTabSpecificData(this.currentTab);
                        
                        console.log('✏️ Ponto editado:', pontoAtualizado);
                    } catch (error) {
                        console.error('❌ Erro ao editar ponto:', error);
                        this.showNotification('Erro ao editar ponto: ' + error.message, 'error');
                    }
                }
            });
        } else {
            this.showNotification('Modal de edição não disponível', 'error');
        }
    }

    /**
     * Obter nome da categoria
     */
    getCategoryName(categoriaId) {
        const categoria = window.databaseManager.getCategorias().find(c => c.id === categoriaId);
        return categoria ? categoria.nome : categoriaId;
    }

    /**
     * Obter informações de status do ponto
     */
    getStatusInfo(ponto) {
        if (ponto.status === 'pendente') {
            return { text: 'Pendente', class: 'badge-warning' };
        } else if (ponto.status === 'oculto') {
            return { text: 'Oculto', class: 'badge-secondary' };
        } else {
            return { text: 'Ativo', class: 'badge-success' };
        }
    }

    /**
     * Renderizar conteúdo da tab
     */
    renderTabContent(html) {
        const tabContent = document.getElementById(`tab-${this.currentTab}`);
        if (tabContent) {
            tabContent.innerHTML = html;
        }
    }

    /**
     * Carregar estatísticas
     */
    async loadStatistics() {
        try {
            const stats = window.databaseManager?.getEstatisticas?.() || {
                totalPontos: 0,
                totalConfirmados: 0,
                totalPendentes: 0,
                totalOcultos: 0,
                pontosPorCategoria: {},
                pontosRecentes: []
            };

            // Atualizar cards de estatísticas
            const statElements = {
                'stat-total-pontos': stats.totalConfirmados || 0,
                'stat-categorias': Object.keys(stats.pontosPorCategoria || {}).length,
                'stat-usuarios': this.getTotalUsers(),
                'stat-hoje': this.getPointsAddedToday()
            };

            Object.entries(statElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });

            console.log('📊 Estatísticas carregadas:', stats);
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
        }
    }

    /**
     * Obter total de usuários
     */
    getTotalUsers() {
        try {
            return Object.keys(window.databaseManager?.usuarios || {}).length;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Obter pontos adicionados hoje
     */
    getPointsAddedToday() {
        try {
            const hoje = new Date().toDateString();
            const todosOsPontos = [
                ...(window.databaseManager?.confirmedPoints || []),
                ...(window.databaseManager?.pendingPoints || []),
                ...(window.databaseManager?.hiddenPoints || [])
            ];
            
            return todosOsPontos.filter(ponto => {
                const dataAdicao = new Date(ponto.dataAdicao || ponto.dataCriacao || Date.now());
                return dataAdicao.toDateString() === hoje;
            }).length;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Atualizar contadores nas abas
     */
    atualizarContadores() {
        try {
            const pendentesCount = window.databaseManager?.pendingPoints?.length || 0;
            const sugestoesCount = window.databaseManager?.getSugestoesPendentes?.()?.length || 0;

            const pendentesBadge = document.getElementById('pendentes-count');
            const sugestoesBadge = document.getElementById('sugestoes-count');

            if (pendentesBadge) {
                pendentesBadge.textContent = pendentesCount;
                pendentesCount > 0 ? pendentesBadge.classList.add('pulse') : pendentesBadge.classList.remove('pulse');
            }

            if (sugestoesBadge) {
                sugestoesBadge.textContent = sugestoesCount;
                sugestoesCount > 0 ? sugestoesBadge.classList.add('pulse') : sugestoesBadge.classList.remove('pulse');
            }

            console.log('🔢 Contadores atualizados:', { pendentesCount, sugestoesCount });
        } catch (error) {
            console.error('❌ Erro ao atualizar contadores:', error);
        }
    }

    /**
     * Mostrar modal personalizado
     */
    mostrarModal(titulo, conteudo, acoes = []) {
        // Criar modal simples se não houver modal manager
        const modalHtml = `
            <div class="modal-backdrop" id="admin-modal" style="display: flex;">
                <div class="modal modal-content">
                    <div class="modal-header">
                        <h3>${titulo}</h3>
                        <button type="button" class="modal-close" onclick="document.getElementById('admin-modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${conteudo}
                    </div>
                    <div class="modal-footer">
                        ${acoes.map(acao => `
                            <button class="btn ${acao.classe}" onclick="${acao.acao ? acao.acao.toString() + '(); document.getElementById(\'admin-modal\').remove();' : 'document.getElementById(\'admin-modal\').remove();'}">
                                ${acao.texto}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    /**
     * Fechar modal
     */
    fecharModal() {
        const modal = document.getElementById('admin-modal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Mostrar notificação
     */
    showNotification(message, type = 'info') {
        // Implementação simples de notificação
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem;
            border-radius: 6px;
            z-index: 10001;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);

        console.log(`${type.toUpperCase()}: ${message}`);
    }

    /**
     * Inicializar mapa administrativo
     */
    initializeAdminMap() {
        try {
            const mapElement = document.getElementById('admin-map');
            if (!mapElement) return;

            // Criar mapa
            this.adminMap = L.map('admin-map').setView([-15.7975, -47.8919], 11);

            // Adicionar tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.adminMap);

            // Carregar pontos
            this.loadMapPoints();
            
            console.log('🗺️ Mapa administrativo inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar mapa admin:', error);
        }
    }

    /**
     * Carregar pontos no mapa
     */
    loadMapPoints() {
        if (!this.adminMap) return;

        const pontos = window.databaseManager?.confirmedPoints || [];
        
        pontos.forEach(ponto => {
            if (ponto.coordenadas && ponto.coordenadas.length === 2) {
                const marker = L.marker(ponto.coordenadas).addTo(this.adminMap)
                    .bindPopup(`
                        <div class="popup-admin">
                            <h4>${ponto.nome}</h4>
                            <p><strong>Categoria:</strong> ${this.getCategoryName(ponto.categoria)}</p>
                            <p><strong>Endereço:</strong> ${ponto.endereco || 'N/A'}</p>
                            <div class="popup-actions">
                                <button class="btn btn-sm btn-primary" onclick="window.adminManager.visualizarPonto(${ponto.id})">
                                    <i class="fas fa-eye"></i> Ver
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="window.adminManager.editarPonto(${ponto.id})">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                            </div>
                        </div>
                    `);
            }
        });
    }

    /**
     * Inicializar gráficos
     */
    initializeCharts() {
        // Placeholder para gráficos futuros
        console.log('📈 Gráficos inicializados');
    }

    /**
     * Configurar tooltips
     */
    setupTooltips() {
        // Placeholder para tooltips futuros
        console.log('💡 Tooltips configurados');
    }

    /**
     * Atualizar informações do usuário
     */
    updateUserInfo() {
        const usuario = window.authManager?.getCurrentUser();
        if (!usuario) return;

        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = usuario.username || usuario.name;
        }
    }

    /**
     * Ocultar tela de loading
     */
    hideLoadingScreen() {
        try {
            const loadingScreen = document.querySelector('.loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
                console.log('🚀 Tela de loading removida');
            }
        } catch (error) {
            console.error('❌ Erro ao remover tela de loading:', error);
        }
    }

    /**
     * Redirecionar para login
     */
    redirectToLogin() {
        window.location.href = 'index.html';
    }

    // Métodos placeholder para funcionalidades futuras
    mostrarSugestoes() { this.showNotification('Funcionalidade de sugestões em desenvolvimento', 'info'); }
    loadUsersData() { console.log('👥 Carregar dados de usuários - em desenvolvimento'); }
    loadReportsData() { console.log('📊 Carregar relatórios - em desenvolvimento'); }
    populateFilters() { console.log('🔍 Popular filtros - em desenvolvimento'); }
    applyFilters() { console.log('🔍 Aplicar filtros - em desenvolvimento'); }
    previousPage() { console.log('◀️ Página anterior - em desenvolvimento'); }
    nextPage() { console.log('▶️ Próxima página - em desenvolvimento'); }
}

// Disponibilizar globalmente
window.AdminManager = AdminManager;