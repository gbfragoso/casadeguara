import { p as prisma } from "../../../../chunks/prisma.js";
import { f as fail, e as error } from "../../../../chunks/index.js";
const removeAccents = function(string) {
  return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};
const load = async ({ url, params }) => {
  const chave = removeAccents(url.searchParams.get("chave") || "");
  const keywords = await prisma.keyword.findMany({
    take: 10,
    where: {
      chave: {
        contains: chave.toUpperCase()
      }
    }
  });
  return { keywords };
};
const actions = {
  excluir: async ({ url }) => {
    const id = url.searchParams.get("id");
    if (!id) {
      return fail(400, { message: "Nenhuma palavra-chave foi selecionada para exclusão" });
    }
    try {
      await prisma.keyword.delete({
        where: {
          idkeyword: Number(id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao excluir a palavra-chave" });
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
