import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const saida = await prisma.saidas.findUnique({
		where: {
			idsaida: Number(params.id)
		}
	});

	if (!saida) {
		throw error(404, 'Saída não encontrada');
	}
	return { saida: JSON.parse(JSON.stringify(saida)) };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { valor, data_entrada } = Object.fromEntries(await request.formData()) as {
			valor: string;
			data_entrada: string;
		};

		try {
			await prisma.saidas.update({
				data: {
					valor: Number(valor),
					data_saida: new Date(data_entrada)
				},
				where: {
					idsaida: Number(params.id)
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados da despesa' });
		}

		return {
			status: 200
		};
	}
};
