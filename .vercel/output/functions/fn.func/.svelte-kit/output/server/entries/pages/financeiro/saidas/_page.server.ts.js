import { p as prisma } from "../../../../chunks/prisma.js";
const load = async ({ url }) => {
  const page = Number(url.searchParams.get("page") || 1);
  const descricao = url.searchParams.get("descricao") || void 0;
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
  const saidas = await prisma.saidas.findMany({
    skip: (page - 1) * 10,
    take: 10,
    where: {
      data_saida: {
        lte: dataFim,
        gte: dataInicio
      },
      descricao: {
        startsWith: descricao
      }
    }
  });
  const total = await prisma.saidas.count();
  return {
    saidas: JSON.parse(JSON.stringify(saidas)),
    total
  };
};
export {
  load
};
