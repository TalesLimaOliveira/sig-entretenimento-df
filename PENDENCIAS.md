# Pendências de Implementação - SIG Entretenimento DF

Este arquivo lista todas as funcionalidades identificadas como pendentes ou não totalmente implementadas no projeto.

## 📋 Lista de Pendências

### 🔴 Prioridade Alta

#### 1. Sistema de Favoritos
**Função:** `toggleFavorito(pontoId)`  
**Arquivo:** `src/js/app.js:930`  
**Status:** Marcada com `// !TODO: Implementar sistema completo de favoritos`  
**Descrição:** Implementar funcionalidade completa para marcar/desmarcar pontos como favoritos dos usuários  
**Comportamento Atual:** Mostra notificação "Funcionalidade em desenvolvimento"

#### 2. Sistema de Favoritos (MapManager)
**Função:** `_createBasicGroups()`  
**Arquivo:** `src/js/map.js:455`  
**Status:** Marcada com `// !TODO: Implementar sistema de favoritos`  
**Descrição:** Integrar categoria "favoritos" nos grupos de marcadores do mapa  
**Comportamento Atual:** Categoria comentada, não criada nos grupos

#### 3. Controles Administrativos do Mapa
**Função:** `_adicionarControleCoordenadas()`  
**Arquivo:** `src/js/map.js:615`  
**Status:** Marcada com `// !TODO: Implement specific map controls if needed`  
**Descrição:** Implementar controles específicos para administradores visualizarem coordenadas  
**Comportamento Atual:** Coordenadas mostradas apenas no console

#### 4. Remoção de Controles Admin
**Função:** `_removerControlesAdmin()`  
**Arquivo:** `src/js/map.js:643`  
**Status:** Marcada com `// !TODO: Implement removal of specific controls if added`  
**Descrição:** Implementar remoção adequada de controles quando usuário sai do modo admin  
**Comportamento Atual:** Apenas desabilita modo de adição

### 🟡 Prioridade Média

#### 5. Configuração de Estatísticas
**Função:** `configureStatistics()`  
**Arquivo:** `src/js/app.js:779`  
**Status:** Marcada com `// !TODO: Implement application statistics configuration logic`  
**Descrição:** Implementar lógica de configuração de estatísticas da aplicação  
**Comportamento Atual:** Função vazia

#### 6. Salvamento no Servidor (AuthManager)
**Função:** `adicionarUsuario(userData)`  
**Arquivo:** `src/js/auth.js:305`  
**Status:** Marcada com `// !TODO: Implementar salvamento real no servidor`  
**Descrição:** Implementar persistência real de usuários no servidor  
**Comportamento Atual:** Salva apenas no localStorage

#### 7. Sistema de Favoritos (InfoPanel)
**Função:** Botão favorito no painel de informações  
**Arquivo:** `src/js/map.js:1175` e `src/js/map.js:1213`  
**Status:** Marcada com `// !TODO: Implementar sistema de favoritos`  
**Descrição:** Implementar funcionalidade do botão favorito no painel de informações  
**Comportamento Atual:** Botão presente mas sem funcionalidade

### 🟢 Prioridade Baixa

#### 8. Filtro de Favoritos (MapManager)
**Função:** `_filtrarFavoritos(username)`  
**Arquivo:** `src/js/map.js:1318`  
**Status:** Comentário "FUNCIONALIDADE EM DESENVOLVIMENTO"  
**Descrição:** Implementar filtro para mostrar apenas pontos favoritos do usuário  
**Comportamento Atual:** Função presente mas comentada como em desenvolvimento

#### 9. Sistema de Favoritos (App)
**Função:** `updateFavoritesVisibility(userRole)`  
**Arquivo:** `src/js/app.js:602`  
**Status:** Marcada com `// !TODO: Implementar sistema de favoritos`  
**Descrição:** Implementar visibilidade da categoria favoritos baseada no papel do usuário  
**Comportamento Atual:** Chamada comentada na configuração de usuário logado

## 🔧 Refatorações Pendentes

### Nomenclatura em Português para Inglês

#### MapManager (`src/js/map.js`)
- `atualizarMarcador()` → `updateMarker()`
- `recarregarMarcadores()` → `reloadMarkers()`
- `limparCacheIcones()` → `clearIconCache()`
- `_configurarCamadas()` → `_configureLayers()`
- `_configurarEventListeners()` → `_configureEventListeners()`

#### DatabaseManager (`src/js/database.js`)
- Diversos métodos ainda em português nos logs e comentários internos

## 📈 Estatísticas

- **Total de Pendências:** 9 funcionalidades
- **Prioridade Alta:** 4 itens
- **Prioridade Média:** 3 itens  
- **Prioridade Baixa:** 2 itens
- **Refatorações de Nomenclatura:** 5+ métodos

## 🎯 Próximos Passos

1. **Implementar Sistema de Favoritos** - Funcionalidade mais requisitada
2. **Completar Controles Administrativos** - Melhorar experiência do admin
3. **Finalizar Refatoração de Nomenclatura** - Padronização completa
4. **Implementar Persistência no Servidor** - Para ambiente de produção

---

**Nota:** Este arquivo é gerado automaticamente durante o processo de refatoração e deve ser mantido atualizado conforme novas pendências são identificadas ou resolvidas.
