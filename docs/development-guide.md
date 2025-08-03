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
// camelCase para métodos e variáveis (SEMPRE EM INGLÊS)
configureInterface()
addMarker()
const activeCategory = 'todos';  // ✓ Correto
const categoriaAtiva = 'todos';  // ✗ Evitar português

// Métodos refatorados (português → inglês) - CONCLUÍDO
loadData()                    // ✓ Refatorado (era: carregarDados)
removeLoadingScreen()         // ✓ Refatorado (era: removerLoadingScreen)
filterByCategory()            // ✓ Refatorado (era: filtrarPorCategoria)
updateCategoryButtons()       // ✓ Refatorado (era: atualizarBotoesCategoria)
updateStatistics()           // ✓ Refatorado (era: atualizarEstatisticas)
forceMapResize()             // ✓ Refatorado (era: forcarRedimensionamentoMapa)
reloadData()                 // ✓ Refatorado (era: recarregarDados)
configureCategoryMenu()      // ✓ Refatorado (era: configurarMenuCategorias)
renderPoints()               // ✓ Refatorado (era: renderizarPontos)
showNotification()           // ✓ Refatorado (era: mostrarNotificacao)
showError()                  // ✓ Refatorado (era: mostrarErro)
configureResponsiveness()    // ✓ Refatorado (era: configurarResponsividade)
configureViewport()          // ✓ Refatorado (era: configurarViewport)
configureResponsiveEventListeners() // ✓ Refatorado (era: configurarEventListenersResponsivos)
configureTouchBehavior()     // ✓ Refatorado (era: configurarComportamentoTouch)
applyResponsiveClasses()     // ✓ Refatorado (era: aplicarClassesResponsivas)
adjustLayoutForScreenSize()  // ✓ Refatorado (era: ajustarLayoutParaTamanhoTela)

// PENDENTES DE REFATORAÇÃO (ver PENDENCIAS.md):
// MapManager: _configurarCamadas() → _configureLayers()
// MapManager: _configurarEventListeners() → _configureEventListeners()
// DatabaseManager: vários métodos em português
```

#### Constantes
```javascript
// UPPER_SNAKE_CASE para constantes
const BASE_STORAGE_KEY = 'pontosEntretenimento';
const DEFAULT_ZOOM_LEVEL = 11;
```

#### Propriedades de Classe
```javascript
// Propriedades em inglês
class DatabaseManager {
    constructor() {
        this.confirmedPoints = [];  // ✓ Correto
        this.pendingPoints = [];    // ✓ Correto
        this.hiddenPoints = [];     // ✓ Correto
        // Evitar: pontosConfirmados, pontosPendentes, etc.
    }
}

class MapManager {
    constructor() {
        this.markers = new Map();           // ✓ Refatorado (era: marcadores)
        this.groupsByCategory = new Map();  // ✓ Refatorado (era: gruposPorCategoria)
        this.openPopup = null;              // ✓ Refatorado (era: popupAberto)
        this.additionMode = false;          // ✓ Refatorado (era: modoAdicao)
    }
}

class ModalManager {
    constructor() {
        this.activeModal = null;  // ✓ Correto
        // Evitar: modalAtivo
    }
}
```
        this.pendingPoints = [];    // ✓ Correto
        this.hiddenPoints = [];     // ✓ Correto
        // Evitar: pontosConfirmados, pontosPendentes, etc.
    }
}

class ModalManager {
    constructor() {
        this.activeModal = null;  // ✓ Correto
        // Evitar: modalAtivo
    }
}
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
        console.log('Iniciando operacao...');  // Sem emojis
        
        // Validações de entrada
        if (!parametro) {
            throw new Error('Parâmetro obrigatório');
        }
        
        // Lógica principal
        const resultado = await operacao(parametro);
        
        console.log('Operacao concluida com sucesso');  // Sem emojis
        return resultado;
        
    } catch (error) {
        console.error('Erro na operacao:', error);  // Sem emojis
        throw error; // ou return null para não-críticos
    }
}
```

### Regras de Log
- **Sem emojis**: Logs devem ser limpos e profissionais
- **Contextuais**: Incluir informações relevantes sobre o estado
- **Consistentes**: Usar padrões uniformes em todo o projeto
- **Informativos**: Logs devem ajudar no debugging

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
    configureElement() { }

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

## Funcionalidades Recentes (2025)

### Sistema de Temas Aprimorado

#### Implementação do Menu Adaptativo
O sistema agora suporta temas dinâmicos para todos os componentes:

```css
/* Tema escuro para user menu */
.theme-dark .user-menu {
    background: var(--gray-800);
    border-color: var(--gray-600);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

/* Tema claro para user menu */
.theme-light .user-menu {
    background: var(--white);
    border-color: var(--gray-200);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
```

#### Botões de Navegação Responsivos
```css
/* Botões adaptativos por tema */
.theme-dark .nav-btn.active {
    background: var(--primary);
    box-shadow: 0 6px 25px rgba(37, 99, 235, 0.4);
}

.theme-light .nav-btn.active {
    background: var(--primary);
    box-shadow: 0 6px 25px rgba(37, 99, 235, 0.3);
}
```

### Sistema de Filtros Corrigido

