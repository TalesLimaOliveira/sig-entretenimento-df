# Arquitetura do Sistema - SIG Entretenimento DF

## Visão Geral da Arquitetura

### Estratégia de Error Handling
1. **Try-Catch**: Em todos os métodos críticos
2. **Logging Estruturado**: Console logs contextuais sem indicadores visuais (emojis removidos)
3. **Graceful Degradation**: Aplicação continua funcionando mesmo com erros parciais
4. **User Feedback**: Notificações visuais para o usuário

### Tipos de Erro
- **Críticos**: Falha na inicialização → mostrar erro e parar
- **Não-críticos**: Funcionalidade específica → log e continuar
- **Rede**: Fallback para dados locais

O projeto foi desenvolvido seguindo os princípios de **Clean Architecture**, separando responsabilidades em camadas bem definidas e mantendo baixo acoplamento entre componentes.

## Estrutura de Módulos

### 1. Camada de Aplicação (Application Layer)
- **Arquivo Principal**: `src/js/app.js`
- **Responsabilidade**: Coordenação geral da aplicação, gerenciamento do ciclo de vida
- **Classe Principal**: `PontosEntretenimentoApp`
  - **Propriedades principais** (nomenclatura em inglês):
    - `isAdmin`: Estado de administrador do usuário atual
    - `activeCategory`: Categoria atualmente filtrada
    - `isInitialized`: Status de inicialização da aplicação
  - **Métodos refatorados para inglês**:
    - `loadData()`: Carregamento inicial de dados
    - `filterByCategory()`: Filtro por categoria
    - `updateStatistics()`: Atualização de estatísticas
    - `removeLoadingScreen()`: Remoção da tela de carregamento
    - `configureCategoryMenu()`: Configuração do menu de categorias
    - `renderPoints()`: Renderização de pontos no mapa
    - `showNotification()`: Exibição de notificações
    - `showError()`: Exibição de erros
    - `configureResponsiveness()`: Configuração de responsividade
    - `configureViewport()`: Configuração do viewport
    - `configureTouchBehavior()`: Configuração de comportamento touch
    - `applyResponsiveClasses()`: Aplicação de classes responsivas
    - `adjustLayoutForScreenSize()`: Ajuste de layout por tamanho de tela

### 2. Camada de Negócio (Domain Layer)
- **Gerenciador de Dados**: `src/js/database.js` (`DatabaseManager`)
  - **Propriedades principais**:
    - `confirmedPoints`: Array de pontos confirmados e visíveis
    - `pendingPoints`: Array de pontos aguardando aprovação
    - `hiddenPoints`: Array de pontos ocultos pelo administrador
    - `usuarios`: Objeto com dados dos usuários registrados
- **Gerenciador de Autenticação**: `src/js/auth.js` (`AuthManager`)
- **Responsabilidade**: Regras de negócio, validações, lógica de domínio

### 3. Camada de Apresentação (Presentation Layer)
- **Gerenciador de Mapas**: `src/js/map.js` (`MapManager`)
  - **Propriedades principais** (nomenclatura em inglês):
    - `markers`: Map de marcadores por ID
    - `groupsByCategory`: Grupos de marcadores por categoria
    - `openPopup`: ID do popup atualmente aberto
    - `additionMode`: Modo de adição de pontos ativo
    - `activeCategory`: Categoria atualmente filtrada no mapa
- **Painel de Informações**: `src/js/info-panel.js` (`InfoPanelManager`)
- **Responsabilidade**: Interface do usuário, interações visuais, controle de aparência

### 4. Camada de Infraestrutura (Infrastructure Layer)
- **Componentes de Modal**: `src/components/`
  - **Modal Manager**: Propriedade `activeModal` para controle do modal ativo
- **Estilos CSS**: `src/css/`
- **Responsabilidade**: Recursos externos, persistência, componentes reutilizáveis

## Fluxo de Inicialização

```
1. DOM Loaded → App.init()
2. App aguarda todos os managers estarem prontos
3. Configuração de responsividade
4. Verificação de autenticação
5. Configuração da interface baseada no usuário
6. Configuração de eventos
7. Carregamento de dados
8. Renderização dos pontos no mapa
9. Remoção da tela de loading
```

## Princípios Arquiteturais Aplicados

### 1. Separação de Responsabilidades
- Cada classe tem uma responsabilidade única e bem definida
- Managers independentes para diferentes domínios (mapa, dados, auth, etc.)

### 2. Inversão de Dependências
- Managers são injetados globalmente e consumidos por referência
- Baixo acoplamento entre componentes

### 3. Padrão Observer
- Sistema de eventos customizados para comunicação entre componentes
- `authStateChanged` para notificar mudanças de autenticação

### 4. Padrão Factory
- `DatabaseManager` centraliza criação de pontos
- `MapManager` gerencia criação de marcadores

