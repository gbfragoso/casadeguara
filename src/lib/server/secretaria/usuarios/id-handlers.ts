import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { error } from '@sveltejs/kit';
import { hash } from 'argon2';
import { eq } from 'drizzle-orm';
import { requireSecretariaAdminAccess } from '#lib/server/secretaria/access.js';
import validator from 'validator';

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

const load = async ({ locals, params }: RequestEvent) => {
	requireSecretariaAdminAccess(locals.user);

	const usuario = await findUser(String(params.id));
	if (!usuario) error(404, 'Usuário não encontrado');

	return { usuario };
};

const actions: Actions = {
	default: async ({ request, params, locals }) => {
		requireSecretariaAdminAccess(locals.user);

		const formData = await request.formData();
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;
		const name = formData.get('name') as string;
		const roles = formData.get('roles') as string;

		if (!validator.isEmail(username)) {
			return {
				status: 400,
				field: 'username',
				message: 'E-mail inválido',
			};
		}
		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return {
				status: 400,
				field: 'password',
				message: 'Senha não atente aos requisitos mínimos de segurança',
			};
		}

		const passwordHash = await hash(password);

		try {
			await db
				.update(user)
				.set({ username, name, passwordHash, roles: roles ? roles : undefined })
				.where(eq(user.id, String(params.id)));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, 'Falha ao atualizar os dados do usuário');
		}
	},
};

export const createSecretariaUsuariosIdAlphanumericHandlers = () => ({
	load,
	actions,
});
