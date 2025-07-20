---
applyTo: '**'
---

# Copilot Instructions — Padrão de Qualidade e Documentação

## Idioma

- **Todo o código, incluindo nomes de variáveis, funções, classes, componentes e arquivos, deve ser escrito em inglês.**
- **Todas as respostas, comentários no código e documentação devem ser escritas em português.**

---

## Boas Práticas de Desenvolvimento

1. **Código Limpo e Manutenível**
   - Use boas práticas de programação e clean code.
   - Evite gambiarras, lógicas confusas e soluções temporárias.
   - Prefira modularização e reaproveitamento de código.
   - Escreva funções pequenas, coesas e com responsabilidade única.

2. **Tratamento de Erros**
   - Utilize blocos `try/catch` para todas as operações assíncronas e de risco.
   - Sempre registre erros com **informações contextuais úteis** (ex: nome da função, parâmetros, estado local).

3. **Convenções de Nomeação**
   - `PascalCase`: para Componentes, Classes, Interfaces e Aliases de Tipos.
   - `camelCase`: para Variáveis, Funções e Métodos.
   - `_camelCase`: para membros **privados** de classes (prefixo `_`).
   - `ALL_CAPS`: para constantes imutáveis.

4. **Uso de Emotes (Emojis)**
   - **Proibido o uso de emotes/emojis em prints do console ou logs.**
   - Permitido:
     - Em **documentação**, se **facilitarem a leitura e organização**.
     - Em **componentes de interface**, quando tiverem **função visual clara**.

---

## Documentação (pasta `/docs`)

1. **Leitura e Conformidade**
   - Sempre leia a documentação existente na pasta `/docs` antes de modificar qualquer código.
   - Siga estritamente o **padrão atual** de escrita, estrutura e formatação.
   - Não crie novos formatos ou estilos de documentação.

2. **Atualização Obrigatória**
   - Após qualquer modificação no código, **atualize imediatamente os arquivos em `/docs`** relacionados.
   - A documentação deve explicar:
     - O que cada função, classe ou componente faz.
     - Onde e como é usada.
     - Quais arquivos interagem com ela.

3. **Validação**
   - Verifique se o conteúdo da documentação corresponde ao código real.
   - Elimine inconsistências para que **a documentação sempre reflita o estado atual do sistema**.

---

## Restrições

- Não crie changelogs, listas de alterações ou registre datas nos arquivos de documentação.
- Não adicione elementos temporários como `alerts`, console extras ou testes visuais no código.
- Não aplique estilos inline fixos nem correções improvisadas (ex: `style="color:red"`).
- Não use gambiarras nem código duplicado.
- Não altere o `README.md` automaticamente (exceto quando explicitamente solicitado).

---

## Objetivo Final

Essas instruções visam garantir que o projeto mantenha um padrão elevado de qualidade, com:

- Código limpo, reutilizável, 100% em inglês.
- Documentação clara, objetiva, 100% em português.
- Estrutura compreensível por **qualquer desenvolvedor ou IA**.
- Facilidade para manutenção futura, escalabilidade e portabilidade para outras tecnologias (como React Native, etc).
