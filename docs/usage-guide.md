# Guia de Uso - SIG Entretenimento DF

## Como usar a aplicação

A aplicação **SIG Entretenimento DF** pode ser executada de duas formas equivalentes:

### 1. Via Servidor HTTP (Recomendado para desenvolvimento)

```bash
# Navegue até a pasta do projeto
cd "c:\Files\zPessoal\ifb\sig-entretenimento-df"

# Inicie o servidor Python
python -m http.server 8000
```

Depois acesse: `http://localhost:8000`

**Vantagens:**
- Carrega arquivos JSON dinâmicamente
- Funciona como um site real
- Permite atualizações dos dados sem modificar código
- Ideal para desenvolvimento e testes

### 2. Via Protocolo File:// (Funcional para demonstrações)

Simplesmente abra o arquivo `index.html` diretamente no navegador.

**Vantagens:**
- Não requer servidor
- Funciona offline
- Ideal para demonstrações rápidas

**Características:**
- Usa dados padrão incorporados no JavaScript
- Detecta automaticamente o protocolo `file://`
- Fornece experiência equivalente ao servidor HTTP

## Diferenças Técnicas Resolvidas

### ✅ Problema 1: Carregamento de Dados
- **HTTP:** Carrega dados via `fetch()` dos arquivos JSON
- **File:** Usa dados padrão incorporados no `database.js`
- **Solução:** Detecção automática de protocolo no método `loadJsonFile()`

### ✅ Problema 2: Ícones de Categorias
- **Antes:** Inconsistência entre campos `icone` (emojis) e `icon` (FontAwesome)
- **Depois:** Unificado para usar `icon` com classes FontAwesome
- **Resultado:** Ícones idênticos em ambos os protocolos

### ✅ Problema 3: Inicialização
- **Sistema:** Inicializador robusto que verifica dependências
- **Fallback:** Se carregamento JSON falha em file://, usa dados padrão
- **Garantia:** Aplicação funciona em ambos os cenários

## Status da Responsividade

### ✅ Desktop (> 945px)
- Menu completo com texto e ícones
- Mapa otimizado para tela grande

### ✅ Tablet (768px - 945px)
- Menu com ícones e tooltips
- Layout adaptado para touch

### ✅ Mobile (< 768px)
- Menu compacto apenas com ícones essenciais
- Mapa otimizado para dispositivos móveis
- Correções de overflow implementadas

## Arquivos Principais

- `index.html` - Página principal com sistema de inicialização
- `src/js/database.js` - Gerenciador de dados com suporte dual
- `src/js/app.js` - Aplicação principal com detecção de categoria
- `database/categorias.json` - Categorias com ícones FontAwesome
- `src/css/main.css` - Estilos responsivos consolidados

## Comandos Úteis

### Iniciar servidor de desenvolvimento:
```bash
python -m http.server 8000
```

### Verificar responsividade:
1. Abra DevTools (F12)
2. Ative simulação de dispositivos
3. Teste larguras: 480px, 768px, 945px, 1200px

### Depuração:
- Console mostra logs detalhados de inicialização
- Verificar se `DatabaseManager inicializado com sucesso`
- Confirmar detecção de protocolo correto

## Próximos Passos

1. ✅ Aplicação funciona igual em HTTP e file://
2. ✅ Ícones de categorias corrigidos
3. ✅ Responsividade implementada
4. ✅ Sistema de inicialização robusto

A aplicação está pronta para uso em ambos os protocolos com funcionalidade equivalente!
