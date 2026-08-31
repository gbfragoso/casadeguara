# Tarefa 5.0: Tornar as jornadas E2E independentes e diagnosticáveis

## Visão geral

Reestruturar os E2E existentes em fixtures por teste e casos de um comportamento, mantendo todas as jornadas reais auditadas. A tarefa elimina dependência de ordem, `describe.serial` e `networkidle` indiscriminado; verifica respostas HTTP junto do estado acessível; conserva trace de falhas; e prova que o timeout padrão é suficiente sem retries ou remoção de testes.

## Dependências e desbloqueios

- **Depende de:** 1.0, 2.0 e 3.0
- **Motivo:** O servidor deve herdar um banco descartável, os IDs precisam ultrapassar o limite anterior e os contratos das rotas devem estar estabilizados antes das jornadas finais.
- **Desbloqueia:** 6.0

## Conformidade

### Skills aplicáveis

- `agent-browser`: navegação semântica, snapshots acessíveis, console, erros e validação manual dirigida quando necessária ao diagnóstico.
- `svelte-core-bestpractices`: interação e acessibilidade das páginas/componentes Svelte 5.
- `javascript`: fixtures TypeScript focadas, cleanup determinístico e módulos sem ciclos.
- `drizzle-postgres`: dados exclusivos, cleanup relacional e sequência acima de 32.767 no banco descartável.
- `no-workarounds`: sem retries, sleeps, timeout ampliado, serialização ou remoção para silenciar flakiness.

### AGENTS.md e rules

Foram lidos o `AGENTS.md` e todas as rules. Playwright usa locators e assertions com auto-wait, cada teste prepara e limpa seu estado e um teste pode executar sozinho. Arquivos TS terão no máximo 100 linhas e funções no máximo 30. E2E permanece restrito às jornadas críticas enumeradas na TechSpec.

## Requisitos relacionados

- RF3, RF10, RF11, RF12 e RF13.
- Preservar todos os comportamentos atuais de acesso, avisos, cadastros, fotos, Amigo Fraterno e PDF.
- Manter timeout padrão de 30 segundos e `retries: 0`.
- Respostas 4xx/5xx devem falhar no ponto da requisição, não somente após uma espera visual.

## Subtarefas

- [x] 5.1 Criar fixture Playwright estendida com token, usuários, autenticação, dados de domínio, conexões e teardown por teste; remover estado mutável em `beforeAll`/`afterAll`.
- [x] 5.2 Atualizar `playwright.config.ts` com guard do banco, `forbidOnly`, `fullyParallel`, política de workers, `retries: 0`, trace retido em falha e servidor herdando a URL descartável.
- [x] 5.3 Remover todos os `describe.serial`; garantir nomes/IDs únicos e que uma falha não impeça a execução de outro caso.
- [x] 5.4 Substituir os oito usos de `networkidle` por URL, locator, resposta ou estado persistido específico; confirmar ausência de `waitForTimeout`, sleeps e timeout customizado.
- [x] 5.5 Dividir `amigo-fraterno.e2e.ts` em arquivos de participação, elegibilidade e fotos abaixo de 100 linhas, eliminando sobreposição do “ciclo completo”.
- [x] 5.6 Dividir Avisos em criação/localização e atualização; cada submissão verifica resposta bem-sucedida antes da confirmação visual.
- [x] 5.7 Dividir a jornada compartilhada de cadastros por painel e privacidade, mantendo ownership de secretaria, biblioteca e tesouraria em casos independentes.
- [x] 5.8 Preparar a sequência do banco E2E acima de 32.767 e implementar a criação via interface sem compartilhar esse cadastro com outros casos.
- [x] 5.9 Implementar ou reorganizar E2E-01 a E2E-21 com Given/When/Then e cleanup próprio.
- [x] 5.10 Executar cada arquivo E2E isoladamente e a suíte completa com um worker; depois executar a suíte completa com múltiplos workers e repetir a suíte para detectar resíduos.
- [x] 5.11 Usar `agent-browser` nos fluxos que falharem para inspecionar URL, árvore acessível, console e erros da página; classificar causa antes de alterar teste ou aplicação.
- [x] 5.12 Confirmar por busca que não existem `.skip`, `.only`, serialização, retries, sleeps, `networkidle` ou timeout ampliado; registrar o maior tempo observado sem transformar duração em assertion frágil.

## Detalhes de implementação

Seguir “Fixtures e jornadas E2E” e E2E-01 a E2E-21 de `techspec.md`. O Playwright oferece auto-wait de locators e assertions; waits adicionais só podem observar um evento funcional específico. Uma limitação de capacidade de CI pode reduzir workers sem mudar o teste, mas não pode ser usada para esconder dependência entre casos.

