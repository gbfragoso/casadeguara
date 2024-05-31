import { p as prisma } from "../../../../../chunks/prisma.js";
import { e as error } from "../../../../../chunks/index.js";
const load = async ({ params }) => {
  const autor = await prisma.autor.findUnique({
    where: {
      idautor: Number(params.id)
    }
  });
  if (!autor) {
    throw error(404, "Autor não encontrado");
  }
  return { autor };
};
const actions = {
  update: async ({ request, params }) => {
    const { nome } = Object.fromEntries(await request.formData());
    try {
      await prisma.autor.update({
        data: {
          nome: nome.toUpperCase()
        },
        where: {
          idautor: Number(params.id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao atualizar os dados do autor" });
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
