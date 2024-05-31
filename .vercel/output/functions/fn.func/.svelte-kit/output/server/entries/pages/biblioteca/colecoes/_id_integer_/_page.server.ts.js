import { p as prisma } from "../../../../../chunks/prisma.js";
import { e as error } from "../../../../../chunks/index.js";
const load = async ({ params }) => {
  const colecao = await prisma.serie.findUnique({
    where: {
      idserie: Number(params.id)
    }
  });
  if (!colecao) {
    throw error(404, "Coleção não encontrada");
  }
  return { colecao };
};
const actions = {
  update: async ({ request, params }) => {
    const { nome } = Object.fromEntries(await request.formData());
    try {
      await prisma.serie.update({
        data: {
          nome: nome.toUpperCase()
        },
        where: {
          idserie: Number(params.id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao atualizar os dados da coleção" });
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
