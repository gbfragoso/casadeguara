import { keyword } from "$lib/database/schema";
import { ilike, count, eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/");

	const page = Number(url.searchParams.get('page') || 1);
	const chave = url.searchParams.get('chave') + "%" || undefined;
	const where = chave !== undefined ? ilike(keyword.chave, chave) : undefined;

	try {
		const keywords = await db.select().from(keyword).where(where).offset((page - 1) * 10).orderBy(keyword.chave).limit(10);
		const counter = await db.select({ count: count() }).from(keyword).where(where);
		const total = counter[0].count;

		return { keywords, total };
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a lista de palavras-chave' });
	}
};