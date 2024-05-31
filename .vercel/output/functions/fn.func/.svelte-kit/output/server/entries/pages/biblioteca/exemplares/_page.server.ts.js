import { p as prisma } from "../../../../chunks/prisma.js";
import { f as fail, e as error } from "../../../../chunks/index.js";
const load = async ({ url }) => {
  const tombo = url.searchParams.get("tombo") || void 0;
  const autor = url.searchParams.get("autor") || void 0;
  const titulo = url.searchParams.get("titulo")?.toUpperCase() || void 0;
  await prisma.autor_has_livro.findMany({
    include: {
      livro_autor_has_livro_livroTolivro: {
        select: {
          tombo: true,
          titulo: true
        }
      },
      autor_autor_has_livro_autorToautor: {
        select: {
          nome: true
        }
      }
    },
    where: {
      autor_autor_has_livro_autorToautor: {
        nome: {
          startsWith: autor
        }
      }
    }
  });
  const status = url.searchParams.get("status") || void 0;
  const exemplares = await prisma.exemplar.findMany({
    take: 10,
    include: {
      livro_exemplar_livroTolivro: {
        select: {
          tombo: true,
          titulo: true
        }
      }
    },
    where: {
      livro_exemplar_livroTolivro: {
        titulo: {
          contains: titulo
        },
        tombo: {
          startsWith: tombo
        }
      },
      status
    }
  });
  return { exemplares };
};
const actions = {
  excluir: async ({ url }) => {
    const id = url.searchParams.get("id");
    if (!id) {
      return fail(400, { message: "Nenhum exemplar foi selecionada para exclusão" });
    }
    try {
      await prisma.exemplar.delete({
        where: {
          idexemplar: Number(id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao excluir o exemplar" });
    }
    return {
      status: 200
    };
  }
};
export {
  actions,
  load
};
