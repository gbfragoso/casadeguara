import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { serie } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { count } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/');

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') || undefined;
	const where = nome ? ulike(serie.nome, nome + '%') : undefined;

	try {
		const colecoes = async () => {
			return db
				.select()
				.from(serie)
				.offset((page - 1) * 5)
				.where(where)
				.orderBy(unaccent(serie.nome))
				.limit(5);
		};

		const counter = async () => {
			return db.select({ count: count() }).from(serie).where(where);
		};

		return { colecoes: colecoes(), counter: counter() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de coleções',
		});
	}
};
