import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { editora } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const nome = form.get('nome') as string;
		const where = nome ? ulike(editora.nome, nome + '%') : undefined;

		try {
			const editoras = await db.select().from(editora).where(where).orderBy(unaccent(editora.nome)).limit(50);
			return { editoras };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de editoras',
			});
		}
	},
} satisfies Actions;
