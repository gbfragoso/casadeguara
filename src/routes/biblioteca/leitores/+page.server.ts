import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const leitores = await prisma.leitor.findMany({
        take: 10
    });
    return { leitores };
}

export const actions: Actions = {
    editar: async (event) => {
		console.log("editar");
	},
    excluir: async (event) => {
		console.log("excluir");
	}
};