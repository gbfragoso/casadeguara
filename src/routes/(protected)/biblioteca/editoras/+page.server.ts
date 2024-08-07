import { editora } from "$lib/database/schema";
import { ilike, count } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/");

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') + "%" || undefined;
	const where = nome !== undefined ? ilike(editora.nome, nome) : undefined;

	try {
		const editoras = await db.select().from(editora).offset((page - 1) * 10).where(where).limit(10);
		const total = await db.select({ count: count() }).from(editora).where(where);
		return { editoras, total };
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a lista de editoras' });
	}
};