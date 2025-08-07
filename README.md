# 🗺️ SIG Entretenimento DF

Sistema de Informações Geográficas interativo para pontos de entretenimento do Distrito Federal, desenvolvido com Clean Architecture e foco em manutenibilidade.

*Projeto acadêmico do Instituto Federal de Brasília (IFB)*

<p align="center">
    <img src="https://img.shields.io/badge/Language-JavaScript-yellow" alt="Language">
    <img src="https://img.shields.io/badge/Plugin-Leaflet-green" alt="leaflet">
    <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Version">
</p>

## 📖 Resumo do Projeto

O **SIG Entretenimento DF** é uma aplicação web que apresenta um mapa interativo com pontos de interesse cultural, gastronômico, esportivo e de entretenimento do Distrito Federal. O sistema permite visualização, filtragem por categorias e funcionalidades administrativas para gerenciamento de conteúdo.

> **📝 TODO**: Sistema de favoritos em desenvolvimento

### Principais Diferenciais
- **Arquitetura Limpa**: Separação clara de responsabilidades
- **Código Documentado**: Preparado para manutenção por equipes e IAs
- **Responsivo**: Funciona perfeitamente em desktop e mobile
- **Extensível**: Fácil adição de novas funcionalidades

## 🚀 Como Executar

### Pré-requisitos
- **Python 3.x** instalado
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)
- **Conexão com internet** (para bibliotecas CDN)

### Passos para Execução

1. **Clone ou baixe o projeto**
   ```bash
   git clone https://github.com/seu-usuario/sig-entretenimento-df.git
   cd sig-entretenimento-df
   ```

2. **Inicie o servidor local**
   ```bash
   python -m http.server 8000
   ```

3. **Acesse no navegador**
   ```
   http://localhost:8000
   ```

### Scripts Disponíveis

Se você tem Node.js instalado, pode usar os scripts do `package.json`:

```bash
npm install          # Instalar dependências de desenvolvimento
npm start           # Iniciar servidor Python
npm run serve       # Iniciar servidor HTTP alternativo
npm run api         # Iniciar JSON Server (se necessário)
```

## 📁 Estrutura do Projeto

```
├── index.html              # Página principal
├── admin.html              # Painel administrativo
├── limpar-cache.html       # Utilitário de limpeza
├── package.json            # Configurações e scripts
├── README.md               # Este arquivo
│
├── database/               # Dados em JSON
│   ├── pontos_confirmados.json
│   ├── pontos_pendentes.json
│   ├── pontos_ocultos.json
│   └── usuarios.json
│
├── src/
│   ├── css/               # Estilos
│   │   ├── colors.css     # Variáveis de cores e temas
│   │   ├── main.css       # Estilos principais
│   │   ├── components.css # Componentes reutilizáveis
│   │   └── admin.css      # Estilos específicos do admin
│   │
│   ├── js/                # JavaScript
│   │   ├── app.js         # Aplicação principal
│   │   ├── database.js    # Gerenciador de dados
│   │   ├── auth.js        # Sistema de autenticação
│   │   ├── map.js         # Gerenciador de mapas
│   │   ├── theme.js       # Sistema de temas
│   │   ├── info-panel.js  # Painel de informações
│   │   └── admin.js       # Funcionalidades administrativas
│   │
│   └── components/        # Componentes modais
│       ├── login-modal.js
│       ├── add-point-modal.js
│       ├── suggestion-modal.js
│       ├── user-menu.js
│       └── error-handler.js
│
└── docs/                  # Documentação técnica
    ├── architecture.md    # Arquitetura do sistema
    ├── development-guide.md # Guia de desenvolvimento
    ├── data-flow.md       # Fluxos de dados
    └── migration-guide.md # Guia de migração
```

## ✨ Funcionalidades Principais

### Para Todos os Usuários
- 🗺️ **Mapa Interativo**: Visualização de pontos com Leaflet.js
- 🔍 **Filtros por Categoria**: Cultura, Gastronomia, Vida Noturna, Esportes, Geral
- 📱 **Interface Responsiva**: Adaptável a diferentes tamanhos de tela
- 🌙 **Modo Claro/Escuro**: Alternância de temas
- ℹ️ **Painel de Informações**: Detalhes completos de cada ponto

### Para Usuários Logados
- 💬 **Sugestões de Mudanças**: Propor alterações nos pontos
- 👤 **Perfil de Usuário**: Gerenciamento da conta

> **📝 TODO**: Sistema de favoritos (❤️) em desenvolvimento

### Para Administradores
- ➕ **Adicionar Pontos**: Criar novos pontos de interesse
- ✏️ **Editar Informações**: Modificar dados existentes
- 🔍 **Moderar Conteúdo**: Aprovar/reprovar sugestões
- 📊 **Painel Administrativo**: Interface dedicada para gestão
- 🗂️ **Gerenciar Usuários**: Controle de acesso
- 📤 **Exportar Dados**: Backup das informações

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Grid, Flexbox, Custom Properties
- **JavaScript ES6+**: Módulos, Classes, Async/Await
- **Leaflet.js**: Biblioteca de mapas interativos
- **Font Awesome**: Ícones vetoriais

### Armazenamento
- **LocalStorage**: Persistência local dos dados
- **JSON Files**: Backup e dados iniciais

## 🎯 Estado Atual do Projeto

### ✅ Implementado
- Sistema completo de mapas com Leaflet
- Autenticação com diferentes níveis de acesso
- Interface responsiva e acessível
- Sistema de favoritos
- Painel administrativo funcional
- Documentação técnica completa
- Tratamento robusto de erros

### 🔄 Em Desenvolvimento
- Sistema de notificações visuais
- Upload de imagens para pontos
- Sistema de avaliações
- API REST para sincronização

### 📋 Funcionalidades Futuras
- PWA (Progressive Web App)
- Notificações push
- Geolocalização automática
- Integração com redes sociais
- Sistema de comentários

## 📚 Documentação Técnica

Para desenvolvedores e equipes de manutenção, consulte:

- **[Arquitetura do Sistema](docs/architecture.md)**: Visão geral da estrutura
- **[Guia de Desenvolvimento](docs/development-guide.md)**: Padrões e convenções
- **[Fluxos de Dados](docs/data-flow.md)**: Como os dados fluem pela aplicação
- **[Guia de Migração](docs/migration-guide.md)**: Migração para outras tecnologias

## 🤝 Manutenção e Evolução

### Para Desenvolvedores
O código foi estruturado seguindo princípios de **Clean Code** e **SOLID**, facilitando:
- Adição de novas funcionalidades
- Manutenção por diferentes equipes
- Migração para outros frameworks (React, Vue, Angular)
- Evolução para React Native

### Para Assistentes de IA
A documentação inclui:
- Comentários detalhados em todo o código
- Arquitetura bem definida e documentada
- Padrões consistentes de nomenclatura
- Separação clara de responsabilidades