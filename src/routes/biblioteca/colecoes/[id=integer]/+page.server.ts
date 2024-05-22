import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const colecao = await prisma.serie.findUnique({
		where: {
			idserie: Number(params.id)
		}
	});

	if (!colecao) {
		throw error(404, 'Coleção não encontrada');
	}
	return { colecao };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await prisma.serie.update({
				data: {
					nome: nome.toUpperCase()
				},
				where: {
					idserie: Number(params.id)
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados da coleção' });
		}

		return {
			status: 200
		};
	}
};
