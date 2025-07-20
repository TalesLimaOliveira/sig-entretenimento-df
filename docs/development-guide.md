# Guia de Desenvolvimento - SIG Entretenimento DF

## Padrões de Código

### Convenções de Nomenclatura

#### Classes
```javascript
// PascalCase para classes
class MapManager { }
class DatabaseManager { }
class PontosEntretenimentoApp { }
```

#### Métodos e Variáveis
```javascript
// camelCase para métodos e variáveis
configurarInterface()
adicionarMarcador()
const categoriaAtiva = 'todos';
```

#### Constantes
```javascript
// UPPER_SNAKE_CASE para constantes
const BASE_STORAGE_KEY = 'pontosEntretenimento';
const DEFAULT_ZOOM_LEVEL = 11;
```

#### Elementos DOM
```javascript
// kebab-case para IDs e classes CSS
#info-panel
.nav-btn
.category-btn
```

### Estrutura de Métodos

#### Padrão de Documentação
```javascript
/**
 * Descrição clara do que o método faz
 * 
 * @param {tipo} nomeParametro - Descrição do parâmetro
 * @returns {tipo} Descrição do retorno
 * 
 * Usado por: Lista de arquivos/componentes que utilizam
 * Dependências: Lista de dependências externas
 */
```

#### Padrão de Tratamento de Erros
```javascript
async exemploMetodo(parametro) {
    try {
        console.log('🔄 Iniciando operação...');
        
        // Validações de entrada
        if (!parametro) {
            throw new Error('Parâmetro obrigatório');
        }
        
        // Lógica principal
        const resultado = await operacao(parametro);
        
        console.log('✅ Operação concluída com sucesso');
        return resultado;
        
    } catch (error) {
        console.error('❌ Erro na operação:', error);
        throw error; // ou return null para não-críticos
    }
}
```

### Estrutura de Classes

#### Padrão de Organização
```javascript
class ExemploManager {
    constructor() {
        // Propriedades de instância
        this.propriedade = valor;
        this.init();
    }

    // Método de inicialização
    async init() { }

    // Métodos públicos principais
    metodoPublico() { }

    // Métodos de configuração
    configurarElemento() { }

    // Métodos de manipulação
    adicionarItem() { }
    removerItem() { }
    atualizarItem() { }

    // Métodos utilitários privados
    _metodoPrivado() { }
    _validarEntrada() { }

    // Métodos de limpeza
    destroy() { }
}
```

## Gerenciamento de Dependências

### Managers Globais
Os seguintes managers são disponibilizados globalmente:
```javascript
window.databaseManager    // Gerenciamento de dados
window.authManager       // Autenticação
window.mapManager        // Mapas e marcadores
window.themeManager      // Temas
window.modalManager      // Modais (se aplicável)
```

### Verificação de Dependências
```javascript
// Sempre verificar disponibilidade antes do uso
if (window.mapManager && typeof window.mapManager.metodo === 'function') {
    window.mapManager.metodo();
} else {
    console.warn('⚠️ MapManager não disponível');
}
```

## Estrutura de CSS

### Organização de Arquivos
- `colors.css` - Variáveis de cores e temas
- `main.css` - Estilos principais e layout
- `components.css` - Componentes reutilizáveis

### Padrão de Classes CSS
```css
/* Componente base */
.component-name {
    /* Propriedades principais */
}

/* Modificadores */
.component-name--variant {
    /* Variações do componente */
}

/* Estados */
.component-name.is-active {
    /* Estados específicos */
}

/* Responsividade */
@media (max-width: 768px) {
    .component-name {
        /* Ajustes mobile */
    }
}
```

### Variáveis CSS
```css
:root {
    /* Cores principais */
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    
    /* Espaçamentos */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    
    /* Tipografia */
    --font-size-base: 1rem;
    --font-weight-normal: 400;
}
```

## Sistema de Eventos

### Eventos Customizados
```javascript
// Disparar evento customizado
document.dispatchEvent(new CustomEvent('authStateChanged', {
    detail: { type: 'login', user: userData }
}));

// Escutar evento customizado
document.addEventListener('authStateChanged', (e) => {
    const { type, user } = e.detail;
    // Lógica de resposta
});
```

### Padrões de Event Handling
```javascript
// Event delegation para elementos dinâmicos
document.addEventListener('click', (e) => {
    if (e.target.matches('.dynamic-element')) {
        // Handle click
    }
});

// Cleanup de event listeners
class ExemploComponent {
    constructor() {
        this.boundHandler = this.handleEvent.bind(this);
        this.setupEvents();
    }
    
    setupEvents() {
        element.addEventListener('event', this.boundHandler);
    }
    
    destroy() {
        element.removeEventListener('event', this.boundHandler);
    }
}
```

## Responsividade

### Breakpoints Padrão
```css
/* Mobile first approach */
@media (min-width: 576px) { /* Small devices */ }
@media (min-width: 768px) { /* Medium devices */ }
@media (min-width: 992px) { /* Large devices */ }
@media (min-width: 1200px) { /* Extra large devices */ }
```

### Unidades Responsivas
```css
/* Preferir unidades relativas */
.container {
    width: 100%;
    max-width: 1200px;
    padding: 1rem; /* rem para espaçamentos */
    font-size: 1.125rem; /* rem para fontes */
    height: 100vh; /* vh para altura da tela */
}
```

## Debug e Logging

### Padrão de Logs
```javascript
// Sistema de logs com emoji indicators
console.log('🚀 Iniciando aplicação...'); // Início de processo
console.log('🔄 Processando...'); // Em andamento
console.log('✅ Sucesso'); // Sucesso
console.warn('⚠️ Aviso'); // Aviso
console.error('❌ Erro'); // Erro
console.log('ℹ️ Informação'); // Informação geral
```

### Debug Mode
```javascript
// Variável global para debug
const DEBUG_MODE = window.location.hostname === 'localhost';

if (DEBUG_MODE) {
    console.log('🐛 Debug mode ativo');
}
```

## Testes e Validação

### Validação de Entrada
```javascript
function validarPonto(ponto) {
    const required = ['nome', 'latitude', 'longitude', 'categoria'];
    
    for (const field of required) {
        if (!ponto[field]) {
            throw new Error(`Campo obrigatório: ${field}`);
        }
    }
    
    if (typeof ponto.latitude !== 'number' || 
        typeof ponto.longitude !== 'number') {
        throw new Error('Coordenadas devem ser números');
    }
    
    return true;
}
```

### Testes Manuais
```javascript
// Funções de teste para console
window.debugApp = {
    managers: () => {
        console.log('Managers disponíveis:', {
            database: !!window.databaseManager,
            auth: !!window.authManager,
            map: !!window.mapManager,
            theme: !!window.themeManager
        });
    },
    
    pontos: () => {
        if (window.databaseManager) {
            console.log('Total de pontos:', 
                window.databaseManager.getPontos().length);
        }
    }
};
```
