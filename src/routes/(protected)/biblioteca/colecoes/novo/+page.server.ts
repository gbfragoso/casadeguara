import { serie } from "$lib/database/schema";
import { db } from '$lib/database/connection';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/");
}

export const actions: Actions = {
	default: async ({ request }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await db.insert(serie).values({ nome: nome.toUpperCase() });
		} catch (err) {
			return error(500, { message: 'Falha ao criar uma nova coleção' });
		}

		return {
			status: 201
		};
	}
} satisfies Actions;
