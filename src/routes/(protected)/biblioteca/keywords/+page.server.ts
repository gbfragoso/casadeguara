import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { keyword } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { count } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/');

	const page = Number(url.searchParams.get('page') || 1);
	const chave = url.searchParams.get('chave') || undefined;
	const where = chave !== undefined ? ulike(keyword.chave, chave + '%') : undefined;

	try {
		const keywords = await db
			.select()
			.from(keyword)
			.where(where)
			.offset((page - 1) * 5)
			.orderBy(unaccent(keyword.chave))
			.limit(5);
		const counter = await db.select({ count: count() }).from(keyword).where(where);
		const total = counter[0].count;

		return { keywords, total };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de palavras-chave',
		});
	}
};
