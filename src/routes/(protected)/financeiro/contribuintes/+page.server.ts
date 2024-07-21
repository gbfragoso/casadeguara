import { leitor } from "$lib/database/schema";
import { ilike, count } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/login");

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') + "%" || undefined;
	const where = nome !== undefined ? ilike(leitor.nome, nome) : undefined;

	try {
		const contribuintes = await db.select().from(leitor).offset((page - 1) * 10).where(where).limit(10);
		const total = await db.select({ count: count() }).from(leitor).where(where);
		return { contribuintes, total };
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a lista de contribuintes' });
	}
};
