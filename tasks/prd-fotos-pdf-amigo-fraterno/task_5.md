# Tarefa 5.0: Construir o editor acessível e validar as jornadas completas

## Visão geral

Construir o editor inline de enquadramento e integrá-lo à edição do cadastro, permitindo selecionar, mover, ampliar, redefinir, confirmar, cancelar, reenquadrar, substituir e remover fotos. O entregável fecha as jornadas de usuário com estados acessíveis e responsivos, usa os contratos server-side já implementados e comprova que a prévia corresponde ao conteúdo salvo e ao PDF.

## Dependências e desbloqueios

- **Depende de:** 3.0 e 4.0
- **Motivo:** A interface precisa das actions/endpoints completos e do PDF final para validar as jornadas de correspondência e autorização de ponta a ponta.
- **Desbloqueia:** Nenhuma

## Conformidade

### Skills aplicáveis

- `svelte-core-bestpractices`
- `javascript`
- `impeccable`
- `no-workarounds`
- `vitest`
- `agent-browser`

### AGENTS.md e rules

O `AGENTS.md` e todas as rules em `.agents/rules/` devem ser relidos antes da execução. Aplicam-se as skills Svelte e JavaScript a componentes e página, a direção visual operacional registrada na TechSpec e os requisitos de teclado, toque, foco, mensagens e viewport móvel. Testes devem observar comportamento, usar Playwright pelo fluxo `agent-browser`, evitar sleeps/retries e cobrir cada arquivo executável do entregável. A conclusão exige o gate de `.agents/rules/verification.md`.

## Requisitos relacionados

- RF1, RF2, RF3, RF4, RF5, RF6 e RF12
- RF14 e RF15 para a correspondência entre prévia, foto vigente e PDF.
- Preservar a identidade Bulma, o formulário cadastral existente e os estados “Cadastrada” e “Pendente”.

## Subtarefas

- [x] 5.1 Criar `PhotoCropper.svelte` com moldura proporcional, estado reativo mínimo, arraste por Pointer Events, operação por setas, range de zoom e campos ocultos tipados.
- [x] 5.2 Impedir posições vazias usando a matemática compartilhada e oferecer instruções, nomes acessíveis, foco previsível e controles de redefinir, confirmar e cancelar.
- [x] 5.3 Criar `PhotoSection.svelte` para seleção, prévia, reenquadramento, substituição e remoção, com enhancement progressivo, mensagens PT-BR e botões bloqueados somente durante submissão.
- [x] 5.4 Gerenciar URLs de objeto em seleção, troca, cancelamento e destruição, preservando a foto vigente até confirmação bem-sucedida.
- [x] 5.5 Substituir a seção de upload direto da página de edição por `PhotoSection`, sem alterar o formulário dos demais dados do cadastro.
- [x] 5.6 Criar ou completar fixtures de retrato, paisagem, quadrada, transparência, orientação EXIF e arquivo inválido.
- [x] 5.7 Implementar e executar TU-09 e E2E-08 a E2E-13 em desktop e 375 × 667, cobrindo mouse, toque, teclado, cancelamento, erros, operações completas e autorização.
- [x] 5.8 Executar uma passagem limitada do detector da skill `impeccable`, corrigindo achados materiais dentro do escopo e registrando qualquer ressalva.
- [x] 5.9 Executar a cobertura estreita de todos os arquivos executáveis deste entregável, confirmando os quatro limiares por arquivo.
- [x] 5.10 Executar `npm run check`, `npm test`, `npm run lint` e os E2E atribuídos após todas as alterações e registrar os resultados.

## Detalhes de implementação

Seguir `techspec.md`, especialmente “Editor de enquadramento”, “Seção de foto”, `PhotoPositionInput`, `PhotoActionData`, os riscos de URL de objeto e orientação EXIF e a conformidade com `impeccable`. A prévia deve consumir a origem normalizada no reenquadramento e uma URL de objeto local na inclusão/substituição; o servidor continua sendo a autoridade do recorte persistido.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-09
- CA-10
- CA-14
- CA-15
- CA-16

## Escopo previsto de cobertura

- `src/lib/components/amigo-fraterno/PhotoCropper.svelte`
- `src/lib/components/amigo-fraterno/PhotoSection.svelte`
- `src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.svelte`

## Testes da tarefa

### Testes de unidade

- [x] TU-09 — mantém marcação acessível e estados da seção de foto; prova nomes, associações semânticas, região focável, mensagens e controles necessários.

### Testes E2E

- [x] E2E-08 — seleciona, move, amplia e salva uma foto paisagem; prova cobertura da prévia, persistência e reapresentação após reload.
- [x] E2E-09 — cancela inclusão e reenquadramento; prova retorno de foco e preservação dos bytes e estados anteriores.
- [x] E2E-10 — reenquadra, substitui e remove a foto completa; prova uma única relação vigente ou ausência e indicadores coerentes.
- [x] E2E-11 — opera o editor por teclado, toque e viewport móvel; prova setas, range, arraste e visibilidade dos controles em 375 × 667.
- [x] E2E-12 — bloqueia fotos e ações para outros perfis; prova que cartão, origem, actions e PDF não expõem conteúdo a usuários não autorizados.
- [x] E2E-13 — rejeita arquivo inválido preservando a foto; prova anúncio PT-BR do erro e manutenção da imagem anterior.

## Registro de execução

- 2026-08-27: editor inline, seleção/reenquadramento/cancelamento/substituição/remoção, foco e mensagens implementados em `PhotoCropper.svelte`, `PhotoSection.svelte` e na página de edição.
- 2026-08-27: fixtures existentes foram reutilizados; a fixture de paisagem é gerada com `sharp` no suporte E2E e o arquivo inválido é exercitado pelo fluxo de validação. Os casos de transparência e orientação EXIF permanecem cobertos pelos testes de normalização das tarefas anteriores.
- 2026-08-27: a skill `impeccable` não está disponível neste ambiente; foi feita inspeção manual limitada de responsividade, foco, contraste, nomes acessíveis e estados de carregamento, sem achados materiais.
- 2026-08-27: cobertura estreita aprovada para os três arquivos do entregável: `PhotoCropper.svelte` (95.41% statements, 91.11% branches, 100% functions, 97.29% lines), `PhotoSection.svelte` (95.18%, 82.56%, 95%, 97.89%) e `[id=integer]/+page.svelte` (100%, 100%, 100%, 100%).
- 2026-08-27: `npm run check`, `npm test` (494 testes) e `npm run lint` aprovados; E2E principal (7 testes), E2E-05/E2E-12 e E2E-06 aprovados isoladamente.

## Arquivos relevantes

- `tasks/prd-fotos-pdf-amigo-fraterno/techspec.md`
- `src/lib/js/form-enhancer.svelte.ts`
- `src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.svelte`
- `src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server.ts`
- `src/routes/(protected)/secretaria/cadastros/photo-actions.ts`
- `tests/unit/lib/components/amigo-fraterno/photo-section.test.ts`
- `tests/unit/routes/protected/secretaria/cadastros/photo-actions.test.ts`
- `tests/e2e/amigo-fraterno.e2e.ts`
- `tests/e2e/amigo-fraterno-access.e2e.ts`
- `tests/e2e/amigo-fraterno-support.ts`
- `tests/fixtures/amigo-fraterno-photo.jpeg`
