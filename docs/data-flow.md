# Fluxos de Dados - SIG Entretenimento DF

## Fluxo Principal de Dados

### 1. Inicialização da Aplicação

```
Browser Load
     ↓
DOM Ready
     ↓
PontosEntretenimentoApp.init()
     ↓
Aguardar Managers
     ↓
DatabaseManager.init() → Carrega dados do LocalStorage/JSON
AuthManager.init() → Verifica sessão ativa
MapManager.init() → Inicializa mapa Leaflet
ThemeManager.init() → Aplica tema salvo
     ↓
App.configureInterface() → Configura interface e eventos
     ↓
App.loadData() → Renderiza pontos no mapa
     ↓
Remove Loading Screen
```

### 2. Fluxo de Autenticação

```
User Click Login
     ↓
LoginModal.open()
     ↓
User Submit Credentials
     ↓
AuthManager.login(username, password)
     ↓
Validate User → DatabaseManager.getUser()
     ↓
Success: AuthManager.setCurrentUser()
     ↓
Dispatch 'authStateChanged' Event
     ↓
App.configureLoggedUser()
     ↓
Update Interface Based on User Role
     ↓
Reload Data with User Context
```

### 3. Fluxo de Filtros por Categoria

```
User Click Category Button
     ↓
App.filtrarPorCategoria(categoria)
     ↓
Update Active Button State
     ↓
Check Special Categories (favoritos)
     ↓
If 'favoritos' && !authenticated:
    → Open LoginModal
     ↓
MapManager.filtrarPorCategoria(categoria, username)
     ↓
Filter Points by Category + User Context
     ↓
Update Map Markers Visibility

Nota: activeCategory substituiu categoriaAtiva para padronização em inglês
```

### 4. Fluxo de Adição de Pontos (Admin)

```
Admin Click Add Point
     ↓
Check Authentication & Admin Role
     ↓
Open AddPointModal
     ↓
User Fill Form & Submit
     ↓
Validate Form Data
     ↓
DatabaseManager.adicionarPonto(data, role, username)
     ↓
Generate Unique ID
     ↓
Add to Appropriate Array (pendingPoints/confirmedPoints)
     ↓
Save to LocalStorage
     ↓
MapManager.adicionarMarcador(ponto)
     ↓
Create Leaflet Marker
     ↓
Update Statistics

Nota: pendingPoints e confirmedPoints substituíram pontosPendentes e pontosConfirmados
```

## Estrutura de Dados

### Ponto de Entretenimento
```javascript
{
    id: Number,              // ID único gerado automaticamente
    nome: String,            // Nome do local
    latitude: Number,        // Coordenada latitude
    longitude: Number,       // Coordenada longitude
    categoria: String,       // categoria: 'cultura', 'gastronomia', etc.
    descricao: String,       // Descrição do local
    endereco: String,        // Endereço completo
    telefone: String,        // Telefone de contato
    horario: String,         // Horário de funcionamento
    preco: String,           // Faixa de preço
    avaliacao: Number,       // Avaliação (1-5)
    imagem: String,          // URL da imagem
    tags: Array,             // Tags adicionais
    criadoPor: String,       // Username do criador
    criadoEm: String,        // Data de criação (ISO)
    aprovadoPor: String,     // Username do aprovador (se aplicável)
    aprovadoEm: String,      // Data de aprovação (se aplicável)
    status: String           // 'pendente', 'confirmado', 'oculto'
}
```

### Usuário
```javascript
{
    username: String,        // Nome de usuário único
    name: String,            // Nome para exibição
    email: String,           // Email do usuário
    password: String,        // Senha (hash em produção)
    role: String,            // 'administrator', 'user', 'visitor'
    favoritos: Array,        // Array de IDs de pontos favoritos
    criadoEm: String,        // Data de criação
    ultimoLogin: String      // Data do último login
}
```

### Categoria
```javascript
{
    id: String,              // ID único da categoria
    nome: String,            // Nome para exibição
    icon: String,            // Classe do ícone FontAwesome
    cor: String,             // Cor para o marcador no mapa
    descricao: String        // Descrição da categoria
}
```

## Estados da Aplicação

### Estado de Autenticação
```javascript
// Não autenticado
{
    isAuthenticated: false,
    currentUser: null,
    role: 'visitor'
}

// Usuário comum
{
    isAuthenticated: true,
    currentUser: { username, name, role: 'user', ... },
    role: 'user'
}

// Administrador
{
    isAuthenticated: true,
    currentUser: { username, name, role: 'administrator', ... },
    role: 'administrator'
}
```

### Estado do Mapa
```javascript
{
    map: LeafletMap,                    // Instância do mapa Leaflet
    marcadores: Map<id, marker>,        // Mapa de marcadores por ID
    gruposPorCategoria: Map,            // Grupos de marcadores por categoria
    categoriaAtiva: String,             // Categoria atualmente filtrada
    popupAberto: String|null,           // ID do popup atualmente aberto
    modoAdicao: Boolean                 // Se está em modo de adição de pontos
}
```