#### Lógica de Filtros de Categoria
```javascript
filtrarPorCategoria(categoria, username = null) {
    // Remover TODOS os grupos ativos do mapa primeiro
    this.gruposPorCategoria.forEach((grupo, cat) => {
        if (this.map.hasLayer(grupo)) {
            this.map.removeLayer(grupo);
        }
    });

    if (categoria === 'todos') {
        // Mostrar todos os pontos exceto favoritos
        this.gruposPorCategoria.forEach((grupo, cat) => {
            if (cat !== 'favoritos') {
                this.map.addLayer(grupo);
            }
        });
    }
}
```

### Interface de Usuário Personalizada

#### Botão de Usuário com Avatar
```javascript
atualizarBotaoLogin(user) {
    const isAdmin = user.role === 'admin';
    const adminIcon = isAdmin ? '<i class="fas fa-shield-alt admin-icon"></i>' : '';
    
    loginBtn.outerHTML = `
        <button class="user-info ${isAdmin ? 'is-admin' : ''}" id="user-info-btn">
            <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
            ${adminIcon}
            <i class="fas fa-chevron-down dropdown-arrow"></i>
        </button>
    `;
}
```

#### Estilos para Administradores
```css
.user-info.is-admin {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.8), rgba(245, 158, 11, 0.9));
    border-color: rgba(251, 191, 36, 0.6);
}

.admin-icon {
    color: #fbbf24;
    font-size: 0.8rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
```

### Sistema de Favoritos Persistente

#### Implementação Completa
O sistema de favoritos já estava implementado e funcional:

```javascript
toggleFavorito(pontoId, username) {
    const dadosUsuario = this.obterDadosUsuario(username);
    const index = dadosUsuario.favoritos.indexOf(pontoId);
    
    if (index === -1) {
        dadosUsuario.favoritos.push(pontoId);
    } else {
        dadosUsuario.favoritos.splice(index, 1);
    }
    
    this.salvarTodosDados();
    return index === -1; // retorna true se foi adicionado
}
```

### Modal de Sugestões Avançado

#### Formulário Pré-preenchido
```javascript
fillFormData(data) {
    this.setFieldValue('point-name', data.nome);
    this.setFieldValue('point-category', data.categoria);
    this.setFieldValue('point-description', data.descricao);
    // ... outros campos
    
    if (data.coordenadas && Array.isArray(data.coordenadas)) {
        this.selectedPosition = data.coordenadas;
        this.showSelectedCoordinates(data.coordenadas);
    }
}
```

#### Processamento de Sugestões
```javascript
processarSugestao(pontoOriginal, dadosAtualizados) {
    const sugestoes = {};
    const camposParaComparar = [
        'nome', 'categoria', 'descricao', 'endereco', 
        'telefone', 'website', 'horario', 'preco', 'imagem'
    ];

    for (const campo of camposParaComparar) {
        const valorOriginal = pontoOriginal[campo] || '';
        const valorNovo = dadosAtualizados[campo] || '';
        
        if (valorNovo !== valorOriginal && valorNovo.trim() !== '') {
            sugestoes[campo] = valorNovo.trim();
        }
    }
    
    window.databaseManager.sugerirMudanca(pontoOriginal.id, sugestoes, user.username);
}
```

## Boas Práticas Implementadas

### Responsividade Visual
- Temas adaptativos para todos os componentes
- Gradientes suaves e consistentes
- Indicadores visuais claros para administradores

### UX/UI Melhorada
- Botão "ENTRAR" em vez de "LOGIN"
- Avatar com inicial do usuário
- Ícone de escudo para administradores
- Formulários modal para sugestões

### Funcionalidade Robusta
- Filtros de categoria funcionais
- Sistema de favoritos persistente
- Modal reutilizável para múltiplos propósitos
- Validação e tratamento de erros aprimorados

## Refatoração Julho 2025

### Melhorias Implementadas

#### 1. Nomenclatura Padronizada
- **Propriedades de classe**: `pontosConfirmados` → `confirmedPoints`
- **Métodos principais**: `filtrarPorCategoria()` → `filterByCategory()`
- **Variáveis de estado**: `categoriaAtiva` → `activeCategory`

#### 2. Logs Limpos
- Remoção de emojis dos console.log() 
- Logs contextuais mais profissionais
- Melhor legibilidade em ambientes de produção

#### 3. Documentação Atualizada
- Arquivos de documentação refletem código atual
- Exemplos com nomenclatura em inglês
- Guias de migração atualizados

#### 4. Pendências Identificadas
- 9 funções marcadas como TODO identificadas
- Arquivo PENDENCIAS.md criado com priorização clara
- Funcionalidades não implementadas documentadas

### Estado Atual do Projeto (Dezembro 2025)
- **Código principal**: 40% refatorado (métodos críticos de app.js concluídos)
- **Nomenclatura**: loadData(), filterByCategory(), updateStatistics() refatorados
- **Logs**: Processo de remoção de emojis iniciado (map.js parcial)
- **Documentação**: Totalmente atualizada e sincronizada
- **Pendências**: 9 TODOs identificados e priorizados
- **Sistema de Imagens**: 100% implementado e funcional

### Próximos Passos Críticos
1. Continuar refatoração de nomenclatura nos arquivos restantes
2. Completar remoção de emojis dos console logs
3. Implementar funções TODO de alta prioridade
4. Adicionar testes automatizados para métodos refatorados

### Próximos Passos Recomendados
1. Implementar funções marcadas como TODO de alta prioridade
2. Completar refatoração de nomenclatura nos arquivos restantes
3. Adicionar testes automatizados para funções críticas
4. Implementar sistema de CI/CD
