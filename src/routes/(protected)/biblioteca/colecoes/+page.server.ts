import { prisma } from '$lib/server/prisma';
import { fail, error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const nome = url.searchParams.get('nome')?.toUpperCase() || undefined;
	const colecoes = await prisma.serie.findMany({
		take: 10,
		where: {
			nome: {
				startsWith: nome
			}
		}
	});
	const total = await prisma.serie.count();
	return { colecoes, total };
};

export const actions: Actions = {
	excluir: async ({ url }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Nenhuma coleção foi selecionada para exclusão' });
		}

		try {
			await prisma.serie.delete({
				where: {
					idserie: Number(id)
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao excluir a coleção' });
		}

		return {
			status: 200
		};
	}
};
