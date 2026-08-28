# Tarefa 2.0: Migrar fotos e criar o domínio de armazenamento dedicado

## Visão geral

Mover os bytes de foto para `cadastro_fotos`, executar a migração única com reconciliação integral e substituir o acesso pela coluna antiga por um domínio dedicado de leitura e escrita. O entregável inclui atomicidade, controle otimista de reenquadramento, auditoria do cadastro e projeções sem blobs desnecessários; não inclui actions HTTP, componentes Svelte nem desenho do PDF.

## Dependências e desbloqueios

- **Depende de:** Nenhuma
- **Motivo:** O esquema final e o modelo aceitam bytes de origem e cartão sem depender da implementação que os produz.
- **Desbloqueia:** 3.0 e 4.0

## Conformidade

### Skills aplicáveis

- `drizzle-postgres`
- `javascript`
- `no-workarounds`
- `vitest`

### AGENTS.md e rules

O `AGENTS.md` e todas as rules em `.agents/rules/` devem ser relidos antes da execução. `schema.ts` permanece a fonte de verdade; a migração e os metadados devem ser gerados pelo Drizzle Kit e revisados sem edição manual de snapshots. Aplicam-se os limites estruturais de TypeScript, transações sem erros engolidos, testes PostgreSQL independentes e cobertura por cada arquivo executável modificado. A conclusão exige o gate de `.agents/rules/verification.md`.

## Requisitos relacionados

- RF4, RF5, RF8, RF9, RF10, RF11, RF12 e RF13
- RF15 para a preservação das fotos legadas e de participantes sem foto.
- A tabela deve conter somente a chave 1:1 e os conteúdos `original` e `cartao` definidos na TechSpec.
- Não criar janela de migração, dual write ou rollout expand/contract, pois a funcionalidade não está em produção.

## Subtarefas

- [x] 2.1 Alterar `schema.ts` para declarar `cadastro_fotos` com PK/FK em `cadastro_id`, `ON DELETE CASCADE`, `original` e `cartao`, removendo `cadastros.foto` do estado final.
- [x] 2.2 Gerar a migração `0006` e seus metadados, inserir a cópia byte a byte, reconciliar quantidade, associações e os dois conteúdos, e remover a coluna antiga na mesma transação.
- [x] 2.3 Aplicar a migração em banco ou schema PostgreSQL descartável partindo de `0005`, comprovando sucesso integral e rollback quando a reconciliação falhar.
- [x] 2.4 Criar a fachada e os módulos separados de leitura e escrita de fotos, com upsert, remoção idempotente, auditoria atômica e reenquadramento protegido contra origem obsoleta.
- [x] 2.5 Remover os métodos e imports de foto do `CadastroModel` e eliminar `cadastro-photo.ts` após migrar todos os consumidores.
- [x] 2.6 Atualizar detalhe, resumo e participantes para `LEFT JOIN`, selecionando somente existência nas listagens e somente `cartao` para o PDF.
- [x] 2.7 Implementar e executar TI-01 a TI-06, incluindo constraints, cascade, commit, rollback, concorrência e ausência de foto.
- [x] 2.8 Executar a cobertura estreita de todos os arquivos executáveis deste entregável, confirmando os quatro limiares por arquivo.
- [x] 2.9 Executar `npm run check`, `npm test` e `npm run lint` após todas as alterações e registrar os resultados.

## Detalhes de implementação

Seguir `techspec.md`, especialmente “Modelos de dados”, “Migração `cadastros.foto` → `cadastro_fotos`”, a interface de `SecretariaPhotoModel`, o sequenciamento 2–3 e as decisões “Fonte e derivado” e “Modelo de foto separado”. A chave primária já cobre o acesso por FK; não criar índice redundante. Os eventos de persistência devem usar somente os campos permitidos na seção de observabilidade.

A migração dos consumidores existentes nas rotas limitou-se à injeção da fachada, preservando o comportamento atual; validação, reenquadramento e novos contratos HTTP permanecem na tarefa 3.

## Critérios de aceitação relacionados

- CA-04
- CA-05
- CA-07
- CA-08
- CA-09
- CA-10
- CA-11
- CA-14

## Escopo previsto de cobertura

- `src/lib/database/schema.ts`
- `src/lib/server/models/secretaria-photo.ts`
- `src/lib/server/models/cadastro-photo-read.ts`
- `src/lib/server/models/cadastro-photo-write.ts`
- `src/lib/server/models/cadastro-photo-reframe.ts`
- `src/lib/server/models/cadastro.ts`
- `src/lib/server/models/cadastro-projections.ts`
- `src/lib/server/models/cadastro-reader.ts`
- `src/lib/server/amigo-fraterno/participant-projections.ts`
- `src/lib/server/amigo-fraterno/participants.ts`
- `src/routes/(protected)/secretaria/cadastros/photo-actions.ts`
- `src/routes/(protected)/secretaria/cadastros/[id=integer]/foto/+server.ts`
- `src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server.ts`

## Testes da tarefa

### Testes de integração

- [x] TI-01 — migra fotos legadas com reconciliação byte a byte; prova associação, conteúdo, ausência para nulos e remoção final da coluna antiga.
- [x] TI-02 — impõe a relação 1:1 e a exclusão em cascata; prova bloqueio de duplicidade e órfãos e remoção da foto com o cadastro.
- [x] TI-03 — substitui origem e cartão na mesma transação; prova que upsert e auditoria confirmam ou revertem juntos.
- [x] TI-04 — reenquadra com controle otimista de concorrência; prova atualização exclusiva de `cartao` ou conflito sem sobrescrita e auditoria.
- [x] TI-05 — remove foto de modo atômico e idempotente; prova estado final consistente em sucesso, repetição e falha.
- [x] TI-06 — deriva detalhe, resumo e PDF por `LEFT JOIN`; prova listagem sem blobs, manutenção de participantes sem foto e seleção exclusiva de `cartao`.

## Arquivos relevantes

- `tasks/prd-fotos-pdf-amigo-fraterno/techspec.md`
- `src/lib/database/schema.ts`
- `src/lib/database/0005_round_vivisector.sql`
- `src/lib/database/0006_<gerado>.sql`
- `src/lib/database/meta/0005_snapshot.json`
- `src/lib/database/meta/0006_snapshot.json`
- `src/lib/database/meta/_journal.json`
- `src/lib/server/models/cadastro-photo-read.ts`
- `src/lib/server/models/cadastro-photo-write.ts`
- `src/lib/server/models/cadastro-photo-reframe.ts`
- `src/lib/server/models/secretaria-photo.ts`
- `src/lib/server/models/cadastro.ts`
- `src/lib/server/models/cadastro-projections.ts`
- `src/lib/server/models/cadastro-reader.ts`
- `src/lib/server/amigo-fraterno/participant-projections.ts`
- `src/lib/server/amigo-fraterno/participants.ts`
- `tests/integration/lib/server/models/cadastro/amigo-fraterno-schema.test.ts`
- `tests/integration/lib/server/models/cadastro/secretaria-photo.test.ts`
- `tests/integration/lib/database/amigo-fraterno-photo-migration.test.ts`
- `tests/integration/lib/server/amigo-fraterno/participants.test.ts`
