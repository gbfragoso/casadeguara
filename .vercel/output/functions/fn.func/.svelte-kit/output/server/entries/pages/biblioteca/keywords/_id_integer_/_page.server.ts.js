import { p as prisma } from "../../../../../chunks/prisma.js";
import { e as error } from "../../../../../chunks/index.js";
const load = async ({ params }) => {
  const keyword = await prisma.keyword.findUnique({
    where: {
      idkeyword: Number(params.id)
    }
  });
  if (!keyword) {
    throw error(404, "Palavra-chave não encontrada");
  }
  return { keyword };
};
const actions = {
  update: async ({ request, params }) => {
    const { chave } = Object.fromEntries(await request.formData());
    try {
      await prisma.keyword.update({
        data: {
          chave: chave.toUpperCase()
        },
        where: {
          idkeyword: Number(params.id)
        }
      });
    } catch (err) {
      return error(500, { message: "Falha ao atualizar os dados da palavra-chave" });
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
