import { p as prisma } from "../../../../../chunks/prisma.js";
import { e as error } from "../../../../../chunks/index.js";
const load = async ({ params }) => {
  const editora = await prisma.editora.findUnique({
    where: {
      ideditora: Number(params.id)
    }
  });
  if (!editora) {
    throw error(404, "Editora não encontrada");
  }
  return { editora };
};
const actions = {
  update: async ({ request, params }) => {
    const { nome } = Object.fromEntries(await request.formData());
    try {
      await prisma.editora.update({
        data: {
          nome: nome.toUpperCase()
        },
        where: {
          ideditora: Number(params.id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao atualizar os dados da editora" });
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
