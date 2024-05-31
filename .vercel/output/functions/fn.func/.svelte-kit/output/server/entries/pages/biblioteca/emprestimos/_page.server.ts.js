import { p as prisma } from "../../../../chunks/prisma.js";
const load = async ({ url }) => {
  const leitor = url.searchParams.get("leitor")?.toUpperCase() || void 0;
  const titulo = url.searchParams.get("titulo")?.toUpperCase() || void 0;
  const ativos = url.searchParams.get("ativos");
  const atrasados = url.searchParams.get("atrasados");
  const emprestimos = await prisma.emprestimo.findMany({
    take: 10,
    include: {
      leitor_emprestimo_leitorToleitor: {
        select: {
          idleitor: true,
          nome: true
        }
      },
      exemplar_emprestimo_exemplarToexemplar: {
        include: {
          livro_exemplar_livroTolivro: true
        }
      }
    },
    where: {
      ...leitor ? {
        leitor_emprestimo_leitorToleitor: {
          nome: {
            contains: leitor,
            mode: "insensitive"
          }
        }
      } : {},
      ...titulo ? {
        exemplar_emprestimo_exemplarToexemplar: {
          livro_exemplar_livroTolivro: {
            titulo: {
              startsWith: titulo,
              mode: "insensitive"
            }
          }
        }
      } : {},
      ...ativos ? {
        data_devolvido: null
      } : {},
      ...atrasados ? {
        AND: [
          {
            data_devolvido: null
          },
          {
            data_devolucao: {
              lt: /* @__PURE__ */ new Date()
            }
          }
        ]
      } : {}
    }
  });
  return { emprestimos };
};
export {
  load
};
