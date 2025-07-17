# 📍 Como Criar Novos Pontos

> **Guia completo para adicionar novos locais de entretenimento ao mapa**

## 📋 Visão Geral

Este guia explica como adicionar novos pontos de entretenimento ao sistema, tanto através da interface web quanto programaticamente. O processo varia dependendo do seu nível de acesso (usuário comum ou administrador).

## 👨‍💼 Para Administradores - Interface Web

### 🔑 1. Acesso ao Sistema

1. Acesse a página de administração: `http://localhost:8000/admin.html`
2. Faça login com as credenciais de administrador:
   - **Usuário**: `admin`
   - **Senha**: `admin123`

### 📍 2. Adicionando Pontos pelo Mapa

#### **Método 1: Clique no Mapa**

1. **Navegue** até a localização desejada no mapa
2. **Clique** no local exato onde deseja adicionar o ponto
3. Um **modal** será aberto automaticamente com o formulário
4. **Preencha** as informações solicitadas
5. **Clique** em "Salvar Ponto"

#### **Método 2: Botão Adicionar**

1. **Clique** no botão "➕ Adicionar Ponto" no menu superior
2. **Selecione** a localização no mapa
3. **Preencha** o formulário que aparecerá
4. **Confirme** a criação do ponto

### 📝 3. Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| **Nome*** | Texto | Nome do estabelecimento | "Restaurante Olivae" |
| **Categoria*** | Seleção | Tipo do local | "Restaurantes" |
| **Endereço*** | Texto | Endereço completo | "CLN 201 - Asa Norte" |
| **Descrição*** | Texto | Descrição detalhada | "Restaurante italiano sofisticado" |

### 📋 4. Campos Opcionais

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| **Telefone** | Texto | Contato telefônico | "(61) 3340-8120" |
| **Website** | URL | Site oficial | "https://olivae.com.br" |
| **Horário** | Texto | Funcionamento | "12h às 15h, 19h às 23h" |
| **Preço** | Texto | Faixa de preço | "R$ 80-120" |
| **Avaliação** | Número | Nota de 1 a 5 | 4.5 |
| **Tags** | Lista | Palavras-chave | "italiano, sofisticado, jantar" |

### 🎯 5. Validações Automáticas

O sistema valida automaticamente:

- ✅ **Nome**: Mínimo 3 caracteres
- ✅ **Categoria**: Deve ser uma categoria válida
- ✅ **Coordenadas**: Dentro dos limites do DF
- ✅ **Website**: Formato de URL válido
- ✅ **Telefone**: Formato brasileiro válido
- ✅ **Avaliação**: Entre 1 e 5

## 💻 Para Desenvolvedores - Programaticamente

### 🔧 1. Usando a Classe DatabaseManager

```javascript
// Importar o gerenciador de banco
import { DatabaseManager } from './src/js/database.js';

// Inicializar
const db = new DatabaseManager();

// Criar novo ponto
const novoPonto = await db.criarPonto({
    nome: "Novo Restaurante",
    categoria: "restaurantes",
    coordenadas: [-15.800000, -47.900000],
    endereco: "SQN 123 - Asa Norte",
    descricao: "Descrição detalhada do local",
    telefone: "(61) 1234-5678",
    website: "https://exemplo.com.br",
    horario: "11h às 23h",
    preco: "R$ 40-60",
    avaliacao: 4.2,
    tags: ["brasileiro", "caseiro", "almoço"]
});

console.log("Ponto criado:", novoPonto);
```

### 🌐 2. Usando a API REST

#### **POST /pontos**

```javascript
// Criar novo ponto via API
const dadosPonto = {
    nome: "Novo Ponto",
    categoria: "restaurantes",
    coordenadas: [-15.800000, -47.900000],
    endereco: "Endereço completo",
    descricao: "Descrição do local",
    telefone: "(61) 1234-5678",
    website: "https://site.com",
    horario: "10h às 22h",
    preco: "R$ 50-80",
    avaliacao: 4.0,
    tags: ["tag1", "tag2"],
    ativo: true
};

const response = await fetch('http://localhost:3000/pontos', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify(dadosPonto)
});

const novoPonto = await response.json();
```

### 📦 3. Estrutura de Dados Completa

```json
{
  "id": 11,
  "nome": "Nome do Estabelecimento",
  "categoria": "restaurantes",
  "coordenadas": [-15.794700, -48.105200],
  "endereco": "Endereço completo com CEP",
  "descricao": "Descrição detalhada do local e suas características",
  "telefone": "(61) 1234-5678",
  "website": "https://site-oficial.com.br",
  "horario": "Segunda a Sexta: 10h às 22h, Sábado e Domingo: 8h às 24h",
  "preco": "R$ 25-50 (por pessoa)",
  "avaliacao": 4.3,
  "tags": ["italiano", "família", "romântico", "estacionamento"],
  "imagem": "https://exemplo.com/imagem.jpg",
  "ativo": true,
  "dataCriacao": "2025-01-17T10:30:00.000Z",
  "dataAtualizacao": "2025-01-17T10:30:00.000Z",
  "criadoPor": "admin",
  "metadata": {
    "views": 0,
    "likes": 0,
    "verificado": false
  }
}
```

## 🏗️ Categorias Disponíveis

### 📂 Lista de Categorias Válidas

