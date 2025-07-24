/**
 * Database Manager - Sistema de Banco de Dados com Controle de Acesso
 * 
 * @author Tales Oliveira (github.com/TalesLimaOliveira)
 * @version 1.0.0
 * @note Este arquivo contém trechos de código gerados com auxílio de Inteligência Artificial.
 */

class DatabaseManager {
    constructor() {
        this.confirmedPoints = [];
        this.pendingPoints = [];
        this.hiddenPoints = [];
        this.usuarios = {};
        this.categorias = [];
        this.proximoId = 1;
        this.baseStorageKey = 'pontosEntretenimento';
        this.databasePath = 'database/';
        // init() será chamado explicitamente pelo app.js
    }

    async init() {
        try {
            console.log('🔧 Inicializando DatabaseManager com nova estrutura...');
            console.log(`🌐 Protocolo atual: ${window.location.protocol}`);
            
            await this.carregarCategorias();
            console.log('✅ Categorias carregadas');
            
            await this.carregarTodosDados();
            console.log('✅ Dados principais carregados');
            
            this.migrarDadosAntigos();
            console.log('✅ Migração de dados concluída');
            
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
            const confirmedPoints = localStorage.getItem(this.baseStorageKey + '_pontosConfirmados');
            const pendingPoints = localStorage.getItem(this.baseStorageKey + '_pontosPendentes');
            const hiddenPoints = localStorage.getItem(this.baseStorageKey + '_pontosOcultos');
            const usuarios = localStorage.getItem(this.baseStorageKey + '_usuarios');

            this.confirmedPoints = confirmedPoints ? JSON.parse(confirmedPoints) : [];
            this.pendingPoints = pendingPoints ? JSON.parse(pendingPoints) : [];
            this.hiddenPoints = hiddenPoints ? JSON.parse(hiddenPoints) : [];
            this.usuarios = usuarios ? JSON.parse(usuarios) : {};

            // Se não há pontos confirmados, tentar carregar dos arquivos JSON
            if (this.confirmedPoints.length === 0) {
                console.log('Nenhum ponto confirmado encontrado, tentando carregar dos arquivos JSON...');
                
                try {
                    // Carregar pontos confirmados
                    const pontosConfirmados = await this.loadJsonFile('./database/pontos_confirmados.json');
                    if (pontosConfirmados && Array.isArray(pontosConfirmados)) {
                        this.confirmedPoints = pontosConfirmados;
                        this.salvarPontosConfirmados();
                    }

                    // Carregar pontos pendentes
                    const pontosPendentes = await this.loadJsonFile('./database/pontos_pendentes.json');
                    if (pontosPendentes && Array.isArray(pontosPendentes)) {
                        this.pendingPoints = pontosPendentes;
                        this.salvarPontosPendentes();
                    }

                    // Carregar pontos ocultos
                    const pontosOcultos = await this.loadJsonFile('./database/pontos_ocultos.json');
                    if (pontosOcultos && Array.isArray(pontosOcultos)) {
                        this.hiddenPoints = pontosOcultos;
                        this.salvarPontosOcultos();
                    }

                    // Carregar usuários
                    const usuarios = await this.loadJsonFile('./database/usuarios.json');
                    if (usuarios && Array.isArray(usuarios)) {
                        this.usuarios = usuarios.reduce((acc, user) => {
                            acc[user.username] = user;
                            return acc;
                        }, {});
                        this.salvarUsuarios();
                    }

                    console.log(`✅ Dados carregados: ${this.confirmedPoints.length} confirmados, ${this.pendingPoints.length} pendentes`);
                } catch (error) {
                    console.error('Erro ao carregar dos arquivos JSON:', error);
                    // Fallback para dados padrão se os arquivos não puderem ser carregados
                    this.inicializarPontosDefault();
                }
            }

            // Se ainda não há pontos no localStorage, carregar dados padrão
            if (this.confirmedPoints.length === 0) {
                console.log('Carregando dados padrao...');
                this.inicializarPontosDefault();
            }

            // Calcular próximo ID
            const todosOsPontos = [...this.confirmedPoints, ...this.pendingPoints, ...this.hiddenPoints];
            this.proximoId = todosOsPontos.length > 0 ? Math.max(...todosOsPontos.map(p => p.id || 0)) + 1 : 1;

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.inicializarDadosDefault();
        }
    }

