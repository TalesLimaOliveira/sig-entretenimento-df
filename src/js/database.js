/**
 * Gerenciador de Banco de Dados
 * Classe responsável por gerenciar os dados dos pontos de entretenimento
 * 
 * @author Seu Nome
 * @version 1.0.0
 */

class DatabaseManager {
    constructor() {
        this.pontos = [];
        this.categorias = [];
        this.proximoId = 1;
        this.apiUrl = 'http://localhost:3000';
        this.storageKey = 'pontosEntretenimento_v1';
        this.categoriasStorageKey = 'categorias_v1';
        this.init();
    }

    /**
     * Inicializa o banco de dados
     */
    async init() {
        try {
            await this.carregarCategorias();
            await this.carregarPontos();
            this.configurarBackupAutomatico();
            console.log('✅ DatabaseManager inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar DatabaseManager:', error);
            // Forçar inicialização das categorias e pontos
            this.inicializarCategoriasDefault();
            this.inicializarPontosDefault();
        }
    }

    /**
     * Configurar backup automático
     */
    configurarBackupAutomatico() {
        // Backup a cada 30 segundos
        setInterval(() => {
            this.salvarNoLocalStorage();
        }, 30 * 1000);

        // Backup antes de sair da página
        window.addEventListener('beforeunload', () => {
            this.salvarNoLocalStorage();
        });
    }

    /**
     * Inicializar dados padrão
     */
    async inicializarDadosDefault() {
        console.log('🔄 Inicializando dados padrão...');
        
        // Categorias padrão
        this.categorias = [
            {
                id: 'restaurantes',
                nome: 'Restaurantes',
                icone: '🍽️',
                cor: '#FF6B6B',
                descricao: 'Opções gastronômicas variadas'
            },
            {
                id: 'shopping',
                nome: 'Shopping',
                icone: '🛍️',
                cor: '#4ECDC4',
                descricao: 'Centros comerciais e lojas'
            },
            {
                id: 'parques',
                nome: 'Parques',
                icone: '🌳',
                cor: '#45B7D1',
                descricao: 'Áreas verdes e lazer ao ar livre'
            },
            {
                id: 'cultura',
                nome: 'Cultura',
                icone: '🎭',
                cor: '#96CEB4',
                descricao: 'Museus, teatros e centros culturais'
            },
            {
                id: 'vida-noturna',
                nome: 'Vida Noturna',
                icone: '🌙',
                cor: '#FFEAA7',
                descricao: 'Bares, casas noturnas e entretenimento'
            }
        ];

        // Pontos padrão
        const pontosDefault = [
            {
                nome: "Restaurante Olivae",
                categoria: "restaurantes",
                coordenadas: [-15.794700, -48.105200],
                descricao: "Restaurante italiano com ambiente sofisticado",
                endereco: "CLN 201 - Asa Norte",
                telefone: "(61) 3340-8120",
                website: "https://olivae.com.br",
                horario: "12h às 15h, 19h às 23h",
                preco: "R$ 80-120",
                avaliacao: 4.5,
                tags: ["italiano", "sofisticado", "jantar"]
            },
            {
                nome: "Brasília Shopping",
                categoria: "shopping",
                coordenadas: [-15.795000, -47.890000],
                descricao: "Um dos maiores centros comerciais do DF",
                endereco: "SCN Quadra 5 - Asa Norte",
                telefone: "(61) 3328-8000",
                website: "https://brasiliashopping.com.br",
                horario: "10h às 22h",
                preco: "Varia por loja",
                avaliacao: 4.4,
                tags: ["shopping", "lojas", "cinema"]
            },
            {
                nome: "Parque da Cidade",
                categoria: "parques",
                coordenadas: [-15.787500, -47.906900],
                descricao: "Maior parque urbano do mundo",
                endereco: "Asa Sul - Brasília",
                telefone: "",
                website: "",
                horario: "24h",
                preco: "Gratuito",
                avaliacao: 4.6,
                tags: ["parque", "exercicio", "familia"]
            }
        ];

        // Adicionar pontos padrão
        for (const pontoData of pontosDefault) {
            await this.criarPonto(pontoData);
        }

        this.salvarNoLocalStorage();
        console.log('✅ Dados padrão inicializados');
    }

