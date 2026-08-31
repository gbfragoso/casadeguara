# Verificação final — confiabilidade-testes

Execução: 31/08/2026, Windows, `C:\Users\gbfra\Documents\casadeguara`, branch `update-tesouraria`.
Nenhum build de produção foi executado: `npm run build` é opt-in e não pertence ao gate desta tarefa.

## Ambiente

| Componente | Versão/evidência |
| --- | --- |
| Node.js / npm | v24.14.0 / 11.11.1 |
| Svelte / SvelteKit / Vite | 5.57.0 / 2.70.3 / 8.2.2 |
| Vitest / Playwright | 4.1.11 / 1.62.1 |
| agent-browser | 0.35.2, instalado como devDependency; execução bloqueada pelo Windows Device Guard (`spawn UNKNOWN`) |
| Drizzle ORM / Kit / TypeScript | 0.45.2 / 0.31.10 / 6.0.3 |
| Docker / Compose | Engine 29.6.1 / Compose v5.3.0 |
| PostgreSQL do Compose | 16.14-alpine, servidor `x86_64-pc-linux-musl`, container `postgres-dev`, healthcheck `healthy` |
| URL de teste | executor gerou um banco `casadeguara_test_<uuid>` por execução; nenhuma credencial foi registrada |

O executável `agent-browser` está instalado, mas `npx agent-browser --version` falhou com `spawn UNKNOWN` por bloqueio do
Windows Device Guard; `where.exe agent-browser` não encontrou arquivo fora de `node_modules/.bin`. As
jornadas foram executadas pelo Playwright configurado no projeto; URL, resposta HTTP, DOM/acessibilidade, console e
erros de página ficaram disponíveis nos resultados/traces do próprio Playwright. Não houve falha que exigisse
diagnóstico adicional.

## Fingerprint do banco persistente

Consulta somente leitura executada em `local` antes e depois do gate:

```sql
SELECT json_build_object(
  'tables', (SELECT count(*) FROM pg_class WHERE relkind = 'r'),
  'sequences', (SELECT count(*) FROM pg_class WHERE relkind = 'S'),
  'cadastros_max', (SELECT COALESCE(MAX(idleitor), 0) FROM cadastros),
  'leitor_seq_last', (SELECT last_value FROM leitor_idleitor_seq),
  'leitor_seq_called', (SELECT is_called FROM leitor_idleitor_seq)
)::text;
```

| Momento | Resultado |
| --- | --- |
| Antes | `{"tables":86,"sequences":13,"cadastros_max":32767,"leitor_seq_last":32933,"leitor_seq_called":true}` |
| Depois | `{"tables":86,"sequences":13,"cadastros_max":32767,"leitor_seq_last":32933,"leitor_seq_called":true}` |

Os fingerprints são idênticos. As suítes só escreveram nos bancos descartáveis emitidos pelo executor.

## Suítes repetidas

Cada linha foi executada com exit code 0; as durações são as informadas pelo runner da suíte (a duração externa inclui
healthcheck/provisionamento). As duas execuções de cada suíte foram feitas após a separação estrutural do teste de
identificador inteiro.

| Suíte | Execução 1 | Execução 2 | Resultado determinístico |
| --- | --- | --- | --- |
| `npm test` | 64 arquivos, 333 testes, 6,03 s | 64 arquivos, 333 testes, 6,13 s | Sim; 333/333 em ambas |
| `npm run test:integration` | 42 arquivos, 119 testes, 8,15 s | 42 arquivos, 119 testes, 7,73 s | Sim; 119/119 em ambas |
| `npm run test:e2e` | 21 testes, 34,1 s | 21 testes, 32,3 s | Sim; E2E-01–E2E-21 em ambas |

O Playwright manteve `timeout: 30_000`, `retries: 0`, `forbidOnly: true`, `fullyParallel: true` e
`trace: 'retain-on-failure'`. Nenhum teste foi ignorado. Os avisos de `NO_COLOR` são do ambiente; o único log de
aplicação observado foi o `Not found: /secretaria/amigofraterno/pdf` emitido pelo client durante o download, enquanto a
resposta HTTP do endpoint foi 200 e o caso E2E-13 passou. Não há falha de teste associada.

## Gate obrigatório

Executado após as alterações desta tarefa:

| Comando | Resultado |
| --- | --- |
| `npm run check` | aprovado; `svelte-check found 0 errors and 0 warnings` |
| `npm test` | aprovado; 64 arquivos, 333 testes, 6,62 s |
| `npm run lint` | aprovado; Prettier e ESLint sem diagnósticos em arquivos do escopo |

## Cobertura delimitada por arquivo

Comando executado (um include por runtime das tarefas 2.0, 3.0 e 4.0; segmentos dinâmicos escapados):

