import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const contribuinte = await prisma.leitor.findUnique({
		where: {
			idleitor: Number(params.id)
		}
	});

	if (!contribuinte) {
		throw error(404, 'Contribuinte não encontrado');
	}
	return { contribuinte };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formdata = await request.formData();
		const nome = String(formdata.get('nome'));
		const trabalhador = Boolean(formdata.get('trabalhador'));

		try {
			await prisma.leitor.update({
				data: {
					nome: nome,
					trab: trabalhador
				},
				where: {
					idleitor: Number(params.id)
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
