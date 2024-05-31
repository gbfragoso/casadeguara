import { p as prisma } from "../../../../../chunks/prisma.js";
import { e as error } from "../../../../../chunks/index.js";
const actions = {
  default: async ({ request }) => {
    const { chave } = Object.fromEntries(await request.formData());
    try {
      await prisma.keyword.create({
        data: {
          chave: chave.toUpperCase()
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao criar uma nova palavra-chave" });
    }
    return {
      status: 201
    };
  }
};
export {
  actions
};
