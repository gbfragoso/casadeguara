import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await prisma.editora.create({
				data: {
					nome: nome.toUpperCase()
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao criar uma nova editora' });
		}

		return {
			status: 201
		};
	}
} satisfies Actions;
