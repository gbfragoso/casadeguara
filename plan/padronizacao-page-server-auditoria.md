# Auditoria da padronização de `+page.server.ts`

Todas as 58 rotas foram migradas ou confirmadas como adaptadores finos. A lógica de aplicação foi movida para factories
em `src/lib/server`; não há exceções diretas aprovadas.

| Rota                                                                                 | Classificação | Handler         |
| ------------------------------------------------------------------------------------ | ------------- | --------------- |
| `src/routes/(protected)/biblioteca/+page.server.ts`                                  | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/autores/+page.server.ts`                          | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/autores/[id=integer]/+page.server.ts`             | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/autores/novo/+page.server.ts`                     | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/avisos/+page.server.ts`                           | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/avisos/[id=integer]/+page.server.ts`              | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/cobrancas/+page.server.ts`                        | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/colecoes/+page.server.ts`                         | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/colecoes/[id=integer]/+page.server.ts`            | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/colecoes/novo/+page.server.ts`                    | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/editoras/+page.server.ts`                         | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/editoras/[id=integer]/+page.server.ts`            | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/editoras/novo/+page.server.ts`                    | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/emprestimos/+page.server.ts`                      | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/emprestimos/[id=integer]/+page.server.ts`         | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/emprestimos/[id=integer]/recibo/+page.server.ts`  | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/emprestimos/novo/+page.server.ts`                 | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/keywords/+page.server.ts`                         | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/keywords/[id=integer]/+page.server.ts`            | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/keywords/novo/+page.server.ts`                    | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/leitores/+page.server.ts`                         | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/leitores/[id=integer]/+page.server.ts`            | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/leitores/novo/+page.server.ts`                    | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/livros/+page.server.ts`                           | já compatível | factory externa |
| `src/routes/(protected)/biblioteca/livros/[id=integer]/+page.server.ts`              | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/livros/[id=integer]/autores/+page.server.ts`      | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/livros/[id=integer]/exemplares/+page.server.ts`   | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/livros/[id=integer]/keywords/+page.server.ts`     | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/livros/novo/+page.server.ts`                      | já compatível | factory externa |
| `src/routes/(protected)/biblioteca/usuarios/+page.server.ts`                         | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/usuarios/[id=alphanumeric]/+page.server.ts`       | migrar        | factory externa |
| `src/routes/(protected)/biblioteca/usuarios/novo/+page.server.ts`                    | migrar        | factory externa |
| `src/routes/(protected)/logout/+page.server.ts`                                      | migrar        | factory externa |
| `src/routes/(protected)/secretaria/+page.server.ts`                                  | migrar        | factory externa |
| `src/routes/(protected)/secretaria/amigofraterno/+page.server.ts`                    | migrar        | factory externa |
| `src/routes/(protected)/secretaria/aniversariantes/+page.server.ts`                  | migrar        | factory externa |
| `src/routes/(protected)/secretaria/cadastros/+page.server.ts`                        | migrar        | factory externa |
| `src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server.ts`           | migrar        | factory externa |
| `src/routes/(protected)/secretaria/cadastros/novo/+page.server.ts`                   | migrar        | factory externa |
| `src/routes/(protected)/secretaria/frequencia/+page.server.ts`                       | migrar        | factory externa |
| `src/routes/(protected)/secretaria/frequencia/registro/+page.server.ts`              | migrar        | factory externa |
| `src/routes/(protected)/secretaria/usuarios/+page.server.ts`                         | migrar        | factory externa |
| `src/routes/(protected)/secretaria/usuarios/[id=alphanumeric]/+page.server.ts`       | migrar        | factory externa |
| `src/routes/(protected)/secretaria/usuarios/novo/+page.server.ts`                    | migrar        | factory externa |
| `src/routes/(protected)/sistemas/+page.server.ts`                                    | migrar        | factory externa |
| `src/routes/(protected)/tesouraria/+page.server.ts`                                  | migrar        | factory externa |
| `src/routes/(protected)/tesouraria/caixa/+page.server.ts`                            | migrar        | factory externa |
| `src/routes/(protected)/tesouraria/contribuintes/+page.server.ts`                    | migrar        | factory externa |
| `src/routes/(protected)/tesouraria/contribuintes/[id=integer]/+page.server.ts`       | migrar        | factory externa |
| `src/routes/(protected)/tesouraria/contribuintes/novo/+page.server.ts`               | migrar        | factory externa |
| `src/routes/(protected)/tesouraria/estornos/+page.server.ts`                         | já compatível | factory externa |
| `src/routes/(protected)/tesouraria/lancamentos/+page.server.ts`                      | já compatível | factory externa |
| `src/routes/(protected)/tesouraria/lancamentos/[id=integer]/estorno/+page.server.ts` | já compatível | factory externa |
| `src/routes/(protected)/tesouraria/lancamentos/novo/+page.server.ts`                 | já compatível | factory externa |
| `src/routes/(protected)/usuario/[id=alphanumeric]/+page.server.ts`                   | migrar        | factory externa |
| `src/routes/+page.server.ts`                                                         | migrar        | factory externa |
| `src/routes/acervo/+page.server.ts`                                                  | migrar        | factory externa |
| `src/routes/recibo/[uuid=uuid]/+page.server.ts`                                      | migrar        | factory externa |

## Evidências

- As rotas exportam somente `load` e/ou `actions` obtidos de factories externas.
- A busca de auditoria por `safeParse`, `request.formData`, `Object.fromEntries`, acesso a banco e `createInternal` em
  rotas não encontrou resultados.
- A alteração pré-existente em `src/routes/(protected)/tesouraria/lancamentos/+page.svelte` foi preservada.
