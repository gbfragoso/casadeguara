# Plano de padronização dos arquivos `+page.server.ts`

## Objetivo

Padronizar os 58 arquivos `+page.server.ts` para que sejam pontos de composição finos. Cada rota deve importar uma
factory de handlers de `$lib/server`, fornecer as dependências reais e exportar `load` e `actions`. Validação,
autorização, leitura de requests, chamadas a modelos, orquestração e tradução de erros devem ficar em módulos de handler
testáveis de forma isolada.

Esta migração é estrutural. Preserve URLs, nomes de actions, status HTTP, redirects, mensagens, formatos de dados,
efeitos no banco e comportamento apresentado ao usuário.

## Estado inicial

- 58 arquivos `+page.server.ts` auditados.
- 6 rotas já usam handlers externos.
- 25 rotas possuem factories internas.
- 27 rotas possuem implementação direta.
- As regras de estrutura e testes já foram atualizadas para registrar o padrão.
- No momento em que este plano foi criado, `src/routes/(protected)/tesouraria/lancamentos/+page.svelte` continha uma
  alteração do usuário fora deste escopo. Preserve qualquer alteração não relacionada encontrada no worktree.

## Arquitetura de destino

Para cada fluxo não trivial, use esta divisão:

```text
src/routes/<rota>/+page.server.ts
  -> importa create<Resource><Operation>Handlers
  -> injeta modelos e demais dependências de produção
  -> exporta load/actions com os tipos gerados em ./$types

src/lib/server/<domínio>/<recurso>/<operação>-handlers.ts
  -> recebe dependências por um único objeto
  -> implementa autorização, parsing, validação, orquestração e tradução de erros
  -> exporta a factory para testes unitários

tests/unit/lib/server/<domínio>/<recurso>/<operação>-handlers.test.ts
  -> usa dependências injetadas e determinísticas

tests/integration/routes/<rota>/*.test.ts
  -> usa os exports reais da rota para provar a composição e as fronteiras reais
```

Use dependências estreitas, como `Pick<Modelo, 'buscar' | 'criar'>`. Não importe `./$types` a partir de `$lib` e não
exporte factories auxiliares do próprio arquivo de rota. Mantenha cada arquivo TypeScript com até 150 linhas e cada
função com até 30 linhas, conforme `code-standards.md`.

Uma implementação direta pode permanecer somente quando todo o comportamento for próprio de roteamento, sem acesso a
modelo ou serviço, parsing de entrada, validação ou tradução de erro. Registre cada exceção na seção de auditoria deste
plano com sua justificativa. A expectativa inicial é que a maioria das rotas atuais precise de handler externo.

## Estratégia de testes por rota

Antes de mover código, identifique o contrato observável existente e os testes que já o protegem. Para cada factory,
cubra somente os cenários aplicáveis:

1. A autorização ocorre antes de ler parâmetros, formulário ou dados protegidos.
2. Entradas válidas são normalizadas e encaminhadas corretamente ao modelo.
3. Entradas inválidas preservam apenas valores seguros e não chamam operações de escrita.
4. O resultado de sucesso mantém o status, redirect, mensagem e formato atuais.
5. Erros de domínio conhecidos são convertidos para o status e payload esperados.
6. Falhas inesperadas não expõem detalhes internos e são convertidas para erro HTTP sanitizado.
7. Operações transacionais confirmam commit no sucesso e rollback na falha.

Os testes unitários devem chamar a factory externa com fakes ou funções injetadas. Os testes de integração devem
importar os exports reais de `+page.server.ts` e comprovar ao menos um fluxo representativo com as dependências de
produção. Não duplique em integração toda a matriz já coberta no nível unitário.

## Processo de migração de cada rota

Execute cada recurso como uma tarefa isolada e revisável:

