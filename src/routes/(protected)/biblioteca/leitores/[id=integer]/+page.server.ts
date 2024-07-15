import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const leitor = await prisma.leitor.findUnique({
		where: {
			idleitor: Number(params.id)
		}
	});

	if (!leitor) {
		throw error(404, 'Leitor não encontrado');
	}
	return { leitor };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await prisma.leitor.update({
				data: {
					nome: nome.toUpperCase()
				},
				where: {
					idleitor: Number(params.id)
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados do leitor' });
		}

		return {
			status: 200
		};
	}
};
