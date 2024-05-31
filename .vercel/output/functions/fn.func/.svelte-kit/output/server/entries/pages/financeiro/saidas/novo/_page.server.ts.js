import { p as prisma } from "../../../../../chunks/prisma.js";
import { e as error } from "../../../../../chunks/index.js";
const actions = {
  default: async ({ request }) => {
    const { descricao, valor, data_saida } = Object.fromEntries(await request.formData());
    try {
      await prisma.saidas.create({
        data: {
          valor,
          descricao,
          data_saida: new Date(data_saida)
        }
      });
    } catch (err) {
      console.error(err);
      return error(500, { message: "Falha ao cadastrar um novo pagamento" });
    }
    return {
      status: 201
    };
  }
};
export {
  actions
};