```text
npm run test:coverage --
  --coverage.include=src/lib/server/database/schema.ts
  --coverage.include=src/lib/server/pdf/amigo-fraterno/handler.ts
  --coverage.include=src/lib/server/database/functions.ts
  --coverage.include=src/routes/**/api/cadastros/+server.ts
  --coverage.include=src/routes/**/biblioteca/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/autores/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/autores/\[id=integer\]/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/autores/novo/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/avisos/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/avisos/\[id=integer\]/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/colecoes/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/colecoes/\[id=integer\]/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/colecoes/novo/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/editoras/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/editoras/\[id=integer\]/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/editoras/novo/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/keywords/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/keywords/\[id=integer\]/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/keywords/novo/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/leitores/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/leitores/\[id=integer\]/+page.server.ts
  --coverage.include=src/routes/**/biblioteca/leitores/novo/+page.server.ts
  --coverage.include=src/routes/**/secretaria/amigofraterno/+page.server.ts
  --coverage.include=src/routes/**/secretaria/amigofraterno/pdf/+server.ts
  --coverage.include=src/routes/**/secretaria/cadastros/+page.server.ts
  --coverage.include=src/routes/**/secretaria/cadastros/\[id=integer\]/+page.server.ts
  --coverage.include=src/routes/**/secretaria/cadastros/\[id=integer\]/foto/+server.ts
  --coverage.include=src/routes/**/secretaria/cadastros/\[id=integer\]/foto/original/+server.ts
  --coverage.include=src/routes/**/secretaria/cadastros/novo/+page.server.ts
  --coverage.include=src/routes/**/tesouraria/contribuintes/+page.server.ts
  --coverage.include=src/routes/**/tesouraria/contribuintes/\[id=integer\]/+page.server.ts
  --coverage.include=src/routes/**/tesouraria/contribuintes/novo/+page.server.ts
```

V8 encontrou os 32 includes no relatório; todos os quatro indicadores de cada arquivo superam 80% individualmente.
Os números estão na ordem statements / branches / functions / lines.

| Arquivo | Stmts | Branch | Funcs | Lines |
| --- | ---: | ---: | ---: | ---: |
| `src/lib/server/database/schema.ts` | 96,42% | 100% | 90% | 96,42% |
| `src/lib/server/pdf/amigo-fraterno/handler.ts` | 95% | 87,5% | 100% | 100% |
| `src/lib/server/database/functions.ts` | 100% | 100% | 100% | 100% |
| `src/routes/(protected)/api/cadastros/+server.ts` | 91,3% | 100% | 100% | 90,47% |
| `src/routes/(protected)/biblioteca/+page.server.ts` | 90,9% | 100% | 100% | 90,9% |
| `src/routes/(protected)/biblioteca/autores/+page.server.ts` | 90% | 100% | 100% | 88,23% |
| `src/routes/(protected)/biblioteca/autores/[id=integer]/+page.server.ts` | 87,09% | 87,5% | 100% | 84,61% |
| `src/routes/(protected)/biblioteca/autores/novo/+page.server.ts` | 90% | 100% | 100% | 88,23% |
| `src/routes/(protected)/biblioteca/avisos/+page.server.ts` | 80,76% | 100% | 80% | 81,81% |
| `src/routes/(protected)/biblioteca/avisos/[id=integer]/+page.server.ts` | 84,37% | 87,5% | 80% | 84,61% |
| `src/routes/(protected)/biblioteca/colecoes/+page.server.ts` | 90% | 100% | 100% | 88,23% |
| `src/routes/(protected)/biblioteca/colecoes/[id=integer]/+page.server.ts` | 89,18% | 87,5% | 100% | 87,5% |
| `src/routes/(protected)/biblioteca/colecoes/novo/+page.server.ts` | 90% | 100% | 100% | 88,23% |
| `src/routes/(protected)/biblioteca/editoras/+page.server.ts` | 90% | 100% | 100% | 88,23% |
| `src/routes/(protected)/biblioteca/editoras/[id=integer]/+page.server.ts` | 87,87% | 87,5% | 100% | 85,71% |
| `src/routes/(protected)/biblioteca/editoras/novo/+page.server.ts` | 88,88% | 100% | 100% | 86,66% |
| `src/routes/(protected)/biblioteca/keywords/+page.server.ts` | 90% | 100% | 100% | 88,23% |
| `src/routes/(protected)/biblioteca/keywords/[id=integer]/+page.server.ts` | 87,09% | 87,5% | 100% | 84,61% |
| `src/routes/(protected)/biblioteca/keywords/novo/+page.server.ts` | 90% | 100% | 100% | 88,23% |
| `src/routes/(protected)/biblioteca/leitores/+page.server.ts` | 88,88% | 100% | 100% | 86,66% |
| `src/routes/(protected)/biblioteca/leitores/[id=integer]/+page.server.ts` | 87,5% | 87,5% | 100% | 86,2% |
| `src/routes/(protected)/biblioteca/leitores/novo/+page.server.ts` | 100% | 100% | 100% | 100% |
| `src/routes/(protected)/secretaria/amigofraterno/+page.server.ts` | 100% | 100% | 100% | 100% |
| `src/routes/(protected)/secretaria/amigofraterno/pdf/+server.ts` | 100% | 100% | 100% | 100% |
| `src/routes/(protected)/secretaria/cadastros/+page.server.ts` | 90% | 100% | 100% | 88,88% |
| `src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server.ts` | 97,22% | 88,88% | 100% | 96,96% |
| `src/routes/(protected)/secretaria/cadastros/[id=integer]/foto/+server.ts` | 100% | 100% | 100% | 100% |
| `src/routes/(protected)/secretaria/cadastros/[id=integer]/foto/original/+server.ts` | 100% | 100% | 100% | 100% |
| `src/routes/(protected)/secretaria/cadastros/novo/+page.server.ts` | 100% | 100% | 100% | 100% |
| `src/routes/(protected)/tesouraria/contribuintes/+page.server.ts` | 89,47% | 100% | 100% | 88,88% |
| `src/routes/(protected)/tesouraria/contribuintes/[id=integer]/+page.server.ts` | 90,32% | 87,5% | 100% | 89,28% |
| `src/routes/(protected)/tesouraria/contribuintes/novo/+page.server.ts` | 95% | 83,33% | 100% | 94,73% |