## Critérios de aceitação relacionados

- CA-04
- CA-08
- CA-09
- CA-10
- CA-12

## Escopo previsto de cobertura

Não aplicável. A tarefa altera configuração, fixtures e testes E2E, não runtime de produção. Se a investigação revelar e autorizar uma correção de aplicação, o respectivo arquivo passa a integrar o entregável e deve cumprir cobertura conforme `.agents/rules/tests.md`.

## Testes da tarefa

### Testes E2E

- [x] E2E-01 — bloqueia acesso direto ao Amigo Fraterno por papel ou sessão inválida.
- [x] E2E-02 — mantém lista do Amigo Fraterno utilizável por teclado e em viewport móvel.
- [x] E2E-03 — altera participação no Amigo Fraterno.
- [x] E2E-04 — atualiza elegibilidade quando trabalhador ou desencarnado muda.
- [x] E2E-05 — seleciona, move, amplia e salva foto horizontal.
- [x] E2E-06 — cancela reenquadramento preservando foto atual.
- [x] E2E-07 — cancela primeiro upload e restaura foco.
- [x] E2E-08 — reenquadra foto atual.
- [x] E2E-09 — substitui foto atual.
- [x] E2E-10 — remove foto atual.
- [x] E2E-11 — opera recorte por teclado em viewport móvel.
- [x] E2E-12 — rejeita arquivo inválido preservando foto atual.
- [x] E2E-13 — baixa PDF paginado com fotos variadas e ausentes.
- [x] E2E-14 — exige data válida antes de gerar PDF.
- [x] E2E-15 — cria e localiza aviso.
- [x] E2E-16 — atualiza aviso existente.
- [x] E2E-17 — secretaria preserva dados pertencentes aos outros painéis.
- [x] E2E-18 — biblioteca preserva dados pertencentes aos outros painéis.
- [x] E2E-19 — tesouraria preserva dados pertencentes aos outros painéis.
- [x] E2E-20 — protege identificadores pessoais entre papéis.
- [x] E2E-21 — cria cadastro acima de 32.767 pela interface.

## Arquivos relevantes

- `playwright.config.ts`
- `vite.config.ts`
- `tests/e2e/fixtures.ts`
- `tests/e2e/fixtures-support.ts`
- `tests/e2e/fixtures-types.ts`
- `tests/e2e/fixtures-hydration.ts`
- `tests/e2e/cadastros-database.ts`
- `tests/e2e/cadastros-fixture.ts`
- `tests/e2e/cadastros-seed.ts`
- `tests/e2e/cadastros-browser.ts`
- `tests/e2e/cadastros-updates.ts`
- `tests/e2e/cadastros-journey.ts`
- `tests/e2e/cadastros.e2e.ts`
- `tests/e2e/avisos-support.ts`
- `tests/e2e/avisos.e2e.ts`
- `tests/e2e/amigo-fraterno-support.ts`
- `tests/e2e/amigo-fraterno-access-support.ts`
- `tests/e2e/amigo-fraterno-access.e2e.ts`
- `tests/e2e/amigo-fraterno-photo-support.ts`
- `tests/e2e/amigo-fraterno-pdf.e2e.ts`
- `tests/e2e/amigo-fraterno-participation.e2e.ts`
- `tests/e2e/amigo-fraterno-eligibility.e2e.ts`
- `tests/e2e/amigo-fraterno-photos-upload.e2e.ts`
- `tests/e2e/amigo-fraterno-photos-edit.e2e.ts`
- `tests/fixtures/amigo-fraterno-photo.jpeg`

## Registro de verificação

- Suítes E2E: todos os arquivos isolados aprovados; execução completa com um worker (21/21), múltiplos workers (21/21) e repetição (21/21).
- Gates: `npm run check`, `npm test` (64 arquivos, 333 testes) e `npm run lint` aprovados.
- Busca estática: nenhum `.skip`, `.only`, `describe.serial`, `networkidle`, `waitForTimeout`, `sleep` ou retry; timeout padrão de 30 s, `retries: 0`; maior teste individual observado em aproximadamente 10,7 s (suíte single-worker em aproximadamente 44 s).
- Diagnóstico: a tentativa de usar `agent-browser` foi bloqueada pela política Windows Device Guard; o diagnóstico equivalente foi feito pelos traces/contextos de erro do Playwright, URL/DOM/acessibilidade, console e erros de página. Não restaram falhas E2E.
- Cobertura: N/A — a alteração é restrita a testes E2E e configuração do executor.
