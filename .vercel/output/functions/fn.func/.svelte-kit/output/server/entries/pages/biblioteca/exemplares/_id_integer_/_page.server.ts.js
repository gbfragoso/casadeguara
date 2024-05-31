import { p as prisma } from "../../../../../chunks/prisma.js";
import { e as error } from "../../../../../chunks/index.js";
const load = async ({ params }) => {
  const exemplar = await prisma.exemplar.findUnique({
    where: {
      idexemplar: Number(params.id)
    }
  });
  if (!exemplar) {
    throw error(404, "Exemplar não encontrado");
  }
  return { exemplar };
};
const actions = {
  update: async ({ request, params }) => {
    const { status } = Object.fromEntries(await request.formData());
    try {
      await prisma.exemplar.update({
        data: {
          status
        },
        where: {
          idexemplar: Number(params.id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao atualizar os dados do exemplar" });
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