O escopo é deliberadamente restrito aos runtimes das tarefas 2.0–4.0. A configuração exclui apenas declarações de
tipos, testes e scripts de suporte já previstos em `vite.config.ts`; nenhuma exclusão nova foi criada para melhorar
esta execução. Migrações SQL e metadados são validados por TI-03, não por instrumentação V8.

## Estrutura, rastreabilidade e mecanismos de mascaramento

- A contagem estrutural dos 131 arquivos TypeScript/JavaScript modificados desde a base da iniciativa encontrou apenas
  `src/lib/server/database/schema.ts` acima de 100 linhas (207). É a exceção explícita de RF15; a separação de
  `amigo-fraterno-schema.test.ts` deixou todos os demais arquivos abaixo do limite.
- Nenhum `_create...` permanece exportado publicamente. Os exports exercitados são `load`, `actions`, `GET` e `POST`.
- A busca em `src`, `tests`, `playwright.config.ts`, `vite.config.ts` e `package.json` não encontrou `.skip`, `.only`,
  `describe.serial`, `waitForTimeout`, `networkidle`, `sleep`, `setTimeout`, suppressions ou retries de teste. A única
  ocorrência de `serial` em E2E pertence a `pg_get_serial_sequence`; `retries: 0` é a política explícita requerida.
- `coverage.exclude` contém somente tipos, testes e scripts sem comportamento de produção e não foi ampliado nesta
  tarefa. Nenhum timeout customizado, retry, espera fixa ou snapshot sem contrato foi adicionado.
- `test-inventory.md` confronta RF1–RF15, CA-01–CA-13 e todos os IDs TU/TI/E2E; cada ID aparece uma vez e não há caso
  órfão. Remoções e reclassificações têm justificativa no próprio inventário.

## Resíduos e limpeza

Após as suítes: a consulta `pg_database` não retornou bancos `casadeguara_test_*`; `tasklist` não retornou processos
Node/Vite/Playwright; o container `postgres-dev` permaneceu apenas como serviço local saudável durante a verificação.
Relatórios `coverage/`, `playwright-report/` e `test-results/` são artefatos ignorados gerados pelo executor e foram
removidos ao final; nenhum arquivo temporário ou processo ficou ativo.

## Rollout da migração de IDs

1. Capturar backup recuperável e validá-lo antes da janela.
2. Em cópia representativa, registrar tipos, FK/cascade de `cadastro_fotos`, maior ID e `last_value/is_called` de
   `leitor_idleitor_seq`; interromper se o preflight detectar valor fora de `integer`.
3. Executar `drizzle-kit migrate` em janela controlada (os `ALTER TABLE` adquirem locks); não usar `db:push` em base
   persistente.
4. Confirmar tipos `integer`, FK com `ON DELETE CASCADE`, default histórico, `setval` sem reutilização e próximo ID
   maior que todo ID persistido/emitido antes de liberar a aplicação.

Risco residual: o lock de `ALTER COLUMN` exige janela operacional e backup testado. O banco `local` continua sem a
migração persistente aplicada; esta execução apenas o leu.
