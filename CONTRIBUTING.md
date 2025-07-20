# 🤝 Guia de Contribuição - SIG Entretenimento DF

## Como Contribuir

Agradecemos seu interesse em contribuir para o projeto! Este documento fornece diretrizes para garantir contribuições de qualidade e consistência com a arquitetura existente.

## 🎯 Tipos de Contribuição

### 1. Correções de Bugs
- Reporte bugs através das Issues
- Inclua passos para reproduzir o problema
- Forneça informações do ambiente (navegador, OS, etc.)

### 2. Novas Funcionalidades
- Discuta a funcionalidade em uma Issue antes de implementar
- Siga os padrões arquiteturais existentes
- Mantenha compatibilidade com código existente

### 3. Melhorias de Performance
- Identifique gargalos específicos
- Mantenha a funcionalidade existente
- Inclua testes de performance quando possível

### 4. Documentação
- Melhore comentários no código
- Atualize documentação técnica
- Adicione exemplos práticos

## 🏗️ Padrões de Desenvolvimento

### Estrutura de Código

#### Classes e Métodos
```javascript
/**
 * Descrição clara da classe/método
 * 
 * @param {tipo} parametro - Descrição
 * @returns {tipo} Descrição do retorno
 * 
 * Usado por: Lista de componentes
 * Dependências: Lista de dependências
 */
```

#### Nomenclatura
- **Classes**: PascalCase (`MapManager`)
- **Métodos/Variáveis**: camelCase (`adicionarMarcador`)
- **Constantes**: UPPER_SNAKE_CASE (`DEFAULT_ZOOM`)
- **CSS**: kebab-case (`nav-btn`)

#### Organização de Métodos
1. Constructor
2. Métodos de inicialização
3. Métodos públicos principais
4. Métodos de configuração
5. Métodos utilitários privados (prefixo `_`)
6. Métodos de limpeza

### Tratamento de Erros
```javascript
try {
    console.log('🔄 Iniciando operação...');
    
    // Validações
    if (!parametro) {
        throw new Error('Parâmetro obrigatório');
    }
    
    // Lógica principal
    const resultado = await operacao();
    
    console.log('✅ Operação concluída');
    return resultado;
    
} catch (error) {
    console.error('❌ Erro:', error);
    throw error;
}
```

### CSS e Responsividade
```css
/* Usar variáveis CSS */
:root {
    --primary-color: #007bff;
    --spacing-md: 1rem;
}

/* Mobile-first */
.component {
    /* Estilos base para mobile */
}

@media (min-width: 768px) {
    .component {
        /* Ajustes para desktop */
    }
}
```

## 🔧 Processo de Contribuição

### 1. Preparação
```bash
# Fork do repositório
git clone https://github.com/seu-usuario/sig-entretenimento-df.git
cd sig-entretenimento-df

# Criar branch para sua feature
git checkout -b feature/nome-da-feature
```

### 2. Desenvolvimento
- Siga os padrões estabelecidos
- Teste localmente com `python -m http.server 8000`
- Verifique responsividade em diferentes tamanhos
- Teste em diferentes navegadores

### 3. Validação
- [ ] Código segue padrões de nomenclatura
- [ ] Métodos estão documentados
- [ ] Tratamento de erros implementado
- [ ] Funciona em mobile e desktop
- [ ] Não quebra funcionalidades existentes

### 4. Commit e Push
```bash
# Commits descritivos
git add .
git commit -m "feat: adicionar funcionalidade X"
git push origin feature/nome-da-feature
```

### 5. Pull Request
- Descreva claramente as mudanças
- Referencie Issues relacionadas
- Inclua screenshots se relevante
- Aguarde review

## 📋 Checklist de Qualidade

### Para Funcionalidades
- [ ] Funcionalidade testada manualmente
- [ ] Responsividade verificada
- [ ] Compatibilidade com diferentes usuários (visitor, user, admin)
- [ ] Tratamento de erros implementado
- [ ] Logs apropriados adicionados
- [ ] Documentação atualizada

### Para Correções
- [ ] Bug reproduzido e identificado
- [ ] Correção não afeta outras funcionalidades
- [ ] Teste de regressão realizado
- [ ] Causa raiz documentada

### Para CSS
- [ ] Usa variáveis CSS existentes
- [ ] Segue padrão mobile-first
- [ ] Testado em diferentes tamanhos de tela
- [ ] Não usa `!important` desnecessariamente
- [ ] Classes nomeadas consistentemente

## 🎨 Padrões de Interface

### Cores e Temas
- Use variáveis definidas em `colors.css`
- Mantenha suporte ao tema escuro
- Garanta contraste adequado para acessibilidade

### Componentes
- Reutilize componentes existentes quando possível
- Mantenha consistência visual
- Implemente estados hover/active/disabled

### Responsividade
- Teste em pelo menos 3 tamanhos: mobile (320px), tablet (768px), desktop (1200px)
- Use unidades relativas (rem, %, vh, vw)
- Considere orientação landscape em mobile

## 🚫 O Que Evitar

### Anti-Padrões
- ❌ Código duplicado
- ❌ Métodos com mais de 50 linhas
- ❌ Classes com mais de 500 linhas
- ❌ Variáveis globais desnecessárias
- ❌ Event listeners sem cleanup
- ❌ Estilos inline
- ❌ Uso excessivo de `!important`

### Dependências
- ❌ Não adicione bibliotecas desnecessárias
- ❌ Evite CDNs não confiáveis
- ❌ Não modifique bibliotecas externas

## 🔍 Processo de Review

### Critérios de Aprovação
1. **Funcionalidade**: Funciona conforme especificado
2. **Qualidade**: Segue padrões estabelecidos
3. **Performance**: Não degrada performance existente
4. **Compatibilidade**: Funciona em diferentes contextos
5. **Documentação**: Adequadamente documentado

### Feedback
- Seja construtivo e específico
- Sugira melhorias quando possível
- Reconheça boas práticas implementadas

## 🎓 Recursos para Contribuidores

### Documentação Técnica
- [Arquitetura](docs/architecture.md)
- [Guia de Desenvolvimento](docs/development-guide.md)
- [Fluxos de Dados](docs/data-flow.md)
- [Migração](docs/migration-guide.md)

### Ferramentas Recomendadas
- **Editor**: VS Code com extensões JavaScript/CSS
- **Browser DevTools**: Para debug e performance
- **Responsive Design Mode**: Para testar responsividade

## 📞 Suporte

### Dúvidas Técnicas
- Abra uma Issue com tag `question`
- Consulte a documentação existente
- Verifique Issues anteriores

### Discussões
- Use Discussions para ideias gerais
- Issues para problemas específicos
- Pull Requests para implementações

---

**Obrigado por contribuir! 🚀**

Sua contribuição ajuda a tornar o projeto melhor para toda a comunidade.
