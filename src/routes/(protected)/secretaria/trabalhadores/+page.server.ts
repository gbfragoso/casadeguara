import { db } from '$lib/database/connection';
import { leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, count, eq, ilike } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/');

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') || undefined;
	const nameFilter = nome ? ilike(leitor.nome, nome + '%') : undefined;
	const where = and(nameFilter, eq(leitor.trab, true));

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

		const counter = await db.select({ count: count() }).from(leitor).where(where);
		const total = counter[0].count;

		return { leitores: leitores(), total };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de leitores',
		});
	}
};
