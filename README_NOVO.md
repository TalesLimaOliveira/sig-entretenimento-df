# Sistema de Pontos de Entretenimento DF

Um mapa interativo responsivo para descobrir e gerenciar pontos de entretenimento no Distrito Federal, com sistema completo de autenticação e controle de acesso.

## 🚀 Funcionalidades Principais

### Para Visitantes (Sem Login)
- ✅ Visualização completa do mapa com todos os pontos confirmados
- ✅ Navegação por categorias (Cultura, Gastronomia, Vida Noturna, Esportes, Geral)
- ✅ Painel lateral com informações detalhadas dos pontos
- ✅ Interface responsiva para desktop e mobile
- ✅ Temas claro e escuro

### Para Usuários Autenticados
- ✅ **Login simples**: `user` / `user`
- ✅ Favoritar/desfavoritar pontos
- ✅ Categoria "Favoritos" exclusiva
- ✅ Cadastrar novos pontos (entram na fila de aprovação)
- ✅ Sugerir mudanças em pontos existentes
- ✅ Dados pessoais persistentes (favoritos, pontos enviados, sugestões)

### Para Administradores
- ✅ **Login administrativo**: `admin` / `admin`
- ✅ Acesso ao painel administrativo completo
- ✅ Aprovar novos pontos cadastrados por usuários
- ✅ Aprovar sugestões de mudança
- ✅ Cadastrar pontos diretamente (sem validação)
- ✅ Ocultar pontos (move para banco separado)
- ✅ Restaurar pontos ocultos
- ✅ Visualizar pontos pendentes com indicadores visuais
- ✅ Sistema de limpeza de cache
- ✅ Estatísticas e relatórios em tempo real

## 🗂️ Estrutura do Banco de Dados

O sistema utiliza uma arquitetura baseada em localStorage com arquivos JSON organizados:

```
database/
├── pontos_confirmados.json    # Pontos aprovados e visíveis
├── pontos_pendentes.json      # Pontos aguardando aprovação
├── pontos_ocultos.json        # Pontos ocultos pelo admin
└── usuarios.json              # Dados dos usuários (favoritos, envios, sugestões)
```

## 🔐 Sistema de Autenticação

### Credenciais de Demo
- **Administrador**: email/usuário: `admin`, senha: `admin`
- **Usuário**: email/usuário: `user`, senha: `user`

### Controle de Acesso
- **Visitante**: Pode navegar e ver pontos, mas precisa fazer login para favoritar ou sugerir
- **Usuário**: Pode favoritar, cadastrar pontos (ficam pendentes) e sugerir mudanças
- **Admin**: Controle total sobre pontos, aprovações e sistema

## 🎯 Fluxos de Uso

### 1. Usuário Visitante Querendo Favoritar
1. Clica em "Favoritar" em qualquer ponto
2. É redirecionado para tela de login
3. Após login, o ponto é automaticamente favoritado
4. Ganha acesso à categoria "Favoritos"

### 2. Usuário Cadastrando Novo Ponto
1. Faz login como usuário comum
2. Cadastra ponto através da interface
3. Ponto vai para fila de aprovação (visível apenas para admin)
4. Admin aprova ou rejeita o ponto

### 3. Usuário Sugerindo Mudança
1. Visualiza ponto existente
2. Clica em "Sugerir mudança"
3. Preenche campos que deseja alterar
4. Sugestão vai para fila de aprovação do admin

### 4. Admin Gerenciando Sistema
1. Faz login como admin
2. Acessa painel administrativo
3. Gerencia pontos pendentes, sugestões e usuários
4. Pode ocultar pontos problemáticos
5. Executa limpeza de cache quando necessário

## 📁 Estrutura do Projeto

```
├── index.html                 # Página principal
├── admin.html                 # Painel administrativo
├── database/                  # Arquivos de dados JSON
├── src/
│   ├── css/
│   │   ├── main.css          # Estilos principais
│   │   ├── admin.css         # Estilos do admin
│   │   ├── components.css    # Componentes e ações do usuário
│   │   └── colors.css        # Paleta de cores
│   ├── js/
│   │   ├── app.js           # Aplicação principal
│   │   ├── auth.js          # Sistema de autenticação
│   │   ├── database.js      # Gerenciador de banco de dados
│   │   ├── map.js           # Gerenciador do mapa
│   │   ├── admin.js         # Funcionalidades administrativas
│   │   ├── info-panel.js    # Painel lateral de informações
│   │   └── theme.js         # Gerenciador de temas
│   └── components/
│       ├── modal.js         # Modais genéricos
│       ├── login-modal.js   # Modal de login
│       └── cache-clean-modal.js # Modal de limpeza de cache
```

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Mapa**: Leaflet.js
- **Ícones**: Font Awesome
- **Armazenamento**: localStorage (simulando banco JSON)
- **Arquitetura**: Clean Code, padrão MVC
- **Responsividade**: CSS Grid, Flexbox, Media Queries

## 🚀 Como Executar

1. **Clone o repositório**
   ```bash
   git clone [seu-repositorio]
   cd sig-entretenimento-df
   ```

2. **Inicie um servidor local**
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx serve .
   
   # PHP
   php -S localhost:8000
   ```

3. **Acesse no navegador**
   - Site principal: `http://localhost:8000`
   - Painel admin: `http://localhost:8000/admin.html`

## 🎨 Características Técnicas

### Clean Code
- Nomenclaturas claras e consistentes
- Separação de responsabilidades
- Código modular e reutilizável
- Comentários relevantes onde necessário
- Arquitetura escalável

### Responsividade
- Design mobile-first
- Breakpoints otimizados
- Touch-friendly em dispositivos móveis
- Interface adaptativa

### Performance
- Carregamento lazy de dados
- Cache inteligente
- Otimização de imagens e recursos
- Compressão de assets

### Segurança Básica
- Validação de entrada de dados
- Sanitização de conteúdo
- Controle de acesso por perfis
- Sessões com timeout

## 🔄 Funcionalidades em Desenvolvimento

- [ ] Sistema de comentários e avaliações
- [ ] Integração com APIs externas (clima, trânsito)
- [ ] Notificações push
- [ ] Sistema de rotas GPS
- [ ] Chat entre usuários
- [ ] Sistema de badges e gamificação

## 🐛 Solução de Problemas

### Problema: Dados não aparecem
- Verifique se o servidor está rodando
- Limpe o cache do navegador (F5 ou Ctrl+Shift+R)
- Use o modal de limpeza de cache no painel admin

### Problema: Login não funciona
- Verifique as credenciais: `admin/admin` ou `user/user`
- Limpe o localStorage do navegador
- Recarregue a página

### Problema: Mapa não carrega
- Verifique conexão com internet (Leaflet CDN)
- Verifique console do navegador para erros
- Teste em modo incógnito

## 📝 Licença

Este projeto é livre para uso educacional e demonstrativo.

## 👥 Contribuições

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para o Distrito Federal**
