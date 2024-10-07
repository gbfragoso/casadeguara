import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { keyword } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const chave = form.get('chave') as string;
		const where = chave !== undefined ? ulike(keyword.chave, chave + '%') : undefined;

		try {
			const keywords = await db.select().from(keyword).where(where).orderBy(unaccent(keyword.chave)).limit(50);
			return { keywords };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de palavras-chave',
			});
		}
	},
} satisfies Actions;