1. Leia a rota, seus componentes consumidores, modelos, schemas, autorização e testes existentes.
2. Registre actions, entradas, retornos, erros, redirects e efeitos persistentes que precisam ser preservados.
3. Crie o diretório funcional em `$lib/server` somente se ainda não existir.
4. Extraia factories por operação (`list-handlers.ts`, `create-handlers.ts`, `edit-handlers.ts` ou nome equivalente).
5. Injete modelos, autorizadores, relógio ou geradores somente quando forem dependências reais do comportamento.
6. Divida parsing ou mapeamento de formulário em `form.ts` apenas quando mais de um handler do recurso o reutilizar.
7. Reduza `+page.server.ts` à composição das dependências e aos exports tipados.
8. Adicione testes unitários comportamentais para a factory e ajuste testes de integração para a composição real.
9. Execute o teste unitário novo, o teste de integração relacionado e a cobertura estreita de todos os arquivos
   executáveis modificados.
10. Execute o gate completo antes de concluir a tarefa: `npm run check`, `npm test` e `npm run lint`.

Não crie uma factory CRUD genérica durante as primeiras migrações. Depois de pelo menos três recursos migrarem, extraia
infraestrutura compartilhada somente se os contratos e os tratamentos de erro forem realmente idênticos.

## Onda 0 — Baseline e proteção contra regressões

- [ ] Registrar `git status --short` e preservar alterações fora da tarefa.
- [ ] Confirmar que o banco de integração local é descartável e está disponível quando uma rota persistente entrar no
      escopo.
- [ ] Executar os testes existentes diretamente relacionados ao primeiro recurso migrado.
- [ ] Criar uma tabela de auditoria com cada rota, classificação final (`migrar`, `já compatível` ou `exceção`) e
      motivo.
- [ ] Confirmar que nenhuma migração altera contratos consumidos pelos respectivos arquivos `+page.svelte`.

## Onda 1 — Catálogos simples da biblioteca

Migre um recurso por tarefa, começando por autores como implementação de referência para CRUD simples.

- [ ] Autores:
    - `src/routes/(protected)/biblioteca/autores/+page.server.ts`
    - `src/routes/(protected)/biblioteca/autores/novo/+page.server.ts`
    - `src/routes/(protected)/biblioteca/autores/[id=integer]/+page.server.ts`
- [ ] Coleções:
    - `src/routes/(protected)/biblioteca/colecoes/+page.server.ts`
    - `src/routes/(protected)/biblioteca/colecoes/novo/+page.server.ts`
    - `src/routes/(protected)/biblioteca/colecoes/[id=integer]/+page.server.ts`
- [ ] Editoras:
    - `src/routes/(protected)/biblioteca/editoras/+page.server.ts`
    - `src/routes/(protected)/biblioteca/editoras/novo/+page.server.ts`
    - `src/routes/(protected)/biblioteca/editoras/[id=integer]/+page.server.ts`
- [ ] Palavras-chave:
    - `src/routes/(protected)/biblioteca/keywords/+page.server.ts`
    - `src/routes/(protected)/biblioteca/keywords/novo/+page.server.ts`
    - `src/routes/(protected)/biblioteca/keywords/[id=integer]/+page.server.ts`

Para cada recurso, crie handlers de listagem, criação e edição sob um diretório funcional em
`src/lib/server/biblioteca/`. Substitua os testes de integração genéricos como única evidência por testes unitários dos
handlers; mantenha os testes genéricos que ainda comprovarem a composição real sem repetir cenários.

## Onda 2 — Cadastros e conteúdo com dependências adicionais

- [ ] Leitores:
    - `src/routes/(protected)/biblioteca/leitores/+page.server.ts`
    - `src/routes/(protected)/biblioteca/leitores/novo/+page.server.ts`
    - `src/routes/(protected)/biblioteca/leitores/[id=integer]/+page.server.ts`
- [ ] Avisos:
    - `src/routes/(protected)/biblioteca/avisos/+page.server.ts`
    - `src/routes/(protected)/biblioteca/avisos/[id=integer]/+page.server.ts`
- [ ] Dashboard da biblioteca:
    - `src/routes/(protected)/biblioteca/+page.server.ts`
- [ ] Contribuintes:
    - `src/routes/(protected)/tesouraria/contribuintes/+page.server.ts`
    - `src/routes/(protected)/tesouraria/contribuintes/novo/+page.server.ts`
    - `src/routes/(protected)/tesouraria/contribuintes/[id=integer]/+page.server.ts`
