import { p as prisma } from "../../../../chunks/prisma.js";
const load = async ({ url }) => {
  const page = Number(url.searchParams.get("page") || 1);
  const nome = url.searchParams.get("nome")?.toUpperCase() || void 0;
  const contribuintes = await prisma.contribuinte.findMany({
    skip: (page - 1) * 10,
    take: 10,
    where: {
      nome: {
        startsWith: nome
      }
    }
  });
  const total = await prisma.contribuinte.count();
  return { contribuintes, total };
};
export {
  load
};
