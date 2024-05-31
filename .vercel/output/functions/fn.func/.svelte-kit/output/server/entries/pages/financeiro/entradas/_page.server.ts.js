import { p as prisma } from "../../../../chunks/prisma.js";
import { e as error } from "../../../../chunks/index.js";
const load = async ({ url }) => {
  const page = Number(url.searchParams.get("page") || 1);
  const nome = url.searchParams.get("contribuinte")?.toUpperCase() || void 0;
  const dataInicioString = url.searchParams.get("dataInicio") || void 0;
  const dataFimString = url.searchParams.get("dataFim") || void 0;
  let dataInicio;
  if (dataInicioString) {
    dataInicio = new Date(dataInicioString);
  }
  let dataFim;
  if (dataFimString) {
    dataFim = new Date(dataFimString);
  }
  try {
    const entradas = await prisma.entradas.findMany({
      skip: (page - 1) * 10,
      take: 10,
      include: {
        contribuinte: true
      },
      where: {
        data_entrada: {
          lte: dataFim,
          gte: dataInicio
        },
        contribuinte: {
          nome: {
            startsWith: nome
          }
        }
      },
      orderBy: {
        data_entrada: "desc"
      }
    });
    const total = await prisma.entradas.count();
    return {
      entradas: JSON.parse(JSON.stringify(entradas)),
      total
    };
  } catch (err) {
    return error(500, { message: "Falha ao carregar a listagem de doações" });
  }
};
export {
  load
};
