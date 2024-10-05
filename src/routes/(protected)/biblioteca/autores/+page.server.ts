import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { autor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const nome = form.get('nome') as string;
		const where = nome ? ulike(autor.nome, nome + '%') : undefined;

		try {
			const autores = await db.select().from(autor).where(where).orderBy(unaccent(autor.nome)).limit(50);
			return { autores };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de autores',
			});
		}
	},
} satisfies Actions;
