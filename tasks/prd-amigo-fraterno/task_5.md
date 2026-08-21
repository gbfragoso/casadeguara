# Tarefa 5.0: Gerar e entregar o PDF do Amigo Fraterno

## Visão geral

Implementar o template editável em código, gerar um cartão por participante elegível e entregar o PDF atual por endpoint protegido. A entrega inclui ativos versionados, fontes licenciadas, layout A4, nomes longos, fotos opcionais, streaming e tratamento seguro de lista vazia ou falha.

## Dependências e desbloqueios

- **Depende de:** 2.0, 4.0
- **Motivo:** A geração consome as fotos normalizadas da tarefa 2.0 e a consulta ordenada e a página entregues pela tarefa 4.0.
- **Desbloqueia:** 6.0

## Conformidade

### Skills aplicáveis

- `javascript` — módulos server-only, geração binária e streaming tipados.
- `svelte-core-bestpractices` — integração do download e dos estados da página SvelteKit.
- `vitest` — testes geométricos, geração determinística, handlers e integridade do PDF.
- `no-workarounds` — separação real entre layout e elegibilidade, sem persistência ou respostas incompletas.
### AGENTS.md e rules

Foram lidos o `AGENTS.md`, `.agents/rules/code-standards.md` e `.agents/rules/tests.md`. Adicionar `pdf-lib` e `@pdf-lib/fontkit` somente com npm e manter o lockfile sincronizado. Carregar as skills obrigatórias antes de editar TypeScript ou rotas SvelteKit. Separar layout, texto, ativos, cartão e paginação para respeitar 100 linhas por arquivo e 30 por função. Módulos de numeração, paginação e regra de desenho devem atingir 100% de cobertura.

Não há desvios justificados.
## Requisitos relacionados

- RF12 e RF13: gerar um PDF atual com todos os elegíveis exatamente uma vez, ordenados e numerados desde `01`.
- RF14: usar A4 retrato, no máximo seis cartões por página e criar páginas adicionais sem perda ou duplicação.
- RF15 e RF16: reproduzir os elementos do modelo e a marca oficial sem incorporar dados exemplificativos do anexo.
- RF17: manter participante sem foto com moldura vazia e demais dados preservados.
- RF18: impedir PDF vazio tanto na página quanto diante de corrida concorrente no endpoint.
- RF19: manter layout e seleção em módulos independentes e não oferecer editor de template.
- Proteger e não armazenar o PDF; usar `ReadableStream` e os cabeçalhos definidos na TechSpec.

## Subtarefas

- [x] 5.1 Adicionar `pdf-lib` e `@pdf-lib/fontkit` com npm e validar a resolução no runtime Node.js do projeto.
- [x] 5.2 Versionar a marca oficial e fontes OFL com cobertura para os nomes e textos aceitos.
- [x] 5.3 Implementar constantes A4, posições, cores, textos fixos e ajuste de nomes longos em módulos puros.
- [x] 5.4 Implementar desenho do cartão com canhoto, numeração, identificação, data, marca, frase e foto opcional.
- [x] 5.5 Implementar paginação de seis cartões, incorporação de ativos e serialização determinística do PDF.
- [x] 5.6 Criar o endpoint autorizado que refaz a consulta, bloqueia vazio, registra métricas seguras e transmite o arquivo sem cache.
- [x] 5.7 Conectar a ação de download da página, mantendo o botão indisponível quando o total carregado for zero.
- [x] 5.8 Implementar e executar TU-05 a TU-10 e TI-08 a TI-09 com fixtures pequenas e determinísticas.

## Detalhes de implementação

Seguir `techspec.md` em “Template do cartão”, “Ativos do PDF”, “Parâmetros fixos da normalização e do PDF”, “GET /secretaria/amigofraterno/pdf” e “Principais decisões”. Usar `AMF2.pdf` apenas como referência visual e importar ativos de runtime por `read` de `$app/server`; nomes, fotos e o cartão vermelho exemplificativos não pertencem ao template.

## Critérios de aceitação relacionados

- CA-08
- CA-09
- CA-10
- CA-11
- CA-12
- CA-13
- CA-14
- CA-15

## Testes da tarefa

### Testes de unidade

- [x] TU-05 — Ordena e numera cartões de forma estável
- [x] TU-06 — Pagina seis cartões por A4
- [x] TU-07 — Desenha todos os elementos do cartão
- [x] TU-08 — Mantém área vazia quando não há foto
- [x] TU-09 — Ajusta nomes longos sem truncar
- [x] TU-10 — Separa layout da elegibilidade

### Testes de integração

- [x] TI-08 — Gera PDF da fotografia atual dos dados
- [x] TI-09 — Propaga falhas de banco e geração

## Arquivos relevantes

- `package.json`
- `package-lock.json`
- `src/lib/server/amigo-fraterno/pdf-layout.ts`
- `src/lib/server/amigo-fraterno/pdf-text.ts`
- `src/lib/server/amigo-fraterno/pdf-card.ts`
- `src/lib/server/amigo-fraterno/pdf-assets.ts`
- `src/lib/server/amigo-fraterno/pdf-generator.ts`
- `src/lib/server/amigo-fraterno/assets/casa-de-guara.jpeg`
- `src/lib/server/amigo-fraterno/assets/*.{ttf,otf}`
- `src/routes/(protected)/secretaria/amigofraterno/+page.svelte`
- `src/routes/(protected)/secretaria/amigofraterno/pdf/+server.ts`
- `tests/unit/lib/server/amigo-fraterno/`
- `tests/integration/lib/server/models/cadastro/`
