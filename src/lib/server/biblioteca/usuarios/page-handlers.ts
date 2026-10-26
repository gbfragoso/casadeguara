import type { RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { rolesOverlap, ulike, unaccent } from '#lib/server/database/functions.js';
import { user } from '#lib/server/database/schema.js';
import { requireLibraryAdminAccess } from '#lib/server/authorization/biblioteca.js';
import { LIBRARY_AREA } from '#lib/server/users/area-roles.js';
import { error } from '@sveltejs/kit';
import { and } from 'drizzle-orm';

const listedUserFields = { id: user.id, name: user.name };

const load = async ({ locals, url }: RequestEvent) => {
	requireLibraryAdminAccess(locals.user);

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome') || undefined;
	const nameFilter = nome ? ulike(user.name, nome + '%') : undefined;

	try {
		const usuarios = async () => {
			return db
				.select(listedUserFields)
				.from(user)
				.offset((page - 1) * 5)
				.where(and(nameFilter, rolesOverlap(user.roles, LIBRARY_AREA.areaRoles)))
				.orderBy(unaccent(user.name));
		};

		return { usuarios: usuarios() };
	} catch (err) {
		console.error(err);
		return error(500, 'Falha ao carregar a lista de usuários');
	}
};

export const createBibliotecaUsuariosHandlers = () => ({
	load,
});
