import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { error } from '@sveltejs/kit';
import { hash } from 'argon2';
import { generateUserId } from '#lib/server/auth/user-id.js';
import { requireLibraryAdminAccess } from '#lib/server/authorization/biblioteca.js';
import { LIBRARY_AREA } from '#lib/server/users/area-roles.js';
import { readUserForm, validateUserForm } from '#lib/server/users/user-form.js';

const load = async ({ locals }: RequestEvent) => {
	requireLibraryAdminAccess(locals.user);
};

const actions: Actions = {
	default: async ({ request, locals }) => {
		requireLibraryAdminAccess(locals.user);

		const form = await readUserForm(request);
		const rejection = validateUserForm(form, { area: LIBRARY_AREA, requireRoles: true });
		if (rejection) return rejection;

		const { username, name, password, roles } = form;
		const id = generateUserId();
		const passwordHash = await hash(password);

		try {
			await db.insert(user).values({ id, username, name, passwordHash, roles });
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, 'Falha ao criar um novo usuário');
		}
	},
};

export const createBibliotecaUsuariosNovoHandlers = () => ({
	load,
	actions,
});
