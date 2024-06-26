import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const contribuinte = await prisma.contribuinte.findUnique({
		where: {
			idcontribuinte: Number(params.id)
		}
	});

	if (!contribuinte) {
		throw error(404, 'Contribuinte não encontrado');
	}
	return { contribuinte };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { nome, trabalhador } = Object.fromEntries(await request.formData()) as {
			nome: string;
			trabalhador: boolean;
		};

		try {
			await prisma.contribuinte.update({
				data: {
					nome: nome,
					trabalhador: trabalhador
				},
				where: {
					idcontribuinte: Number(params.id)
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados do contribuinte' });
		}

		return {
			status: 200
		};
	}
};