    /**
     * Criar novo ponto
     * @param {Object} dadosPonto - Dados do ponto
     * @returns {Promise<Object>} Ponto criado
     */
    async criarPonto(dadosPonto) {
        try {
            // Validar dados
            const dadosValidados = this.validarDadosPonto(dadosPonto);
            
            // Verificar duplicatas
            if (this.verificarDuplicata(dadosValidados.nome, dadosValidados.coordenadas)) {
                throw new Error('Já existe um ponto com esse nome ou nas mesmas coordenadas');
            }

            // Criar ponto
            const novoPonto = {
                id: this.proximoId++,
                ...dadosValidados,
                ativo: true,
                dataCriacao: new Date().toISOString(),
                dataAtualizacao: new Date().toISOString(),
                criadoPor: authManager.getCurrentUser()?.username || 'sistema',
                metadata: {
                    views: 0,
                    likes: 0,
                    verificado: false
                }
            };

            // Adicionar ao array
            this.pontos.push(novoPonto);

            // Salvar
            this.salvarNoLocalStorage();

            // Tentar salvar na API
            try {
                await this.salvarNaAPI(novoPonto);
            } catch (apiError) {
                console.warn('⚠️ Erro ao salvar na API:', apiError.message);
            }

            // Disparar evento
            this.dispatchEvent('pontoAdicionado', novoPonto);

            console.log('✅ Ponto criado:', novoPonto.nome);
            return novoPonto;

        } catch (error) {
            console.error('❌ Erro ao criar ponto:', error);
            throw error;
        }
    }

    /**
     * Validar dados do ponto
     * @param {Object} dados - Dados a validar
     * @returns {Object} Dados validados
     */
    validarDadosPonto(dados) {
        const erros = [];

        // Validações obrigatórias
        if (!dados.nome || dados.nome.length < 3) {
            erros.push('Nome deve ter pelo menos 3 caracteres');
        }

        if (!dados.categoria || !this.categorias.find(c => c.id === dados.categoria)) {
            erros.push('Categoria inválida');
        }

        if (!dados.coordenadas || !Array.isArray(dados.coordenadas) || dados.coordenadas.length !== 2) {
            erros.push('Coordenadas inválidas');
        }

        if (!dados.endereco || dados.endereco.length < 10) {
            erros.push('Endereço deve ter pelo menos 10 caracteres');
        }

        if (!dados.descricao || dados.descricao.length < 20) {
            erros.push('Descrição deve ter pelo menos 20 caracteres');
        }

        // Validações opcionais
        if (dados.telefone && !this.validarTelefone(dados.telefone)) {
            erros.push('Formato de telefone inválido');
        }

        if (dados.website && !this.validarURL(dados.website)) {
            erros.push('URL do website inválida');
        }

        if (dados.avaliacao && (dados.avaliacao < 1 || dados.avaliacao > 5)) {
            erros.push('Avaliação deve estar entre 1 e 5');
        }

        // Validar coordenadas do DF
        if (dados.coordenadas) {
            const [lat, lng] = dados.coordenadas;
            if (lat < -16.5 || lat > -15.3 || lng < -48.5 || lng > -47.2) {
                erros.push('Coordenadas fora dos limites do Distrito Federal');
            }
        }

        if (erros.length > 0) {
            throw new Error('Dados inválidos: ' + erros.join(', '));
        }

        return {
            nome: dados.nome.trim(),
            categoria: dados.categoria,
            coordenadas: dados.coordenadas,
            endereco: dados.endereco.trim(),
            descricao: dados.descricao.trim(),
            telefone: dados.telefone?.trim() || '',
            website: dados.website?.trim() || '',
            horario: dados.horario?.trim() || '',
            preco: dados.preco?.trim() || '',
            avaliacao: dados.avaliacao || 0,
            tags: dados.tags || []
        };
    }

    /**
     * Validar telefone
     * @param {string} telefone - Telefone a validar
     * @returns {boolean}
     */
    validarTelefone(telefone) {
        const pattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return pattern.test(telefone);
    }

    /**
     * Validar URL
     * @param {string} url - URL a validar
     * @returns {boolean}
     */
    validarURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Verificar duplicata
     * @param {string} nome - Nome do ponto
     * @param {Array} coordenadas - Coordenadas do ponto
     * @returns {boolean}
     */
    verificarDuplicata(nome, coordenadas) {
        return this.pontos.some(ponto => 
            ponto.ativo && (
                ponto.nome.toLowerCase() === nome.toLowerCase() ||
                this.calcularDistancia(ponto.coordenadas, coordenadas) < 0.05 // 50 metros
            )
        );
    }

