# Inventário final de testes — confiabilidade-testes

Data da revisão: 31/08/2026. O inventário corresponde ao estado após as tarefas 1.0–5.0 e à separação do caso de
identificador inteiro de `amigo-fraterno-schema.test.ts` (6.4). A fonte dos nomes e dos contratos é
`techspec.md`; cada linha abaixo aponta para uma prova observável e não para execução artificial de código.

## Critério de rastreabilidade

Cada ID aparece uma vez na matriz principal, tem camada única, comportamento observável, vínculo com RF/CA ou risco
e uma disposição explícita. Os arquivos de suporte listados no catálogo não são casos independentes: apenas montam
fixtures, requests ou dados usados pelos casos referenciados. A ausência de um caso em uma camada é intencional quando
a menor camada adequada já prova o comportamento.

## Matriz de casos

| ID | Camada | Arquivo e caso | Comportamento observável | Vínculo | Disposição |
| --- | --- | --- | --- | --- | --- |
| TU-01 | unidade | `tests/unit/lib/scripts/testing/database.test.ts` — alvo emitido e ambiente correspondente | Aceita somente URL, nome e UUID do banco descartável da execução | RF2–RF3, CA-03, risco de mutação do banco local | Preservado |
| TU-02 | unidade | `tests/unit/lib/scripts/testing/database.test.ts` — host, banco-base e marcador divergentes | Rejeita desenvolvimento, produção, host remoto ou marcador divergente antes do callback destrutivo | RF2, CA-03 | Preservado |
| TU-03 | unidade | `tests/unit/lib/scripts/testing/run-suite.test.ts` — sucesso, falha, interrupção e falha de provisionamento | Propaga exit code e sempre remove o alvo exato, inclusive em erro | RF1–RF3, CA-01–CA-02, risco de resíduo | Preservado |
| TU-04 | unidade | `tests/unit/lib/{errors,forms,image,utils,validation}/**`; `tests/unit/lib/server/{authorization,connection,image,pdf}/**` | Validações, autorização, transformações, imagem e PDF retornam resultados de domínio sem SvelteKit/PostgreSQL | RF6–RF7, CA-06–CA-07 | Preservado na menor camada |
| TU-05 | unidade/componente | `tests/unit/lib/components/{navigation,feedback,image}/**`; `tests/unit/routes/**/**-svelte.test.ts` | Renderiza estados acessíveis e executa foco, teclado, upload, crop, cancelamento, confirmação e erro reais | RF6, RF8–RF9, CA-06 | Preservado/reescrito em happy-dom ou SSR |
| TI-01 | integração | `tests/integration/lib/scripts/testing/database.test.ts` — provisionar/remover schema e extensão | Banco completo existe durante o callback e deixa de existir depois | RF1, CA-01–CA-02 | Preservado |
| TI-02 | integração | `tests/integration/lib/scripts/testing/database.test.ts` — fingerprint local | Duas execuções isoladas não alteram tabelas ou sequências de `local` | RF1–RF3, CA-01–CA-02 | Preservado |
| TI-03 | integração | `tests/integration/lib/server/database/cadastro-id-migration.test.ts` — migração, rollback e preflight | Converte tipos no limite, preserva dados/FK/cascade/sequência e reverte DDL quando uma etapa falha | RF4–RF5, RF15, CA-04–CA-05, CA-13 | Preservado |
| TI-04 | integração | `tests/integration/lib/server/models/cadastro/create.test.ts` — criação acima de 32.767 | `CadastroModel` cria, retorna e lê o identificador inteiro superior ao limite anterior | RF4–RF5, CA-04–CA-05 | Preservado |
| TI-05 | integração | `tests/integration/lib/server/models/cadastro/amigo-fraterno-integer-id.test.ts` e `amigo-fraterno-schema.test.ts` | Foto e empréstimo usam o mesmo ID inteiro; remoção do cadastro elimina a foto por cascade | RF5, CA-05 | Caso separado por limite estrutural |
| TI-06 | integração | `tests/integration/routes/protected/{biblioteca,secretaria,tesouraria}/**authorization.test.ts` e equivalentes de Amigo Fraterno | Anônimo e papel estrangeiro são bloqueados; papel autorizado prossegue nos exports reais | RF6–RF7, CA-07 | Preservado nos adaptadores reais |
| TI-07 | integração | `tests/integration/routes/protected/**/adapters*.test.ts`, `amigofraterno/**`, `secretaria/api-cadastros-behavior.test.ts` | Loads, actions e handlers reais cobrem sucesso, validação, duplicidade, commit e falhas esperadas | RF6–RF7, CA-06–CA-07 | Preservado e dividido por contrato |
| TI-08 | integração | `tests/integration/lib/server/models/{autor,colecao,editora,keyword}.test.ts` e `cadastro/search.test.ts` | Busca PostgreSQL encontra prefixos com acento/case diferentes por `unaccent`/`ulike` | RF6, RF8, CA-06 | Preservado; substitui assertions de SQL |
| E2E-01 | E2E | `tests/e2e/amigo-fraterno-access.e2e.ts` — acesso inválido | Papel ou sessão inválida não expõe Amigo Fraterno | RF10–RF12, CA-08 | Preservado |
| E2E-02 | E2E | `tests/e2e/amigo-fraterno-access.e2e.ts` — lista móvel/teclado | Controles recebem foco e a lista permanece utilizável em viewport móvel | RF10–RF11, CA-08 | Preservado |
| E2E-03 | E2E | `tests/e2e/amigo-fraterno-participation.e2e.ts` | Participante entra e sai da seleção conforme a ação | RF10, CA-08 | Preservado |
| E2E-04 | E2E | `tests/e2e/amigo-fraterno-eligibility.e2e.ts` | Lista reflete alterações de trabalhador e desencarnado sem reload arbitrário | RF10–RF11, CA-08 | Preservado |
| E2E-05 | E2E | `tests/e2e/amigo-fraterno-photos-upload.e2e.ts` — seleção, movimento, zoom e salvamento | Cartão salvo reflete o recorte horizontal escolhido | RF10–RF11, CA-08 | Preservado |
| E2E-06 | E2E | `tests/e2e/amigo-fraterno-photos-edit.e2e.ts` — cancelar reenquadramento | Bytes/visual da foto atual não mudam | RF10–RF11, CA-08 | Preservado |
| E2E-07 | E2E | `tests/e2e/amigo-fraterno-photos-upload.e2e.ts` — cancelar primeiro upload | Nenhuma foto é criada e o foco retorna ao controle correto | RF10–RF11, CA-08 | Preservado |
| E2E-08 | E2E | `tests/e2e/amigo-fraterno-photos-edit.e2e.ts` — reenquadrar foto atual | Derivação é salva sem substituir a origem indevidamente | RF10–RF11, CA-08 | Preservado |
| E2E-09 | E2E | `tests/e2e/amigo-fraterno-photos-upload.e2e.ts` — substituir foto | Origem e cartão passam a representar o novo arquivo | RF10–RF11, CA-08 | Preservado |
| E2E-10 | E2E | `tests/e2e/amigo-fraterno-photos-edit.e2e.ts` — remover foto | Placeholder sem foto é exibido e persistido | RF10–RF11, CA-08 | Preservado |
| E2E-11 | E2E | `tests/e2e/amigo-fraterno-photos-edit.e2e.ts` — recorte por teclado móvel | Controles de recorte respondem sem gesto exclusivo de ponteiro | RF10–RF11, CA-08 | Preservado |
| E2E-12 | E2E | `tests/e2e/amigo-fraterno-photos-upload.e2e.ts` — arquivo inválido | Erro aparece e a foto persistida permanece igual | RF10–RF12, CA-08–CA-09 | Preservado |
| E2E-13 | E2E | `tests/e2e/amigo-fraterno-pdf.e2e.ts` — PDF paginado | HTTP bem-sucedido inicia download e a paginação inclui fotos variadas/ausentes | RF10–RF12, CA-08–CA-09 | Preservado |
| E2E-14 | E2E | `tests/e2e/amigo-fraterno-pdf.e2e.ts` — data inválida | Validação impede geração e retorna HTTP 400 | RF11–RF12, CA-09 | Preservado |
| E2E-15 | E2E | `tests/e2e/avisos.e2e.ts` — criar/localizar aviso | Resposta de criação é bem-sucedida e o aviso aparece na lista | RF10–RF12, CA-08–CA-09 | Preservado |
| E2E-16 | E2E | `tests/e2e/avisos.e2e.ts` — atualizar aviso | Resposta de atualização é bem-sucedida e o novo texto aparece | RF10–RF12, CA-08–CA-09 | Preservado |
| E2E-17 | E2E | `tests/e2e/cadastros.e2e.ts` — edição de secretaria | Dados de biblioteca/tesouraria não são sobrescritos | RF10, CA-08 | Preservado |
| E2E-18 | E2E | `tests/e2e/cadastros.e2e.ts` — edição de biblioteca | Dados de secretaria/tesouraria não são sobrescritos | RF10, CA-08 | Preservado |
| E2E-19 | E2E | `tests/e2e/cadastros.e2e.ts` — edição de tesouraria | Dados de secretaria/biblioteca não são sobrescritos | RF10, CA-08 | Preservado |
| E2E-20 | E2E | `tests/e2e/cadastros.e2e.ts` — identificadores pessoais | Papel sem permissão não lê nem altera RG/CPF | RF10–RF12, CA-08 | Preservado |
| E2E-21 | E2E | `tests/e2e/cadastros.e2e.ts` — cadastro acima de 32.767 | Usuário autorizado vê confirmação e o cadastro persistido | RF4, RF10–RF12, CA-04, CA-08–CA-09 | Preservado |