```javascript
const categorias = [
    {
        id: 'restaurantes',
        nome: 'Restaurantes',
        icone: '🍽️',
        cor: '#FF6B6B',
        subcategorias: ['italiano', 'brasileiro', 'japonês', 'fast-food']
    },
    {
        id: 'shopping',
        nome: 'Shopping',
        icone: '🛍️',
        cor: '#4ECDC4',
        subcategorias: ['mall', 'outlet', 'mercado', 'feira']
    },
    {
        id: 'parques',
        nome: 'Parques',
        icone: '🌳',
        cor: '#45B7D1',
        subcategorias: ['urbano', 'ecológico', 'aquático', 'temático']
    },
    {
        id: 'cultura',
        nome: 'Cultura',
        icone: '🎭',
        cor: '#96CEB4',
        subcategorias: ['museu', 'teatro', 'cinema', 'biblioteca']
    },
    {
        id: 'vida-noturna',
        nome: 'Vida Noturna',
        icone: '🌙',
        cor: '#FFEAA7',
        subcategorias: ['bar', 'balada', 'pub', 'karaoke']
    }
];
```

### ➕ Adicionando Nova Categoria

```javascript
// Para administradores - via código
const novaCategoria = {
    id: 'esportes',
    nome: 'Esportes',
    icone: '⚽',
    cor: '#FF9F43',
    descricao: 'Locais para prática esportiva',
    subcategorias: ['futebol', 'academia', 'natação', 'tênis']
};

await db.criarCategoria(novaCategoria);
```

## 🔍 Validação e Qualidade dos Dados

### ✅ Checklist de Qualidade

Antes de adicionar um ponto, verifique:

- [ ] **Nome único** (não duplicar estabelecimentos)
- [ ] **Coordenadas precisas** (usar GPS ou mapa detalhado)
- [ ] **Categoria correta** (escolher a mais apropriada)
- [ ] **Endereço completo** (incluir CEP se possível)
- [ ] **Descrição informativa** (mínimo 20 caracteres)
- [ ] **Informações atualizadas** (horários, telefones, websites)
- [ ] **Tags relevantes** (facilitar busca)

### 🛡️ Validações Automáticas

O sistema aplica as seguintes validações:

```javascript
const validacoes = {
    nome: {
        minLength: 3,
        maxLength: 100,
        pattern: /^[a-zA-ZÀ-ÿ0-9\s\-&.]+$/
    },
    telefone: {
        pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
        exemplo: "(61) 99999-9999"
    },
    website: {
        pattern: /^https?:\/\/.+/,
        exemplo: "https://exemplo.com.br"
    },
    coordenadas: {
        latitude: { min: -16.5, max: -15.3 },  // Limites do DF
        longitude: { min: -48.5, max: -47.2 }
    },
    avaliacao: {
        min: 1,
        max: 5,
        step: 0.1
    }
};
```

## 📊 Monitoramento e Estatísticas

### 📈 Acompanhar Pontos Criados

```javascript
// Estatísticas dos pontos
const stats = await db.obterEstatisticas();

console.log({
    totalPontos: stats.total,
    porCategoria: stats.porCategoria,
    pontosRecentes: stats.ultimaSemana,
    maisVisitados: stats.topViews
});
```

### 📝 Log de Atividades

Todas as ações são registradas:

```javascript
// Visualizar logs
const logs = await db.obterLogs({
    acao: 'CREATE_PONTO',
    usuario: 'admin',
    dataInicio: '2025-01-01',
    dataFim: '2025-01-31'
});
```

## 🚨 Troubleshooting

### ❌ Problemas Comuns

#### **Erro: "Coordenadas inválidas"**
```
Solução: Verifique se as coordenadas estão dentro dos limites do DF:
- Latitude: entre -16.5 e -15.3
- Longitude: entre -48.5 e -47.2
```

#### **Erro: "Categoria não encontrada"**
```
Solução: Use uma das categorias válidas:
- restaurantes
- shopping  
- parques
- cultura
- vida-noturna
```

#### **Erro: "Nome já existe"**
```
Solução: Verifique se não há outro estabelecimento com o mesmo nome.
Use variações como "Restaurante X - Asa Norte" se necessário.
```

#### **Erro: "Falha na autenticação"**
```
Solução: Verifique se você está logado como administrador:
1. Acesse /admin.html
2. Faça login novamente
3. Tente criar o ponto novamente
```

## 🔄 Workflow Completo

### 📋 Processo Recomendado

1. **Planejamento**
   - Definir categoria do ponto
   - Coletar informações completas
   - Verificar localização exata

2. **Coleta de Dados**
   - Nome oficial do estabelecimento
   - Endereço completo
   - Informações de contato
   - Horários de funcionamento
   - Características especiais

3. **Criação no Sistema**
   - Login como administrador
   - Navegar até a localização
   - Clicar no mapa ou usar botão
   - Preencher formulário completo
   - Revisar informações

4. **Validação**
   - Testar se o ponto aparece no mapa
   - Verificar popup com informações
   - Confirmar categoria correta
   - Testar filtros

5. **Documentação**
   - Registrar o novo ponto adicionado
   - Informar equipe sobre novos locais
   - Atualizar estatísticas

## 📞 Suporte

Precisa de ajuda para criar pontos?

- 📧 **Email**: suporte@pontosdf.com.br
- 💬 **Chat**: Disponível no sistema
- 📱 **WhatsApp**: (61) 99999-9999
- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-usuario/pontos-entretenimento-df/issues)

---

<div align="center">

**📍 Agora você está pronto para adicionar novos pontos ao mapa!**

[🏠 Voltar ao README Principal](../README.md) | [📚 Ver Documentação da API](API.md)

</div>
