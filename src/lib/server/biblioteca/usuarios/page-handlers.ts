import type { RequestEvent } from '@sveltejs/kit';

import { db } from '$lib/server/database/connection';
import { ulike, unaccent } from '$lib/server/database/functions';
import { user } from '$lib/server/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and } from 'drizzle-orm';

const load = async ({ locals, url }: RequestEvent) => {
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

export const createBibliotecaUsuariosHandlers = () => ({
	load,
});
