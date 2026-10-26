import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { error } from '@sveltejs/kit';
import { hash } from 'argon2';
import { eq } from 'drizzle-orm';
import { requireLibraryAdminAccess } from '#lib/server/authorization/biblioteca.js';
import { LIBRARY_AREA } from '#lib/server/users/area-roles.js';
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

const findEditableUser = async (id: string, editor: { roles: string }) => {
	const usuario = await findUser(id);
	if (!usuario || !LIBRARY_AREA.includesAny(usuario.roles)) error(404, 'Usuário não encontrado');
	if (!LIBRARY_AREA.administersOtherAreasOf(editor, usuario)) {
		error(401, 'Usuário não possui acesso administrativo às demais áreas deste usuário');
	}

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
	const editor = requireLibraryAdminAccess(locals.user);

	const usuario = await findEditableUser(String(params.id), editor);

	return { usuario: { ...usuario, roles: LIBRARY_AREA.select(usuario.roles) } };
};

const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const editor = requireLibraryAdminAccess(locals.user);

		const form = await readUserForm(request);
		const rejection = validateUserForm(form, { area: LIBRARY_AREA, requireRoles: false });
		if (rejection) return rejection;

		const target = await findEditableUser(String(params.id), editor);
		const roles = form.roles ? LIBRARY_AREA.replace(target.roles, form.roles) : undefined;
		return updateUser(String(params.id), form, roles);
	},
};

export const createBibliotecaUsuariosIdAlphanumericHandlers = () => ({
	load,
	actions,
});
