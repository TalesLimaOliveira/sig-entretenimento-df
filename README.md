# 🎯 Pontos de Entretenimento DF

> **Mapa interativo para descobrir os melhores locais de entretenimento no Distrito Federal**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/seu-usuario/pontos-entretenimento-df)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.3.4-brightgreen.svg)](https://leafletjs.com/)

![Screenshot do Projeto](assets/screenshot.png)

## 📋 Sobre o Projeto

O **Pontos de Entretenimento DF** é uma aplicação web interativa que permite aos usuários descobrir e explorar locais de interesse no Distrito Federal. O sistema oferece uma interface intuitiva com mapa dinâmico, sistema de categorias e funcionalidades distintas para usuários e administradores.

### 🌟 Principais Funcionalidades

- **🗺️ Mapa Interativo**: Baseado no Leaflet.js com múltiplas camadas
- **📂 Sistema de Categorias**: Organização por tipo de estabelecimento
- **👥 Controle de Acesso**: Funcionalidades diferentes para usuários e administradores
- **📍 Adição de Pontos**: Interface para administradores cadastrarem novos locais
- **🔍 Busca e Filtros**: Sistema avançado de pesquisa
- **📱 Design Responsivo**: Funciona perfeitamente em dispositivos móveis
- **💾 Persistência de Dados**: Armazenamento local com opção de API

## 🎯 Categorias Disponíveis

| Categoria | Ícone | Descrição |
|-----------|-------|-----------|
| **Restaurantes** | 🍽️ | Opções gastronômicas variadas |
| **Shopping** | 🛍️ | Centros comerciais e lojas |
| **Parques** | 🌳 | Áreas verdes e lazer ao ar livre |
| **Cultura** | 🎭 | Museus, teatros e centros culturais |
| **Vida Noturna** | 🌙 | Bares, casas noturnas e entretenimento |

## 🚀 Demonstração

### Interface de Usuário
- Visualização de todos os pontos cadastrados
- Filtros por categoria
- Informações detalhadas em popups
- Navegação intuitiva no mapa

### Interface de Administrador
- Todas as funcionalidades do usuário
- Adição de novos pontos através do mapa
- Edição de informações existentes
- Gerenciamento de categorias

## 📁 Estrutura do Projeto

```
pontos-entretenimento-df/
├── 📄 index.html                    # Página principal
├── 📄 admin.html                    # Interface do administrador
├── 📁 src/                          # Código fonte
│   ├── 📁 js/                       # Scripts JavaScript
│   │   ├── 📄 app.js               # Aplicação principal
│   │   ├── 📄 database.js          # Gerenciamento de dados
│   │   ├── 📄 auth.js              # Sistema de autenticação
│   │   ├── 📄 map.js               # Configurações do mapa
│   │   └── 📄 utils.js             # Funções utilitárias
│   ├── 📁 css/                     # Estilos
│   │   ├── 📄 main.css             # Estilos principais
│   │   ├── 📄 components.css       # Componentes
│   │   └── 📄 responsive.css       # Design responsivo
│   └── 📁 components/              # Componentes reutilizáveis
│       ├── 📄 modal.js             # Componente de modal
│       ├── 📄 form.js              # Formulários
│       └── 📄 notification.js      # Sistema de notificações
├── 📁 assets/                      # Recursos estáticos
│   ├── 📁 images/                  # Imagens
│   └── 📁 icons/                   # Ícones
├── 📁 docs/                        # Documentação
│   ├── 📄 CRIAR_PONTOS.md          # Como criar novos pontos
│   ├── 📄 API.md                   # Documentação da API
│   └── 📄 DEPLOYMENT.md            # Guia de implantação
├── 📄 db.json                      # Banco de dados JSON
├── 📄 package.json                 # Dependências do projeto
└── 📄 README.md                    # Este arquivo
```

## ⚡ Início Rápido

### Método Rápido (Recomendado)

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Instalação Manual

### 1. **Clone o Repositório**
```bash
git clone https://github.com/seu-usuario/pontos-entretenimento-df.git
cd pontos-entretenimento-df
```

### 2. **Instale as Dependências (Opcional)**
```bash
npm install
```

### 3. **Inicie o Servidor**
```bash
# Servidor local
npm start
```

### 4. **Acesse a Aplicação**
- **Usuário**: http://localhost:8000
- **Administrador**: http://localhost:8000/admin.html

### Requisitos do Sistema
- **Python 3.x** (para servidor HTTP)
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

## 👤 Sistema de Usuários

### 🔑 Credenciais de Teste

| Tipo | Usuário | Senha |
|------|---------|-------|
| **Administrador** | `admin` | `admin123` |
| **Usuário** | `user` | `user123` |

### 📋 Permissões

#### 👥 **Usuário Comum**
- ✅ Visualizar todos os pontos
- ✅ Filtrar por categoria
- ✅ Ver detalhes dos locais
- ✅ Navegar pelo mapa
- ❌ Adicionar novos pontos
- ❌ Editar informações

#### 👨‍💼 **Administrador**
- ✅ Todas as permissões do usuário
- ✅ Adicionar novos pontos
- ✅ Editar pontos existentes
- ✅ Remover pontos
- ✅ Gerenciar categorias
- ✅ Acessar painel administrativo

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Leaflet.js** | 1.3.4 | Biblioteca para mapas interativos |
| **JavaScript ES6+** | - | Linguagem principal |
| **HTML5** | - | Estrutura das páginas |
| **CSS3** | - | Estilização e design |
| **JSON Server** | 0.17.3 | API REST para desenvolvimento |
| **LocalStorage** | - | Armazenamento local do navegador |

## 📊 Funcionalidades Técnicas

### 🗃️ **Gerenciamento de Dados**
- Classe `DatabaseManager` para operações CRUD
- Sincronização entre LocalStorage e API
- Validação de dados de entrada
- Sistema de backup automático

### 🗺️ **Sistema de Mapas**
- Múltiplas camadas base (ruas, satélite, topográfico)
- Marcadores customizados por categoria
- Popups informativos com dados detalhados
- Controles de zoom e navegação

### 🔐 **Autenticação**
- Sistema simples de login
- Gerenciamento de sessões
- Controle de acesso baseado em roles
- Proteção de rotas administrativas

### 📱 **Interface Responsiva**
- Design mobile-first
- Adaptação automática para diferentes telas
- Menu responsivo
- Controles touch-friendly

## 🎨 Personalização

### Adicionar Nova Categoria
```javascript
const novaCategoria = {
    id: 'esportes',
    nome: 'Esportes',
    icone: '⚽',
    cor: '#FF9F43',
    descricao: 'Locais para prática esportiva'
};

categoriaManager.adicionarCategoria(novaCategoria);
```

### Personalizar Cores do Tema
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #FF6B6B;
    --success-color: #4CAF50;
    --warning-color: #FFC107;
    --danger-color: #F44336;
}
```

## 📈 Estatísticas do Projeto

- **🏢 Pontos Cadastrados**: 25+ locais
- **📂 Categorias**: 5 tipos diferentes
- **🗺️ Área de Cobertura**: Distrito Federal completo
- **📱 Compatibilidade**: Todos os dispositivos modernos

## 🤝 Como Contribuir

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um **Pull Request**

### 📋 Diretrizes de Contribuição

- Siga o padrão de código estabelecido
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário
- Use mensagens de commit descritivas

## 📚 Documentação Adicional

- 📖 [Como Criar Novos Pontos](docs/CRIAR_PONTOS.md)
- 🔧 [Documentação da API](docs/API.md)
- 🚀 [Guia de Implantação](docs/DEPLOYMENT.md)

## 🐛 Suporte e Issues

Encontrou um bug ou tem uma sugestão? Abra uma [issue](https://github.com/seu-usuario/pontos-entretenimento-df/issues) no GitHub.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)
- Email: seu.email@exemplo.com

---

<div align="center">

**⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!**

[🏠 Voltar ao Topo](#-pontos-de-entretenimento-df)

</div>
