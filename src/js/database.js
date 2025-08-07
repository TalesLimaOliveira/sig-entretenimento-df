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
            console.log('Initializing DatabaseManager with new structure...');
            console.log(`Current protocol: ${window.location.protocol}`);
            
            await this.loadCategories();
            console.log('Categories loaded');
            
            await this.loadAllData();
            console.log('Main data loaded');
            
            this.migrateOldData();
            console.log('Data migration completed');
            
            this.migrateAlternativeCategory();
            console.log('Alternative category migration completed');
            
            // Verificação final - garantir que há dados
            if (this.confirmedPoints.length === 0) {
                console.warn('No confirmed points after loading, forcing default data...');
                this.confirmedPoints = this.getConfirmedPointsDefault();
                this.saveAllData();
            }
            
            if (this.categorias.length === 0) {
                console.warn('No categories after loading, forcing default categories...');
                this.categorias = this.getCategoriesDefault();
                this.saveCategories();
            }
            
            console.log(`Final state: ${this.confirmedPoints.length} confirmed points, ${this.categorias.length} categories`);
            console.log('DatabaseManager successfully initialized');
        } catch (error) {
            console.error('Error initializing DatabaseManager:', error);
            this.initializeDefaultData();
        }
    }

    /**
     * Load all data from JSON files
     */
    async loadAllData() {
        try {
            console.log('Iniciando carregamento de dados dos arquivos JSON...');
            
            // Primeiro, tentar carregar dos arquivos JSON (prioridade)
            let dadosCarregadosJSON = false;
            
            try {
                console.log('Attempting to load data from JSON files...');
                
                // Carregar pontos confirmados
                const pontosConfirmados = await this.loadJsonFile('./database/pontos_confirmados.json');
                if (pontosConfirmados && Array.isArray(pontosConfirmados) && pontosConfirmados.length > 0) {
                    this.confirmedPoints = pontosConfirmados;
                    dadosCarregadosJSON = true;
                    console.log(`${pontosConfirmados.length} pontos confirmados carregados do JSON`);
                }

                // Carregar pontos pendentes
                const pontosPendentes = await this.loadJsonFile('./database/pontos_pendentes.json');
                if (pontosPendentes && Array.isArray(pontosPendentes)) {
                    this.pendingPoints = pontosPendentes;
                    console.log(`${pontosPendentes.length} pontos pendentes carregados do JSON`);
                }

                // Carregar pontos ocultos
                const pontosOcultos = await this.loadJsonFile('./database/pontos_ocultos.json');
                if (pontosOcultos && Array.isArray(pontosOcultos)) {
                    this.hiddenPoints = pontosOcultos;
                    console.log(`${pontosOcultos.length} pontos ocultos carregados do JSON`);
                }

                // Carregar usuários
                const usuarios = await this.loadJsonFile('./database/usuarios.json');
                if (usuarios && Array.isArray(usuarios)) {
                    this.usuarios = usuarios.reduce((acc, user) => {
                        acc[user.username] = user;
                        return acc;
                    }, {});
                    console.log(`${usuarios.length} usuários carregados do JSON`);
                }

            } catch (error) {
                console.warn('Error loading from JSON files:', error);
            }
            
            // If couldn't load from JSON, try localStorage
            if (!dadosCarregadosJSON) {
                console.log('Attempting to load from localStorage...');
                
                const confirmedPoints = localStorage.getItem(this.baseStorageKey + '_pontosConfirmados');
                const pendingPoints = localStorage.getItem(this.baseStorageKey + '_pontosPendentes');
                const hiddenPoints = localStorage.getItem(this.baseStorageKey + '_pontosOcultos');
                const usuarios = localStorage.getItem(this.baseStorageKey + '_usuarios');

                if (confirmedPoints) {
                    this.confirmedPoints = JSON.parse(confirmedPoints);
                    console.log(`${this.confirmedPoints.length} pontos confirmados carregados do localStorage`);
                    dadosCarregadosJSON = true;
                }
                if (pendingPoints) {
                    this.pendingPoints = JSON.parse(pendingPoints);
                }
                if (hiddenPoints) {
                    this.hiddenPoints = JSON.parse(hiddenPoints);
                }
                if (usuarios) {
                    this.usuarios = JSON.parse(usuarios);
                }
            }

            // Se ainda não há pontos, usar dados padrão
            if (!dadosCarregadosJSON || this.confirmedPoints.length === 0) {
                console.log('Carregando dados padrão...');
                this.inicializarPontosDefault();
            }

            // Salvar dados carregados no localStorage para cache
            if (this.confirmedPoints.length > 0) {
                this.saveAllData();
                console.log('Data saved to localStorage for caching');
            }

            // Calcular próximo ID
            const todosOsPontos = [...this.confirmedPoints, ...this.pendingPoints, ...this.hiddenPoints];
            this.proximoId = todosOsPontos.length > 0 ? Math.max(...todosOsPontos.map(p => p.id || 0)) + 1 : 1;

            console.log(`Total final: ${this.confirmedPoints.length} confirmados, ${this.pendingPoints.length} pendentes, ${this.hiddenPoints.length} ocultos`);

        } catch (error) {
            console.error('Critical error loading data:', error);
            this.initializeDefaultData();
        }
    }

    /**
     * UNIFIED: Load JSON file - same behavior for both file:// and http://
     * No more protocol-specific logic, always try to load actual files
     * @param {string} url - URL do arquivo JSON
     * @returns {Promise<Object>} - Dados JSON carregados
     */
    async loadJsonFile(url) {
        console.log(`Loading: ${url} (Protocol: ${window.location.protocol})`);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Successfully loaded ${url}:`, Array.isArray(data) ? `${data.length} items` : 'data object');
            return data;

        } catch (error) {
            console.warn(`⚠️ Failed to load ${url}:`, error.message);
            
            // Fallback to default data only if fetch completely fails
            if (url.includes('categorias.json')) {
                console.log('Using default categories');
                return this.getCategoriesDefault();
            } else if (url.includes('pontos_confirmados.json')) {
                console.log('Using default confirmed points');
                return this.getConfirmedPointsDefault();
            } else if (url.includes('pontos_ocultos.json')) {
                console.log('Using default hidden points');
                return this.getHiddenPointsDefault();
            } else if (url.includes('usuarios.json')) {
                console.log('Using default users');
                return this.getUsersDefault();
            } else {
                console.log('No default data available');
                return [];
            }
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
                this.saveAllData();
                
                console.log(`${pontosConvertidos.length} pontos carregados do db.json`);
            }
        } catch (error) {
            console.error('Erro ao carregar db.json:', error);
            // Não lançar erro, deixar que seja usado o fallback
        }
    }

    /**
     * Migrate old data to new structure
     */
    migrateOldData() {
        const oldPoints = localStorage.getItem(this.baseStorageKey + '_pontos');
        if (oldPoints && this.confirmedPoints.length === 0) {
            console.log('Migrating old data...');
            const pontos = JSON.parse(oldPoints);
            
            pontos.forEach(ponto => {
                // Pontos verificados vão para confirmados, não verificados para pendentes
                if (ponto.verificado) {
                    this.confirmedPoints.push({...ponto, status: 'confirmado'});
                } else {
                    this.pendingPoints.push({...ponto, status: 'pendente'});
                }
            });
            
            this.saveAllData();
            console.log('Migracao concluida');
        }
    }

    /**
     * Migrate points from "alternative" category to "general"
     */
    migrateAlternativeCategory() {
        let changes = 0;
        
        // Migrar pontos confirmados
        this.confirmedPoints.forEach(ponto => {
            if (ponto.categoria === 'alternativo') {
                ponto.categoria = 'geral';
                changes++;
            }
        });
        
        // Migrar pontos pendentes
        this.pendingPoints.forEach(ponto => {
            if (ponto.categoria === 'alternativo') {
                ponto.categoria = 'geral';
                changes++;
            }
        });
        
        // Migrar pontos ocultos
        this.hiddenPoints.forEach(ponto => {
            if (ponto.categoria === 'alternativo') {
                ponto.categoria = 'geral';
                changes++;
            }
        });
        
        if (changes > 0) {
            this.saveAllData();
            console.log(`${changes} points migrated from 'alternativo' to 'geral' category`);
        }
        
        // Remover categoria "alternativo" das categorias salvas
        this.categorias = this.categorias.filter(cat => cat.id !== 'alternativo');
        this.saveCategories();
    }

    async loadCategories() {
        try {
            // Tentar carregar usando a função compatível
            const categorias = await this.loadJsonFile('./database/categorias.json');
            this.categorias = categorias;
            console.log('Categorias carregadas:', categorias.length);
            
            // Disparar evento para atualizar marcadores
            document.dispatchEvent(new CustomEvent('database_categoriasCarregadas', {
                detail: { categorias: this.categorias }
            }));
            return;
        } catch (error) {
            console.warn('Erro ao carregar categorias:', error);
        }

        // Fallback: tentar carregar do localStorage
        const saved = localStorage.getItem(this.baseStorageKey + '_categorias');
        if (saved) {
            this.categorias = JSON.parse(saved);
            console.log('Categorias carregadas do localStorage');
            
            // Disparar evento para atualizar marcadores
            document.dispatchEvent(new CustomEvent('database_categoriasCarregadas', {
                detail: { categorias: this.categorias }
            }));
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
                    id: 'casas-noturnas', 
                    nome: 'Casas Noturnas', 
                    icon: 'fas fa-glass-cheers', 
                    cor: '#f59e0b',
                    descricao: 'Boates, pubs, lounges, baladas temáticas e outros espaços voltados à vida noturna'
                }
                // !TODO: Implementar sistema de favoritos completo
                // { 
                //     id: 'favoritos', 
                //     nome: 'Favoritos', 
                //     icon: 'fas fa-heart', 
                //     cor: '#ec4899',
                //     descricao: 'Pontos marcados como favoritos pelo usuário'
                // }
            ];
            this.saveCategories();
            console.log('Categorias padrão carregadas');
            
            // Disparar evento para atualizar marcadores
            document.dispatchEvent(new CustomEvent('database_categoriasCarregadas', {
                detail: { categorias: this.categorias }
            }));
        }
    }

    /**
     * Salva todos os dados
     */
    saveAllData() {
        localStorage.setItem(this.baseStorageKey + '_pontosConfirmados', JSON.stringify(this.confirmedPoints));
        localStorage.setItem(this.baseStorageKey + '_pontosPendentes', JSON.stringify(this.pendingPoints));
        localStorage.setItem(this.baseStorageKey + '_pontosOcultos', JSON.stringify(this.hiddenPoints));
        localStorage.setItem(this.baseStorageKey + '_usuarios', JSON.stringify(this.usuarios));
    }

    saveCategories() {
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
            this.saveAllData();
        }
        return this.usuarios[username];
    }

    /**
     * Inicializar dados padrão quando não há dados salvos
     */
    initializeDefaultData() {
        console.log('Inicializando dados padrão...');
        this.inicializarPontosDefault();
        this.loadCategories(); // Garantir que categorias estejam carregadas
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
                categoria: 'geral',
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
                categoria: 'geral',
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
        this.saveAllData();
        console.log(`${pontosDefault.length} pontos padrao carregados`);
    }

    // API pública - Métodos principais

    /**
     * Retorna pontos confirmados + ocultos (unified behavior)
     * UNIFIED: Now includes hidden points like the Python server
     */
    getPontos() {
        return [...this.confirmedPoints, ...this.hiddenPoints];
    }

    /**
     * Retorna pontos baseado no perfil do usuário
     * UNIFIED: Now returns all points (confirmed + hidden) for all users, like the Python server
     */
    getPontosParaUsuario(userRole = 'visitor', username = null) {
        if (userRole === 'administrator') {
            // Admins see everything: confirmed + pending + hidden
            return [...this.confirmedPoints, ...this.pendingPoints, ...this.hiddenPoints];
        }
        // Regular users see confirmed + hidden points (unified with Python server behavior)
        return [...this.confirmedPoints, ...this.hiddenPoints];
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
        
        this.saveAllData();
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
        this.saveAllData();
        
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
        this.saveAllData();
        
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
        this.saveAllData();
        
        return ponto;
    }

    /**
     * Adicionar/remover favorito - FUNCIONALIDADE EM DESENVOLVIMENTO
     * !TODO: Implementar sistema completo de favoritos
     */
    toggleFavorito(pontoId, username) {
        console.log('!TODO: Implementar toggleFavorito - pontoId:', pontoId, 'username:', username);
        return false; // Retornar false para não interferir no sistema
    }

    /**
     * Verificar se ponto é favorito - FUNCIONALIDADE EM DESENVOLVIMENTO
     * !TODO: Implementar sistema completo de favoritos
     */
    isFavorito(pontoId, username) {
        console.log('!TODO: Implementar isFavorito - pontoId:', pontoId, 'username:', username);
        return false; // Sempre retornar false para não mostrar como favorito
    }

    /**
     * Obter pontos favoritos do usuário - FUNCIONALIDADE EM DESENVOLVIMENTO
     * !TODO: Implementar sistema completo de favoritos
     */
    getFavoritos(username) {
        console.log('!TODO: Implementar getFavoritos - username:', username);
        return []; // Retornar array vazio
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
        
        this.saveAllData();
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
        
        this.saveAllData();
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
            this.saveAllData();
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

            this.saveAllData();
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

            this.saveAllData();
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
        
        // !TODO: Implementar sistema de favoritos completo
        if (categoria === 'favoritos' && username) {
            console.log('!TODO: Implementar filtro de favoritos');
            return []; // Retornar array vazio temporariamente
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
            
            this.saveAllData();
            return { success: true, message: 'Dados importados com sucesso' };
        }
        
        throw new Error('Formato de dados inválido');
    }

    /**
     * Salvar dados no localStorage (método de compatibilidade)
     */
    salvarNoLocalStorage() {
        this.saveAllData();
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
            this.saveAllData();
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
                "icon": "fas fa-theater-masks",
                "cor": "#6c757d",
                "descricao": "Pontos de interesse geral e diversos"
            },
            {
                "id": "esportes-lazer",
                "nome": "Esportes",
                "icon": "fas fa-running",
                "cor": "#28a745",
                "descricao": "Atividades esportivas e de lazer"
            },
            {
                "id": "gastronomia",
                "nome": "Gastronomia",
                "icon": "fas fa-utensils",
                "cor": "#dc3545",
                "descricao": "Restaurantes, bares e experiências culinárias"
            },
            {
                "id": "geek-nerd",
                "nome": "Geek",
                "icon": "fas fa-gamepad",
                "cor": "#6f42c1",
                "descricao": "Cultura geek, games e tecnologia"
            },

            {
                "id": "casas-noturnas",
                "nome": "Casas Noturnas",
                "icon": "fas fa-glass-cheers",
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
     * Dados padrão de pontos ocultos para fallback
     */
    getHiddenPointsDefault() {
        return [
            {
                "id": 101,
                "nome": "Ponto Oculto de Exemplo",
                "categoria": "geral",
                "coordenadas": [-15.794, -47.882],
                "descricao": "Exemplo de ponto oculto carregado por padrão",
                "endereco": "Localização reservada",
                "ativo": true,
                "dataCriacao": "2025-01-20T12:00:00.000Z",
                "oculto": true
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
