# Arquitetura do Sistema - SIG Entretenimento DF

## Visão Geral da Arquitetura

O sistema foi desenvolvido seguindo os princípios de **Clean Architecture**, separando responsabilidades em camadas bem definidas e mantendo baixo acoplamento entre componentes.

## Estrutura de Módulos

### 1. Camada de Aplicação (Application Layer)
- **Arquivo Principal**: `src/js/app.js`
- **Responsabilidade**: Coordenação geral da aplicação, gerenciamento do ciclo de vida
- **Classe Principal**: `PontosEntretenimentoApp`

### 2. Camada de Negócio (Domain Layer)
- **Gerenciador de Dados**: `src/js/database.js` (`DatabaseManager`)
- **Gerenciador de Autenticação**: `src/js/auth.js` (`AuthManager`)
- **Responsabilidade**: Regras de negócio, validações, lógica de domínio

### 3. Camada de Apresentação (Presentation Layer)
- **Gerenciador de Mapas**: `src/js/map.js` (`MapManager`)
- **Gerenciador de Temas**: `src/js/theme.js` (`ThemeManager`)
- **Painel de Informações**: `src/js/info-panel.js` (`InfoPanelManager`)
- **Responsabilidade**: Interface do usuário, interações visuais

### 4. Camada de Infraestrutura (Infrastructure Layer)
- **Componentes de Modal**: `src/components/`
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

## Gerenciamento de Estado

### Estado Global
- **Aplicação**: `PontosEntretenimentoApp` mantém estado geral
- **Autenticação**: `AuthManager` mantém estado do usuário
- **Tema**: `ThemeManager` mantém preferências visuais

### Estado Local
- **Mapa**: `MapManager` mantém estado dos marcadores e camadas
- **Base de Dados**: `DatabaseManager` mantém cache dos dados

### Persistência
- **LocalStorage**: Para dados do usuário e preferências
- **Arquivos JSON**: Para dados de produção (fallback para LocalStorage)

## Tratamento de Erros

### Estratégia de Error Handling
1. **Try-Catch**: Em todos os métodos críticos
2. **Logging Estruturado**: Console logs com emoji indicators
3. **Graceful Degradation**: Aplicação continua funcionando mesmo com erros parciais
4. **User Feedback**: Notificações visuais para o usuário

### Tipos de Erro
- **Críticos**: Falha na inicialização → mostrar erro e parar
- **Não-críticos**: Funcionalidade específica → log e continuar
- **Rede**: Fallback para dados locais

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
3. **Novos Temas**: Adicionar em `ThemeManager`
4. **Novas Funcionalidades**: Integrar via `PontosEntretenimentoApp`

### Convenções para Extensão
- Seguir padrão de nomenclatura existente
- Implementar tratamento de erros consistente
- Adicionar logs apropriados
- Manter compatibilidade com diferentes papéis de usuário
