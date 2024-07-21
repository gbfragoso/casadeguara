import { exemplar } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';

import { fail, error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const tombo = url.searchParams.get('tombo') || undefined;
	const autor = url.searchParams.get('autor') || undefined;
	const titulo = url.searchParams.get('titulo')?.toUpperCase() || undefined;
	// await prisma.autor_has_livro.findMany({
	// 	include: {
	// 		livro_autor_has_livro_livroTolivro: {
	// 			select: {
	// 				tombo: true,
	// 				titulo: true
	// 			}
	// 		},
	// 		autor_autor_has_livro_autorToautor: {
	// 			select: {
	// 				nome: true
	// 			}
	// 		}
	// 	},
	// 	where: {
	// 		autor_autor_has_livro_autorToautor: {
	// 			nome: {
	// 				startsWith: autor
	// 			}
	// 		}
	// 	}
	// });
	// const status = url.searchParams.get('status') || undefined;
	// const exemplares = await prisma.exemplar.findMany({
	// 	take: 10,
	// 	include: {
	// 		livro_exemplar_livroTolivro: {
	// 			select: {
	// 				tombo: true,
	// 				titulo: true
	// 			}
	// 		}
	// 	},
	// 	where: {
	// 		livro_exemplar_livroTolivro: {
	// 			titulo: {
	// 				contains: titulo
	// 			},
	// 			tombo: {
	// 				startsWith: tombo
	// 			}
	// 		},
	// 		status: status
	// 	}
	// });
	return { };
};

export const actions: Actions = {
	excluir: async ({ url }) => {
		// const id = url.searchParams.get('id');
		// if (!id) {
		// 	return fail(400, { message: 'Nenhum exemplar foi selecionada para exclusão' });
		// }

		// try {
		// 	await prisma.exemplar.delete({
		// 		where: {
		// 			idexemplar: Number(id)
		// 		}
		// 	});
		// } catch (err) {
		// 	return error(500, { message: 'Falha ao excluir o exemplar' });
		// }

		return {
			status: 200
		};
	}
};
