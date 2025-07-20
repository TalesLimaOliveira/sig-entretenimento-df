/**
 * Database Manager - Sistema de Banco de Dados com Controle de Acesso
 */
class DatabaseManager {
    constructor() {
        this.pontosConfirmados = [];
        this.pontosPendentes = [];
        this.pontosOcultos = [];
        this.usuarios = {};
        this.categorias = [];
        this.proximoId = 1;
        this.baseStorageKey = 'pontosEntretenimento';
        this.databasePath = 'database/';
        this.init();
    }

    async init() {
        try {
            console.log('💾 Inicializando DatabaseManager com nova estrutura...');
            this.carregarCategorias();
            await this.carregarTodosDados();
            this.migrarDadosAntigos();
            console.log('✅ DatabaseManager inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar DatabaseManager:', error);
            this.inicializarDadosDefault();
        }
    }

    /**
     * Carrega todos os dados dos arquivos JSON
     */
    async carregarTodosDados() {
        try {
            // Carregar dados do localStorage primeiro
            const pontosConfirmados = localStorage.getItem(this.baseStorageKey + '_pontosConfirmados');
            const pontosPendentes = localStorage.getItem(this.baseStorageKey + '_pontosPendentes');
            const pontosOcultos = localStorage.getItem(this.baseStorageKey + '_pontosOcultos');
            const usuarios = localStorage.getItem(this.baseStorageKey + '_usuarios');

            this.pontosConfirmados = pontosConfirmados ? JSON.parse(pontosConfirmados) : [];
            this.pontosPendentes = pontosPendentes ? JSON.parse(pontosPendentes) : [];
            this.pontosOcultos = pontosOcultos ? JSON.parse(pontosOcultos) : [];
            this.usuarios = usuarios ? JSON.parse(usuarios) : {};

            // Se não há pontos confirmados, tentar carregar do db.json
            if (this.pontosConfirmados.length === 0) {
                console.log('📍 Nenhum ponto confirmado encontrado, tentando carregar do db.json...');
                await this.carregarDoPrincipalDb();
            }

            // Se ainda não há pontos, carregar dados padrão
            if (this.pontosConfirmados.length === 0) {
                console.log('📍 Carregando dados padrão...');
                this.inicializarPontosDefault();
            }

            // Calcular próximo ID
            const todosOsPontos = [...this.pontosConfirmados, ...this.pontosPendentes, ...this.pontosOcultos];
            this.proximoId = todosOsPontos.length > 0 ? Math.max(...todosOsPontos.map(p => p.id || 0)) + 1 : 1;

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.inicializarDadosDefault();
        }
    }

