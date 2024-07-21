import { keyword } from "$lib/database/schema";
import { ilike, count } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/login");
	
	const page = Number(url.searchParams.get('page') || 1);
	const chave = url.searchParams.get('chave') + "%" || undefined;
	const where = chave !== undefined ? ilike(keyword.chave, chave) : undefined;

	try {
		const keywords = await db.select().from(keyword).offset((page - 1) * 10).where(where).limit(10);
		const total = await db.select({ count: count() }).from(keyword).where(where);
		return { keywords, total };
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a lista de palavras-chave' });
	}
};