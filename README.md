# 🗺️ SIG Entretenimento DF

Sistema de Informações Geográficas para pontos de entretenimento do Distrito Federal.

## 🚀 Sobre o Projeto

Aplicação web que apresenta um mapa interativo com pontos de entretenimento do Distrito Federal, desenvolvida com Clean Architecture e boas práticas de programação.

## ✨ Funcionalidades

- 🗺️ Mapa interativo com Leaflet
- 📍 Marcadores categorizados por tipo de entretenimento
- 🔍 Filtros por categoria
- 📊 Estatísticas em tempo real
- 🌙 Tema claro/escuro
- 🔐 Sistema de autenticação para administradores
- � Design responsivo

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapas**: Leaflet.js
- **Armazenamento**: LocalStorage
- **Arquitetura**: Clean Architecture
- **Estilo**: CSS custom com variáveis

## 📋 Correções Implementadas

### ❌ Problemas Identificados e Corrigidos:

1. **Inicialização Assíncrona**
   - ✅ Implementado sistema robusto de inicialização
   - ✅ Verificação de dependências antes da inicialização
   - ✅ Tratamento de erros em todos os managers

2. **Ordem de Carregamento**
   - ✅ Aguarda DOM completamente carregado
   - ✅ Inicialização sequencial com delays apropriados
   - ✅ Verificação de disponibilidade de elementos

3. **Tratamento de Erros**
   - ✅ Try-catch em todos os métodos críticos
   - ✅ Logs detalhados para debug
   - ✅ Tela de erro informativa com stack trace

4. **Verificações de Segurança**
   - ✅ Verificação de existência de managers antes do uso
   - ✅ Verificação de elementos DOM antes da manipulação
   - ✅ Fallbacks para funcionalidades não críticas

## 🚀 Como Executar

1. **Clone o repositório**
   ```bash
   git clone [url-do-repositorio]
   cd sig-entretenimento-df
   ```

2. **Execute um servidor local**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Ou Node.js
   npx serve .
   
   # Ou qualquer servidor web local
   ```

3. **Acesse no navegador**
   ```
   http://localhost:8000
   ```

## 🧪 Testes

- **Teste Simples**: Acesse `/test-simple.html` para verificar funcionalidades básicas
- **Console**: Verifique logs detalhados no console do desenvolvedor

## 📁 Estrutura do Projeto

```
├── index.html              # Página principal
├── admin.html              # Página de administração
├── test-simple.html        # Teste básico
├── src/
│   ├── js/
│   │   ├── app.js          # Aplicação principal
│   │   ├── database.js     # Gerenciador de dados
│   │   ├── auth.js         # Sistema de autenticação
│   │   ├── map.js          # Gerenciador do mapa
│   │   └── theme.js        # Gerenciador de temas
│   ├── css/
│   │   ├── main.css        # Estilos principais
│   │   ├── colors.css      # Variáveis de cores
│   │   └── components.css  # Componentes reutilizáveis
│   └── components/
│       └── modal.js        # Sistema de modais
```

## 🔧 Padrões de Código

### Clean Code Aplicado:
- ✅ Nomes descritivos para variáveis e funções
- ✅ Funções pequenas com responsabilidade única
- ✅ Comentários JSDoc para documentação
- ✅ Tratamento consistente de erros
- ✅ Separação de responsabilidades

### Clean Architecture:
- ✅ Separação em camadas (UI, Business Logic, Data)
- ✅ Dependency Injection via window globals
- ✅ Managers especializados por domínio
- ✅ Event-driven communication

## 🔐 Credenciais de Teste

- **Usuário**: admin
- **Senha**: admin123

## 🐛 Troubleshooting

### Se a aplicação não carregar:

1. **Verifique o console** para logs de erro
2. **Teste básico** em `/test-simple.html`
3. **Limpe o localStorage** se necessário:
   ```javascript
   localStorage.clear();
   ```
4. **Verifique a conexão** com CDNs externos (Leaflet, FontAwesome)

### Logs de Debug:
A aplicação possui logs detalhados:
- 🚀 Inicialização
- ✅ Sucessos
- ❌ Erros
- ⚠️ Warnings
- 🔧 Debug

## 📝 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para o Distrito Federal** 🏛️
5. **Admin**: Clique em "LOGIN" para acessar funcionalidades administrativas.

## 🎨 Personalização de Temas

### Como alterar cores:

1. **Edite** `src/css/colors.css`
2. **Modifique** as variáveis em `:root` para cores base
3. **Ajuste** `.theme-light` para personalizar tema claro  
4. **Ajuste** as variáveis padrão para personalizar tema escuro

### Exemplo de personalização:
```css
:root {
    --primary: #your-color;        /* Cor principal */
    --secondary: #your-color;      /* Cor secundária */
    --accent: #your-color;         /* Cor de destaque */
}
```

## ⚙️ Configurações

### Tema padrão:
- **Localização**: `src/js/theme.js`
- **Variável**: `DEFAULT_THEME = 'dark'` (escuro como padrão)
- **Para mudar**: Altere para `'light'` se desejar claro como padrão

### Centro do mapa:
- **Localização**: `src/js/map.js`
- **Coordenadas**: `[-15.794700, -47.890000]` (Brasília)

### Dados dos pontos:
- **Localização**: `db.json`
- **Formato**: Array de objetos com propriedades: id, nome, categoria, coordenadas, etc.

## 🏗️ Arquitetura

### Estrutura Clean Code:
```
src/
├── css/
│   ├── colors.css     # Sistema de cores e temas
│   ├── main.css       # Estilos principais
│   └── components.css # Componentes (modais, etc.)
├── js/
│   ├── app.js         # Aplicação principal
│   ├── theme.js       # Gerenciador de temas
│   ├── map.js         # Gerenciador de mapas
│   ├── database.js    # Gerenciador de dados
│   └── auth.js        # Autenticação
└── components/
    └── modal.js       # Componente de modais