    /**
     * Carrega dados do arquivo db.json principal
     */
    async carregarDoPrincipalDb() {
        try {
            const response = await fetch('./db.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.pontos && Array.isArray(data.pontos)) {
                // Converter pontos do db.json para formato esperado
                const pontosConvertidos = data.pontos
                    .filter(ponto => ponto.ativo !== false)
                    .map(ponto => ({
                        id: ponto.id,
                        nome: ponto.nome,
                        descricao: ponto.descricao,
                        categoria: ponto.categoria,
                        coordenadas: ponto.coordenadas,
                        endereco: ponto.endereco,
                        telefone: ponto.telefone,
                        website: ponto.website,
                        horario: ponto.horario,
                        preco: ponto.preco,
                        nota: ponto.avaliacao || ponto.nota || 0,
                        verificado: true,
                        status: 'confirmado',
                        dataAdicao: ponto.dataCriacao || new Date().toISOString()
                    }));

                this.pontosConfirmados = pontosConvertidos;
                this.salvarTodosDados();
                
                console.log(`✅ ${pontosConvertidos.length} pontos carregados do db.json`);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar db.json:', error);
            // Não lançar erro, deixar que seja usado o fallback
        }
    }

    /**
     * Migra dados antigos para nova estrutura
     */
    migrarDadosAntigos() {
        const pontosAntigos = localStorage.getItem(this.baseStorageKey + '_pontos');
        if (pontosAntigos && this.pontosConfirmados.length === 0) {
            console.log('📦 Migrando dados antigos...');
            const pontos = JSON.parse(pontosAntigos);
            
            pontos.forEach(ponto => {
                // Pontos verificados vão para confirmados, não verificados para pendentes
                if (ponto.verificado) {
                    this.pontosConfirmados.push({...ponto, status: 'confirmado'});
                } else {
                    this.pontosPendentes.push({...ponto, status: 'pendente'});
                }
            });
            
            this.salvarTodosDados();
            console.log('✅ Migração concluída');
        }
    }

    carregarCategorias() {
        const saved = localStorage.getItem(this.baseStorageKey + '_categorias');
        if (saved) {
            this.categorias = JSON.parse(saved);
        } else {
            this.categorias = [
                { id: 'geral', nome: 'Geral', icon: 'fas fa-map-marker-alt', cor: '#ef4444' },
                { id: 'gastronomia', nome: 'Gastronomia', icon: 'fas fa-utensils', cor: '#2563eb' },
                { id: 'esportes', nome: 'Esportes', icon: 'fas fa-futbol', cor: '#10b981' },
                { id: 'cultura', nome: 'Cultura', icon: 'fas fa-theater-masks', cor: '#8b5cf6' },
                { id: 'noturno', nome: 'Vida Noturna', icon: 'fas fa-glass-cheers', cor: '#f59e0b' },
                { id: 'favoritos', nome: 'Favoritos', icon: 'fas fa-heart', cor: '#ec4899' }
            ];
            this.salvarCategorias();
        }
    }

    /**
     * Salva todos os dados
     */
    salvarTodosDados() {
        localStorage.setItem(this.baseStorageKey + '_pontosConfirmados', JSON.stringify(this.pontosConfirmados));
        localStorage.setItem(this.baseStorageKey + '_pontosPendentes', JSON.stringify(this.pontosPendentes));
        localStorage.setItem(this.baseStorageKey + '_pontosOcultos', JSON.stringify(this.pontosOcultos));
        localStorage.setItem(this.baseStorageKey + '_usuarios', JSON.stringify(this.usuarios));
    }

    salvarCategorias() {
        localStorage.setItem(this.baseStorageKey + '_categorias', JSON.stringify(this.categorias));
    }

    /**
     * Obtém dados do usuário ou cria se não existir
     */
    obterDadosUsuario(username) {
        if (!this.usuarios[username]) {
            this.usuarios[username] = {
                username: username,
                favoritos: [],
                pontosEnviados: [],
                sugestoesEnviadas: [],
                dataCriacao: new Date().toISOString()
            };
            this.salvarTodosDados();
        }
        return this.usuarios[username];
    }

    /**
     * Inicializar dados padrão quando não há dados salvos
     */
    inicializarDadosDefault() {
        console.log('🔧 Inicializando dados padrão...');
        this.inicializarPontosDefault();
        this.carregarCategorias(); // Garantir que categorias estejam carregadas
        console.log('✅ Dados padrão inicializados');
    }

    inicializarPontosDefault() {
        const pontosDefault = [
            {
                id: 1,
                nome: 'Pontão do Lago Sul',
                descricao: 'Complexo gastronômico e de lazer',
                categoria: 'gastronomia',
                coordenadas: [-15.8267, -47.8881],
                endereco: 'SHIS QI 11, Brasília - DF',
                telefone: '(61) 3248-1000',
                website: 'https://pontaodolagosul.com.br',
                horario: '10:00 - 22:00',
                preco: 'R$ 50-100',
                nota: 4.5,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 2,
                nome: 'Estádio Nacional de Brasília',
                descricao: 'Estádio multiuso para eventos esportivos',
                categoria: 'esportes',
                coordenadas: [-15.7836, -47.9003],
                endereco: 'SRPN, Brasília - DF',
                telefone: '(61) 3340-9000',
                website: 'https://mane.gov.br',
                horario: 'Conforme eventos',
                preco: 'Variável',
                nota: 4.3,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 3,
                nome: 'Teatro Nacional Claudio Santoro',
                descricao: 'Principal casa de espetáculos de Brasília',
                categoria: 'cultura',
                coordenadas: [-15.7952, -47.8852],
                endereco: 'Via N2, Brasília - DF',
                telefone: '(61) 3325-6100',
                website: 'https://teatronacional.df.gov.br',
                horario: '19:00 - 22:00',
                preco: 'R$ 20-80',
                nota: 4.6,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 4,
                nome: 'Praça dos Três Poderes',
                descricao: 'Marco histórico e político do Brasil',
                categoria: 'geral',
                coordenadas: [-15.7999, -47.8597],
                endereco: 'Praça dos Três Poderes, Brasília - DF',
                telefone: 'N/A',
                website: 'https://www.gov.br',
                horario: '24 horas',
                preco: 'Gratuito',
                nota: 4.8,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 5,
                nome: 'Villa Mix Brasília',
                descricao: 'Casa noturna com música sertaneja',
                categoria: 'noturno',
                coordenadas: [-15.8321, -47.9187],
                endereco: 'SGAS 915, Brasília - DF',
                telefone: '(61) 3443-8000',
                website: 'https://villamix.com.br',
                horario: '22:00 - 06:00',
                preco: 'R$ 40-120',
                nota: 4.2,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            }
        ];
        
        this.pontosConfirmados = pontosDefault;
        this.proximoId = 6;
        this.salvarTodosDados();
        console.log(`✅ ${pontosDefault.length} pontos padrão carregados`);
    }

    // API pública - Métodos principais

    /**
     * Retorna pontos visíveis (confirmados)
     */
    getPontos() {
        return this.pontosConfirmados;
    }

    /**
     * Retorna pontos baseado no perfil do usuário
     */
    getPontosParaUsuario(userRole = 'visitor', username = null) {
        if (userRole === 'administrator') {
            return [...this.pontosConfirmados, ...this.pontosPendentes];
        }
        return this.pontosConfirmados;
    }

    /**
     * Retorna pontos pendentes (apenas para admin)
     */
    getPontosPendentes() {
        return this.pontosPendentes;
    }

    /**
     * Retorna pontos ocultos (apenas para admin)
     */
    getPontosOcultos() {
        return this.pontosOcultos;
    }

    getCategorias() {
        return this.categorias;
    }

    getPontoById(id) {
        const pontoId = parseInt(id);
        return [...this.pontosConfirmados, ...this.pontosPendentes, ...this.pontosOcultos]
               .find(p => p.id === pontoId);
    }

    obterPorId(id) {
        return this.getPontoById(id);
    }

    obterPonto(id) {
        return this.getPontoById(id);
    }

    obterTodos() {
        return this.getPontos();
    }

    obterCategoria(categoriaId) {
        return this.categorias.find(c => c.id === categoriaId);
    }

    /**
     * Buscar pontos por categoria
     * @param {string|number} categoria - ID da categoria ou 'todos' para todas
     * @param {string} userRole - Papel do usuário (visitor, user, administrator)
     * @param {string} username - Nome do usuário (para filtros personalizados)
     * @returns {Array} Array de pontos da categoria especificada
     */
    buscarPorCategoria(categoria = 'todos', userRole = 'visitor', username = null) {
        // Se categoria for 'todos', retornar todos os pontos baseado no papel do usuário
        if (categoria === 'todos') {
            return this.getPontosParaUsuario(userRole, username);
        }

        // Converter categoria para número se necessário
        const categoriaId = typeof categoria === 'string' && categoria !== 'todos' 
            ? parseInt(categoria) 
            : categoria;

        // Obter pontos baseado no papel do usuário
        const pontos = this.getPontosParaUsuario(userRole, username);
        
        // Filtrar por categoria específica
        return pontos.filter(ponto => ponto.categoria === categoriaId);
    }

    /**
     * Adicionar ponto (comportamento baseado no perfil)
     */
    adicionarPonto(dadosPonto, userRole = 'visitor', username = null) {
        const ponto = {
            id: this.proximoId++,
            ...dadosPonto,
            dataAdicao: new Date().toISOString(),
            adicionadoPor: username || 'anonimo'
        };

        if (userRole === 'administrator') {
            // Admin adiciona diretamente como confirmado
            ponto.status = 'confirmado';
            ponto.verificado = true;
            this.pontosConfirmados.push(ponto);
        } else {
            // Usuário comum adiciona como pendente
            ponto.status = 'pendente';
            ponto.verificado = false;
            this.pontosPendentes.push(ponto);
            
            // Registrar no perfil do usuário
            if (username) {
                const dadosUsuario = this.obterDadosUsuario(username);
                dadosUsuario.pontosEnviados.push(ponto.id);
            }
        }
        
        this.salvarTodosDados();
        return ponto;
    }

    /**
     * Aprovar ponto pendente (apenas admin)
     */
    aprovarPonto(pontoId, userRole = 'visitor') {
        if (userRole !== 'administrator') {
            throw new Error('Apenas administradores podem aprovar pontos');
        }

        const index = this.pontosPendentes.findIndex(p => p.id === pontoId);
        if (index === -1) {
            throw new Error('Ponto pendente não encontrado');
        }

        const ponto = this.pontosPendentes.splice(index, 1)[0];
        ponto.status = 'confirmado';
        ponto.verificado = true;
        ponto.dataAprovacao = new Date().toISOString();
        
        this.pontosConfirmados.push(ponto);
        this.salvarTodosDados();
        
        return ponto;
    }

    /**
     * Ocultar ponto (apenas admin) - move para pontos ocultos
     */
    ocultarPonto(pontoId, userRole = 'visitor') {
        if (userRole !== 'administrator') {
            throw new Error('Apenas administradores podem ocultar pontos');
        }

        // Buscar em confirmados
        let index = this.pontosConfirmados.findIndex(p => p.id === pontoId);
        let ponto = null;
        
        if (index !== -1) {
            ponto = this.pontosConfirmados.splice(index, 1)[0];
        } else {
            // Buscar em pendentes
            index = this.pontosPendentes.findIndex(p => p.id === pontoId);
            if (index !== -1) {
                ponto = this.pontosPendentes.splice(index, 1)[0];
            }
        }

        if (!ponto) {
            throw new Error('Ponto não encontrado');
        }

        ponto.status = 'oculto';
        ponto.dataOcultacao = new Date().toISOString();
        this.pontosOcultos.push(ponto);
        this.salvarTodosDados();
        
        return ponto;
    }

    /**
     * Restaurar ponto oculto (apenas admin)
     */
    restaurarPonto(pontoId, userRole = 'visitor') {
        if (userRole !== 'administrator') {
            throw new Error('Apenas administradores podem restaurar pontos');
        }

        const index = this.pontosOcultos.findIndex(p => p.id === pontoId);
        if (index === -1) {
            throw new Error('Ponto oculto não encontrado');
        }

        const ponto = this.pontosOcultos.splice(index, 1)[0];
        ponto.status = 'confirmado';
        ponto.verificado = true;
        ponto.dataRestauracao = new Date().toISOString();
        
        this.pontosConfirmados.push(ponto);
        this.salvarTodosDados();
        
        return ponto;
    }

    /**
     * Adicionar/remover favorito
     */
    toggleFavorito(pontoId, username) {
        if (!username) {
            throw new Error('Usuário deve estar logado para favoritar');
        }

        const dadosUsuario = this.obterDadosUsuario(username);
        const index = dadosUsuario.favoritos.indexOf(pontoId);
        
        if (index === -1) {
            dadosUsuario.favoritos.push(pontoId);
        } else {
            dadosUsuario.favoritos.splice(index, 1);
        }
        
        this.salvarTodosDados();
        return index === -1; // retorna true se foi adicionado, false se foi removido
    }

    /**
     * Verificar se ponto é favorito
     */
    isFavorito(pontoId, username) {
        if (!username) return false;
        const dadosUsuario = this.obterDadosUsuario(username);
        return dadosUsuario.favoritos.includes(pontoId);
    }

    /**
     * Obter pontos favoritos do usuário
     */
    getFavoritos(username) {
        if (!username) return [];
        const dadosUsuario = this.obterDadosUsuario(username);
        return this.pontosConfirmados.filter(p => dadosUsuario.favoritos.includes(p.id));
    }

    /**
     * Sugerir mudança em ponto existente
     */
    sugerirMudanca(pontoId, sugestoes, username) {
        if (!username) {
            throw new Error('Usuário deve estar logado para sugerir mudanças');
        }

        const ponto = this.getPontoById(pontoId);
        if (!ponto) {
            throw new Error('Ponto não encontrado');
        }

        const sugestao = {
            id: Date.now(),
            pontoId: pontoId,
            pontoOriginal: {...ponto},
            sugestoes: sugestoes,
            usuarioSugeriu: username,
            dataSugestao: new Date().toISOString(),
            status: 'pendente'
        };

        const dadosUsuario = this.obterDadosUsuario(username);
        dadosUsuario.sugestoesEnviadas.push(sugestao.id);
        
        // Armazenar sugestões em uma lista separada
        if (!this.usuarios._sugestoes) {
            this.usuarios._sugestoes = [];
        }
        this.usuarios._sugestoes.push(sugestao);
        
        this.salvarTodosDados();
        return sugestao;
    }

    /**
     * Obter sugestões pendentes (admin)
     */
    getSugestoesPendentes() {
        if (!this.usuarios._sugestoes) return [];
        return this.usuarios._sugestoes.filter(s => s.status === 'pendente');
    }

    /**
     * Aprovar sugestão (admin)
     */
    aprovarSugestao(sugestaoId, userRole = 'visitor') {
        if (userRole !== 'administrator') {
            throw new Error('Apenas administradores podem aprovar sugestões');
        }

        if (!this.usuarios._sugestoes) return null;
        
        const sugestao = this.usuarios._sugestoes.find(s => s.id === sugestaoId);
        if (!sugestao) {
            throw new Error('Sugestão não encontrada');
        }

        // Aplicar mudanças ao ponto
        const ponto = this.getPontoById(sugestao.pontoId);
        if (ponto) {
            Object.assign(ponto, sugestao.sugestoes);
            ponto.dataUltimaEdicao = new Date().toISOString();
        }

        // Marcar sugestão como aprovada
        sugestao.status = 'aprovada';
        sugestao.dataAprovacao = new Date().toISOString();
        
        this.salvarTodosDados();
        return sugestao;
    }

    atualizarPonto(pontoId, novosDados) {
        // Buscar em todas as listas
        let ponto = this.pontosConfirmados.find(p => p.id === pontoId);
        if (!ponto) {
            ponto = this.pontosPendentes.find(p => p.id === pontoId);
        }
        if (!ponto) {
            ponto = this.pontosOcultos.find(p => p.id === pontoId);
        }

        if (ponto) {
            Object.assign(ponto, novosDados);
            ponto.dataUltimaEdicao = new Date().toISOString();
            this.salvarTodosDados();
            return ponto;
        }
        return null;
    }

    buscarPontos(termo) {
        const termoLower = termo.toLowerCase();
        return this.pontosConfirmados.filter(ponto => 
            ponto.nome.toLowerCase().includes(termoLower) ||
            ponto.descricao.toLowerCase().includes(termoLower) ||
            ponto.endereco.toLowerCase().includes(termoLower)
        );
    }

    filtrarPorCategoria(categoria, username = null) {
        if (categoria === 'todos') {
            return this.pontosConfirmados;
        }
        
        if (categoria === 'favoritos' && username) {
            return this.getFavoritos(username);
        }
        
        return this.pontosConfirmados.filter(p => p.categoria === categoria);
    }

    getEstatisticas() {
        const totalConfirmados = this.pontosConfirmados.length;
        const totalPendentes = this.pontosPendentes.length;
        const totalOcultos = this.pontosOcultos.length;
        const pontosPorCategoria = {};
        
        // Inicializar contadores para todas as categorias
        this.categorias.forEach(cat => {
            pontosPorCategoria[cat.id] = 0;
        });
        
        // Contar pontos confirmados por categoria
        this.pontosConfirmados.forEach(ponto => {
            if (pontosPorCategoria.hasOwnProperty(ponto.categoria)) {
                pontosPorCategoria[ponto.categoria]++;
            }
        });
        
        return {
            totalPontos: totalConfirmados,
            totalConfirmados,
            totalPendentes,
            totalOcultos,
            pontosPorCategoria,
            pontosVerificados: totalConfirmados,
            pontosNaoVerificados: totalPendentes,
            totalUsuarios: Object.keys(this.usuarios).filter(k => !k.startsWith('_')).length,
            totalSugestoes: this.usuarios._sugestoes ? this.usuarios._sugestoes.length : 0
        };
    }

    async carregarDados() {
        // Método para compatibilidade com app.js
        return Promise.resolve();
    }

    /**
     * Exportar dados para backup
     */
    exportarDados() {
        return {
            pontosConfirmados: this.pontosConfirmados,
            pontosPendentes: this.pontosPendentes,
            pontosOcultos: this.pontosOcultos,
            usuarios: this.usuarios,
            categorias: this.categorias,
            dataExport: new Date().toISOString(),
            versao: '2.0'
        };
    }

    /**
     * Importar dados de backup
     */
    importarDados(dados, userRole = 'visitor') {
        if (userRole !== 'administrator') {
            throw new Error('Apenas administradores podem importar dados');
        }

        if (dados.versao && dados.pontosConfirmados) {
            this.pontosConfirmados = dados.pontosConfirmados || [];
            this.pontosPendentes = dados.pontosPendentes || [];
            this.pontosOcultos = dados.pontosOcultos || [];
            this.usuarios = dados.usuarios || {};
            this.categorias = dados.categorias || this.categorias;
            
            // Recalcular próximo ID
            const todosOsPontos = [...this.pontosConfirmados, ...this.pontosPendentes, ...this.pontosOcultos];
            this.proximoId = todosOsPontos.length > 0 ? Math.max(...todosOsPontos.map(p => p.id || 0)) + 1 : 1;
            
            this.salvarTodosDados();
            return { success: true, message: 'Dados importados com sucesso' };
        }
        
        throw new Error('Formato de dados inválido');
    }

    /**
     * Salvar dados no localStorage (método de compatibilidade)
     */
    salvarNoLocalStorage() {
        this.salvarTodosDados();
    }

    /**
     * Deletar ponto definitivamente
     * @param {number} pontoId - ID do ponto a ser deletado
     * @param {string} userRole - Papel do usuário
     * @returns {boolean} True se deletado com sucesso
     */
    deletarPonto(pontoId, userRole = 'visitor') {
        if (userRole !== 'administrator') {
            throw new Error('Apenas administradores podem deletar pontos');
        }

        let deletado = false;
        const id = parseInt(pontoId);

        // Tentar deletar de todas as listas
        let index = this.pontosConfirmados.findIndex(p => p.id === id);
        if (index !== -1) {
            this.pontosConfirmados.splice(index, 1);
            deletado = true;
        }

        index = this.pontosPendentes.findIndex(p => p.id === id);
        if (index !== -1) {
            this.pontosPendentes.splice(index, 1);
            deletado = true;
        }

        index = this.pontosOcultos.findIndex(p => p.id === id);
        if (index !== -1) {
            this.pontosOcultos.splice(index, 1);
            deletado = true;
        }

        if (deletado) {
            this.salvarTodosDados();
            console.log(`🗑️ Ponto ${pontoId} deletado definitivamente`);
        }

        return deletado;
    }

    /**
     * Remover ponto (alias para deletarPonto para compatibilidade)
     * @param {number} pontoId - ID do ponto a ser removido
     * @param {string} userRole - Papel do usuário
     * @returns {boolean} True se removido com sucesso
     */
    removerPonto(pontoId, userRole = 'visitor') {
        return this.deletarPonto(pontoId, userRole);
    }

    /**
     * Buscar pontos por proximidade geográfica
     * @param {number} lat - Latitude do centro
     * @param {number} lng - Longitude do centro
     * @param {number} raio - Raio em quilômetros
     * @param {string} userRole - Papel do usuário
     * @param {string} username - Nome do usuário
     * @returns {Array} Array de pontos dentro do raio especificado
     */
    buscarPorProximidade(lat, lng, raio = 1, userRole = 'visitor', username = null) {
        const pontos = this.getPontosParaUsuario(userRole, username);
        
        return pontos.filter(ponto => {
            if (!ponto.coordenadas || ponto.coordenadas.length !== 2) {
                return false;
            }

            const [pontoLat, pontoLng] = ponto.coordenadas;
            const distancia = this.calcularDistancia(lat, lng, pontoLat, pontoLng);
            
            return distancia <= raio;
        }).sort((a, b) => {
            // Ordenar por distância
            const distA = this.calcularDistancia(lat, lng, a.coordenadas[0], a.coordenadas[1]);
            const distB = this.calcularDistancia(lat, lng, b.coordenadas[0], b.coordenadas[1]);
            return distA - distB;
        });
    }

    /**
     * Calcular distância entre duas coordenadas usando fórmula de Haversine
     * @param {number} lat1 - Latitude do primeiro ponto
     * @param {number} lng1 - Longitude do primeiro ponto
     * @param {number} lat2 - Latitude do segundo ponto
     * @param {number} lng2 - Longitude do segundo ponto
     * @returns {number} Distância em quilômetros
     */
    calcularDistancia(lat1, lng1, lat2, lng2) {
        const R = 6371; // Raio da Terra em km
        const dLat = this.degreesToRadians(lat2 - lat1);
        const dLng = this.degreesToRadians(lng2 - lng1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Converter graus para radianos
     * @param {number} degrees - Ângulo em graus
     * @returns {number} Ângulo em radianos
     */
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}
