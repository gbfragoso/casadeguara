import { error, redirect } from '@sveltejs/kit';
import { autor } from "$lib/database/schema";
import { ilike, count } from "drizzle-orm";
import { db } from '$lib/database/connection';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/");

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') + "%" || undefined;
	const where = nome ? ilike(autor.nome, nome) : undefined;

	try {
		const autores = await db.select().from(autor).offset((page - 1) * 10).where(where).orderBy(autor.nome).limit(10);
		const counter = await db.select({ count: count() }).from(autor).where(where);
		const total = counter[0].count;
		return { autores, total };
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a lista de autores' });
	}
};
