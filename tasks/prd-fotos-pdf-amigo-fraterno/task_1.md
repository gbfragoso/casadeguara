# Tarefa 1.0: Consolidar geometria e processamento de imagens

## Visão geral

Criar a fundação compartilhada que transforma ponto focal e zoom em um recorte válido, centraliza a geometria dos cartões e produz, no servidor, a origem normalizada e o JPEG enquadrado. O entregável não acessa banco, HTTP ou DOM; ele fornece contratos determinísticos para as tarefas de persistência, rotas, interface e PDF.

## Dependências e desbloqueios

- **Depende de:** Nenhuma
- **Motivo:** A geometria e o processamento são funções de domínio independentes do armazenamento e das rotas.
- **Desbloqueia:** 3.0 e 4.0

## Conformidade

### Skills aplicáveis

- `javascript`
- `no-workarounds`
- `vitest`

### AGENTS.md e rules

O `AGENTS.md` e todas as rules em `.agents/rules/` devem ser relidos antes da execução. Aplicam-se especialmente os limites de 100 linhas por arquivo TypeScript e 30 linhas por função, nomes de funções em inglês, constantes para valores geométricos, módulos sem ciclos e testes Given/When/Then. A conclusão exige o gate de `.agents/rules/verification.md` e cobertura por arquivo conforme `.agents/rules/tests.md`, sem alterar artefatos gerados ou adicionar dependências.

## Requisitos relacionados

- RF2, RF3, RF4, RF5 e RF7
- RF14, RF15, RF16 e RF17
- Preservar os limites atuais de 3 MiB, 300 × 300 px mínimos e 24 milhões de pixels.
- Usar a mesma matemática de enquadramento no navegador e no servidor, conforme o `techspec.md`.

## Subtarefas

- [x] 1.1 Criar `card-geometry.ts` com constantes A4, moldura da foto, bordas, gap de slot e cálculo dos seis slots.
- [x] 1.2 Criar `photo-crop.ts` com os tipos e a função pura que limita ponto focal, zoom e retângulo de origem sem expor áreas vazias.
- [x] 1.3 Atualizar a normalização para autorrotação, remoção de metadados, fundo branco e fonte JPEG limitada a 1.200 px, e criar o processador do derivado 239 × 300.
- [x] 1.4 Implementar TU-01, TU-02, TU-04 e TU-05 com imagens determinísticas em retrato, paisagem, quadrada, PNG transparente e JPEG com orientação EXIF.
- [x] 1.5 Executar os testes unitários direcionados e a cobertura estreita de todos os arquivos executáveis deste entregável, confirmando os quatro limiares por arquivo.
- [x] 1.6 Executar `npm run check`, `npm test` e `npm run lint` após todas as alterações e registrar os resultados.

## Detalhes de implementação

Seguir `techspec.md`, especialmente “Visão dos componentes”, “Principais interfaces”, as constantes de `PHOTO_FRAME`, “Principais decisões” e os riscos de orientação EXIF e processamento `sharp`. O recorte deve permanecer uma abstração pura e compartilhável; `sharp` fica restrito aos módulos server-only.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-04
- CA-05
- CA-06
- CA-11
- CA-12
- CA-13

## Escopo previsto de cobertura

- `src/lib/amigo-fraterno/card-geometry.ts`
- `src/lib/amigo-fraterno/photo-crop.ts`
- `src/lib/server/amigo-fraterno/photo-normalizer.ts`
- `src/lib/server/amigo-fraterno/photo-cropper.ts`

## Testes da tarefa

### Testes de unidade

- [x] TU-01 — centraliza e cobre fontes retrato, paisagem e quadrada; prova que o retângulo inicial possui a proporção da moldura, fica contido e não produz vazio.
- [x] TU-02 — limita arraste e zoom às bordas válidas; prova que focos extremos e ampliações permitidas não expõem a origem.
- [x] TU-04 — normaliza orientação, transparência, metadados e dimensões; prova o contrato da fonte JPEG e a rejeição tipada de entradas inválidas.
- [x] TU-05 — gera a foto enquadrada com a matemática da prévia; prova dimensões 239 × 300 e correspondência do recorte dentro de um pixel.

## Arquivos relevantes

- `tasks/prd-fotos-pdf-amigo-fraterno/techspec.md`
- `src/lib/server/amigo-fraterno/photo-normalizer.ts`
- `src/lib/server/amigo-fraterno/pdf-layout.ts`
- `tests/unit/lib/amigo-fraterno/photo-crop.test.ts`
- `tests/unit/lib/server/amigo-fraterno/photo-normalizer.test.ts`
- `tests/unit/lib/server/amigo-fraterno/photo-cropper.test.ts`
- `tests/unit/lib/server/amigo-fraterno/pdf-pagination.test.ts`
- `tests/fixtures/amigo-fraterno-photo.jpeg`
