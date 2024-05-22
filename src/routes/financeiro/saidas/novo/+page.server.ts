import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const { categoria, valor, data_saida } = Object.fromEntries(await request.formData()) as {
			categoria: string;
			valor: string;
			data_saida: string;
		};

		try {
			await prisma.despesas.create({
				data: {
					valor: valor,
					categoria: categoria,
					data_despesa: new Date(data_saida)
				}
			});
		} catch (err) {
			console.error(err);
			return error(500, { message: 'Falha ao cadastrar uma nova doação' });
		}

		return {
			status: 201
		};
	}
} satisfies Actions;
