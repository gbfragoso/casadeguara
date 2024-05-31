import { p as prisma } from "../../../../chunks/prisma.js";
const load = async ({ url }) => {
  const nome = url.searchParams.get("nome")?.toUpperCase() || void 0;
  const leitores = await prisma.leitor.findMany({
    take: 10,
    where: {
      nome: {
        contains: nome
      }
    }
  });
  return { leitores };
};
export {
  load
};
