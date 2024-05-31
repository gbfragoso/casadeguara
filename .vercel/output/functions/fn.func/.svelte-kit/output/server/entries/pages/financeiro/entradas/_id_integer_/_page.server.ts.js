import { p as prisma } from "../../../../../chunks/prisma.js";
import { e as error } from "../../../../../chunks/index.js";
const load = async ({ params }) => {
  const entrada = await prisma.entradas.findUnique({
    where: {
      identrada: Number(params.id)
    }
  });
  if (!entrada) {
    throw error(404, "Entrada não encontrada");
  }
  return { entrada: JSON.parse(JSON.stringify(entrada)) };
};
const actions = {
  update: async ({ request, params }) => {
    const { valor, data_entrada } = Object.fromEntries(await request.formData());
    try {
      await prisma.entradas.update({
        data: {
          valor: Number(valor),
          data_entrada: new Date(data_entrada)
        },
        where: {
          identrada: Number(params.id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao atualizar os dados da entrada" });
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
