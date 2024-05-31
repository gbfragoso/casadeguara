import { p as prisma } from "../../../../chunks/prisma.js";
import { f as fail, e as error } from "../../../../chunks/index.js";
const load = async ({ url }) => {
  const nome = url.searchParams.get("nome")?.toUpperCase() || void 0;
  const colecoes = await prisma.serie.findMany({
    take: 10,
    where: {
      nome: {
        startsWith: nome
      }
    }
  });
  return { colecoes };
};
const actions = {
  excluir: async ({ url }) => {
    const id = url.searchParams.get("id");
    if (!id) {
      return fail(400, { message: "Nenhuma coleção foi selecionada para exclusão" });
    }
    try {
      await prisma.serie.delete({
        where: {
          idserie: Number(id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao excluir a coleção" });
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
