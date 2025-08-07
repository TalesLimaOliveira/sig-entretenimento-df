# Dashboard Administrativo

## Visão Geral

O dashboard administrativo (`admin.html`) é a interface de gerenciamento completa do sistema, permitindo que administradores autenticados gerenciem pontos turísticos confirmados, pendentes e ocultos.

## Funcionalidades Principais

### 🏠 Dashboard Principal
- **Estatísticas Gerais**: Visualização de contadores em tempo real
- **Gráficos**: Distribuição de pontos por categoria
- **Informações do Sistema**: Status geral da aplicação

### 📍 Gerenciamento de Pontos Confirmados
- **Visualizar**: Lista completa de pontos ativos no sistema
- **Ocultar**: Mover pontos para estado oculto
- **Editar**: Modificar informações de pontos existentes
- **Deletar**: Remover pontos permanentemente

### ⏳ Aprovação de Pontos Pendentes
- **Aprovar**: Mover pontos pendentes para confirmados
- **Rejeitar**: Mover pontos pendentes para ocultos
- **Visualizar Detalhes**: Ver informações completas antes da decisão

### 👁️‍🗨️ Gerenciamento de Pontos Ocultos
- **Restaurar**: Retornar pontos ocultos ao estado ativo
- **Visualizar**: Ver pontos que foram ocultados
- **Deletar**: Remover permanentemente pontos ocultos

## Estrutura de Arquivos

### Frontend
- `admin.html` - Interface principal do dashboard
- `src/css/admin.css` - Estilos específicos do admin
- `src/js/admin.js` - Lógica do dashboard (classe AdminManager)

### Backend/Dados
- `database/pontos_confirmados.json` - Pontos ativos no sistema
- `database/pontos_pendentes.json` - Pontos aguardando aprovação
- `database/pontos_ocultos.json` - Pontos ocultados pelo admin

## Classe AdminManager

A classe `AdminManager` controla toda a funcionalidade do dashboard administrativo.

### Métodos Principais

#### Inicialização
- `init()` - Configura o dashboard e verifica autenticação
- `checkAdminAccess()` - Valida se usuário é administrador

#### Navegação
- `showTab(tabName)` - Alterna entre abas do dashboard
- `loadTabSpecificData(tabName)` - Carrega dados específicos da aba

#### Gerenciamento de Pontos
- `mostrarPontosConfirmados()` - Lista pontos ativos
- `mostrarPontosPendentes()` - Lista pontos pendentes
- `mostrarPontosOcultos()` - Lista pontos ocultados

#### Ações sobre Pontos
- `aprovarPonto(pontoId)` - Aprova ponto pendente
- `rejeitarPonto(pontoId)` - Rejeita e oculta ponto
- `ocultarPonto(pontoId)` - Oculta ponto confirmado
- `restaurarPonto(pontoId)` - Restaura ponto oculto
- `deletarPonto(pontoId)` - Remove ponto permanentemente
- `visualizarPonto(pontoId)` - Mostra detalhes do ponto
- `editarPonto(pontoId)` - Abre modal de edição

#### Interface e UX
- `showNotification(message, type)` - Exibe notificações
- `mostrarModal(titulo, conteudo, acoes)` - Cria modais personalizados
- `atualizarContadores()` - Atualiza badges com contagem

## Sistema de Navegação

### Abas Disponíveis
1. **Dashboard** (`dashboard`) - Visão geral e estatísticas
2. **Pontos** (`pontos`) - Gerenciamento de pontos confirmados
3. **Pendentes** (`pendentes`) - Aprovação de pontos pendentes
4. **Ocultos** (`ocultos`) - Gerenciamento de pontos ocultos
5. **Sugestões** (`sugestoes`) - Em desenvolvimento
6. **Usuários** (`usuarios`) - Em desenvolvimento
7. **Relatórios** (`relatorios`) - Em desenvolvimento

### Estrutura HTML
```html
<nav class="admin-nav">
    <div class="nav-tabs">
        <button class="nav-tab active" data-tab="dashboard">Dashboard</button>
        <button class="nav-tab" data-tab="pontos">Pontos</button>
        <button class="nav-tab" data-tab="pendentes">
            Pendentes <span id="pendentes-count" class="badge">0</span>
        </button>
        <!-- ... outras abas -->
    </div>
</nav>
```