    /**
     * Calcular distância entre coordenadas
     * @param {Array} coord1 - Primeira coordenada
     * @param {Array} coord2 - Segunda coordenada
     * @returns {number} Distância em km
     */
    calcularDistancia(coord1, coord2) {
        const R = 6371; // Raio da Terra em km
        const dLat = this.toRadians(coord2[0] - coord1[0]);
        const dLon = this.toRadians(coord2[1] - coord1[1]);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(coord1[0])) * Math.cos(this.toRadians(coord2[0])) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Converter graus para radianos
     * @param {number} degrees - Graus
     * @returns {number} Radianos
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Buscar pontos por categoria
     * @param {string} categoria - Categoria a buscar
     * @returns {Array} Pontos encontrados
     */
    buscarPorCategoria(categoria) {
        if (categoria === 'todos') {
            return this.pontos.filter(ponto => ponto.ativo);
        }
        return this.pontos.filter(ponto => ponto.categoria === categoria && ponto.ativo);
    }

    /**
     * Buscar pontos por texto
     * @param {string} texto - Texto a buscar
     * @returns {Array} Pontos encontrados
     */
    buscarPorTexto(texto) {
        const termoBusca = texto.toLowerCase();
        return this.pontos.filter(ponto => 
            ponto.ativo && (
                ponto.nome.toLowerCase().includes(termoBusca) ||
                ponto.descricao.toLowerCase().includes(termoBusca) ||
                ponto.endereco.toLowerCase().includes(termoBusca) ||
                ponto.tags.some(tag => tag.toLowerCase().includes(termoBusca))
            )
        );
    }

    /**
     * Buscar pontos por proximidade
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @param {number} raioKm - Raio em quilômetros
     * @returns {Array} Pontos encontrados
     */
    buscarPorProximidade(lat, lng, raioKm = 5) {
        return this.pontos.filter(ponto => {
            if (!ponto.ativo) return false;
            
            const distancia = this.calcularDistancia(
                [lat, lng], 
                ponto.coordenadas
            );
            return distancia <= raioKm;
        });
    }

    /**
     * Obter ponto por ID
     * @param {number} id - ID do ponto
     * @returns {Object|null} Ponto encontrado
     */
    obterPonto(id) {
        return this.pontos.find(ponto => ponto.id === id && ponto.ativo);
    }

    /**
     * Atualizar ponto
     * @param {number} id - ID do ponto
     * @param {Object} dadosAtualizados - Dados para atualizar
     * @returns {Promise<Object>} Ponto atualizado
     */
    async atualizarPonto(id, dadosAtualizados) {
        try {
            const index = this.pontos.findIndex(ponto => ponto.id === id);
            if (index === -1) {
                throw new Error('Ponto não encontrado');
            }

            // Validar dados
            const dadosValidados = this.validarDadosPonto({
                ...this.pontos[index],
                ...dadosAtualizados
            });

            // Atualizar
            this.pontos[index] = {
                ...this.pontos[index],
                ...dadosValidados,
                dataAtualizacao: new Date().toISOString()
            };

            // Salvar
            this.salvarNoLocalStorage();

            // Disparar evento
            this.dispatchEvent('pontoAtualizado', this.pontos[index]);

            return this.pontos[index];

        } catch (error) {
            console.error('❌ Erro ao atualizar ponto:', error);
            throw error;
        }
    }

    /**
     * Deletar ponto (soft delete)
     * @param {number} id - ID do ponto
     * @returns {boolean} Sucesso da operação
     */
    async deletarPonto(id) {
        try {
            const index = this.pontos.findIndex(ponto => ponto.id === id);
            if (index === -1) {
                throw new Error('Ponto não encontrado');
            }

            // Soft delete
            this.pontos[index].ativo = false;
            this.pontos[index].dataAtualizacao = new Date().toISOString();

            // Salvar
            this.salvarNoLocalStorage();

            // Disparar evento
            this.dispatchEvent('pontoRemovido', this.pontos[index]);

            return true;

        } catch (error) {
            console.error('❌ Erro ao deletar ponto:', error);
            throw error;
        }
    }

