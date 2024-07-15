import { prisma } from '$lib/server/prisma';
import { fail, error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const tombo = url.searchParams.get('tombo') || undefined;
	const titulo = url.searchParams.get('titulo')?.toUpperCase() || undefined;
	const editora = url.searchParams.get('editora') || undefined;
	const autor = url.searchParams.get('autor') || undefined;
	const livros = await prisma.livro.findMany({
		take: 10,
		include: {
			editora_livro_editoraToeditora: {
				select: {
					nome: true
				}
			},
			serie_livro_serieToserie: {
				select: {
					nome: true
				}
			}
		},
		where: {
			titulo: {
				contains: titulo
			},
			tombo: {
				startsWith: tombo
			}
		}
	});
	const total = await prisma.livro.count();
	return { livros, total };
};

export const actions: Actions = {
	excluir: async ({ url }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Nenhum livro foi selecionada para exclusão' });
		}

		try {
			await prisma.livro.delete({
				where: {
					idlivro: Number(id)
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao excluir o livro' });
		}

		return {
			status: 200
		};
	}
};