## Segurança e Autenticação

### Verificação de Acesso
- **Autenticação Obrigatória**: Usuário deve estar logado
- **Verificação de Permissão**: Apenas usuários com role `administrator`
- **Redirecionamento**: Usuários não autorizados são enviados para login

### Proteção de Ações
- **Confirmações**: Ações destrutivas requerem confirmação
- **Logs**: Todas as ações são registradas no console
- **Validação**: Verificação de dados antes de executar ações

## Integração com Database Manager

O dashboard utiliza os seguintes métodos do `DatabaseManager`:

### Leitura de Dados
- `getPontosConfirmados()` - Obter pontos confirmados
- `getPontosPendentes()` - Obter pontos pendentes
- `getPontosOcultos()` - Obter pontos ocultos
- `getPontoById(id)` - Obter ponto específico
- `getEstatisticas()` - Obter estatísticas gerais

### Modificação de Dados
- `aprovarPonto(id, usuario)` - Aprovar ponto pendente
- `ocultarPonto(id, usuario)` - Ocultar ponto
- `restaurarPonto(id, usuario)` - Restaurar ponto oculto
- `deletarPonto(id, usuario)` - Deletar ponto permanentemente
- `atualizarPonto(id, dados)` - Atualizar informações do ponto

## Interface de Usuário

### Elementos Visuais
- **Cards de Estatísticas**: Contadores em tempo real
- **Tabelas Responsivas**: Listas organizadas de pontos
- **Badges de Status**: Indicadores visuais de estado
- **Botões de Ação**: Ações específicas para cada ponto
- **Modais**: Visualização e edição de detalhes

### Feedback Visual
- **Notificações**: Sistema de alertas coloridos
- **Loading States**: Indicadores de carregamento
- **Confirmações**: Diálogos antes de ações destrutivas
- **Contadores Dinâmicos**: Badges que pulsam quando há novos itens

## Fluxo de Trabalho Típico

### Aprovação de Pontos
1. Acesso à aba "Pendentes"
2. Visualização da lista de pontos aguardando aprovação
3. Análise individual dos pontos (botão "Ver")
4. Decisão: Aprovar ou Rejeitar
5. Atualização automática da interface

### Gerenciamento de Pontos Ativos
1. Acesso à aba "Pontos"
2. Visualização de pontos confirmados
3. Ações disponíveis: Visualizar, Editar, Ocultar, Deletar
4. Confirmação para ações destrutivas

### Recuperação de Pontos Ocultos
1. Acesso à aba "Ocultos"
2. Visualização de pontos ocultados
3. Opção de restaurar ou deletar permanentemente

## Considerações Técnicas

### Performance
- **Carregamento Lazy**: Dados carregados apenas quando necessário
- **Atualização Seletiva**: Apenas recarrega dados da aba ativa
- **Cache Local**: Utiliza dados em memória quando possível

### Responsividade
- **Layout Flexível**: Adapta-se a diferentes tamanhos de tela
- **Tabelas Responsivas**: Scroll horizontal em telas pequenas
- **Navegação Mobile**: Menu adaptado para dispositivos móveis

### Compatibilidade
- **Navegadores Modernos**: ES6+ com classes e arrow functions
- **Dependências**: Leaflet.js para mapas (quando implementado)
- **Fallbacks**: Notificações simples se sistema principal indisponível

## Estados da Aplicação

### Estados dos Pontos
- **Confirmado**: Visível no mapa público
- **Pendente**: Aguardando aprovação administrativa
- **Oculto**: Removido da visualização pública
- **Deletado**: Removido permanentemente do sistema

### Estados da Interface
- **Loading**: Carregando dados do servidor
- **Empty**: Nenhum item encontrado
- **Error**: Erro ao executar operação
- **Success**: Operação realizada com sucesso

## Monitoramento e Logs

### Logs do Sistema
- **Console Logs**: Registro detalhado de operações
- **Error Tracking**: Captura e registro de erros
- **User Actions**: Log de todas as ações administrativas

### Métricas Disponíveis
- **Total de Pontos**: Por categoria e status
- **Atividade Diária**: Pontos adicionados hoje
- **Pendências**: Itens aguardando aprovação
- **Performance**: Tempo de carregamento das operações
