import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const autor = await prisma.autor.findUnique({
		where: {
			idautor: Number(params.id)
		}
	});

	if (!autor) {
		throw error(404, 'Autor não encontrado');
	}
	return { autor };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await prisma.autor.update({
				data: {
					nome: nome.toUpperCase()
				},
				where: {
					idautor: Number(params.id)
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados do autor' });
		}

		return {
			status: 200
		};
	}
};
