import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const { chave } = Object.fromEntries(await request.formData()) as {
			chave: string;
		};

		try {
			await prisma.leitor.create({
				data: {
					nome: chave.toUpperCase() || undefined
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao criar uma nova palavra-chave' });
		}

		return {
			status: 201
		};
	}
} satisfies Actions;
