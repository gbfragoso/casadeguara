import { db } from '$lib/database/connection';
import { leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { count } from 'drizzle-orm';
import { ulike, unaccent } from '$lib/database/functions';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/');

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') || undefined;
	const where = nome ? ulike(leitor.nome, nome + '%') : undefined;

	try {
		const contribuintes = async () => {
			return db
				.select({ idleitor: leitor.idleitor, nome: leitor.nome, trab: leitor.trab })
				.from(leitor)
				.offset((page - 1) * 5)
				.where(where)
				.orderBy(unaccent(leitor.nome))
				.limit(5);
		};

		const counter = await db.select({ count: count() }).from(leitor).where(where);
		const total = counter[0].count;

		return { contribuintes: contribuintes(), total };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de contribuintes',
		});
	}
};
