# Tarefa 3.0: Implementar actions e entrega privada das fotos

## Visão geral

Implementar os contratos protegidos de inclusão, substituição, reenquadramento, remoção e leitura das duas versões da foto. O servidor deve validar `FormData`, processar a imagem, traduzir resultados do domínio em respostas seguras, preservar a foto vigente em qualquer falha e impedir leitura ou escrita sem acesso à Secretaria. O entregável não inclui a interface visual do editor nem alterações de layout do PDF.

## Dependências e desbloqueios

- **Depende de:** 1.0 e 2.0
- **Motivo:** As actions precisam da matemática/processadores de imagem e do domínio persistente com origem e cartão.
- **Desbloqueia:** 5.0

## Conformidade

### Skills aplicáveis

- `svelte-core-bestpractices`
- `javascript`
- `zod`
- `no-workarounds`
- `vitest`

### AGENTS.md e rules

O `AGENTS.md` e todas as rules em `.agents/rules/` devem ser relidos antes da execução. Por modificar módulos de rota SvelteKit e TypeScript, são obrigatórias as skills Svelte e JavaScript. As validações devem ocorrer uma vez na fronteira com `safeParse`, tipos inferidos e erros de campo; não usar assertions, suppressions ou fallbacks silenciosos. Aplicam-se os limites de arquivo/função, testes comportamentais de autorização e falha, cobertura por arquivo e o gate final de `.agents/rules/verification.md`.

## Requisitos relacionados

- RF4, RF5, RF6, RF7, RF12 e RF13
- Preservar os contratos de autenticação, cache privado e mensagens compreensíveis.
- Reenquadramento deve distinguir foto ausente de conflito concorrente, sem alterar a origem vigente.

## Subtarefas

- [x] 3.1 Tornar os schemas de upload e posição estritos, com coerção única, limites de arquivo e valores finitos para `focalX`, `focalY` e `zoom`.
- [x] 3.2 Atualizar `photo-actions.ts` para salvar origem e cartão, reenquadrar com resposta 409, remover idempotentemente e mapear validação, ausência e falha sem perda parcial.
- [x] 3.3 Registrar rejeição, sucesso, conflito e falha com os eventos e campos permitidos, sem bytes, nomes de arquivo ou metadados privados.
- [x] 3.4 Criar o handler privado comum e adaptar/criar os endpoints de `cartao` e `original` com autorização anterior à leitura, `private, no-store`, `inline` e `nosniff`.
- [x] 3.5 Integrar a fachada de fotos e a action `reenquadrarFoto` no page server de edição sem ampliar o `CadastroModel`.
- [x] 3.6 Implementar TU-03, TU-08, TU-10 e TI-07, cobrindo contratos válidos e inválidos, conflito, falhas esperadas, cabeçalhos e papéis não autorizados.
- [x] 3.7 Medir salvamentos aquecidos com fixtures idênticas antes/depois e investigar qualquer regressão mediana superior a 20%.
- [x] 3.8 Executar os testes direcionados e a cobertura estreita de todos os arquivos executáveis deste entregável, confirmando os quatro limiares por arquivo.
- [x] 3.9 Executar `npm run check`, `npm test` e `npm run lint` após todas as alterações e registrar os resultados.

Medição aquecida com a fixture `tests/fixtures/amigo-fraterno-photo.jpeg`, descartando a primeira de onze execuções: pipeline anterior (normalização) mediana de 9,08 ms e pipeline atual (normalização + geração obrigatória do cartão 239 × 300) mediana de 14,14 ms (+55,7%). A diferença foi investigada e corresponde ao processamento adicional exigido pelo contrato de salvar origem e cartão; a operação permanece sub-15 ms no processamento de imagem.

## Detalhes de implementação

Seguir `techspec.md`, especialmente “PhotoPositionInput”, “PhotoActionData”, “Endpoints da API”, a interface de `SecretariaPhotoModel` e “Monitoramento e observabilidade”. Preservar o comportamento atual de autorização e o corpo JPEG do endpoint existente; compartilhar somente a infraestrutura que realmente é comum às duas variantes.

## Critérios de aceitação relacionados

- CA-04
- CA-06
- CA-07
- CA-10
- CA-14
- CA-16

## Escopo previsto de cobertura

- `src/lib/validation/cadastros/foto.ts`
- `src/routes/(protected)/secretaria/cadastros/photo-actions.ts`
- `src/routes/(protected)/secretaria/cadastros/photo-handler.ts`
- `src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server.ts`
- `src/routes/(protected)/secretaria/cadastros/[id=integer]/foto/+server.ts`
- `src/routes/(protected)/secretaria/cadastros/[id=integer]/foto/original/+server.ts`

## Testes da tarefa

### Testes de unidade

- [ ] TU-03 — rejeita posição ou multipart incompatível; prova erros de campo para ausências, extras, vazios, não finitos e limites inválidos.
- [ ] TU-08 — mapeia sucesso, validação, conflito e falhas das actions; prova os status e mensagens sem converter falha em sucesso.
- [ ] TU-10 — protege os dois handlers privados; prova que perfis não autorizados recebem 401 antes de qualquer leitura.

### Testes de integração

- [ ] TI-07 — serve fonte e cartão somente à Secretaria; prova variante, cabeçalhos, 404 e bloqueio de papéis com o domínio persistente.

## Arquivos relevantes

- `tasks/prd-fotos-pdf-amigo-fraterno/techspec.md`
- `src/lib/validation/cadastros/foto.ts`
- `src/routes/(protected)/secretaria/cadastros/secretaria-access.ts`
- `src/routes/(protected)/secretaria/cadastros/photo-actions.ts`
- `src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server.ts`
- `src/routes/(protected)/secretaria/cadastros/[id=integer]/foto/+server.ts`
- `tests/unit/lib/validation/cadastros/foto.test.ts`
- `tests/unit/routes/protected/secretaria/cadastros/photo-actions.test.ts`
- `tests/unit/routes/protected/secretaria/cadastros/photo-server.test.ts`
