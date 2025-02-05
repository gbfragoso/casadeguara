import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { user } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/');

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') || undefined;
	const nameFilter = nome ? ulike(user.name, nome + '%') : undefined;

	try {
		const usuarios = async () => {
			return db
				.select()
				.from(user)
				.offset((page - 1) * 5)
				.where(and(nameFilter, ulike(user.roles, 'biblioteca%')))
				.orderBy(unaccent(user.name));
		};

		return { usuarios: usuarios() };
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Falha ao carregar a lista de usuários' });
	}
};
