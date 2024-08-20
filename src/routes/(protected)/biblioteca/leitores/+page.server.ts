import { leitor } from "$lib/database/schema";
import { ilike, count } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/");

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') || undefined;
	const where = nome ? ilike(leitor.nome, nome + "%") : undefined;

	try {
		const leitores = await db.select().from(leitor).offset((page - 1) * 5).where(where).orderBy(leitor.nome).limit(5);
		const counter = await db.select({ count: count() }).from(leitor).where(where);
		const total = counter[0].count;
		return { leitores, total };
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a lista de leitores' });
	}
};
