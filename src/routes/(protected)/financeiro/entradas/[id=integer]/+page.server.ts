import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const entrada = await prisma.entradas.findUnique({
		where: {
			identrada: Number(params.id)
		}
	});

	if (!entrada) {
		throw error(404, 'Entrada não encontrada');
	}
	return { entrada: JSON.parse(JSON.stringify(entrada)) };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { valor, data_entrada } = Object.fromEntries(await request.formData()) as {
			valor: string;
			data_entrada: string;
		};

		try {
			await prisma.entradas.update({
				data: {
					valor: Number(valor),
					data_entrada: new Date(data_entrada)
				},
				where: {
					identrada: Number(params.id)
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados da entrada' });
		}

		return {
			status: 200
		};
	}
};
