import { p as prisma } from "../../../../../chunks/prisma.js";
import { e as error } from "../../../../../chunks/index.js";
const load = async ({ params }) => {
  const leitor = await prisma.leitor.findUnique({
    where: {
      idleitor: Number(params.id)
    }
  });
  if (!leitor) {
    throw error(404, "Leitor não encontrado");
  }
  return { leitor };
};
const actions = {
  update: async ({ request, params }) => {
    const { nome } = Object.fromEntries(await request.formData());
    try {
      await prisma.leitor.update({
        data: {
          nome: nome.toUpperCase()
        },
        where: {
          idleitor: Number(params.id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao atualizar os dados do leitor" });
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
