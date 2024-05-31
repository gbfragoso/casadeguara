import { p as prisma } from "../../../../chunks/prisma.js";
const load = async ({ url }) => {
  const nome = url.searchParams.get("nome")?.toUpperCase() || void 0;
  const autores = await prisma.autor.findMany({
    take: 10,
    where: {
      nome: {
        startsWith: nome
      }
    }
  });
  return { autores };
};
export {
  load
};
