/**
 * Gerenciador Administrativo - Pontos de Entretenimento DF
 * Funcionalidades específicas para o painel administrativo
 *
 * @author Tales Oliveira (github.com/TalesLimaOliveira)
 * @version 1.0.0
 * @note Este arquivo contém trechos de código gerados com auxílio de Inteligência Artificial.
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
        console.log('🛠️ Inicializando AdminManager...');
        
        // Verificar permissões
        if (!window.authManager?.isAdmin()) {
            console.warn('❌ Usuário não é administrador');
            this.redirectToLogin();
            return;
        }

        // Configurar interface
        this.setupInterface();
        
        // Carregar dados iniciais
        await this.loadInitialData();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Inicializar mapa admin
        this.initializeAdminMap();
        
        console.log('✅ AdminManager inicializado');
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
            // Carregar estatísticas
            await this.loadStatistics();
            
            // Carregar dados das tabs
            await this.loadTabData();
            
            // Inicializar gráficos
            this.initializeCharts();
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this.showNotification('Erro ao carregar dados', 'error');
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

            console.log('✅ Mapa administrativo inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar mapa admin:', error);
        }
    }

    /**
     * Carregar pontos no mapa
     */
    loadMapPoints() {
        const pontos = window.databaseManager?.obterTodos() || [];
        
        pontos.forEach(ponto => {
            const marker = L.marker([ponto.latitude, ponto.longitude])
                .addTo(this.adminMap)
                .bindPopup(`
                    <div class="popup-admin">
                        <h4>${ponto.nome}</h4>
                        <p><strong>Categoria:</strong> ${ponto.categoria}</p>
                        <p><strong>Endereço:</strong> ${ponto.endereco || 'N/A'}</p>
                        <div class="popup-actions">
                            <button class="btn btn-sm btn-primary" onclick="window.adminManager.editPoint(${ponto.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="window.adminManager.deletePoint(${ponto.id})">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                `);

            // Adicionar evento de clique para edição
            marker.on('click', () => {
                this.selectPoint(ponto.id);
            });
        });
    }

    /**
     * Carregar estatísticas
     */
    async loadStatistics() {
        try {
            const stats = window.databaseManager?.getEstatisticas?.() || {
                totalPontos: 0,
                pontosPorCategoria: {},
                pontosRecentes: []
            };
            
            // Atualizar cards de estatísticas (com fallback se elementos não existirem)
            const statElements = {
                'stat-total-pontos': stats.totalPontos,
                'stat-categorias': Object.keys(stats.pontosPorCategoria || {}).length,
                'stat-usuarios': window.authManager?.getTotalUsers?.() || 0,
                'stat-hoje': this.getPointsAddedToday()
            };

            Object.entries(statElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
        }
    }

    /**
     * Carregar dados das tabs
     */
    async loadTabData() {
        // Carregar dados da tab de pontos
        this.loadPointsData();
        
        // Carregar dados da tab de categorias
        this.loadCategoriesData();
        
        // Carregar dados da tab de usuários
        this.loadUsersData();
    }

    /**
     * Carregar dados de pontos
     */
    loadPointsData() {
        const pontos = window.databaseManager?.obterTodos() || [];
        const tbody = document.getElementById('pontos-tbody');
        
        if (!tbody) return;

        // Aplicar filtros
        let filteredPontos = this.filterPoints(pontos);
        
        // Aplicar ordenação
        filteredPontos = this.sortPoints(filteredPontos);
        
        // Aplicar paginação
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedPontos = filteredPontos.slice(startIndex, endIndex);
        
        // Gerar HTML
        tbody.innerHTML = paginatedPontos.map(ponto => `
            <tr>
                <td>${ponto.id}</td>
                <td>${ponto.nome}</td>
                <td>
                    <span class="badge badge-primary">${ponto.categoria}</span>
                </td>
                <td>${ponto.endereco || 'N/A'}</td>
                <td>
                    <span class="status-badge ${ponto.status === 'aprovado' ? 'status-active' : 'status-pending'}">${ponto.status || 'Ativo'}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="window.adminManager.editPoint(${ponto.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.adminManager.deletePoint(${ponto.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Atualizar paginação
        this.updatePagination(filteredPontos.length);
    }

    /**
     * Carregar dados de categorias
     */
    loadCategoriesData() {
        const categorias = databaseManager.getCategorias();
        const container = document.getElementById('categories-grid');
        
        if (!container) return;

        container.innerHTML = categorias.map(categoria => {
            const stats = databaseManager.getEstatisticas();
            const count = stats.pontosPorCategoria[categoria.id] || 0;
            
            return `
                <div class="category-card">
                    <div class="category-header">
                        <div class="category-icon" style="background: ${categoria.cor}20; color: ${categoria.cor};">
                            ${categoria.icone}
                        </div>
                        <div class="category-actions">
                            <button class="action-btn action-btn-edit" onclick="adminManager.editCategory('${categoria.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn action-btn-delete" onclick="adminManager.deleteCategory('${categoria.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="category-name">${categoria.nome}</div>
                    <div class="category-description">${categoria.descricao || 'Sem descrição'}</div>
                    <div class="category-stats">
                        <span>Pontos: <span class="category-count">${count}</span></span>
                        <span style="color: ${categoria.cor};">●</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Carregar dados de usuários
     */
    loadUsersData() {
        const usuarios = authManager.getAllUsers();
        const tbody = document.getElementById('usuarios-tbody');
        
        if (!tbody) return;

        tbody.innerHTML = usuarios.map(usuario => `
            <tr>
                <td>${usuario.id}</td>
                <td>${usuario.name}</td>
                <td>${usuario.email || 'N/A'}</td>
                <td>
                    <span class="badge ${usuario.role === 'administrator' ? 'badge-danger' : 'badge-secondary'}">
                        ${usuario.role === 'administrator' ? 'Administrador' : 'Usuário'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${usuario.active ? 'status-active' : 'status-inactive'}">
                        ${usuario.active ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>${usuario.lastLogin ? new Date(usuario.lastLogin).toLocaleDateString() : 'Nunca'}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn action-btn-edit" onclick="adminManager.editUser(${usuario.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn action-btn-delete" onclick="adminManager.deleteUser(${usuario.id})" ${usuario.role === 'administrator' ? 'disabled' : ''}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Obter pontos adicionados hoje
     */
    getPointsAddedToday() {
        const pontos = window.databaseManager?.obterTodos() || [];
        const hoje = new Date().toDateString();
        
        return pontos.filter(ponto => {
            const dataAdicao = new Date(ponto.dataAdicao || ponto.dataCriacao || Date.now());
            return dataAdicao.toDateString() === hoje;
        }).length;
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
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
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
                this.loadPointsData();
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
     * Inicializar gráficos
     */
    initializeCharts() {
        this.initializeCategoriesChart();
    }

    /**
     * Inicializar gráfico de categorias
     */
    initializeCategoriesChart() {
        const canvas = document.getElementById('categorias-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const stats = databaseManager.getEstatisticas();
        const categorias = databaseManager.getCategorias();

        const data = {
            labels: categorias.map(c => c.nome),
            datasets: [{
                label: 'Pontos por Categoria',
                data: categorias.map(c => stats.pontosPorCategoria[c.id] || 0),
                backgroundColor: categorias.map(c => c.cor + '80'),
                borderColor: categorias.map(c => c.cor),
                borderWidth: 2
            }]
        };

        if (this.charts.categorias) {
            this.charts.categorias.destroy();
        }

        this.charts.categorias = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Filtrar pontos
     * @param {Array} pontos - Array de pontos
     * @returns {Array} Pontos filtrados
     */
    filterPoints(pontos) {
        return pontos.filter(ponto => {
            // Filtro por categoria
            if (this.filters.categoria !== 'todos' && ponto.categoria !== this.filters.categoria) {
                return false;
            }
            
            // Filtro por busca
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                return ponto.nome.toLowerCase().includes(searchTerm) ||
                       ponto.endereco.toLowerCase().includes(searchTerm) ||
                       ponto.categoria.toLowerCase().includes(searchTerm);
            }
            
            return true;
        });
    }

    /**
     * Ordenar pontos
     * @param {Array} pontos - Array de pontos
     * @returns {Array} Pontos ordenados
     */
    sortPoints(pontos) {
        return pontos.sort((a, b) => {
            let aVal = a[this.sortBy];
            let bVal = b[this.sortBy];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (this.sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    /**
     * Aplicar filtros
     */
    applyFilters() {
        this.filters.categoria = document.getElementById('filter-categoria')?.value || 'todos';
        this.currentPage = 1; // Reset para primeira página
        this.loadPointsData();
    }

    /**
     * Atualizar paginação
     * @param {number} totalItems - Total de itens
     */
    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        // Atualizar informações
        const paginationInfo = document.getElementById('pagination-info');
        if (paginationInfo) {
            const start = (this.currentPage - 1) * this.itemsPerPage + 1;
            const end = Math.min(start + this.itemsPerPage - 1, totalItems);
            paginationInfo.textContent = `Mostrando ${start} a ${end} de ${totalItems} pontos`;
        }
        
        // Atualizar controles
        const paginationCurrent = document.getElementById('pagination-current');
        if (paginationCurrent) {
            paginationCurrent.textContent = `Página ${this.currentPage} de ${totalPages}`;
        }
        
        // Atualizar botões
        const btnPrev = document.querySelector('[data-action="prev-page"]');
        const btnNext = document.querySelector('[data-action="next-page"]');
        
        if (btnPrev) {
            btnPrev.disabled = this.currentPage === 1;
        }
        
        if (btnNext) {
            btnNext.disabled = this.currentPage === totalPages;
        }
    }

    /**
     * Página anterior
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadPointsData();
        }
    }

    /**
     * Próxima página
     */
    nextPage() {
        this.currentPage++;
        this.loadPointsData();
    }

    /**
     * Visualizar ponto
     * @param {number} id - ID do ponto
     */
    viewPoint(id) {
        const ponto = databaseManager.obterPorId(id);
        if (!ponto) return;

        const conteudo = `
            <div class="point-details">
                <h4>${ponto.nome}</h4>
                <p><strong>Categoria:</strong> ${ponto.categoria}</p>
                <p><strong>Endereço:</strong> ${ponto.endereco}</p>
                <p><strong>Descrição:</strong> ${ponto.descricao || 'Sem descrição'}</p>
                <p><strong>Telefone:</strong> ${ponto.telefone || 'Não informado'}</p>
                <p><strong>Horário:</strong> ${ponto.horario || 'Não informado'}</p>
                <p><strong>Coordenadas:</strong> ${ponto.latitude}, ${ponto.longitude}</p>
                <p><strong>Data de Criação:</strong> ${new Date(ponto.dataCriacao || Date.now()).toLocaleDateString()}</p>
            </div>
        `;

        const botoes = [{
            texto: 'Fechar',
            classe: 'btn-secondary',
            acao: () => modalManager.fecharModal()
        }];

        const modal = modalManager.criarModal(`Detalhes: ${ponto.nome}`, conteudo, botoes);
        modalManager.mostrarModal(modal);
    }

    /**
     * Editar ponto
     * @param {number} id - ID do ponto
     */
    editPoint(id) {
        const ponto = databaseManager.obterPorId(id);
        if (!ponto) return;

        modalManager.abrirModalEdicaoPonto(ponto);
    }

    /**
     * Excluir ponto
     * @param {number} id - ID do ponto
     */
    deletePoint(id) {
        const ponto = databaseManager.obterPorId(id);
        if (!ponto) return;

        if (confirm(`Tem certeza que deseja excluir o ponto "${ponto.nome}"?`)) {
            if (databaseManager.removerPonto(id)) {
                this.showNotification('Ponto excluído com sucesso!', 'success');
                this.loadPointsData();
                this.loadStatistics();
                this.loadMapPoints();
            } else {
                this.showNotification('Erro ao excluir ponto', 'error');
            }
        }
    }

    /**
     * Obter pontos adicionados hoje
     * @returns {number} Quantidade de pontos
     */
    getPointsAddedToday() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const pontos = databaseManager.obterTodos();
        return pontos.filter(ponto => {
            const dataCriacao = new Date(ponto.dataCriacao || 0);
            return dataCriacao >= hoje;
        }).length;
    }

    /**
     * Popularizar filtros
     */
    populateFilters() {
        const selectCategoria = document.getElementById('filter-categoria');
        if (!selectCategoria) return;

        const categorias = databaseManager.getCategorias();
        selectCategoria.innerHTML = '<option value="todos">Todas</option>';
        
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nome;
            selectCategoria.appendChild(option);
        });
    }

    /**
     * Atualizar informações do usuário
     */
    updateUserInfo() {
        const usuario = authManager.getCurrentUser();
        if (!usuario) return;

        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = usuario.name;
        }
    }

    /**
     * Configurar tooltips
     */
    setupTooltips() {
        // !TODO: Implement informative tooltips in admin interface
    }

    /**
     * Redirecionar para login
     */
    redirectToLogin() {
        window.location.href = 'index.html';
    }

    /**
     * Mostrar notificação
     * @param {string} mensagem - Mensagem da notificação
     * @param {string} tipo - Tipo da notificação
     */
    showNotification(mensagem, tipo = 'info') {
        // Usar o sistema de notificações do app principal
        if (window.app) {
            window.app.mostrarNotificacao(mensagem, tipo);
        } else {
            console.log(`${tipo.toUpperCase()}: ${mensagem}`);
        }
    }

    /**
     * Toggle do menu do usuário
     */
    toggleUserMenu() {
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.classList.toggle('active');
        }
    }

    /**
     * Mostrar modal de novo ponto
     */
    mostrarModalNovoPonto() {
        modalManager.abrirModalAdicaoPonto();
    }

    /**
     * Mostrar modal de nova categoria
     */
    mostrarModalNovaCategoria() {
        alert('Funcionalidade em desenvolvimento');
    }

    /**
     * Mostrar modal de novo usuário
     */
    mostrarModalNovoUsuario() {
        alert('Funcionalidade em desenvolvimento');
    }

    /**
     * Exportar relatório
     */
    exportarRelatorio() {
        alert('Funcionalidade em desenvolvimento');
    }

    /**
     * Gerar relatório
     */
    gerarRelatorio() {
        alert('Funcionalidade em desenvolvimento');
    }

    /**
     * Mostrar ajuda
     */
    mostrarAjuda() {
        alert('Funcionalidade em desenvolvimento');
    }

    /**
     * Mostrar logs
     */
    mostrarLogs() {
        alert('Funcionalidade em desenvolvimento');
    }

    /**
     * Gerenciar pontos pendentes
     */
    mostrarPontosPendentes() {
        const pontosPendentes = databaseManager.getPontosPendentes();
        
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
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pontosPendentes.map(ponto => `
                                    <tr>
                                        <td>
                                            <strong>${ponto.nome}</strong><br>
                                            <small class="text-muted">${ponto.endereco || 'Sem endereço'}</small>
                                        </td>
                                        <td>
                                            <span class="badge badge-info">${ponto.categoria}</span>
                                        </td>
                                        <td>${ponto.adicionadoPor || 'Anônimo'}</td>
                                        <td>${new Date(ponto.dataAdicao).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                            <div class="btn-group">
                                                <button class="btn btn-success btn-sm" onclick="adminManager.aprovarPonto(${ponto.id})">
                                                    <i class="fas fa-check"></i> Aprovar
                                                </button>
                                                <button class="btn btn-warning btn-sm" onclick="adminManager.visualizarPonto(${ponto.id})">
                                                    <i class="fas fa-eye"></i> Ver
                                                </button>
                                                <button class="btn btn-danger btn-sm" onclick="adminManager.rejeitarPonto(${ponto.id})">
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
     * Aprovar ponto pendente
     */
    aprovarPonto(pontoId) {
        if (confirm('Aprovar este ponto?')) {
            try {
                databaseManager.aprovarPonto(pontoId, 'administrator');
                this.showNotification('Ponto aprovado com sucesso!', 'success');
                this.mostrarPontosPendentes(); // Recarregar lista
                this.atualizarContadores();
            } catch (error) {
                this.showNotification('Erro ao aprovar ponto: ' + error.message, 'error');
            }
        }
    }

    /**
     * Rejeitar ponto pendente
     */
    rejeitarPonto(pontoId) {
        if (confirm('Rejeitar este ponto? Ele será movido para pontos ocultos.')) {
            try {
                databaseManager.ocultarPonto(pontoId, 'administrator');
                this.showNotification('Ponto rejeitado e ocultado', 'warning');
                this.mostrarPontosPendentes(); // Recarregar lista
                this.atualizarContadores();
            } catch (error) {
                this.showNotification('Erro ao rejeitar ponto: ' + error.message, 'error');
            }
        }
    }

    /**
     * Mostrar pontos ocultos
     */
    mostrarPontosOcultos() {
        const pontosOcultos = databaseManager.getPontosOcultos();
        
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
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pontosOcultos.map(ponto => `
                                    <tr>
                                        <td>
                                            <strong>${ponto.nome}</strong><br>
                                            <small class="text-muted">${ponto.endereco || 'Sem endereço'}</small>
                                        </td>
                                        <td>
                                            <span class="badge badge-secondary">${ponto.categoria}</span>
                                        </td>
                                        <td>${ponto.dataOcultacao ? new Date(ponto.dataOcultacao).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                        <td>
                                            <div class="btn-group">
                                                <button class="btn btn-success btn-sm" onclick="adminManager.restaurarPonto(${ponto.id})">
                                                    <i class="fas fa-undo"></i> Restaurar
                                                </button>
                                                <button class="btn btn-info btn-sm" onclick="adminManager.visualizarPonto(${ponto.id})">
                                                    <i class="fas fa-eye"></i> Ver
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
     * Restaurar ponto oculto
     */
    restaurarPonto(pontoId) {
        if (confirm('Restaurar este ponto? Ele ficará visível novamente.')) {
            try {
                databaseManager.restaurarPonto(pontoId, 'administrator');
                this.showNotification('Ponto restaurado com sucesso!', 'success');
                this.mostrarPontosOcultos(); // Recarregar lista
                this.atualizarContadores();
            } catch (error) {
                this.showNotification('Erro ao restaurar ponto: ' + error.message, 'error');
            }
        }
    }

    /**
     * Mostrar sugestões pendentes
     */
    mostrarSugestoes() {
        const sugestoes = databaseManager.getSugestoesPendentes();
        
        const html = `
            <div class="admin-section">
                <div class="section-header">
                    <h2><i class="fas fa-edit"></i> Sugestões de Mudança</h2>
                    <p>Total: ${sugestoes.length} sugestões pendentes</p>
                </div>
                
                ${sugestoes.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-check-circle"></i>
                        <h3>Nenhuma sugestão pendente</h3>
                        <p>Todas as sugestões foram revisadas!</p>
                    </div>
                ` : `
                    <div class="suggestions-list">
                        ${sugestoes.map(sugestao => {
                            const ponto = databaseManager.getPontoById(sugestao.pontoId);
                            return `
                                <div class="suggestion-card">
                                    <div class="suggestion-header">
                                        <h4>${ponto ? ponto.nome : 'Ponto não encontrado'}</h4>
                                        <span class="badge badge-warning">Pendente</span>
                                    </div>
                                    <div class="suggestion-content">
                                        <p><strong>Sugerido por:</strong> ${sugestao.usuarioSugeriu}</p>
                                        <p><strong>Data:</strong> ${new Date(sugestao.dataSugestao).toLocaleDateString('pt-BR')}</p>
                                        
                                        <h5>Mudanças propostas:</h5>
                                        <div class="changes-list">
                                            ${Object.entries(sugestao.sugestoes).map(([campo, valor]) => `
                                                <div class="change-item">
                                                    <strong>${campo}:</strong> ${valor}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                    <div class="suggestion-actions">
                                        <button class="btn btn-success btn-sm" onclick="adminManager.aprovarSugestao(${sugestao.id})">
                                            <i class="fas fa-check"></i> Aprovar
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="adminManager.rejeitarSugestao(${sugestao.id})">
                                            <i class="fas fa-times"></i> Rejeitar
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        `;
        
        this.renderTabContent(html);
    }

    /**
     * Aprovar sugestão
     */
    aprovarSugestao(sugestaoId) {
        if (confirm('Aprovar esta sugestão? As mudanças serão aplicadas ao ponto.')) {
            try {
                databaseManager.aprovarSugestao(sugestaoId, 'administrator');
                this.showNotification('Sugestão aprovada com sucesso!', 'success');
                this.mostrarSugestoes(); // Recarregar lista
                this.atualizarContadores();
            } catch (error) {
                this.showNotification('Erro ao aprovar sugestão: ' + error.message, 'error');
            }
        }
    }

    /**
     * Rejeitar sugestão
     */
    rejeitarSugestao(sugestaoId) {
        if (confirm('Rejeitar esta sugestão?')) {
            // !TODO: Implement point rejection logic with user feedback
            this.showNotification('Funcionalidade em desenvolvimento', 'info');
        }
    }

    /**
     * Atualizar contadores nas abas
     */
    atualizarContadores() {
        const pendentesCount = databaseManager.getPontosPendentes().length;
        const sugestoesCount = databaseManager.getSugestoesPendentes().length;
        
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
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// Disponibilizar globalmente
window.AdminManager = AdminManager;
