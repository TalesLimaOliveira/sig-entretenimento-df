/**
 * Database Manager - Clean Version
 */
class DatabaseManager {
    constructor() {
        this.pontos = [];
        this.categorias = [];
        this.proximoId = 1;
        this.storageKey = 'pontosEntretenimento';
        this.init();
    }

    async init() {
        try {
            console.log('💾 Inicializando DatabaseManager...');
            this.carregarCategorias();
            this.carregarPontos();
            console.log('✅ DatabaseManager inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar DatabaseManager:', error);
            this.inicializarDadosDefault();
        }
    }

    carregarCategorias() {
        const saved = localStorage.getItem(this.storageKey + '_categorias');
        if (saved) {
            this.categorias = JSON.parse(saved);
        } else {
            this.categorias = [
                { id: 'geral', nome: 'Geral', icon: 'fas fa-map-marker-alt', cor: '#ef4444' },
                { id: 'gastronomia', nome: 'Gastronomia', icon: 'fas fa-utensils', cor: '#2563eb' },
                { id: 'esportes', nome: 'Esportes', icon: 'fas fa-futbol', cor: '#10b981' },
                { id: 'cultura', nome: 'Cultura', icon: 'fas fa-theater-masks', cor: '#8b5cf6' },
                { id: 'noturno', nome: 'Vida Noturna', icon: 'fas fa-glass-cheers', cor: '#f59e0b' }
            ];
            this.salvarCategorias();
        }
    }

    carregarPontos() {
        const saved = localStorage.getItem(this.storageKey + '_pontos');
        if (saved) {
            this.pontos = JSON.parse(saved);
            this.proximoId = Math.max(...this.pontos.map(p => p.id), 0) + 1;
        } else {
            this.pontos = [];
            this.inicializarPontosDefault();
        }
    }

    inicializarPontosDefault() {
        const pontosDefault = [
            {
                id: 1,
                nome: 'Pontão do Lago Sul',
                descricao: 'Complexo gastronômico e de lazer',
                categoria: 'gastronomia',
                latitude: -15.8267,
                longitude: -47.8881,
                endereco: 'SHIS QI 11, Brasília - DF',
                telefone: '(61) 3248-1000',
                website: 'https://pontaodolagosul.com.br',
                horario: '10:00 - 22:00',
                preco: 'R$ 50-100',
                nota: 4.5,
                verificado: true,
                dataAdicao: new Date().toISOString()
            },
            {
                id: 2,
                nome: 'Estádio Nacional de Brasília',
                descricao: 'Estádio multiuso para eventos esportivos',
                categoria: 'esportes',
                latitude: -15.7836,
                longitude: -47.9003,
                endereco: 'SRPN, Brasília - DF',
                telefone: '(61) 3340-9000',
                website: 'https://mane.gov.br',
                horario: 'Conforme eventos',
                preco: 'Variável',
                nota: 4.3,
                verificado: true,
                dataAdicao: new Date().toISOString()
            },
            {
                id: 3,
                nome: 'Teatro Nacional Claudio Santoro',
                descricao: 'Principal casa de espetáculos de Brasília',
                categoria: 'cultura',
                latitude: -15.7952,
                longitude: -47.8852,
                endereco: 'Via N2, Brasília - DF',
                telefone: '(61) 3325-6100',
                website: 'https://teatronacional.df.gov.br',
                horario: '19:00 - 22:00',
                preco: 'R$ 20-80',
                nota: 4.6,
                verificado: true,
                dataAdicao: new Date().toISOString()
            },
            {
                id: 4,
                nome: 'Praça dos Três Poderes',
                descricao: 'Marco histórico e político do Brasil',
                categoria: 'geral',
                latitude: -15.7999,
                longitude: -47.8597,
                endereco: 'Praça dos Três Poderes, Brasília - DF',
                telefone: 'N/A',
                website: 'https://www.gov.br',
                horario: '24 horas',
                preco: 'Gratuito',
                nota: 4.8,
                verificado: true,
                dataAdicao: new Date().toISOString()
            },
            {
                id: 5,
                nome: 'Villa Mix Brasília',
                descricao: 'Casa noturna com música sertaneja',
                categoria: 'noturno',
                latitude: -15.8321,
                longitude: -47.9187,
                endereco: 'SGAS 915, Brasília - DF',
                telefone: '(61) 3443-8000',
                website: 'https://villamix.com.br',
                horario: '22:00 - 06:00',
                preco: 'R$ 40-120',
                nota: 4.2,
                verificado: true,
                dataAdicao: new Date().toISOString()
            }
        ];
        
        this.pontos = pontosDefault;
        this.proximoId = 6;
        this.salvarPontos();
        console.log(`✅ ${pontosDefault.length} pontos padrão carregados`);
    }

    salvarCategorias() {
        localStorage.setItem(this.storageKey + '_categorias', JSON.stringify(this.categorias));
    }

    salvarPontos() {
        localStorage.setItem(this.storageKey + '_pontos', JSON.stringify(this.pontos));
    }

    // API pública
    getPontos() {
        return this.pontos;
    }

    getCategorias() {
        return this.categorias;
    }

    getPontoById(id) {
        return this.pontos.find(p => p.id === parseInt(id));
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

    adicionarPonto(dadosPonto) {
        const ponto = {
            id: this.proximoId++,
            ...dadosPonto,
            dataAdicao: new Date().toISOString(),
            verificado: false
        };
        
        this.pontos.push(ponto);
        this.salvarPontos();
        return ponto;
    }

    removerPonto(pontoId) {
        this.pontos = this.pontos.filter(p => p.id !== pontoId);
        this.salvarPontos();
    }

    atualizarPonto(pontoId, novosDados) {
        const index = this.pontos.findIndex(p => p.id === pontoId);
        if (index !== -1) {
            this.pontos[index] = { ...this.pontos[index], ...novosDados };
            this.salvarPontos();
            return this.pontos[index];
        }
        return null;
    }

    buscarPontos(termo) {
        const termoLower = termo.toLowerCase();
        return this.pontos.filter(ponto => 
            ponto.nome.toLowerCase().includes(termoLower) ||
            ponto.descricao.toLowerCase().includes(termoLower) ||
            ponto.endereco.toLowerCase().includes(termoLower)
        );
    }

    filtrarPorCategoria(categoria) {
        if (categoria === 'todos') {
            return this.pontos;
        }
        return this.pontos.filter(p => p.categoria === categoria);
    }

    getEstatisticas() {
        const totalPontos = this.pontos.length;
        const pontosPorCategoria = {};
        
        // Inicializar contadores para todas as categorias
        this.categorias.forEach(cat => {
            pontosPorCategoria[cat.id] = 0;
        });
        
        // Contar pontos por categoria
        this.pontos.forEach(ponto => {
            if (pontosPorCategoria.hasOwnProperty(ponto.categoria)) {
                pontosPorCategoria[ponto.categoria]++;
            }
        });
        
        return {
            totalPontos,
            pontosPorCategoria,
            pontosVerificados: this.pontos.filter(p => p.verificado).length,
            pontosNaoVerificados: this.pontos.filter(p => !p.verificado).length
        };
    }

    async carregarDados() {
        // Método para compatibilidade com app.js
        return Promise.resolve();
    }
}
