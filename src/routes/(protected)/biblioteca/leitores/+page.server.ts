import { db } from '$lib/database/connection';
import { leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { count, ilike } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/');

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') || undefined;
	const where = nome ? ilike(leitor.nome, nome + '%') : undefined;

	try {
		const leitores = async () => {
			return db
				.select()
				.from(leitor)
				.offset((page - 1) * 5)
				.where(where)
				.orderBy(leitor.nome)
				.limit(5);
		};

		const counter = async () => {
			return db.select({ count: count() }).from(leitor).where(where);
		};

		return { leitores: leitores(), counter: counter() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de leitores',
		});
	}
};
