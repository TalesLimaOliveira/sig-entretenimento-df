# Dynamic User Button - Documentação

## Visão Geral

O **Dynamic User Button** é um componente que gerencia automaticamente a exibição e o comportamento do botão de usuário no cabeçalho da aplicação, adaptando-se ao estado de autenticação do usuário.

## Funcionalidades

### 1. Estados do Botão

#### Visitante (não logado)
- **Ícone**: `fas fa-user`
- **Texto**: "ENTRAR"
- **Comportamento**: Abre modal de login ao clicar

#### Usuário Logado (padrão)
- **Ícone**: `fas fa-user`
- **Texto**: Nome do usuário + seta para baixo
- **Comportamento**: Abre menu suspenso com opções:
  - Gerenciar conta
  - Sair

#### Usuário Administrador
- **Ícone**: `fas fa-shield-alt` (indicando privilégios administrativos)
- **Texto**: Nome do administrador + seta para baixo
- **Comportamento**: Abre menu suspenso com opções:
  - Painel Administrativo
  - Gerenciar conta
  - Sair

### 2. Menu Suspenso

O menu suspenso é posicionado automaticamente para evitar sair da tela e inclui:

- **Animações suaves** de abertura/fechamento
- **Fechamento automático** ao clicar fora ou pressionar ESC
- **Responsividade** para dispositivos móveis
- **Temas** (suporte a modo escuro/claro)

## Implementação Técnica

### Arquivos

- **Componente**: `src/components/dynamic-user-button.js`
- **Estilos**: `src/css/components.css` (seção Dynamic User Button)

### Integração

O componente é automaticamente inicializado e se integra com:

- **AuthManager**: Para verificar estado de autenticação
- **Eventos de autenticação**: Escuta `authStateChanged` para atualizar em tempo real
- **Modais existentes**: Utiliza o `loginModal` existente para visitantes

### Elementos HTML Alvo

O componente procura pelos seguintes elementos:

```html
<!-- Desktop -->
<button id="desktop-login-btn" class="login-btn desktop">
    <i class="fas fa-user"></i>
    <span class="login-btn-text">ENTRAR</span>
</button>

<!-- Mobile -->
<button id="mobile-login-btn" class="login-btn mobile">
    <i class="fas fa-user"></i>
    <span class="login-btn-text">ENTRAR</span>
</button>
```

## API Pública

### Métodos

- `refresh()`: Atualiza o estado do botão manualmente
- `updateButtonState()`: Força atualização baseada no estado atual de autenticação

### Eventos

O componente escuta automaticamente:
- `authStateChanged`: Atualiza quando o estado de login/logout muda
- `DOMContentLoaded`: Aguarda o DOM estar pronto para inicializar

## Estilização

### Classes CSS Principais

- `.user-btn`: Botão para usuário logado
- `.admin-btn`: Botão para administrador
- `.user-dropdown-menu`: Menu suspenso
- `.user-menu-item`: Item do menu

### Suporte a Temas

O componente suporta automaticamente os temas:
- `.theme-dark`: Modo escuro
- `.theme-light`: Modo claro (padrão)

## Responsividade

- **Desktop**: Menu posicionado adequadamente abaixo do botão
- **Mobile**: Menu centralizado e com toque otimizado
- **Redimensionamento**: Menu fecha automaticamente ao redimensionar

## Compatibilidade

- **Navegadores modernos** com suporte a ES6+
- **Dispositivos móveis** e tablets
- **Acessibilidade** com labels apropriados e navegação por teclado

## Exemplo de Uso

```javascript
// Atualizar manualmente o estado do botão
if (window.dynamicUserButton) {
    window.dynamicUserButton.refresh();
}

// O componente é automaticamente inicializado no carregamento da página
// e funciona automaticamente com o sistema de autenticação existente
```

## Notas de Desenvolvimento

- O componente mantém compatibilidade com o sistema existente
- Substitui a lógica manual de `handleLoginClick` no `app.js`
- Utiliza os mesmos elementos HTML existentes
- Não requer mudanças na estrutura atual do projeto
