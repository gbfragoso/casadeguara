import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { User } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { count } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/');

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') || undefined;
	const where = nome ? ulike(User.name, nome + '%') : undefined;

	try {
		const usuarios = async () => {
			return db
				.select()
				.from(User)
				.offset((page - 1) * 5)
				.where(where)
				.orderBy(unaccent(User.name))
				.limit(5);
		};

		const counter = async () => {
			return db.select({ count: count() }).from(User).where(where);
		};

		return { usuarios: usuarios(), counter: counter() };
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Falha ao carregar a lista de usuários' });
	}
};
