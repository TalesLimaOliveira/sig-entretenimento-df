# PENDÊNCIAS DO PROJETO

Este arquivo lista todas as funções e implementações que ainda precisam ser concluídas ou estão marcadas como TODO no código.

## ✅ IMPLEMENTAÇÕES RECENTES CONCLUÍDAS

### UI/UX Melhorias - Data: 2024
- **Sistema de Pop-ups de Erro Interativo**: Implementado error-handler com modal responsivo, categorização de erros, sugestões contextuais e detalhes técnicos expansíveis
- **Correção de Navegação de Categorias**: Corrigido eventos de clique para filtros de categoria, botão "Favoritos" já posicionado corretamente após "Todos"
- **Layout Responsivo de Botões**: Removido menu hambúrguer, botões de login e tema sempre visíveis em mobile com posicionamento adequado no desktop
- **Remoção de Emojis**: Limpos todos os logs e estilos conforme diretrizes do projeto
- **Padronização de Nomenclatura**: Funções renomeadas de português para inglês seguindo padrões do projeto

## Pendências por Arquivo

### src/js/app.js

**1. configurarEstatisticas()**
- **Linha:** 393-395
- **Descrição:** Método vazio que deveria implementar configuração de estatísticas
- **Status:** !TODO: Implementar lógica de configuração das estatísticas da aplicação

**2. handleFavoriteAction(e)**
- **Linha:** 547-550 
- **Descrição:** Lógica de favoritar pontos não implementada
- **Status:** !TODO: Implementar sistema de favoritos para usuários logados

**3. handleSuggestAction(e)**
- **Linha:** 567-570
- **Descrição:** Lógica de sugerir mudanças nos pontos não implementada  
- **Status:** !TODO: Implementar sistema de sugestões de mudanças

**4. getCurrentPontoId()**
- **Linha:** 628-631
- **Descrição:** Método para obter ID do ponto atualmente selecionado
- **Status:** !TODO: Implementar lógica para obter o ID do ponto atualmente selecionado

**5. mostrarErro(mensagem)**
- **Linha:** 793-796
- **Descrição:** Sistema de notificação de erros não implementado
- **Status:** ✅ CONCLUÍDO: Implementado sistema de pop-ups de erro interativo com error-handler

### src/js/admin.js

**6. implementarTooltips()**
- **Linha:** 705
- **Descrição:** Sistema de tooltips para interface administrativa
- **Status:** !TODO: Implementar tooltips informativos na interface de administração

**7. rejeitarPonto(pontoId)**
- **Linha:** 1049
- **Descrição:** Lógica de rejeição de pontos pendentes
- **Status:** !TODO: Implementar lógica de rejeição de pontos com feedback ao usuário

### src/js/map.js

**8. configurarControlsEspecificos()**
- **Linha:** 585-587
- **Descrição:** Configuração de controles específicos do mapa
- **Status:** !TODO: Implementar controles específicos do mapa se necessário

**9. removerControlsEspecificos()**
- **Linha:** 613-615
- **Descrição:** Remoção de controles específicos do mapa
- **Status:** !TODO: Implementar remoção de controles específicos se adicionados

### src/components/user-menu.js

**10. abrirFormularioAdicionarPonto()**
- **Linha:** 165
- **Descrição:** Abertura do formulário para adicionar novos pontos
- **Status:** !TODO: Implementar abertura do formulário de adicionar ponto para usuários

## Refatoração de Nomenclatura

### Métodos e Variáveis em Português (Para Refatorar)

**src/js/app.js:**
- `filtrarPorCategoria()` → `filterByCategory()`
- `configurarInterface()` → `configureInterface()`
- `configurarEventos()` → `configureEvents()`
- `atualizarIconesTema()` → `updateThemeIcons()`
- `carregarDados()` → `loadData()`
- `recarregarDados()` → `reloadData()`
- `mostrarErro()` → `showError()`
- `configurarMenuCategorias()` → `configureMenuCategories()`

**src/js/database.js:**
- `carregarTodosDados()` → `loadAllData()`
- `obterTodos()` → `getAll()`
- `pontosConfirmados` → `confirmedPoints`
- `pontosPendentes` → `pendingPoints`
- `pontosOcultos` → `hiddenPoints`

**src/js/map.js:**
- `alternarTemaMapa()` → `toggleMapTheme()`
- `forcarRedimensionamento()` → `forceResize()`
- `adicionarMarcador()` → `addMarker()`
- `removerMarcador()` → `removeMarker()`

## Prioridade de Implementação

**Alta Prioridade:**
1. Sistema de favoritos (handleFavoriteAction)
2. Sistema de sugestões (handleSuggestAction)
3. Notificações de erro (mostrarErro)
4. Obter ponto atual (getCurrentPontoId)

**Média Prioridade:**
5. Configuração de estatísticas (configurarEstatisticas)
6. Rejeição de pontos (rejeitarPonto)
7. Formulário adicionar ponto (abrirFormularioAdicionarPonto)

**Baixa Prioridade:**
8. Tooltips administrativos (implementarTooltips)
9. Aumentar o tamanho dos pontos no mapa
10. Alinhar botao "ENTRAR" a Direita da pagina, Nao ficando "colado" com o nav-buttons
