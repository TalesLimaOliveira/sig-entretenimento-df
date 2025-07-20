---
mode: agent
---

Refatore, reorganize e padronize **todo o projeto** conforme as diretrizes definidas no arquivo `.github/copilot-instructions.md`. Siga todos os padrões e boas práticas, aplicando as seguintes instruções:

---

## Objetivos

### 1. Refatoração e Organização Global
- Garanta que **todo o código do projeto esteja limpo, organizado e padronizado**.
- Aplique boas práticas de desenvolvimento, eliminando:
  - Códigos duplicados
  - Gambiarras ou workarounds temporários
  - Lógicas confusas ou mal estruturadas
- **Remova arquivos, módulos, funções ou imports não utilizados**.

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
- Atualize os arquivos de forma que **representem corretamente o código real**.
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

## Restrições Finais

- **Remova qualquer código, dependência, arquivo, asset ou trecho que não esteja sendo utilizado.**
- Não crie changelogs ou listas de alterações manuais.
- Não insira elementos visuais, mensagens ou arquivos desnecessários.
- Toda a resposta deve ser em **português**.

**Escopo de aplicação**: O projeto inteiro, incluindo todos os arquivos de código e documentação existentes.