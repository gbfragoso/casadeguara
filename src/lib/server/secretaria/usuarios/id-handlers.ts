import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { error } from '@sveltejs/kit';
import { hash } from 'argon2';
import { eq } from 'drizzle-orm';
import { requireSecretariaAdminAccess } from '#lib/server/secretaria/access.js';
import { SECRETARIA_AREA } from '#lib/server/users/area-roles.js';
import { readUserForm, validateUserForm, type UserForm } from '#lib/server/users/user-form.js';

const editableUserFields = { id: user.id, username: user.username, name: user.name, roles: user.roles };

const findUser = async (id: string) => {
	try {
		const [usuario] = await db.select(editableUserFields).from(user).where(eq(user.id, id));
		return usuario;
	} catch (err) {
		console.error(err);
		error(500, 'Falha ao baixar os dados do usuário');
	}
};

const findEditableUser = async (id: string) => {
	const usuario = await findUser(id);
	if (!usuario || !SECRETARIA_AREA.includesAny(usuario.roles)) error(404, 'Usuário não encontrado');

	return usuario;
};

const updateUser = async (id: string, { username, name, password }: UserForm, roles?: string) => {
	const passwordHash = await hash(password);

	try {
		await db.update(user).set({ username, name, passwordHash, roles }).where(eq(user.id, id));
		return { status: 200 };
	} catch (err) {
		console.error(err);
		return error(500, 'Falha ao atualizar os dados do usuário');
	}
};

const load = async ({ locals, params }: RequestEvent) => {
	requireSecretariaAdminAccess(locals.user);

	const usuario = await findEditableUser(String(params.id));

	return { usuario: { ...usuario, roles: SECRETARIA_AREA.select(usuario.roles) } };
};

const actions: Actions = {
	default: async ({ request, params, locals }) => {
		requireSecretariaAdminAccess(locals.user);

		const form = await readUserForm(request);
		const rejection = validateUserForm(form, { area: SECRETARIA_AREA, requireRoles: false });
		if (rejection) return rejection;

		const target = await findEditableUser(String(params.id));
		const roles = form.roles ? SECRETARIA_AREA.replace(target.roles, form.roles) : undefined;
		return updateUser(String(params.id), form, roles);
	},
};

export const createSecretariaUsuariosIdAlphanumericHandlers = () => ({
	load,
	actions,
});
