import { p as prisma } from "../../../../../chunks/prisma.js";
import { e as error } from "../../../../../chunks/index.js";
const actions = {
  default: async ({ request }) => {
    const { nome } = Object.fromEntries(await request.formData());
    try {
      await prisma.serie.create({
        data: {
          nome: nome.toUpperCase()
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao criar uma nova coleção" });
    }
    return {
      status: 201
    };
  }
};
export {
  actions
};
