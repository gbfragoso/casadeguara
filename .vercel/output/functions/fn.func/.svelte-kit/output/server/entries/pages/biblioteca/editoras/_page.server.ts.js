import { p as prisma } from "../../../../chunks/prisma.js";
import { f as fail, e as error } from "../../../../chunks/index.js";
const load = async ({ url }) => {
  const nome = url.searchParams.get("nome")?.toUpperCase() || void 0;
  const editoras = await prisma.editora.findMany({
    take: 10,
    where: {
      nome: {
        contains: nome
      }
    }
  });
  return { editoras };
};
const actions = {
  excluir: async ({ url }) => {
    const id = url.searchParams.get("id");
    if (!id) {
      return fail(400, { message: "Nenhuma editora foi selecionada para exclusão" });
    }
    try {
      await prisma.editora.delete({
        where: {
          ideditora: Number(id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao excluir a editora" });
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