- [ ] Cadastros da secretaria:
    - `src/routes/(protected)/secretaria/cadastros/+page.server.ts`
    - `src/routes/(protected)/secretaria/cadastros/novo/+page.server.ts`
    - `src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server.ts`
- [ ] Amigo Fraterno:
    - `src/routes/(protected)/secretaria/amigofraterno/+page.server.ts`

Preserve especialmente upload e enquadramento de fotos, flags de domínio, permissões distintas e traduções de erros de
cadastro. Separe colaboradores de foto dos modelos cadastrais quando ambos forem necessários.

## Onda 3 — Fluxos financeiros já compatíveis e restantes

Confirme sem reescrever os seis adaptadores já compatíveis:

- [ ] `src/routes/(protected)/tesouraria/lancamentos/+page.server.ts`
- [ ] `src/routes/(protected)/tesouraria/lancamentos/novo/+page.server.ts`
- [ ] `src/routes/(protected)/tesouraria/lancamentos/[id=integer]/estorno/+page.server.ts`
- [ ] `src/routes/(protected)/tesouraria/estornos/+page.server.ts`
- [ ] `src/routes/(protected)/biblioteca/livros/+page.server.ts`
- [ ] `src/routes/(protected)/biblioteca/livros/novo/+page.server.ts`

Migre os fluxos financeiros restantes:

- [ ] `src/routes/(protected)/tesouraria/+page.server.ts`
- [ ] `src/routes/(protected)/tesouraria/caixa/+page.server.ts`

Reutilize os serviços financeiros existentes por composição. Não mova regras de domínio de volta para handlers nem
acesse tabelas diretamente quando já existir um modelo ou serviço proprietário.

## Onda 4 — Livros e empréstimos complexos

Divida esta onda em tarefas pequenas porque as rotas possuem múltiplas ações e efeitos persistentes.

- [ ] Livro e relacionamentos:
    - `src/routes/(protected)/biblioteca/livros/[id=integer]/+page.server.ts`
    - `src/routes/(protected)/biblioteca/livros/[id=integer]/autores/+page.server.ts`
    - `src/routes/(protected)/biblioteca/livros/[id=integer]/exemplares/+page.server.ts`
    - `src/routes/(protected)/biblioteca/livros/[id=integer]/keywords/+page.server.ts`
- [ ] Empréstimos:
    - `src/routes/(protected)/biblioteca/emprestimos/+page.server.ts`
    - `src/routes/(protected)/biblioteca/emprestimos/novo/+page.server.ts`
    - `src/routes/(protected)/biblioteca/emprestimos/[id=integer]/+page.server.ts`
    - `src/routes/(protected)/biblioteca/emprestimos/[id=integer]/recibo/+page.server.ts`
- [ ] Cobranças:
    - `src/routes/(protected)/biblioteca/cobrancas/+page.server.ts`

Antes da extração, identifique limites transacionais, concorrência, dependências entre livro e exemplar, geração de
recibo e regras de devolução. Teste commit e rollback no nível que usa o banco real.

## Onda 5 — Usuários, frequência e superfícies administrativas

- [ ] Usuários da biblioteca:
    - `src/routes/(protected)/biblioteca/usuarios/+page.server.ts`
    - `src/routes/(protected)/biblioteca/usuarios/novo/+page.server.ts`
    - `src/routes/(protected)/biblioteca/usuarios/[id=alphanumeric]/+page.server.ts`
- [ ] Usuários da secretaria:
    - `src/routes/(protected)/secretaria/usuarios/+page.server.ts`
    - `src/routes/(protected)/secretaria/usuarios/novo/+page.server.ts`
    - `src/routes/(protected)/secretaria/usuarios/[id=alphanumeric]/+page.server.ts`
- [ ] Secretaria e frequência:
    - `src/routes/(protected)/secretaria/+page.server.ts`
    - `src/routes/(protected)/secretaria/aniversariantes/+page.server.ts`
    - `src/routes/(protected)/secretaria/frequencia/+page.server.ts`
    - `src/routes/(protected)/secretaria/frequencia/registro/+page.server.ts`
- [ ] Administração geral:
    - `src/routes/(protected)/sistemas/+page.server.ts`
    - `src/routes/(protected)/usuario/[id=alphanumeric]/+page.server.ts`

