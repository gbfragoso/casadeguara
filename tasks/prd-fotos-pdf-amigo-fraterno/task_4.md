# Tarefa 4.0: Aplicar enquadramento e espaÃ§amento no PDF

## VisÃ£o geral

Atualizar a geraÃ§Ã£o do PDF para usar a versÃ£o `cartao`, preencher a moldura por `cover` com clipping e produzir 1,5 ponto visÃ­vel entre as bordas externas dos cartÃµes. O documento deve continuar A4, com seis cartÃµes por pÃ¡gina e as regras atuais de conteÃºdo, ordenaÃ§Ã£o, numeraÃ§Ã£o e ausÃªncia de foto. O entregÃ¡vel nÃ£o modifica a interface de ediÃ§Ã£o da foto.

## DependÃªncias e desbloqueios

- **Depende de:** 1.0 e 2.0
- **Motivo:** O PDF precisa da geometria compartilhada e da projeÃ§Ã£o dedicada que fornece `cartao` ou ausÃªncia de foto.
- **Desbloqueia:** 5.0

## Conformidade

### Skills aplicÃ¡veis

- `javascript`
- `no-workarounds`
- `vitest`
- `agent-browser`

### AGENTS.md e rules

O `AGENTS.md` e todas as rules em `.agents/rules/` devem ser relidos antes da execuÃ§Ã£o. Aplicam-se os limites de arquivo/funÃ§Ã£o TypeScript, constantes nomeadas, mÃ³dulos sem ciclos e testes na menor camada capaz de provar geometria, conteÃºdo e paginaÃ§Ã£o. O E2E deve usar Playwright pelo fluxo `agent-browser`, locators com espera automÃ¡tica e nenhuma pausa fixa. A conclusÃ£o exige cobertura por arquivo e o gate de `.agents/rules/verification.md`.

## Requisitos relacionados

- RF5, RF12, RF14, RF15, RF16 e RF17
- A distÃ¢ncia exigida Ã© 1,5 ponto livre entre as bordas externas, obtida com slots separados por 4,5 pontos diante das bordas de 3 pontos.
- Participantes sem foto devem permanecer no PDF e fotos legadas devem usar cover central sem reprocessamento obrigatÃ³rio.

## Subtarefas

- [x] 4.1 Mover as constantes e os slots genÃ©ricos para a geometria compartilhada e manter em `pdf-layout.ts` somente cores e aspectos prÃ³prios do `pdf-lib`.
- [x] 4.2 Criar `pdf-photo.ts` para calcular cover, aplicar caminho de clipping, desenhar a imagem e sobrepor a borda da moldura; sem foto, desenhar somente a moldura.
- [x] 4.3 Atualizar `pdf-card.ts` para delegar o desenho da foto e ajustar paginaÃ§Ã£o e geraÃ§Ã£o para os slots compartilhados sem alterar o conteÃºdo existente.
- [x] 4.4 Preservar ordem, numeraÃ§Ã£o, data, seis cartÃµes por pÃ¡gina, margens A4 e comportamento para zero/uma/mÃºltiplas pÃ¡ginas.
- [x] 4.5 Implementar e executar TU-06, TU-07, TI-08 e E2E-14 com fotos largas, altas, enquadradas, legadas e ausentes.
- [x] 4.6 Comparar dez geraÃ§Ãµes aquecidas com fixtures idÃªnticas antes/depois e investigar qualquer regressÃ£o mediana superior a 20%.
- [x] 4.7 Executar a cobertura estreita de todos os arquivos executÃ¡veis deste entregÃ¡vel, confirmando os quatro limiares por arquivo.
- [x] 4.8 Executar `npm run check`, `npm test`, `npm run lint`, a integraÃ§Ã£o e o E2E atribuÃ­dos apÃ³s todas as alteraÃ§Ãµes e registrar os resultados.

## Detalhes de implementaÃ§Ã£o

Seguir `techspec.md`, especialmente a geometria descrita em â€œVisÃ£o dos componentesâ€, as constantes de gap, `GET /secretaria/amigofraterno/pdf`, â€œCover tambÃ©m no PDFâ€ e â€œGap calculado pela borda visÃ­velâ€. Isolar os operadores de clipping de baixo nÃ­vel em `pdf-photo.ts` e manter o contrato pÃºblico do download inalterado.

## CritÃ©rios de aceitaÃ§Ã£o relacionados

- CA-04
- CA-05
- CA-11
- CA-12
- CA-13

## Escopo previsto de cobertura

- `src/lib/server/amigo-fraterno/pdf-layout.ts`
- `src/lib/server/amigo-fraterno/pdf-pagination.ts`
- `src/lib/server/amigo-fraterno/pdf-generator.ts`
- `src/lib/server/amigo-fraterno/pdf-photo.ts`
- `src/lib/server/amigo-fraterno/pdf-card.ts`

## Testes da tarefa

### Testes de unidade

- [x] TU-06 â€” calcula cover e clipping da foto no PDF; prova preenchimento sem distorÃ§Ã£o para imagens largas/altas e moldura vazia para ausÃªncia.
- [x] TU-07 â€” calcula 1,5 ponto visÃ­vel e seis slots A4; prova distÃ¢ncia entre strokes, ausÃªncia de sobreposiÃ§Ã£o e manutenÃ§Ã£o das margens.

### Testes de integraÃ§Ã£o

- [x] TI-08 â€” gera PDF com projeÃ§Ã£o dedicada e geometria nova; prova documento vÃ¡lido, ordem, numeraÃ§Ã£o, seis cartÃµes/pÃ¡gina e fotos variadas.

### Testes E2E

- [x] E2E-14 â€” baixa PDF paginado com fotos variadas e ausentes; prova duas pÃ¡ginas para sete participantes e download sem erro ou perda de cartÃµes.

## Arquivos relevantes

- `tasks/prd-fotos-pdf-amigo-fraterno/techspec.md`
- `src/lib/amigo-fraterno/card-geometry.ts`
- `src/lib/server/amigo-fraterno/participant-projections.ts`
- `src/lib/server/amigo-fraterno/participants.ts`
- `src/lib/server/amigo-fraterno/pdf-layout.ts`
- `src/lib/server/amigo-fraterno/pdf-pagination.ts`
- `src/lib/server/amigo-fraterno/pdf-generator.ts`
- `src/lib/server/amigo-fraterno/pdf-card.ts`
- `src/routes/(protected)/secretaria/amigofraterno/pdf/+server.ts`
- `tests/unit/lib/server/amigo-fraterno/pdf-pagination.test.ts`
- `tests/unit/lib/server/amigo-fraterno/pdf-generator.test.ts`
- `tests/unit/lib/server/amigo-fraterno/pdf-photo.test.ts`
- `tests/integration/lib/server/amigo-fraterno/pdf-handler.test.ts`
- `tests/e2e/amigo-fraterno-pdf.e2e.ts`