## Catálogo de arquivos finais

### Unitários e componentes

Os 64 arquivos de teste executáveis da unidade são: `tests/unit/lib/components/feedback/notification.test.ts`,
`tests/unit/lib/components/image/{photo-cropper,photo-section,photo-section-interaction,photo-section-lifecycle}.test.ts`,
`tests/unit/lib/components/navigation/navbar.test.ts`, `tests/unit/lib/errors/application.test.ts`,
`tests/unit/lib/forms/enhancer.test.ts`, `tests/unit/lib/image/crop/rectangle.test.ts`,
`tests/unit/lib/scripts/testing/{database,run-suite}.test.ts`,
`tests/unit/lib/server/authorization/{biblioteca,cadastros}.test.ts`,
`tests/unit/lib/server/database/connection.test.ts`, `tests/unit/lib/server/image/{cropper,normalizer}.test.ts`,
`tests/unit/lib/server/pdf/amigo-fraterno/{date,generator,handler,pagination,photo,text}.test.ts`,
`tests/unit/lib/server/secretaria/photo/{actions-reframe,actions-upload}.test.ts`,
`tests/unit/lib/utils/{currency,mask}.test.ts`,
`tests/unit/lib/validation/{autor,aviso,colecao,editora,keyword}.test.ts`,
`tests/unit/lib/validation/cadastros/{biblioteca,common,flags,foto,secretaria,tesouraria}.test.ts`, e os 27
arquivos `tests/unit/routes/protected/**/**-svelte.test.ts` listados pela árvore do repositório.

