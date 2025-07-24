# Sistema de Imagens dos Pontos

Este sistema permite associar imagens aos pontos de entretenimento através de duas fontes principais: URLs da web ou arquivos locais do servidor.

## Estrutura de Dados da Imagem

Cada ponto pode ter uma propriedade `imagem` com a seguinte estrutura:

```json
{
    "imagem": {
        "url": "URL_OU_CAMINHO_DA_IMAGEM",
        "source": "web" | "local",
        "description": "Descrição da imagem",
        "addedAt": "2025-07-23T10:00:00.000Z"
    }
}
```

## Tipos de Fonte

### 1. Imagens da Web (`source: "web"`)
- **URL**: Deve ser uma URL completa (http:// ou https://)
- **Exemplo**: `https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=400`
- **Vantagens**: Não ocupa espaço no servidor, sempre disponível
- **Desvantagens**: Dependente de conexão externa

### 2. Imagens Locais (`source: "local"`)
- **Caminho**: Deve ser um caminho relativo à raiz do projeto
- **Exemplo**: `/assets/images/estadio-nacional.jpg`
- **Vantagens**: Controle total, sem dependência externa
- **Desvantagens**: Ocupa espaço no servidor

## Métodos Disponíveis no DatabaseManager

### `updatePointImage(pontoId, imageData)`
Adiciona ou atualiza a imagem de um ponto.

```javascript
const imageData = {
    url: 'https://example.com/image.jpg',
    source: 'web',
    description: 'Descrição da imagem'
};

const success = databaseManager.updatePointImage(1, imageData);
```

### `removePointImage(pontoId)`
Remove a imagem de um ponto.

```javascript
const success = databaseManager.removePointImage(1);
```

### `getPointImage(pontoId)`
Obtém as informações da imagem de um ponto.

```javascript
const imageInfo = databaseManager.getPointImage(1);
// Retorna: { url, source, description, addedAt } ou null
```

### `validateImageUrl(url, source)`
Valida se uma URL/caminho de imagem é válido.

```javascript
const isValid = databaseManager.validateImageUrl('/assets/image.jpg', 'local');
```

## Exemplos de Uso

### Adicionando um ponto com imagem web
```javascript
const pontoDados = {
    nome: 'Teatro Nacional',
    categoria: 'cultura',
    coordenadas: [-15.796, -47.878],
    imagem: {
        url: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=400',
        source: 'web',
        description: 'Teatro Nacional de Brasília'
    }
};

databaseManager.adicionarPonto(pontoDados, 'administrator', 'admin');
```

### Adicionando um ponto com imagem local
```javascript
const pontoDados = {
    nome: 'Estádio Nacional',
    categoria: 'esportes',
    coordenadas: [-15.783, -47.899],
    imagem: {
        url: '/assets/images/estadio-nacional.jpg',
        source: 'local',
        description: 'Estádio Nacional - Mané Garrincha'
    }
};

databaseManager.adicionarPonto(pontoDados, 'administrator', 'admin');
```

## Estrutura de Pastas Recomendada

```
assets/
├── images/
│   ├── pontos/
│   │   ├── teatro-nacional.jpg
│   │   ├── estadio-nacional.jpg
│   │   └── ...
│   └── categorias/
│       ├── cultura.jpg
│       ├── esportes.jpg
│       └── ...
```

## Validações Implementadas

1. **URL Web**: Deve começar com http:// ou https://
2. **Caminho Local**: Deve ser um caminho válido (/, ./, ../, assets/, etc.)
3. **Source**: Deve ser exatamente "web" ou "local"
4. **Campos obrigatórios**: url e source são obrigatórios

## Migração de Dados Existentes

O sistema é retrocompatível. Pontos existentes sem imagem continuarão funcionando normalmente. Para adicionar imagens a pontos existentes, use:

```javascript
// Atualizar ponto existente com imagem
databaseManager.updatePointImage(pontoId, {
    url: 'caminho/para/imagem.jpg',
    source: 'local',
    description: 'Descrição da imagem'
});
```
