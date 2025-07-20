---
mode: agent
---

Refatore, reorganize e padronize **todo o projeto** conforme as diretrizes definidas no arquivo `.github/copilot-instructions.md`. Siga todos os padrões e boas práticas, aplicando as instruções a seguir:

---

## Idioma

- **Todo o código, incluindo nomes de variáveis, funções, classes, componentes e arquivos, deve ser escrito em inglês.**
- **Todas as respostas, comentários no código e documentação devem ser escritas em português.**

## Objetivos

### 1. Refatoração e Organização Global
- Garanta que **todo o código do projeto esteja limpo, organizado e padronizado**.
- Aplique boas práticas de desenvolvimento, eliminando:
  - Códigos duplicados
  - Gambiarras ou workarounds temporários
  - Lógicas confusas ou mal estruturadas
- **Remova arquivos, módulos, funções ou imports não utilizados.**
- **Remova todos os comentários desnecessários ou obsoletos** que não agregam contexto relevante ao código.

### 2. Convenções de Nomenclatura
- Todos os nomes de variáveis, funções e arquivos devem estar em **inglês**.
- Aplique a seguinte padronização:
  - **PascalCase** para nomes de componentes, interfaces e aliases de tipo.
  - **camelCase** para funções, métodos e variáveis.
  - Prefixo com `_` para membros privados.
  - **ALL_CAPS** para constantes.

### 3. Tratamento de Erros
- Utilize blocos `try/catch` para operações assíncronas.
- Registre erros com mensagens contextuais (sem emotes no console).

---

## 4. Atualização da Documentação

### Documentação localizada em `/docs`
- Leia toda a documentação atual da pasta `/docs`.
- Atualize os arquivos para que **representem corretamente o código real**.
- Mantenha o **formato e padrão atual de escrita**, sem criar novas estruturas.
- Descreva:
  - O que cada módulo/função/componente faz.
  - Onde é usado.
  - Como interage com outras partes do sistema.

**Não altere o `README.md`** neste processo.

---

## 5. Regras e Restrições Visuais

- Não adicionar alertas temporários, console extras ou prints com emojis.
- Evite usar estilos inline ou fixos — utilize a paleta de cores/temas definidos.
- Use os temas disponíveis via sistema de paleta de cores, quando aplicável.
- Não colapsar componentes de UI — mantenha layout consistente e responsivo.

---

## 6. Marcação de Pendências no Código

- Identifique todas as **funções ainda não implementadas** ou parcialmente concluídas.
- Em cada ponto, adicione o comentário `// !TODO: (descrição clara da tarefa que falta implementar)`.
- Gere automaticamente um arquivo `PENDENCIAS.md` na raiz do projeto com:
  - Nome da função
  - Caminho completo do arquivo onde ela se encontra
  - Breve descrição da pendência ou comportamento esperado

---

## Restrições Finais

- **Remova qualquer código, dependência, arquivo, asset ou trecho que não esteja sendo utilizado.**
- **Não gere arquivos `.md` de changelog ou listas de alteração.**
- **Não insira elementos visuais, mensagens ou arquivos desnecessários.**
- Toda a resposta deve ser em **português**.

**Escopo de aplicação:** O projeto inteiro, incluindo todos os arquivos de código e documentação existentes.