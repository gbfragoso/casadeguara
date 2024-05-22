import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const keyword = await prisma.keyword.findUnique({
		where: {
			idkeyword: Number(params.id)
		}
	});

	if (!keyword) {
		throw error(404, 'Palavra-chave não encontrada');
	}
	return { keyword };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { chave } = Object.fromEntries(await request.formData()) as {
			chave: string;
		};

		try {
			await prisma.keyword.update({
				data: {
					chave: chave.toUpperCase()
				},
				where: {
					idkeyword: Number(params.id)
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados da palavra-chave' });
		}

		return {
			status: 200
		};
	}
};
