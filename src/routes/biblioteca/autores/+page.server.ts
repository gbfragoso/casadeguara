import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const autores = await prisma.autor.findMany({
        take: 10
    });
    return { autores };
}

export const actions: Actions = {
    editar: async (event) => {
		console.log("editar");
	},
    excluir: async (event) => {
		console.log("excluir");
	}
};