    /**
     * Obter estatísticas
     * @returns {Object} Estatísticas dos pontos
     */
    obterEstatisticas() {
        const pontosAtivos = this.pontos.filter(ponto => ponto.ativo);
        const estatisticas = {
            total: pontosAtivos.length,
            porCategoria: {},
            ultimaSemana: 0,
            maisVisitados: []
        };

        // Contar por categoria
        pontosAtivos.forEach(ponto => {
            estatisticas.porCategoria[ponto.categoria] = 
                (estatisticas.porCategoria[ponto.categoria] || 0) + 1;
        });

        // Pontos da última semana
        const umaSemanAAtras = new Date();
        umaSemanAAtras.setDate(umaSemanAAtras.getDate() - 7);
        
        estatisticas.ultimaSemana = pontosAtivos.filter(ponto => 
            new Date(ponto.dataCriacao) > umaSemanAAtras
        ).length;

        // Mais visitados
        estatisticas.maisVisitados = pontosAtivos
            .sort((a, b) => (b.metadata?.views || 0) - (a.metadata?.views || 0))
            .slice(0, 5)
            .map(ponto => ({
                id: ponto.id,
                nome: ponto.nome,
                views: ponto.metadata?.views || 0
            }));

        return estatisticas;
    }

    /**
     * Carregar pontos do localStorage
     */
    carregarPontos() {
        try {
            const dados = localStorage.getItem(this.storageKey);
            if (dados) {
                const parsed = JSON.parse(dados);
                this.pontos = parsed.pontos || [];
                this.proximoId = parsed.proximoId || 1;
            }
            
            // Se não há pontos, inicializar dados padrão
            if (!this.pontos || this.pontos.length === 0) {
                this.inicializarPontosDefault();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar pontos do localStorage:', error);
            this.inicializarPontosDefault();
        }
    }

    /**
     * Inicializar pontos padrão
     */
    async inicializarPontosDefault() {
        const pontosDefault = [
            {
                nome: "Restaurante Olivae",
                categoria: "restaurantes",
                coordenadas: [-15.794700, -48.105200],
                descricao: "Restaurante italiano com ambiente sofisticado",
                endereco: "CLN 201 - Asa Norte",
                telefone: "(61) 3340-8120",
                website: "https://olivae.com.br",
                horario: "12h às 15h, 19h às 23h",
                preco: "R$ 80-120",
                avaliacao: 4.5,
                tags: ["italiano", "sofisticado", "jantar"]
            },
            {
                nome: "Brasília Shopping",
                categoria: "shopping",
                coordenadas: [-15.795000, -47.890000],
                descricao: "Um dos maiores centros comerciais do DF",
                endereco: "SCN Quadra 5 - Asa Norte",
                telefone: "(61) 3328-8000",
                website: "https://brasiliashopping.com.br",
                horario: "10h às 22h",
                preco: "Varia por loja",
                avaliacao: 4.4,
                tags: ["shopping", "lojas", "cinema"]
            },
            {
                nome: "Parque da Cidade",
                categoria: "parques",
                coordenadas: [-15.787500, -47.906900],
                descricao: "Maior parque urbano do mundo",
                endereco: "Asa Sul - Brasília",
                telefone: "",
                website: "",
                horario: "24h",
                preco: "Gratuito",
                avaliacao: 4.6,
                tags: ["parque", "exercicio", "familia"]
            },
            {
                nome: "Museu Nacional",
                categoria: "cultura",
                coordenadas: [-15.798000, -47.875000],
                descricao: "Importante centro cultural de Brasília",
                endereco: "Esplanada dos Ministérios",
                telefone: "(61) 3325-5220",
                website: "",
                horario: "9h às 17h",
                preco: "R$ 10",
                avaliacao: 4.3,
                tags: ["museu", "cultura", "historia"]
            },
            {
                nome: "Bar Beirute",
                categoria: "vida-noturna",
                coordenadas: [-15.796000, -47.883000],
                descricao: "Tradicional bar e restaurante de Brasília",
                endereco: "CLS 109 - Asa Sul",
                telefone: "(61) 3244-1717",
                website: "",
                horario: "18h às 2h",
                preco: "R$ 40-80",
                avaliacao: 4.2,
                tags: ["bar", "tradicional", "noturno"]
            }
        ];

        // Adicionar pontos padrão
        for (const pontoData of pontosDefault) {
            const novoPonto = {
                id: this.proximoId++,
                ...pontoData,
                ativo: true,
                dataCriacao: new Date().toISOString(),
                dataAtualizacao: new Date().toISOString(),
                criadoPor: 'sistema',
                metadata: {
                    views: 0,
                    likes: 0,
                    verificado: true
                }
            };
            this.pontos.push(novoPonto);
        }

        // Salvar no localStorage
        this.salvarNoLocalStorage();
    }

    /**
     * Carregar categorias
     */
    carregarCategorias() {
        try {
            const dados = localStorage.getItem(this.categoriasStorageKey);
            if (dados) {
                this.categorias = JSON.parse(dados);
            }
            
            // Se não há categorias, inicializar padrão
            if (!this.categorias || this.categorias.length === 0) {
                this.inicializarCategoriasDefault();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar categorias:', error);
            this.inicializarCategoriasDefault();
        }
    }

    /**
     * Inicializar categorias padrão
     */
    inicializarCategoriasDefault() {
        this.categorias = [
            {
                id: 'restaurantes',
                nome: 'Restaurantes',
                icone: '🍽️',
                cor: '#FF6B6B',
                descricao: 'Opções gastronômicas variadas'
            },
            {
                id: 'shopping',
                nome: 'Shopping',
                icone: '🛍️',
                cor: '#4ECDC4',
                descricao: 'Centros comerciais e lojas'
            },
            {
                id: 'parques',
                nome: 'Parques',
                icone: '🌳',
                cor: '#45B7D1',
                descricao: 'Áreas verdes e lazer ao ar livre'
            },
            {
                id: 'cultura',
                nome: 'Cultura',
                icone: '🎭',
                cor: '#96CEB4',
                descricao: 'Museus, teatros e centros culturais'
            },
            {
                id: 'vida-noturna',
                nome: 'Vida Noturna',
                icone: '🌙',
                cor: '#FFEAA7',
                descricao: 'Bares, casas noturnas e entretenimento'
            }
        ];
        
        // Salvar no localStorage
        this.salvarNoLocalStorage();
    }

    /**
     * Salvar no localStorage
     */
    salvarNoLocalStorage() {
        try {
            const dados = {
                pontos: this.pontos,
                proximoId: this.proximoId,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(dados));
            localStorage.setItem(this.categoriasStorageKey, JSON.stringify(this.categorias));
        } catch (error) {
            console.error('❌ Erro ao salvar no localStorage:', error);
        }
    }

    /**
     * Salvar na API
     * @param {Object} ponto - Ponto a salvar
     */
    async salvarNaAPI(ponto) {
        try {
            const response = await fetch(`${this.apiUrl}/pontos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ponto)
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Erro ao salvar na API: ${error.message}`);
        }
    }

    /**
     * Exportar dados para backup
     * @returns {string} Dados em JSON
     */
    exportarDados() {
        const dados = {
            pontos: this.pontos,
            categorias: this.categorias,
            metadata: {
                versao: '1.0.0',
                dataExportacao: new Date().toISOString(),
                totalPontos: this.pontos.length
            }
        };
        return JSON.stringify(dados, null, 2);
    }

    /**
     * Importar dados de backup
     * @param {string} dadosJson - Dados em JSON
     * @returns {boolean} Sucesso da operação
     */
    importarDados(dadosJson) {
        try {
            const dados = JSON.parse(dadosJson);
            
            if (dados.pontos) {
                this.pontos = dados.pontos;
                this.proximoId = Math.max(...this.pontos.map(p => p.id), 0) + 1;
            }
            
            if (dados.categorias) {
                this.categorias = dados.categorias;
            }

            this.salvarNoLocalStorage();
            this.dispatchEvent('dadosImportados', dados);
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao importar dados:', error);
            return false;
        }
    }

    /**
     * Disparar evento personalizado
     * @param {string} tipo - Tipo do evento
     * @param {Object} dados - Dados do evento
     */
    dispatchEvent(tipo, dados) {
        const event = new CustomEvent(`database_${tipo}`, {
            detail: dados
        });
        document.dispatchEvent(event);
    }

    /**
     * Obter categorias
     * @returns {Array} Lista de categorias
     */
    obterCategorias() {
        return this.categorias;
    }

    /**
     * Obter categoria por ID
     * @param {string} id - ID da categoria
     * @returns {Object|null} Categoria encontrada
     */
    obterCategoria(id) {
        return this.categorias.find(cat => cat.id === id);
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
