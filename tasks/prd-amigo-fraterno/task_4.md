# Tarefa 4.0: Criar consulta de elegibilidade e página de conferência

## Visão geral

Criar uma única origem para a regra de elegibilidade e entregar a página de conferência do Amigo Fraterno. A lista deve ser ordenada, leve e atual a cada carregamento, informar total e fotos pendentes e orientar alterações pela tela de Cadastros.

## Dependências e desbloqueios

- **Depende de:** 2.0
- **Motivo:** A consulta exige o schema e as projeções persistentes da tarefa 2.0; depois disso, pode ser executada em paralelo à tarefa 3.0.
- **Desbloqueia:** 5.0, 6.0

## Conformidade

### Skills aplicáveis

- `drizzle-postgres` — predicado de elegibilidade, ordenação e projeções estreitas sem `bytea` na UI.
- `javascript` — DTOs e módulos server-only tipados.
- `svelte-core-bestpractices` — página Svelte 5 responsiva, acessível e sem estado derivado redundante.
- `vitest` — testes de combinações do predicado, projeção e page load.
- `no-workarounds` — uma única regra reutilizada pelas projeções de tela e PDF.
### AGENTS.md e rules

Foram lidos o `AGENTS.md`, `.agents/rules/code-standards.md` e `.agents/rules/tests.md`. A página e o servidor permanecem no monólito SvelteKit protegido. Carregar as skills obrigatórias de Svelte/SvelteKit e TypeScript antes de editar. Manter arquivos pequenos, projeções explícitas e cobertura de 100% para o predicado de elegibilidade, com todas as combinações e valores `NULL` exercitados.

Não há desvios justificados.
## Requisitos relacionados

- RF6 e RF7: adicionar o menu “Amigo Fraterno” e a rota `/secretaria/amigofraterno` para usuários da Secretaria.
- RF8: considerar elegível somente `amigo_fraterno = true`, `trab = true` e `desencarnado = false`.
- RF9: refletir mudanças na próxima carga sem apagar a flag quando as demais condições mudarem.
- RF10: exibir total e identificar participantes sem foto sem carregar os bytes.
- RF11: orientar alterações pela tela de Cadastros e não fornecer mutações na nova página.
- RF18: apresentar estado vazio textual e deixar preparada a indisponibilidade do download vazio.

## Subtarefas

- [x] 4.1 Criar os DTOs e a função única de consulta com projeções de resumo e PDF.
- [x] 4.2 Implementar o predicado completo, exclusão de `NULL` e ordenação por `unaccent(nome)` com desempate por `idleitor`.
- [x] 4.3 Garantir que a projeção da página retorne apenas `id`, `name` e `hasPhoto`, sem selecionar `foto`.
- [x] 4.4 Criar o page load autorizado com `participants`, `total` e `withoutPhoto`.
- [x] 4.5 Adicionar o item de menu e a página responsiva com lista, pendências, estado vazio e link para Cadastros.
- [x] 4.6 Implementar e executar TI-05 e TI-06, cobrindo todas as combinações e o contrato leve da carga.

## Detalhes de implementação

Seguir `techspec.md` em “Consulta do Amigo Fraterno”, modelos `AmigoFraternoParticipant`, `AmigoFraternoPageData` e `AmigoFraternoPdfParticipant`, além de “Página do Amigo Fraterno”. A projeção com foto será consumida pela tarefa 5.0; o predicado não deve ser duplicado pelo gerador.

## Critérios de aceitação relacionados

- CA-04
- CA-05
- CA-06
- CA-07
- CA-12
- CA-14

## Testes da tarefa

### Testes de integração

- [x] TI-05 — Seleciona todas as combinações de elegibilidade
- [x] TI-06 — Lista total e pendências sem carregar bytes

## Arquivos relevantes

- `src/lib/server/amigo-fraterno/participants.ts`
- `src/lib/server/amigo-fraterno/participant-projections.ts`
- `src/routes/(protected)/secretaria/+layout.svelte`
- `src/routes/(protected)/secretaria/amigofraterno/+page.server.ts`
- `src/routes/(protected)/secretaria/amigofraterno/+page.svelte`
- `tests/unit/lib/server/amigo-fraterno/`
- `tests/integration/lib/server/models/cadastro/`
- `tests/unit/routes/protected/secretaria/`
