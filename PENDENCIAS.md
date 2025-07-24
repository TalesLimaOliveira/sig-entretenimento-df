# PENDÊNCIAS - Sistema de Entretenimento DF

Este arquivo lista as funções identificadas como TODO/pendentes no projeto.

## ✅ Correções Realizadas (Sessão Atual)

### Nomenclatura de Métodos
- **Corrigido**: `this.filtrarPorCategoria()` → `this.filterByCategory()`
- **Corrigido**: `this.atualizarEstatisticas()` → `this.updateStatistics()`
- **Arquivos afetados**: `src/js/app.js` (múltiplas linhas)
- **Descrição**: Padronização da nomenclatura para inglês conforme refatoração

## Pendências Identificadas (por prioridade)

### 🔴 Alta Prioridade

1. **Funcionalidade de cadastro de usuários**
   - **Arquivo**: `src/components/login-modal.js:455`
   - **Função**: `showRegisterForm()`
   - **Descrição**: Implementar sistema completo de cadastro de novos usuários

2. **Lógica de rejeição de pontos com feedback**
   - **Arquivo**: `src/js/admin.js:1049`
   - **Função**: `rejeitarPonto(pontoId)`
   - **Descrição**: Implementar lógica completa de rejeição de pontos com feedback ao usuário

### 🟡 Média Prioridade

3. **Configuração de estatísticas da aplicação**
   - **Arquivo**: `src/js/app.js:400`
   - **Função**: `configureStatistics()`
   - **Descrição**: Implementar lógica de configuração de estatísticas da aplicação

4. **Formulário de adição de pontos para usuários**
   - **Arquivo**: `src/components/user-menu.js:165`
   - **Função**: `openAddPointForm()`
   - **Descrição**: Implementar abertura do formulário de adição de pontos para usuários comuns

5. **Tooltips informativos na interface admin**
   - **Arquivo**: `src/js/admin.js:705`
   - **Função**: `setupTooltips()`
   - **Descrição**: Implementar tooltips informativos na interface administrativa

### 🟢 Baixa Prioridade

6. **Controles específicos do mapa**
   - **Arquivo**: `src/js/map.js:592`
   - **Função**: `enableMapControls()`
   - **Descrição**: Implementar controles específicos do mapa se necessário

7. **Remoção de controles específicos do mapa**
   - **Arquivo**: `src/js/map.js:620`
   - **Função**: `disableMapControls()`
   - **Descrição**: Implementar remoção de controles específicos se adicionados

### 🔵 Funcionalidades Futuras

8. **Gerenciamento de conta de usuário**
   - **Arquivo**: `src/components/dynamic-user-button.js:424`
   - **Função**: `openAccountManagement()`
   - **Descrição**: Implementar funcionalidade completa de gerenciamento de conta

9. **Sistema de rotas**
   - **Arquivo**: `src/js/info-panel.js:328`
   - **Função**: Sistema de direções/rotas
   - **Descrição**: Implementar funcionalidade de rotas para pontos selecionados

## Funcionalidades Ainda Não Implementadas (com alertas temporários)

### AdminManager
- `showNewCategoryModal()` - Modal de nova categoria
- `showNewUserModal()` - Modal de novo usuário
- `exportReport()` - Exportação de relatórios
- `generateReport()` - Geração de relatórios
- `showHelp()` - Sistema de ajuda
- `showLogs()` - Visualização de logs

## Status das Implementações

### ✅ Concluído
- Sistema de imagens completo
- Sistema de favoritos
- Sistema de autenticação básico
- Interface responsiva
- Documentação atualizada

### 🔄 Em Progresso
- Refatoração de nomenclatura
- Remoção de emojis dos logs
- Padronização do código

### ⏳ Planejado
- Implementação das funções TODO listadas acima
- Testes automatizados
- Sistema de CI/CD
