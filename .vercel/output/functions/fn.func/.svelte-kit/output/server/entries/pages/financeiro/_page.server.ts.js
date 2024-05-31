import { p as prisma } from "../../../chunks/prisma.js";
import { e as error } from "../../../chunks/index.js";
const load = async ({ url }) => {
  try {
    const entradas = await prisma.$queryRaw`select sum(valor), extract(month from data_entrada) as month, extract(year from data_entrada) as year from entradas group by year, month order by year, month limit 12;`;
    let entradasData = [];
    let entradasIndex = [];
    entradas.forEach((element) => {
      entradasIndex.push(element.month + "/" + element.year);
      entradasData.push(Number(element.sum));
    });
    const saidas = await prisma.$queryRaw`select sum(valor), extract(month from data_saida) as month, extract(year from data_saida) as year from saidas group by year, month order by year, month limit 12;`;
    let saidasData = [];
    let saidasIndex = [];
    saidas.forEach((element) => {
      saidasIndex.push(element.month + "/" + element.year);
      saidasData.push(Number(element.sum));
    });
    return {
      entradasData,
      entradasIndex,
      saidasData,
      saidasIndex
    };
  } catch (err) {
    return error(500, { message: "Falha ao carregar a listagem de doações" });
  }
};
export {
  load
};
