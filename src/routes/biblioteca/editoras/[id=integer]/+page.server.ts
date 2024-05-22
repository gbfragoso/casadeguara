import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const editora = await prisma.editora.findUnique({
		where: {
			ideditora: Number(params.id)
		}
	});

	if (!editora) {
		throw error(404, 'Editora não encontrada');
	}
	return { editora };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await prisma.editora.update({
				data: {
					nome: nome.toUpperCase()
				},
				where: {
					ideditora: Number(params.id)
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados da editora' });
		}

		return {
			status: 200
		};
	}
};
