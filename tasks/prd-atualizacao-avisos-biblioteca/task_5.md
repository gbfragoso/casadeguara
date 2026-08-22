# Tarefa 5.0: Integrar o mural de avisos ao painel

## Visão geral

Substituir a consulta duplicada do painel por `AvisoModel.listRecent` e entregar PageData totalmente resolvido, preservando as consultas, valores e apresentação dos indicadores de empréstimos, devoluções e renovações.

## Dependências e desbloqueios

- **Depende de:** 1.0, 2.0
- **Motivo:** O painel requer a guarda tipada da tarefa 1.0 e a listagem determinística do modelo da tarefa 2.0.
- **Desbloqueia:** 6.0

## Conformidade

### Skills aplicáveis

- `svelte-core-bestpractices`
- `impeccable`
- `javascript`
- `drizzle-postgres`
- `vitest`
- `no-workarounds`

### AGENTS.md e rules

Ler e aplicar `AGENTS.md` e todas as rules em `.agents/rules/` antes da implementação. Carregar as skills exigidas para Svelte/SvelteKit, TypeScript e consultas PostgreSQL. Preservar as queries de indicadores fora do modelo de avisos, iniciar fontes independentes em paralelo, testar resultados observáveis e concluir o gate de `verification.md`. Não há desvio previsto.

## Requisitos relacionados

- RF3
- RF4
- RF7
- RF11
- RF12
- RF18–RF20
- RF23
- Somente a consulta de avisos sai do adapter; os indicadores permanecem com o contrato atual.
- Nenhuma rejeição pode escapar em uma promise retornada como PageData ou produzir dados parciais.

## Subtarefas

- [x] 5.1 Extrair a orquestração do load do painel para a factory e os contratos de fontes definidos em `techspec.md`.
- [x] 5.2 Consumir `AvisoModel.listRecent`, manter as queries atuais dos indicadores e aguardar todas as fontes com `Promise.all` na fronteira de erro.
- [x] 5.3 Adaptar o painel para valores resolvidos, preservando rótulos, cálculos, ordem dos avisos e apresentação existente.
- [x] 5.4 Implementar TU-09 para autorização, concorrência, contrato dos indicadores, modelo de avisos e falha sem PageData parcial.
- [x] 5.5 Implementar o teste SSR do painel previsto no mapa de arquivos da TechSpec para o mural e os três indicadores.
- [x] 5.6 Executar TU-09 e o teste de renderização do painel com os menores alvos Vitest aplicáveis.
- [x] 5.7 Executar `rtk npm run check`, `rtk npm test` e `rtk npm run lint` como gate da tarefa.

## Detalhes de implementação

Seguir as seções **Arquitetura do sistema → Visão dos componentes / Interface Svelte**, **Design de implementação → Principais interfaces**, a linha de contrato de `GET /biblioteca` e **Considerações técnicas → Loads resolvidos** de `techspec.md`.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-08
- CA-13
- CA-14
- CA-20

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-09 — orquestra o painel sem duplicar consulta de avisos

### Testes de integração (se aplicável)

Não se aplica.

### Testes E2E (se aplicável)

Não se aplica.

## Arquivos relevantes

- `src/routes/(protected)/biblioteca/+page.server.ts`
- `src/routes/(protected)/biblioteca/+page.svelte`
- `src/lib/server/authorization/biblioteca.ts`
- `src/lib/server/models/aviso.ts`
- `src/lib/database/schema.ts` (reutilizado para os indicadores; sem alteração prevista)
- `tests/unit/routes/protected/biblioteca/dashboard-page-server.test.ts` (novo)
- `tests/unit/routes/protected/biblioteca/dashboard-page-svelte.test.ts` (novo)
