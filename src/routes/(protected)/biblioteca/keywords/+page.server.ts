import { prisma } from '$lib/server/prisma';
import { fail, error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

const removeAccents = function (string: String) {
	return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const load: PageServerLoad = async ({ url, params }) => {
	const chave = removeAccents(url.searchParams.get('chave') || '');
	const keywords = await prisma.keyword.findMany({
		take: 10,
		where: {
			chave: {
				contains: chave.toUpperCase()
			}
		}
	});
	const total = await prisma.keyword.count();
	return { keywords, total };
};

export const actions: Actions = {
	excluir: async ({ url }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Nenhuma palavra-chave foi selecionada para exclusão' });
		}

		try {
			await prisma.keyword.delete({
				where: {
					idkeyword: Number(id)
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao excluir a palavra-chave' });
		}

		return {
			status: 200
		};
	}
};