`tests/unit/lib/server/secretaria/photo/actions-test-support.ts`,
`tests/unit/routes/protected/biblioteca/leitores/test-support.ts`,
`tests/unit/routes/protected/secretaria/cadastros/test-support.ts`,
`tests/unit/routes/protected/tesouraria/contribuintes/test-support.ts` e
`tests/unit/support/rendered-document.ts` são suporte, não casos adicionais.

### Integração

Os 42 arquivos executáveis são `tests/integration/lib/scripts/testing/database.test.ts`,
`tests/integration/lib/server/database/{amigo-fraterno-photo-migration,cadastro-id-migration}.test.ts`,
`tests/integration/lib/server/models/{autor,aviso,colecao,editora,keyword}.test.ts`,
`tests/integration/lib/server/models/cadastro/{amigo-fraterno-integer-id,amigo-fraterno-schema,biblioteca-update,create,errors,projections,search,secretaria-flag,secretaria-photo,secretaria-update,tesouraria-update}.test.ts`,
`tests/integration/lib/server/pdf/amigo-fraterno/participants.test.ts`,
`tests/integration/routes/protected/biblioteca/{adapters-authorization,adapters-behavior,adapters-create,adapters-edit-catalogs,adapters-edit-notices,adapters-edit-registration,adapters-edit-simple,adapters-loads,adapters-validation}.test.ts`,
`tests/integration/routes/protected/secretaria/{adapters,adapters-behavior,adapters-failures,adapters-list-create,api-cadastros-behavior}.test.ts`,
`tests/integration/routes/protected/secretaria/amigofraterno/{authorization,behavior}.test.ts`,
`tests/integration/routes/protected/secretaria/amigofraterno/pdf/{handler,layout}.test.ts`, e
`tests/integration/routes/protected/tesouraria/{adapters,adapters-behavior,adapters-edit-failures,adapters-failures}.test.ts`.

