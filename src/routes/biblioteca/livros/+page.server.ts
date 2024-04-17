import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const livros = await prisma.livro.findMany({
        take: 10,
        include: {
            editora_livro_editoraToeditora: {
                select: {
                    nome: true
                }
            }
        }
    });
    return { livros };
}

export const actions: Actions = {
    editar: async (event) => {
		console.log("editar");
	},
    excluir: async (event) => {
		console.log("excluir");
	}
};