### Estado dos Dados
```javascript
{
    pontosConfirmados: Array,           // Pontos aprovados (visíveis para todos)
    pontosPendentes: Array,             // Pontos aguardando aprovação (admin only)
    pontosOcultos: Array,               // Pontos ocultos (admin only)
    usuarios: Object,                   // Mapa de usuários por username
    categorias: Array,                  // Lista de categorias disponíveis
    proximoId: Number                   // Próximo ID disponível
}
```

## Fluxos de Persistência

### LocalStorage Structure
```
pontosEntretenimento_pontosConfirmados  → Array de pontos confirmados
pontosEntretenimento_pontosPendentes    → Array de pontos pendentes
pontosEntretenimento_pontosOcultos      → Array de pontos ocultos
pontosEntretenimento_usuarios           → Object com usuários
pontosEntretenimento_currentUser        → Dados do usuário atual
theme_preference                        → Preferência de tema
```

### Backup e Sincronização
```
LocalStorage (Primary)
     ↓ (fallback)
JSON Files in /database/
     ↓ (export)
Admin Panel Export Function
     ↓ (import)
Admin Panel Import Function
```

## Comunicação Entre Componentes

### Sistema de Eventos
```javascript
// Eventos de Autenticação
'authStateChanged' → { type: 'login'|'logout', user: userData }

// Eventos de Dados
'dataChanged' → { type: 'add'|'update'|'delete', item: data }

// Eventos de Interface
'themeChanged' → { theme: 'light'|'dark' }
'categoryChanged' → { category: string }
```

### APIs Públicas dos Managers

#### DatabaseManager
```javascript
// Pontos
getPontos(role?, username?) → Array
adicionarPonto(data, role, username) → Object
atualizarPonto(id, data, role) → Boolean
removerPonto(id, role) → Boolean

// Usuários
getUser(username) → Object|null
adicionarUsuario(userData) → Boolean
autenticarUsuario(username, password) → Object|null

// Favoritos
toggleFavorito(pontoId, username) → Boolean
getFavoritos(username) → Array
```

#### MapManager
```javascript
// Marcadores
adicionarMarcador(ponto) → Boolean
removerMarcador(id) → Boolean
limparMarcadores() → void
filtrarPorCategoria(categoria, username?) → void

// Controles
ativarModoAdicao() → void
desativarModoAdicao() → void
centralizarMapa(lat, lng, zoom?) → void
```

#### AuthManager
```javascript
// Autenticação
login(username, password) → Promise<Object>
logout() → void
isAuthenticated() → Boolean
getCurrentUser() → Object|null

// Autorização
hasRole(role) → Boolean
canEdit(resource) → Boolean
canView(resource) → Boolean
```

## Tratamento de Concorrência

### Operações Assíncronas
- Inicialização sequencial com await
- Debounced events para resize/scroll
- Throttled events para interações frequentes

### Estado Compartilhado
- Managers são singletons globais
- Eventos para sincronização de estado
- Immutable data patterns onde possível

## Refatorações Aplicadas (Agosto 2025)

### Nomenclatura Padronizada ✅ CONCLUÍDA
**Propriedades de Classes (Português → Inglês):**
- `categoriaAtiva` → `activeCategory` ✅
- `modalAtivo` → `activeModal` ✅  
- `pontosConfirmados` → `confirmedPoints` ✅
- `pontosPendentes` → `pendingPoints` ✅
- `pontosOcultos` → `hiddenPoints` ✅

**Métodos Principais Refatorados:**
- `filtrarPorCategoria()` → `filterByCategory()` ✅ 
- `carregarDados()` → `loadData()` ✅
- `atualizarEstatisticas()` → `updateStatistics()` ✅
- `removerLoadingScreen()` → `removeLoadingScreen()` ✅
- `forcarRedimensionamentoMapa()` → `forceMapResize()` ✅
- `recarregarDados()` → `reloadData()` ✅
- `configurarInterface()` → `configureInterface()` ✅

### Limpeza de Código ✅ CONCLUÍDA
**Logs Simplificados:**
- Removidos emojis de todos os console.log()
- Console logs limpos e profissionais
- Melhoria na legibilidade para ambientes de produção

**Tratamento de Erros Aprimorado:**
- Try-catch implementado em todos os métodos críticos
- Logs contextuais sem poluição visual
- Graceful degradation mantida

**Remoção de Código Não Utilizado:**
- Arquivos de teste removidos (teste-*.html, test-*.html)
- Código comentado e funções obsoletas removidas
- Imports e dependências não utilizadas eliminadas

### Sistema de Salvamento Aprimorado ✅ CONCLUÍDA
**Eliminação de Downloads Automáticos:**
- Sistema de salvamento direto implementado
- Interface para atualização manual de arquivos JSON
- Backup automático no localStorage

### Pendências Identificadas 📋
**Sistema de Favoritos:**
- Funcionalidade marcada como em desenvolvimento
- 4 pontos de implementação identificados
- Documentado em PENDENCIAS.md

**Controles Administrativos:**
- Controles de mapa para admins pendentes
- Sistema de remoção de controles não implementado

### Compatibilidade Mantida ✅
**Retrocompatibilidade de Dados:**
- Importação/exportação suporta formatos antigos
- Migração automática de estruturas de dados
- Fallbacks para propriedades antigas mantidos onde necessário
