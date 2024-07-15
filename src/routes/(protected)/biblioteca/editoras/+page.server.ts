import { prisma } from '$lib/server/prisma';
import { fail, error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const nome = url.searchParams.get('nome')?.toUpperCase() || undefined;
	const editoras = await prisma.editora.findMany({
		take: 10,
		where: {
			nome: {
				contains: nome
			}
		}
	});
	const total = await prisma.editora.count();
	return { editoras, total };
};

export const actions: Actions = {
	excluir: async ({ url }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Nenhuma editora foi selecionada para exclusão' });
		}

		try {
			await prisma.editora.delete({
				where: {
					ideditora: Number(id)
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao excluir a editora' });
		}

		return {
			status: 200
		};
	}
};