`tests/integration/{setup.ts,support/auth.ts,support/request-event.ts,support/biblioteca-route-actions.ts,support/biblioteca-route-loads.ts}`
e `tests/integration/lib/server/models/{aviso-test-support,test-support}.ts` são suporte compartilhado.

### E2E

Os oito arquivos executáveis são `tests/e2e/amigo-fraterno-{access,eligibility,participation,pdf,photos-edit,photos-upload}.e2e.ts`,
`tests/e2e/avisos.e2e.ts` e `tests/e2e/cadastros.e2e.ts` (seis arquivos de Amigo Fraterno e dois de outros domínios).
`tests/e2e/{fixtures,fixtures-support,fixtures-types,fixtures-hydration}.ts`,
`tests/e2e/{amigo-fraterno-support,amigo-fraterno-access-support,amigo-fraterno-photo-support,avisos-support}.ts`,
`tests/e2e/{cadastros-browser,cadastros-database,cadastros-fixture,cadastros-journey,cadastros-seed,cadastros-updates}.ts`
e `tests/fixtures/amigo-fraterno-photo.jpeg` são suporte/fixture.

## Disposição de remoções e reclassificações

| Origem | Disposição | Justificativa |
| --- | --- | --- |
| `tests/unit/suite.test.ts`, `tests/integration/suite.test.ts` | Removidos | Placeholders sem comportamento; as suítes reais já são executadas pelo executor. |
| `tests/unit/architecture/avisos-boundaries.test.ts` | Removido | Source scanning não prova contrato de usuário; TI-07 exercita o adaptador real. |
| `tests/unit/lib/server/database/functions.test.ts` | Removido | Assertions de SQL gerado foram substituídas por buscas PostgreSQL reais em TI-08. |
| `tests/e2e/amigo-fraterno.e2e.ts` | Dividido | Os 11 comportamentos foram preservados em arquivos de acesso, participação, elegibilidade, fotos e PDF. |
| `tests/unit/lib/components/image/photo-interaction.test.ts` | Dividido | Interações foram separadas entre cropper, lifecycle e seção de foto, sem perder foco/upload/cancelamento. |
| `tests/unit/lib/server/secretaria/photo/actions.test.ts` | Dividido | Upload, reenquadramento, validação e falhas agora têm contextos mínimos independentes. |
| `tests/unit/routes/protected/**/*-page-server.test.ts` e `api/cadastros.test.ts` | Reclassificados/removidos | Eram testes de banco/rota/autorização na camada unitária; seus contratos estão nos adaptadores de TI-06/TI-07. |

As remoções de telas demo não fazem parte desta iniciativa e permanecem como histórico anterior. Nenhuma jornada E2E
viável foi descartada.

## Confronto RF/CA e verificações alternativas

| Requisito/critério | Prova principal | Verificação alternativa ou decisão |
| --- | --- | --- |
| RF1–RF3 / CA-01–CA-03 | TU-01–TU-03, TI-01–TI-02 | Guard rejeita alvo não descartável; fingerprint e banco efêmero antes/depois. |
| RF4–RF5 / CA-04–CA-05 | TI-03–TI-05, E2E-21 | Migração real, relações e sequência acima de 32.767. |
| RF6–RF9 / CA-06–CA-07 | TU-04–TU-05, TI-06–TI-08 | Revisão semântica dos nomes, Given/When/Then e asserções finais; nenhum placeholder/source scan. |
| RF10–RF12 / CA-08–CA-09 | E2E-01–E2E-21 | Execução individual/conjunta, resposta HTTP, locator/URL/estado e trace on-failure. |
| RF13 / CA-10 | Todos os 34 IDs da matriz | Busca manual de duplicidade e ausência de órfãos; cada ID ocorre uma vez na matriz. |
| RF14 / CA-11–CA-12 | `verification.md` | Gate obrigatório, integração, E2E, busca de mecanismos de mascaramento e cobertura por arquivo. |
| RF15 / CA-13 | `schema.ts`, `connection.ts`, `drizzle.config.ts` | Árvore confirma fonte única do schema e caminhos Drizzle inalterados. |

Não há IDs duplicados ou casos órfãos na matriz: TU-01–TU-05, TI-01–TI-08 e E2E-01–E2E-21 estão todos presentes uma
vez. CA-06, CA-10, CA-11, CA-12 e CA-13, que não são comportamentos automatizáveis sem repetir o antipadrão, são
provados pela revisão desta matriz, pelo gate e pela inspeção estrutural documentada em `verification.md`.
