import { p as prisma } from "../../../../../chunks/prisma.js";
import { e as error } from "../../../../../chunks/index.js";
const load = async ({ params }) => {
  const saida = await prisma.saidas.findUnique({
    where: {
      idsaida: Number(params.id)
    }
  });
  if (!saida) {
    throw error(404, "Saída não encontrada");
  }
  return { saida: JSON.parse(JSON.stringify(saida)) };
};
const actions = {
  update: async ({ request, params }) => {
    const { valor, data_entrada } = Object.fromEntries(await request.formData());
    try {
      await prisma.saidas.update({
        data: {
          valor: Number(valor),
          data_saida: new Date(data_entrada)
        },
        where: {
          idsaida: Number(params.id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao atualizar os dados da despesa" });
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
