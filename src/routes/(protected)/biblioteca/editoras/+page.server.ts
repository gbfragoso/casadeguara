import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { editora } from "$lib/database/schema";
import { error, redirect } from '@sveltejs/kit';
import { count } from "drizzle-orm";

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/");

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') || undefined;
	const where = nome ? ulike(editora.nome, nome  + "%") : undefined;

	try {
		const editoras = await db.select().from(editora).offset((page - 1) * 5).where(where).orderBy(unaccent(editora.nome)).limit(5);
		const counter = await db.select({ count: count() }).from(editora).where(where);
		const total = counter[0].count;
		return { editoras, total };
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a lista de editoras' });
	}
};