    /**
     * Função auxiliar para carregar arquivos JSON compatível com file:// e http://
     * @param {string} url - URL do arquivo JSON
     * @returns {Promise<Object>} - Dados JSON carregados
     */
    async loadJsonFile(url) {
        // Detectar se estamos usando protocolo file://
        const isFileProtocol = window.location.protocol === 'file:';
        
        console.log(`🌐 Protocolo detectado: ${window.location.protocol}, URL: ${url}`);
        
        if (isFileProtocol) {
            // Para protocolo file://, tentar usar dados incorporados ou fallback
            console.log(`📁 Protocolo file:// detectado, usando fallback para: ${url}`);
            
            // Retornar dados padrão baseado na URL
            if (url.includes('categorias.json')) {
                return this.getCategoriesDefault();
            } else if (url.includes('pontos_confirmados.json')) {
                return this.getConfirmedPointsDefault();
            } else if (url.includes('pontos_pendentes.json')) {
                return [];
            } else if (url.includes('pontos_ocultos.json')) {
                return [];
            } else if (url.includes('usuarios.json')) {
                return this.getUsersDefault();
            }
            
            return {};
        } else {
            // Para protocolo HTTP/HTTPS, usar fetch normal
            console.log(`🌍 Protocolo HTTP detectado, carregando via fetch: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
    }

    /**
     * Carrega dados do arquivo db.json principal (versão assíncrona)
     */
    async carregarDoPrincipalDbAsync() {
        try {
            const data = await this.loadJsonFile('./db.json');
            
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

                this.confirmedPoints = pontosConvertidos;
                this.salvarTodosDados();
                
                console.log(`${pontosConvertidos.length} pontos carregados do db.json`);
            }
        } catch (error) {
            console.error('Erro ao carregar db.json:', error);
            // Não lançar erro, deixar que seja usado o fallback
        }
    }

    /**
     * Migra dados antigos para nova estrutura
     */
    migrarDadosAntigos() {
        const pontosAntigos = localStorage.getItem(this.baseStorageKey + '_pontos');
        if (pontosAntigos && this.confirmedPoints.length === 0) {
            console.log('Migrando dados antigos...');
            const pontos = JSON.parse(pontosAntigos);
            
            pontos.forEach(ponto => {
                // Pontos verificados vão para confirmados, não verificados para pendentes
                if (ponto.verificado) {
                    this.confirmedPoints.push({...ponto, status: 'confirmado'});
                } else {
                    this.pendingPoints.push({...ponto, status: 'pendente'});
                }
            });
            
            this.salvarTodosDados();
            console.log('Migracao concluida');
        }
    }

    async carregarCategorias() {
        try {
            // Tentar carregar usando a função compatível
            const categorias = await this.loadJsonFile('./database/categorias.json');
            this.categorias = categorias;
            console.log('Categorias carregadas:', categorias.length);
            return;
        } catch (error) {
            console.warn('Erro ao carregar categorias:', error);
        }

        // Fallback: tentar carregar do localStorage
        const saved = localStorage.getItem(this.baseStorageKey + '_categorias');
        if (saved) {
            this.categorias = JSON.parse(saved);
            console.log('Categorias carregadas do localStorage');
        } else {
            // Fallback final: categorias padrão
            this.categorias = [
                { 
                    id: 'geral', 
                    nome: 'Geral', 
                    icon: 'fas fa-theater-masks', 
                    cor: '#8b5cf6',
                    descricao: 'Teatros, cinemas, centros culturais, casas de show, eventos públicos'
                },
                { 
                    id: 'esportes-lazer', 
                    nome: 'Esportes e Lazer', 
                    icon: 'fas fa-running', 
                    cor: '#10b981',
                    descricao: 'Estádios, quadras públicas, academias ao ar livre, pistas de skate, parques ecológicos'
                },
                { 
                    id: 'gastronomia', 
                    nome: 'Gastronomia', 
                    icon: 'fas fa-utensils', 
                    cor: '#2563eb',
                    descricao: 'Bares, restaurantes, feiras gastronômicas, cafeterias, food trucks'
                },
                { 
                    id: 'geek-nerd', 
                    nome: 'Geek e Nerd', 
                    icon: 'fas fa-gamepad', 
                    cor: '#7c3aed',
                    descricao: 'Lojas de board games, card games, action figures, eventos de cultura pop, espaços de e-sports'
                },
                { 
                    id: 'alternativo', 
                    nome: 'Alternativo', 
                    icon: 'fas fa-palette', 
                    cor: '#ef4444',
                    descricao: 'Espaços culturais, saraus, exposições independentes, feiras de arte'
                },
                { 
                    id: 'casas-noturnas', 
                    nome: 'Casas Noturnas', 
                    icon: 'fas fa-glass-cheers', 
                    cor: '#f59e0b',
                    descricao: 'Boates, pubs, lounges, baladas temáticas e outros espaços voltados à vida noturna'
                },
                { 
                    id: 'favoritos', 
                    nome: 'Favoritos', 
                    icon: 'fas fa-heart', 
                    cor: '#ec4899',
                    descricao: 'Pontos marcados como favoritos pelo usuário'
                }
            ];
            this.salvarCategorias();
            console.log('Categorias padrão carregadas');
        }
    }

    /**
     * Salva todos os dados
     */
    salvarTodosDados() {
        localStorage.setItem(this.baseStorageKey + '_pontosConfirmados', JSON.stringify(this.confirmedPoints));
        localStorage.setItem(this.baseStorageKey + '_pontosPendentes', JSON.stringify(this.pendingPoints));
        localStorage.setItem(this.baseStorageKey + '_pontosOcultos', JSON.stringify(this.hiddenPoints));
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
        console.log('Inicializando dados padrão...');
        this.inicializarPontosDefault();
        this.carregarCategorias(); // Garantir que categorias estejam carregadas
        console.log('Dados padrao inicializados');
    }

    inicializarPontosDefault() {
        const pontosDefault = [
            {
                id: 1,
                nome: 'Teatro Nacional Claudio Santoro',
                descricao: 'Principal teatro de Brasília, com programação diversificada',
                categoria: 'geral',
                coordenadas: [-15.796, -47.878],
                endereco: 'Via N2 - Asa Norte, Brasília',
                telefone: '(61) 3325-6268',
                horario: 'Conforme programação',
                preco: 'R$ 20-80',
                nota: 4.6,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString(),
                imagem: {
                    url: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=400',
                    source: 'web',
                    description: 'Teatro Nacional de Brasília'
                }
            },
            {
                id: 2,
                nome: 'Cine Brasília',
                descricao: 'Cinema de arte e cultura, com filmes alternativos',
                categoria: 'geral',
                coordenadas: [-15.795, -47.882],
                endereco: 'EQS 106/107 - Asa Sul, Brasília',
                telefone: '(61) 3244-1660',
                horario: '14h às 22h',
                preco: 'R$ 10-15',
                nota: 4.4,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString(),
                imagem: {
                    url: 'https://images.unsplash.com/photo-1489599433510-0fcf9d9c4e2d?w=400',
                    source: 'web',
                    description: 'Cinema Brasília'
                }
            },
            {
                id: 3,
                nome: 'Estádio Nacional de Brasília',
                descricao: 'Arena multiuso para grandes eventos esportivos',
                categoria: 'esportes-lazer',
                coordenadas: [-15.783, -47.899],
                endereco: 'SRPN - Asa Norte, Brasília',
                telefone: '(61) 3424-4000',
                horario: 'Conforme eventos',
                preco: 'Variável',
                nota: 4.5,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString(),
                imagem: {
                    url: '/assets/images/estadio-nacional.jpg',
                    source: 'local',
                    description: 'Estádio Nacional de Brasília - Mané Garrincha'
                }
            },
            {
                id: 4,
                nome: 'Parque da Cidade Sarah Kubitschek',
                descricao: 'Maior parque urbano do mundo, ideal para esportes e lazer',
                categoria: 'esportes-lazer',
                coordenadas: [-15.788, -47.907],
                endereco: 'Asa Sul, Brasília',
                horario: '24 horas',
                preco: 'Gratuito',
                nota: 4.7,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 5,
                nome: 'Restaurante Olivae',
                descricao: 'Restaurante italiano sofisticado com ambiente acolhedor',
                categoria: 'gastronomia',
                coordenadas: [-15.795, -48.105],
                endereco: 'CLN 201 - Asa Norte, Brasília',
                telefone: '(61) 3340-8120',
                horario: '12h às 15h, 19h às 23h',
                preco: 'R$ 80-120',
                nota: 4.5,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 6,
                nome: 'Feira da Torre de TV',
                descricao: 'Feira gastronômica tradicional aos fins de semana',
                categoria: 'gastronomia',
                coordenadas: [-15.790, -47.896],
                endereco: 'Torre de TV, Asa Norte, Brasília',
                horario: 'Sábados e domingos, 9h às 18h',
                preco: 'R$ 15-40',
                nota: 4.2,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 7,
                nome: 'Dragonstore',
                descricao: 'Loja especializada em jogos, cards e cultura geek',
                categoria: 'geek-nerd',
                coordenadas: [-15.794, -47.889],
                endereco: 'CLN 208 - Asa Norte, Brasília',
                telefone: '(61) 3328-1234',
                horario: '10h às 22h',
                preco: 'R$ 20-200',
                nota: 4.6,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 8,
                nome: 'Arena E-Sports BSB',
                descricao: 'Centro de e-sports com torneios e competições',
                categoria: 'geek-nerd',
                coordenadas: [-15.835, -48.044],
                endereco: 'Taguatinga Centro, Brasília',
                telefone: '(61) 3562-9876',
                horario: '14h às 23h',
                preco: 'R$ 10-30/hora',
                nota: 4.3,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 9,
                nome: 'Centro Cultural da República',
                descricao: 'Espaço cultural independente com exposições alternativas',
                categoria: 'alternativo',
                coordenadas: [-15.797, -47.879],
                endereco: 'Eixo Monumental, Brasília',
                horario: '9h às 18h',
                preco: 'Gratuito',
                nota: 4.4,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 10,
                nome: 'Sarau do Beco',
                descricao: 'Sarau independente com poesia e música',
                categoria: 'alternativo',
                coordenadas: [-15.840, -48.045],
                endereco: 'Taguatinga Norte, Brasília',
                horario: 'Quintas, 19h às 23h',
                preco: 'R$ 5-15',
                nota: 4.1,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 11,
                nome: 'Villa Mix Brasília',
                descricao: 'Casa noturna com música sertaneja e eletrônica',
                categoria: 'casas-noturnas',
                coordenadas: [-15.796, -47.885],
                endereco: 'SCLS 109 - Asa Sul, Brasília',
                telefone: '(61) 3244-1010',
                horario: '22h às 4h',
                preco: 'R$ 40-80',
                nota: 4.2,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            },
            {
                id: 12,
                nome: 'Lounge 442',
                descricao: 'Lounge sofisticado com drinks autorais',
                categoria: 'casas-noturnas',
                coordenadas: [-15.794, -47.886],
                endereco: 'CLN 442 - Asa Norte, Brasília',
                telefone: '(61) 3328-4422',
                horario: '19h às 2h',
                preco: 'R$ 30-60',
                nota: 4.0,
                verificado: true,
                status: 'confirmado',
                dataAdicao: new Date().toISOString()
            }
        ];
        
        this.confirmedPoints = pontosDefault;
        this.proximoId = 13;
        this.salvarTodosDados();
        console.log(`${pontosDefault.length} pontos padrao carregados`);
    }

    // API pública - Métodos principais

    /**
     * Retorna pontos visíveis (confirmados)
     */
    getPontos() {
        return this.confirmedPoints;
    }

    /**
     * Retorna pontos baseado no perfil do usuário
     */
    getPontosParaUsuario(userRole = 'visitor', username = null) {
        if (userRole === 'administrator') {
            return [...this.confirmedPoints, ...this.pendingPoints];
        }
        return this.confirmedPoints;
    }

    /**
     * Retorna pontos pendentes (apenas para admin)
     */
    getPontosPendentes() {
        return this.pendingPoints;
    }

    /**
     * Retorna pontos ocultos (apenas para admin)
     */
    getPontosOcultos() {
        return this.hiddenPoints;
    }

    getCategorias() {
        return this.categorias;
    }

    getPontoById(id) {
        const pontoId = parseInt(id);
        return [...this.confirmedPoints, ...this.pendingPoints, ...this.hiddenPoints]
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
        // Validar e processar imagem se fornecida
        if (dadosPonto.imagem) {
            const isValidImage = this.validateImageUrl(dadosPonto.imagem.url, dadosPonto.imagem.source);
            if (!isValidImage) {
                console.warn('Invalid image URL provided, removing image data');
                delete dadosPonto.imagem;
            } else {
                // Estruturar dados da imagem corretamente
                dadosPonto.imagem = {
                    url: dadosPonto.imagem.url,
                    source: dadosPonto.imagem.source,
                    description: dadosPonto.imagem.description || '',
                    addedAt: new Date().toISOString()
                };
            }
        }

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
            this.confirmedPoints.push(ponto);
        } else {
            // Usuário comum adiciona como pendente
            ponto.status = 'pendente';
            ponto.verificado = false;
            this.pendingPoints.push(ponto);
            
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

        const index = this.pendingPoints.findIndex(p => p.id === pontoId);
        if (index === -1) {
            throw new Error('Ponto pendente não encontrado');
        }

        const ponto = this.pendingPoints.splice(index, 1)[0];
        ponto.status = 'confirmado';
        ponto.verificado = true;
        ponto.dataAprovacao = new Date().toISOString();
        
        this.confirmedPoints.push(ponto);
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
        let index = this.confirmedPoints.findIndex(p => p.id === pontoId);
        let ponto = null;
        
        if (index !== -1) {
            ponto = this.confirmedPoints.splice(index, 1)[0];
        } else {
            // Buscar em pendentes
            index = this.pendingPoints.findIndex(p => p.id === pontoId);
            if (index !== -1) {
                ponto = this.pendingPoints.splice(index, 1)[0];
            }
        }

        if (!ponto) {
            throw new Error('Ponto não encontrado');
        }

        ponto.status = 'oculto';
        ponto.dataOcultacao = new Date().toISOString();
        this.hiddenPoints.push(ponto);
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

        const index = this.hiddenPoints.findIndex(p => p.id === pontoId);
        if (index === -1) {
            throw new Error('Ponto oculto não encontrado');
        }

        const ponto = this.hiddenPoints.splice(index, 1)[0];
        ponto.status = 'confirmado';
        ponto.verificado = true;
        ponto.dataRestauracao = new Date().toISOString();
        
        this.confirmedPoints.push(ponto);
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
        return this.confirmedPoints.filter(p => dadosUsuario.favoritos.includes(p.id));
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
        let ponto = this.confirmedPoints.find(p => p.id === pontoId);
        if (!ponto) {
            ponto = this.pendingPoints.find(p => p.id === pontoId);
        }
        if (!ponto) {
            ponto = this.hiddenPoints.find(p => p.id === pontoId);
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
        return this.confirmedPoints.filter(ponto => 
            ponto.nome.toLowerCase().includes(termoLower) ||
            ponto.descricao.toLowerCase().includes(termoLower) ||
            ponto.endereco.toLowerCase().includes(termoLower)
        );
    }

    /**
     * Adicionar ou atualizar imagem de um ponto
     * @param {number} pontoId - ID do ponto
     * @param {Object} imageData - Dados da imagem
     * @param {string} imageData.url - URL ou caminho da imagem
     * @param {string} imageData.source - 'web' ou 'local'
     * @param {string} imageData.description - Descrição da imagem
     * @returns {boolean} - true se atualizado com sucesso
     */
    updatePointImage(pontoId, imageData) {
        try {
            // Validar dados da imagem
            if (!imageData.url || !imageData.source) {
                throw new Error('URL e source são obrigatórios');
            }

            if (!['web', 'local'].includes(imageData.source)) {
                throw new Error('Source deve ser "web" ou "local"');
            }

            // Encontrar o ponto
            const ponto = this.getPontoById(pontoId);
            if (!ponto) {
                throw new Error('Ponto não encontrado');
            }

            // Estrutura da imagem
            const imagemStructure = {
                url: imageData.url,
                source: imageData.source,
                description: imageData.description || '',
                updatedAt: new Date().toISOString()
            };

            // Atualizar a imagem
            ponto.imagem = imagemStructure;
            ponto.dataUltimaEdicao = new Date().toISOString();

            this.salvarTodosDados();
            console.log(`Image updated for point ${pontoId}: ${imageData.source} - ${imageData.url}`);
            return true;

        } catch (error) {
            console.error('Error updating point image:', error);
            return false;
        }
    }

    /**
     * Remover imagem de um ponto
     * @param {number} pontoId - ID do ponto
     * @returns {boolean} - true se removido com sucesso
     */
    removePointImage(pontoId) {
        try {
            const ponto = this.getPontoById(pontoId);
            if (!ponto) {
                throw new Error('Ponto não encontrado');
            }

            delete ponto.imagem;
            ponto.dataUltimaEdicao = new Date().toISOString();

            this.salvarTodosDados();
            console.log(`Image removed from point ${pontoId}`);
            return true;

        } catch (error) {
            console.error('Error removing point image:', error);
            return false;
        }
    }

    /**
     * Obter informações de imagem de um ponto
     * @param {number} pontoId - ID do ponto
     * @returns {Object|null} - Dados da imagem ou null se não houver
     */
    getPointImage(pontoId) {
        const ponto = this.getPontoById(pontoId);
        return ponto?.imagem || null;
    }

    /**
     * Validar URL de imagem
     * @param {string} url - URL para validar
     * @param {string} source - Tipo da fonte ('web' ou 'local')
     * @returns {boolean} - true se válida
     */
    validateImageUrl(url, source) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        if (source === 'web') {
            // Validar URL web
            try {
                const urlObj = new URL(url);
                return ['http:', 'https:'].includes(urlObj.protocol);
            } catch {
                return false;
            }
        } else if (source === 'local') {
            // Validar caminho local (relativo ou absoluto)
            return url.startsWith('/') || url.startsWith('./') || url.startsWith('../') || 
                   url.match(/^[a-zA-Z]:/) || url.startsWith('assets/');
        }

        return false;
    }

    filterByCategory(categoria, username = null) {
        if (categoria === 'todos') {
            return this.confirmedPoints;
        }
        
        if (categoria === 'favoritos' && username) {
            return this.getFavoritos(username);
        }
        
        return this.confirmedPoints.filter(p => p.categoria === categoria);
    }

    getEstatisticas() {
        const totalConfirmados = this.confirmedPoints.length;
        const totalPendentes = this.pendingPoints.length;
        const totalOcultos = this.hiddenPoints.length;
        const pontosPorCategoria = {};
        
        // Inicializar contadores para todas as categorias
        this.categorias.forEach(cat => {
            pontosPorCategoria[cat.id] = 0;
        });
        
        // Contar pontos confirmados por categoria
        this.confirmedPoints.forEach(ponto => {
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
            confirmedPoints: this.confirmedPoints,
            pendingPoints: this.pendingPoints,
            hiddenPoints: this.hiddenPoints,
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

        if (dados.versao && (dados.confirmedPoints || dados.pontosConfirmados)) {
            this.confirmedPoints = dados.confirmedPoints || dados.pontosConfirmados || [];
            this.pendingPoints = dados.pendingPoints || dados.pontosPendentes || [];
            this.hiddenPoints = dados.hiddenPoints || dados.pontosOcultos || [];
            this.usuarios = dados.usuarios || {};
            this.categorias = dados.categorias || this.categorias;
            
            // Recalcular próximo ID
            const todosOsPontos = [...this.confirmedPoints, ...this.pendingPoints, ...this.hiddenPoints];
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
        let index = this.confirmedPoints.findIndex(p => p.id === id);
        if (index !== -1) {
            this.confirmedPoints.splice(index, 1);
            deletado = true;
        }

        index = this.pendingPoints.findIndex(p => p.id === id);
        if (index !== -1) {
            this.pendingPoints.splice(index, 1);
            deletado = true;
        }

        index = this.hiddenPoints.findIndex(p => p.id === id);
        if (index !== -1) {
            this.hiddenPoints.splice(index, 1);
            deletado = true;
        }

        if (deletado) {
            this.salvarTodosDados();
            console.log(`Ponto ${pontoId} deletado definitivamente`);
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

    /**
     * Dados padrão de categorias para fallback quando file:// não pode carregar JSON
     */
    getCategoriesDefault() {
        return [
            {
                "id": "geral",
                "nome": "Geral",
                "icone": "📍",
                "cor": "#6c757d",
                "descricao": "Pontos de interesse geral e diversos"
            },
            {
                "id": "esportes-lazer",
                "nome": "Esportes e Lazer",
                "icone": "⚽",
                "cor": "#28a745",
                "descricao": "Atividades esportivas e de lazer"
            },
            {
                "id": "gastronomia",
                "nome": "Gastronomia",
                "icone": "🍽️",
                "cor": "#dc3545",
                "descricao": "Restaurantes, bares e experiências culinárias"
            },
            {
                "id": "geek-nerd",
                "nome": "Geek e Nerd",
                "icone": "🎮",
                "cor": "#6f42c1",
                "descricao": "Cultura geek, games e tecnologia"
            },
            {
                "id": "alternativo",
                "nome": "Alternativo",
                "icone": "🎨",
                "cor": "#fd7e14",
                "descricao": "Arte, cultura alternativa e eventos especiais"
            },
            {
                "id": "casas-noturnas",
                "nome": "Casas Noturnas",
                "icone": "🌙",
                "cor": "#6610f2",
                "descricao": "Vida noturna, bares e casas de show"
            }
        ];
    }

    /**
     * Dados padrão de pontos confirmados para fallback
     */
    getConfirmedPointsDefault() {
        return [
            {
                "id": 1,
                "nome": "Teatro Nacional Claudio Santoro",
                "categoria": "geral",
                "coordenadas": [-15.796, -47.878],
                "descricao": "Principal teatro de Brasília, com programação diversificada",
                "endereco": "Via N2 - Asa Norte",
                "telefone": "(61) 3325-6268",
                "horario": "Conforme programação",
                "preco": "R$ 20-80",
                "avaliacao": 4.6,
                "tags": ["teatro", "cultura", "espetaculos"],
                "ativo": true,
                "dataCriacao": "2025-01-20T10:00:00.000Z",
                "imagem": {
                    "url": "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=400",
                    "source": "web",
                    "description": "Teatro Nacional de Brasília"
                }
            },
            {
                "id": 2,
                "nome": "Museu Nacional da República",
                "categoria": "geral",
                "coordenadas": [-15.798, -47.875],
                "descricao": "Espaço cultural com exposições de arte e história",
                "endereco": "Via N1 - Asa Norte",
                "telefone": "(61) 3325-5220",
                "horario": "Ter-Dom: 9h-18h",
                "preco": "R$ 5-15",
                "avaliacao": 4.3,
                "tags": ["museu", "arte", "cultura"],
                "ativo": true,
                "dataCriacao": "2025-01-20T10:15:00.000Z",
                "imagem": {
                    "url": "https://images.unsplash.com/photo-1554072675-66db59dba46f?w=400",
                    "source": "web",
                    "description": "Museu Nacional da República"
                }
            },
            {
                "id": 3,
                "nome": "Parque da Cidade Sarah Kubitschek",
                "categoria": "esportes-lazer",
                "coordenadas": [-15.798, -47.896],
                "descricao": "Maior parque urbano da América Latina, ideal para atividades físicas",
                "endereco": "Asa Sul",
                "telefone": "(61) 3224-5717",
                "horario": "24h",
                "preco": "Gratuito",
                "avaliacao": 4.8,
                "tags": ["parque", "exercicios", "natureza"],
                "ativo": true,
                "dataCriacao": "2025-01-20T10:30:00.000Z",
                "imagem": {
                    "url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
                    "source": "web",
                    "description": "Parque da Cidade"
                }
            }
        ];
    }

    /**
     * Dados padrão de usuários para fallback
     */
    getUsersDefault() {
        return [
            {
                "id": 1,
                "username": "admin",
                "password": "admin123",
                "role": "administrator",
                "email": "admin@sigdf.gov.br",
                "nome": "Administrador do Sistema",
                "dataCriacao": "2025-01-20T08:00:00.000Z",
                "ativo": true
            }
        ];
    }
}

// Criar instância global
const databaseManager = new DatabaseManager();

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
}

// Disponibilizar globalmente
window.DatabaseManager = DatabaseManager;
window.databaseManager = databaseManager;
