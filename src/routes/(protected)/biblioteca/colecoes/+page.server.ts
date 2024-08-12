import { error } from '@sveltejs/kit';
import { serie } from "$lib/database/schema";
import { ilike, count } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/");

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') + "%" || undefined;
	const where = nome ? ilike(serie.nome, nome) : undefined;

	try {
		const colecoes = await db.select().from(serie).offset((page - 1) * 10).where(where).orderBy(serie.nome).limit(10);
		const counter = await db.select({ count: count() }).from(serie).where(where);
		const total = counter[0].count;
		return { colecoes, total };
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a lista de coleções' });
	}
};