### 5. Padrão Strategy
- Diferentes comportamentos baseados no papel do usuário (admin, user, visitor)
- Filtros dinâmicos baseados em categoria
- Sistema de temas com estratégias para diferentes preferências visuais

### 6. Padrão Observable
- Sistema de temas utiliza eventos customizados (`themeChanged`)
- Comunicação assíncrona entre componentes de interface

## Sistema de Temas Aprimorado

### Arquitetura do Sistema de Temas
O sistema de temas foi completamente reimplementado seguindo princípios modernos:

#### Características Principais
- **CSS Variables Dinâmicas**: Todas as cores são definidas via CSS custom properties
- **API Programática**: Controle completo via JavaScript
- **Persistência Inteligente**: localStorage com fallback para preferências do sistema
- **Eventos Customizados**: Notificação automática de mudanças de tema
- **Cores Aprimoradas**: Paleta otimizada para conforto visual

#### Classes e Responsabilidades
```javascript
EnhancedThemeSystem {
    currentTheme: string         // 'light' | 'dark'
    isAutoMode: boolean         // Se segue preferência do sistema
    themes: object             // Configurações de cores por tema
    
    // Métodos principais
    setTheme(theme)           // Define tema específico
    toggleTheme()             // Alterna entre claro/escuro
    getCurrentTheme()         // Retorna tema ativo
    enableAutoMode()          // Ativa modo automático
    applyTheme(theme)         // Aplica cores CSS
}
```

#### Integração com CSS
- **enhanced-theme-colors.css**: Sistema de cores completo
- **Variáveis CSS organizadas**: backgrounds, textos, bordas, estados
- **Componentes adaptativos**: Todos os elementos respondem automaticamente
- **Transições suaves**: Animações coordenadas entre temas

#### Compatibilidade
- **Backward Compatibility**: Código existente continua funcionando
- **Progressive Enhancement**: Novos recursos não quebram funcionalidade antiga
- **Fallbacks**: Cores padrão para browsers sem CSS Variables

## Gerenciamento de Estado

### Estado Global
- **Aplicação**: `PontosEntretenimentoApp` mantém estado geral
- **Autenticação**: `AuthManager` mantém estado do usuário
- **Tema**: `EnhancedThemeSystem` mantém preferências visuais e aplica cores dinamicamente

### Estado Local
- **Mapa**: `MapManager` mantém estado dos marcadores e camadas
- **Base de Dados**: `DatabaseManager` mantém cache dos dados
- **Interface**: Componentes mantêm estado local específico

### Persistência
- **LocalStorage**: Para dados do usuário e preferências de tema
- **CSS Variables**: Para aplicação dinâmica de cores
- **Arquivos JSON**: Para dados de produção (fallback para LocalStorage)

### Estado do Sistema de Temas
```javascript
{
    currentTheme: 'dark' | 'light',    // Tema ativo
    isAutoMode: boolean,                // Modo automático ativo
    userPreference: 'dark' | 'light' | 'auto',  // Preferência salva
    systemPreference: 'dark' | 'light'  // Preferência do SO
}
```

## Tratamento de Erros

### Estratégia de Error Handling
1. **Try-Catch**: Em todos os métodos críticos
2. **Logging Estruturado**: Console logs contextuais sem indicadores visuais (emojis removidos)
3. **Graceful Degradation**: Aplicação continua funcionando mesmo com erros parciais
4. **User Feedback**: Notificações visuais para o usuário

### Tipos de Erro
- **Críticos**: Falha na inicialização → mostrar erro e parar
- **Não-críticos**: Funcionalidade específica → log e continuar
- **Rede**: Fallback para dados locais
- **Tema**: Fallback para tema padrão se configuração falhar

## Responsividade e Performance

### Estratégias de Responsividade
- **CSS Grid/Flexbox**: Layout fluido
- **Viewport Units**: Dimensionamento baseado na tela
- **Media Queries**: Breakpoints para diferentes dispositivos
- **JavaScript**: Ajustes dinâmicos de layout

### Otimizações de Performance
- **Lazy Loading**: Componentes carregados sob demanda
- **Debounced Events**: Resize handlers otimizados
- **Memory Management**: Limpeza de event listeners

## Extensibilidade

### Pontos de Extensão
1. **Novos Tipos de Dados**: Adicionar em `DatabaseManager`
2. **Novos Componentes**: Seguir padrão de modules em `src/components/`
3. **Novos Temas**: Configurar em `ThemeManager`
4. **Novas Funcionalidades**: Integrar via `PontosEntretenimentoApp`

### Convenções para Extensão
- Seguir padrão de nomenclatura existente (inglês para código)
- Implementar tratamento de erros consistente
- Adicionar logs apropriados sem emojis
- Manter compatibilidade com diferentes papéis de usuário
- Utilizar CSS Variables para elementos temáticos
- Disparar eventos customizados para comunicação entre componentes
