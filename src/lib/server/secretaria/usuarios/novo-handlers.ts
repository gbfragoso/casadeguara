import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { error } from '@sveltejs/kit';
import { hash } from 'argon2';
import { generateUserId } from '#lib/server/auth/user-id.js';
import { requireSecretariaAdminAccess } from '#lib/server/secretaria/access.js';
import validator from 'validator';

const load = async ({ locals }: RequestEvent) => {
	requireSecretariaAdminAccess(locals.user);
};

const actions: Actions = {
	default: async ({ request, locals }) => {
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

export const createSecretariaUsuariosNovoHandlers = () => ({
	load,
	actions,
});
