# Tarefa 6.0: Consolidar rastreabilidade e executar o gate integral

## Visão geral

Consolidar o inventário final de testes, provar que cada caso corresponde a comportamento, risco ou regressão real e executar o gate completo em ambiente isolado. O entregável registra comandos, resultados, cobertura por arquivo, ausência de contaminação e decisões de manter/mover/reescrever/remover; não implementa novos comportamentos nem cria testes para ajustar métricas.

## Dependências e desbloqueios

- **Depende de:** 2.0, 4.0 e 5.0
- **Motivo:** Schema, adaptadores, unitários/componentes e jornadas E2E precisam estar estabilizados para que a matriz e as evidências sejam finais.
- **Desbloqueia:** Nenhuma

## Conformidade

### Skills aplicáveis

- `vitest`: execução integral, projetos e cobertura V8 delimitada.
- `agent-browser`: confirmação dirigida de jornadas e diagnóstico de qualquer divergência E2E.
- `no-workarounds`: rejeitar `.skip`, `.only`, retry, timeout, sleep, exclusão de cobertura ou alteração de expectativa que silencie falhas.

### AGENTS.md e rules

Foram lidos o `AGENTS.md` e todas as rules. O gate obrigatório é executado uma vez após todas as alterações; as repetições adicionais decorrem dos critérios desta iniciativa. Cobertura inclui cada runtime modificado por caminho estreito, com quatro thresholds por arquivo. Build continua opt-in e não será executado sem nova solicitação.

## Requisitos relacionados

- RF13, RF14 e RF15, com validação final de RF1 a RF15.
- Cada caso deve ter ID único, camada, comportamento, origem e resultado esperado.
- O banco `local` deve apresentar o mesmo fingerprint antes e depois do gate.

## Subtarefas

- [x] 6.1 Criar `test-inventory.md` com todos os arquivos/casos finais, camada, comportamento, vínculo (`RF`, `CA`, risco ou regressão), disposição e justificativa de qualquer remoção.
- [x] 6.2 Confrontar RF1–RF15 e CA-01–CA-13 com TU-01–TU-05, TI-01–TI-08, E2E-01–E2E-21 e as verificações alternativas documentadas; resolver IDs duplicados, casos órfãos e critérios sem prova ou verificação alternativa.
- [x] 6.3 Confirmar que nenhum teste existe somente para cobertura, source scanning, framework plumbing ou snapshot sem contrato revisado.
- [x] 6.4 Confirmar os limites estruturais nos arquivos modificados e registrar a exceção explícita de `src/lib/server/database/schema.ts`, que permanece único e acima do limite; verificar que nenhum `_create...` público permanece apenas para teste.
- [x] 6.5 Capturar fingerprint somente leitura do banco `local` e executar `npm test`, `npm run test:integration` e `npm run test:e2e` duas vezes consecutivas, registrando contagens, duração e exit code.
- [x] 6.6 Executar `npm run check`, `npm test` e `npm run lint` após todas as alterações, conforme `.agents/rules/verification.md`.
- [x] 6.7 Executar cobertura com um `--coverage.include` por arquivo executável das tarefas 2.0, 3.0 e 4.0; confirmar todos no relatório e registrar linhas, branches, funções e statements individualmente.
- [x] 6.8 Repetir o fingerprint do banco `local` e comprovar igualdade; confirmar que nenhum banco `casadeguara_test_*`, processo de servidor ou artefato temporário ficou ativo.
- [x] 6.9 Buscar `.skip`, `.only`, `describe.serial`, retries, `waitForTimeout`, sleeps, `networkidle`, timeout ampliado, suppressions e exclusões de cobertura novas; tratar qualquer ocorrência pela causa-raiz.
- [x] 6.10 Registrar em `verification.md` versões, ambiente, comandos, resultados, métricas, riscos residuais e o procedimento de rollout da migração; atualizar o progresso das tarefas sem iniciar trabalho fora do escopo.

## Detalhes de implementação

Seguir “Abordagem de testes”, “Mensuração das métricas de sucesso” e “Conformidade” de `techspec.md`. Uma falha no gate reabre a tarefa que possui sua causa; a tarefa 6.0 não deve contorná-la. O relatório global histórico de cobertura não é evidência e não deve ser corrigido com testes artificiais.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08
- CA-09
- CA-10
- CA-11
- CA-12
- CA-13

## Escopo previsto de cobertura

Não aplicável à tarefa 6.0, pois ela cria documentação e evidências. O gate reexecuta a cobertura dos runtimes autorizados nas tarefas 2.0, 3.0 e 4.0 sem adicionar arquivos históricos.

## Testes da tarefa

Esta tarefa não cria novos casos; reexecuta e valida a matriz completa abaixo.

### Testes de unidade

- [x] TU-01 a TU-05 — segurança do alvo, lifecycle, regras puras e componentes acessíveis.

### Testes de integração

- [x] TI-01 a TI-08 — banco descartável, migração, IDs, relações, rotas reais e buscas PostgreSQL.

### Testes E2E

- [x] E2E-01 a E2E-21 — acesso, Amigo Fraterno, fotos, PDF, avisos, ownership, privacidade e cadastro acima do limite.

## Arquivos relevantes

- `tasks/prd-confiabilidade-testes/prd.md`
- `tasks/prd-confiabilidade-testes/techspec.md`
- `tasks/prd-confiabilidade-testes/tasks.md`
- `tasks/prd-confiabilidade-testes/task_1.md`
- `tasks/prd-confiabilidade-testes/task_2.md`
- `tasks/prd-confiabilidade-testes/task_3.md`
- `tasks/prd-confiabilidade-testes/task_4.md`
- `tasks/prd-confiabilidade-testes/task_5.md`
- `tasks/prd-confiabilidade-testes/task_6.md`
- `tasks/prd-confiabilidade-testes/test-inventory.md`
- `tasks/prd-confiabilidade-testes/verification.md`
- `package.json`
- `vite.config.ts`
- `playwright.config.ts`
- `.agents/rules/tests.md`
- `.agents/rules/verification.md`
