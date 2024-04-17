import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const exemplares = await prisma.exemplar.findMany({
        take: 50,
        include: {
            livro_exemplar_livroTolivro: {
                select: {
                    tombo: true,
                    titulo: true
                }
            }
        }
    });
    return { exemplares };
}

export const actions: Actions = {
    editar: async (event) => {
		console.log("editar");
	},
    excluir: async (event) => {
		console.log("excluir");
	}
};