import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { hash } from 'argon2';
import { eq } from 'drizzle-orm';

const requireAccountOwner = (accountUser: App.Locals['user'], accountId: string) => {
	if (!accountUser || accountUser.id !== accountId) redirect(302, '/');

	return accountUser;
};

const accountFields = { id: user.id, username: user.username, name: user.name };

const findUser = async (id: string) => {
	try {
		const [usuario] = await db.select(accountFields).from(user).where(eq(user.id, id));
		return usuario;
	} catch (err) {
		console.error(err);
		error(500, 'Falha ao baixar os dados do usuário');
	}
};

const load = async ({ locals, params }: RequestEvent) => {
	requireAccountOwner(locals.user, String(params.id));

	const usuario = await findUser(String(params.id));
	if (!usuario) error(404, 'Usuário não encontrado');

	return { usuario };
};

const actions: Actions = {
	default: async ({ request, params, locals }) => {
		requireAccountOwner(locals.user, String(params.id));

		const formData = await request.formData();
		const password = formData.get('password') as string;
		const name = formData.get('name') as string;

		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return {
				status: 400,
				field: 'password',
				message: 'Senha não atende aos requisitos mínimos de segurança',
			};
		}

		const passwordHash = await hash(password);

		try {
			await db
				.update(user)
				.set({ name, passwordHash })
				.where(eq(user.id, String(params.id)));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, 'Falha ao atualizar os dados do usuário');
		}
	},
};

export const createUsuarioDetailHandlers = () => ({
	load,
	actions,
});
