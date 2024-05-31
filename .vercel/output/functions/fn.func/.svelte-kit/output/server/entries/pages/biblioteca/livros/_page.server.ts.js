import { p as prisma } from "../../../../chunks/prisma.js";
import { f as fail, e as error } from "../../../../chunks/index.js";
const load = async ({ url }) => {
  const tombo = url.searchParams.get("tombo") || void 0;
  const titulo = url.searchParams.get("titulo")?.toUpperCase() || void 0;
  url.searchParams.get("editora") || void 0;
  url.searchParams.get("autor") || void 0;
  const livros = await prisma.livro.findMany({
    take: 10,
    include: {
      editora_livro_editoraToeditora: {
        select: {
          nome: true
        }
      },
      serie_livro_serieToserie: {
        select: {
          nome: true
        }
      }
    },
    where: {
      titulo: {
        contains: titulo
      },
      tombo: {
        startsWith: tombo
      }
    }
  });
  return { livros };
};
const actions = {
  excluir: async ({ url }) => {
    const id = url.searchParams.get("id");
    if (!id) {
      return fail(400, { message: "Nenhum livro foi selecionada para exclusão" });
    }
    try {
      await prisma.livro.delete({
        where: {
          idlivro: Number(id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao excluir o livro" });
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