Não reduza testes de autorização a uma única role genérica. Preserve as diferenças entre usuário comum, administrador e
domínios biblioteca, secretaria e tesouraria.

## Onda 6 — Rotas públicas e sessão

Audite estas rotas individualmente antes de decidir se existe uma exceção legítima:

- [ ] `src/routes/+page.server.ts`
- [ ] `src/routes/acervo/+page.server.ts`
- [ ] `src/routes/recibo/[uuid=uuid]/+page.server.ts`
- [ ] `src/routes/(protected)/logout/+page.server.ts`

Login, consulta pública, recibo e encerramento de sessão possuem efeitos ou dependências de aplicação e provavelmente
devem usar handlers externos. Uma rota pode permanecer direta apenas se, após a auditoria, contiver exclusivamente um
redirect ou outra operação de roteamento sem dependências.

## Validação por tarefa

Depois de cada recurso migrado:

1. Execute os testes unitários dos handlers criados.
2. Execute os testes de integração da rota e do domínio afetado.
3. Execute cobertura com um `--coverage.include` estreito para cada rota e módulo de produção modificado, escapando
   `\(protected\)` e parâmetros como `\[id=integer\]`.
4. Confirme pelo relatório que cada arquivo incluído atingiu ao menos 80% em linhas, branches, funções e statements.
5. Execute `npm run check`, `npm test` e `npm run lint` ao concluir a tarefa.
6. Execute testes E2E somente quando a migração tocar uma jornada crítica mapeada ou quando a integração não provar o
   comportamento observável.

## Auditoria automática final

Use buscas equivalentes às seguintes para localizar lógica que permaneceu em rotas:

```powershell
rg -n "createInternal|safeParse|request\.formData|Object\.fromEntries" src/routes --glob "+page.server.ts"
rg -n "\$lib/server/database|drizzle-orm" src/routes --glob "+page.server.ts"
rg --files src/routes -g "+page.server.ts"
```

Analise cada resultado; uma busca vazia não substitui a revisão das rotas. Atualize a tabela de auditoria com qualquer
exceção aprovada e sua justificativa arquitetural.

## Critérios de conclusão

- [ ] Todos os 58 arquivos foram classificados e revisados.
- [ ] Nenhuma rota contém factory privada ou helper de aplicação.
- [ ] Rotas não excepcionadas apenas compõem dependências e exportam handlers tipados.
- [ ] Cada exceção contém somente comportamento próprio de roteamento e está registrada neste plano.
- [ ] Handlers usam dependências explícitas e estreitas, sem importar módulos de rota ou `./$types`.
- [ ] Actions, payloads, mensagens, redirects e efeitos persistentes permanecem compatíveis.
- [ ] Cenários relevantes estão cobertos no nível unitário; composição e persistência estão cobertas em integração.
- [ ] Todos os arquivos executáveis de cada tarefa passaram pelo gate de cobertura por arquivo.
- [ ] `npm run check`, `npm test` e `npm run lint` passaram na última tarefa.
- [ ] As buscas de auditoria final não mostram lógica de aplicação sem uma exceção registrada.

## Riscos e mitigação

| Risco                                                            | Mitigação                                                                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Alterar silenciosamente o contrato retornado à página            | Registrar o contrato antes da extração e manter testes pelos exports reais da rota.                    |
| Criar muitos arquivos e abstrações artificiais                   | Organizar por domínio e operação; extrair compartilhamento somente após repetição idêntica comprovada. |
| Testar a implementação em vez do comportamento                   | Derivar casos de autorização, validação, resultado e falhas observáveis.                               |
| Deixar a rota fina sem comprovação da composição real            | Manter ao menos um cenário de integração representativo por rota.                                      |
| Duplicar a mesma matriz em unitários e integração                | Concentrar branches nos unitários e reservar integração para fronteiras reais.                         |
| Ocultar falhas com casts, mocks profundos ou tratamento genérico | Corrigir tipos e dependências na origem; usar fakes injetados e erros de domínio explícitos.           |
| Produzir uma migração ampla e difícil de revisar                 | Executar um recurso por tarefa, com cobertura e gate completos antes do próximo.                       |
