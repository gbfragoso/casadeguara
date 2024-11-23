import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const nome = form.get('nome') as string;
		const where = nome ? ulike(leitor.nome, nome + '%') : undefined;

		try {
			const leitores = await db
				.select({ idleitor: leitor.idleitor, nome: leitor.nome, trab: leitor.trab })
				.from(leitor)
				.where(where)
				.orderBy(unaccent(leitor.nome))
				.limit(50);
			return { leitores };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de trabalhadores',
			});
		}
	},
} satisfies Actions;
