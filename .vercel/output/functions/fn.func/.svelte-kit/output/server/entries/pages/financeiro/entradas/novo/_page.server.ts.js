import { p as prisma } from "../../../../../chunks/prisma.js";
import { e as error } from "../../../../../chunks/index.js";
const load = async () => {
  const contribuintes = await prisma.contribuinte.findMany();
  return { contribuintes };
};
const actions = {
  default: async ({ request }) => {
    const { nome, descricao, valor, data_entrada } = Object.fromEntries(
      await request.formData()
    );
    try {
      const contribuinte = await prisma.contribuinte.findFirst({
        select: {
          idcontribuinte: true
        },
        where: {
          nome: {
            startsWith: nome.toUpperCase()
          }
        }
      });
      if (contribuinte) {
        await prisma.entradas.create({
          data: {
            idcontribuinte: Number(contribuinte.idcontribuinte),
            descricao,
            valor,
            data_entrada: new Date(data_entrada)
          }
        });
      } else {
        return {
          status: 400,
          field: "nome",
          message: "Contribuinte não encontrado"
        };
      }
    } catch (err) {
      console.log(err);
      return error(500, { message: "Falha ao cadastrar uma nova doação" });
    }
    return {
      status: 201
    };
  }
};
export {
  actions,
  load
};
