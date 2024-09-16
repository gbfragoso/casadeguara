import { db } from '$lib/database/connection';
import { user } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { hash } from 'argon2';
import { eq } from 'drizzle-orm';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const resultado = await db
			.select()
			.from(user)
			.where(eq(user.id, String(params.id)));

		if (!resultado) {
			throw fail(404, { message: 'Autor não encontrado' });
		}

		return { usuario: resultado[0] };
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Falha ao baixar os dados do autor' });
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;
		const name = formData.get('name') as string;
		const roles = formData.get('roles') as string;

		if (validator.isEmail(username)) {
			return fail(400, {
				message: 'Invalid username',
			});
		}
		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: 'Invalid password',
			});
		}

		const passwordHash = await hash(password);

		try {
			await db.update(user).set({ username, name, passwordHash, roles }).where(eq(user.id, params.id));
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao criar um novo usuário',
			});
		}
	},
};
