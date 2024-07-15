import { prisma } from '$lib/server/prisma';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) redirect(302, "/login");
	return {
		username: event.locals.user.username
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await prisma.autor.create({
				data: {
					nome: nome.toUpperCase()
				}
			});
		} catch (err) {
			return error(500, { message: 'Falha ao criar um novo autor' });
		}

		return {
			status: 201
		};
	}
} satisfies Actions;