```

### Princípios aplicados:
- **Single Responsibility**: Cada classe tem uma responsabilidade específica
- **Clean Architecture**: Separação de camadas e responsabilidades
- **Error Handling**: Tratamento robusto de erros
- **Logging**: Sistema de logs para debugging
- **Modularização**: Código organizado em módulos

## 🔧 Desenvolvimento

### Adicionando novos pontos:
1. **Programaticamente**: Use `app.adicionarPonto(dados)` no console
2. **Via interface**: Faça login como admin e use os controles

### Debugging:
- **Console**: Logs detalhados em todas as operações
- **Tema**: Eventos de mudança de tema são logados
- **Inicialização**: Processo completo é rastreado

### Estrutura de dados:
```javascript
{
  "id": "unique-id",
  "nome": "Nome do Local",
  "categoria": "cultura|gastronomia|vida-noturna|lazer|natureza",
  "coordenadas": [-15.794700, -47.890000],
  "endereco": "Endereço completo",
  "descricao": "Descrição do local"
}
```

## 📋 Checklist de Funcionalidades

- ✅ **Loading Screen**: Removido após inicialização completa
- ✅ **Tema Escuro/Claro**: Funcionando com persistência
- ✅ **Mapa**: Carregando e renderizando corretamente
- ✅ **Filtros**: Categorias funcionais
- ✅ **Responsivo**: Layout adaptável
- ✅ **Error Handling**: Tratamento robusto de erros
- ✅ **Clean Code**: Arquitetura limpa e documentada
- ✅ **Console Clean**: Sem erros no console do navegador

## 🚨 Solução de Problemas

### Loading infinito:
- **Verificar**: Se todos os managers são carregados
- **Console**: Checar logs de inicialização
- **Timeout**: Aplicação tem timeout de 15s para inicialização

### Tema não funciona:
- **localStorage**: Pode estar bloqueado
- **Button**: Verificar se existe elemento com id="theme-toggle"
- **CSS**: Verificar se classes .theme-light/.theme-dark existem

### Mapa não carrega:
- **Internet**: Verificar conexão (usa CDN do Leaflet)
- **Container**: Verificar se elemento #map existe
- **JavaScript**: Verificar se MapManager foi inicializado

---

**Versão**: 2.0.0 | **Tema padrão**: Escuro | **Arquitetura**: Clean Code
