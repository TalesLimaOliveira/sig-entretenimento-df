# PENDÊNCIAS - SIG Entretenimento DF

Este arquivo contém a lista de funcionalidades ainda não implementadas ou parcialmente concluídas no projeto.

## Funcionalidades Pendentes

### MapManager (src/js/map.js)

#### `_configureControls()` - Linha 598
**Descrição:** Implementar controles específicos do mapa se necessário
**Status:** Método stub - necessita implementação de controles personalizados

#### `_removeControls()` - Linha 626  
**Descrição:** Implementar remoção de controles específicos se adicionados
**Status:** Método stub - necessita implementação de limpeza de controles

### AdminManager (src/js/admin.js)

#### `setupTooltips()` - Linha 791
**Descrição:** Implementar tooltips informativos na interface administrativa
**Status:** Método stub - necessita implementação de sistema de tooltips

#### `showNewCategoryModal()` - Linha 836
**Descrição:** Implementar funcionalidade do modal de nova categoria
**Status:** Método stub - necessita implementação completa do modal

#### `showNewUserModal()` - Linha 844
**Descrição:** Implementar funcionalidade do modal de novo usuário
**Status:** Método stub - necessita implementação completa do modal

#### `exportReport()` - Linha 852
**Descrição:** Implementar funcionalidade de exportação de relatório
**Status:** Método stub - necessita implementação de exportação (PDF/Excel)

#### `generateReport()` - Linha 860
**Descrição:** Implementar funcionalidade de geração de relatório
**Status:** Método stub - necessita implementação de geração de dados

#### `showHelp()` - Linha 868
**Descrição:** Implementar sistema de ajuda
**Status:** Método stub - necessita implementação de sistema de documentação/help

#### `showLogs()` - Linha 876
**Descrição:** Implementar funcionalidade de visualização de logs
**Status:** Método stub - necessita implementação de visualizador de logs

#### `rejectPoint()` - Linha 1141
**Descrição:** Implementar lógica de rejeição de pontos com feedback do usuário
**Status:** Método stub - necessita implementação de workflow de rejeição

### PontosEntretenimentoApp (src/js/app.js)

#### `configureStatistics()` - Linha 401
**Descrição:** Implementar lógica de configuração de estatísticas da aplicação
**Status:** Método stub - necessita implementação de dashboard de estatísticas

### UserMenu (src/components/user-menu.js)

#### `showAddPointForm()` - Linha 165
**Descrição:** Implementar abertura do formulário de adicionar ponto para usuários
**Status:** Método stub - necessita implementação de modal/formulário

## Refatoração de Nomenclatura

### Métodos Pendentes de Tradução (Português → Inglês)

#### MapManager (src/js/map.js)
- `_configurarCamadas()` → `_configureLayers()`
- `_configurarEventListeners()` → `_configureEventListeners()`
- `_configurarControles()` → `_configureControls()`
- `_configurarResponsividade()` → `_configureResponsiveness()`
- `_configurarResizeObserver()` → `_configureResizeObserver()`
- `_configurarEventListenersResponsivos()` → `_configureResponsiveEventListeners()`
- `_configurarEventosDatabase()` → `_configureDatabaseEvents()`
- `_configurarEventosAuth()` → `_configureAuthEvents()`

#### Propriedades (já refatoradas)
- `marcadores` → `markers` ✅
- `gruposPorCategoria` → `groupsByCategory` ✅
- `popupAberto` → `openPopup` ✅
- `modoAdicao` → `additionMode` ✅

### Arquivos que Necessitam Revisão Completa

1. **database.js** - Métodos em português precisam ser traduzidos
2. **admin.js** - Vários métodos em português e funcionalidades incompletas
3. **info-panel.js** - Métodos de configuração em português
4. **auth.js** - Verificar nomenclatura de métodos
5. **theme-colors.js** - Verificar se há métodos em português

## Padrões a Implementar

### Nomenclatura de Código
- [x] Variáveis em inglês (camelCase)
- [x] Constantes em UPPER_SNAKE_CASE
- [x] Classes em PascalCase
- [x] Métodos privados com prefixo `_`
- [ ] Completar tradução de todos os métodos para inglês

### Documentação
- [ ] Atualizar comments em português para refletir nomes em inglês
- [ ] Documentar todos os métodos com JSDoc padrão
- [ ] Atualizar guia de desenvolvimento com nomenclatura atual

### Tratamento de Erros
- [x] Uso do ErrorHandler para notificações
- [ ] Implementar try/catch em todos os métodos assíncronos
- [ ] Padronizar mensagens de erro

---

**Última atualização:** 02/08/2025  
**Total de pendências:** 15 funcionalidades + refatoração de nomenclatura
