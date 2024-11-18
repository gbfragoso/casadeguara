import { db } from '$lib/database/connection';
import { user } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { hash } from 'argon2';
import { generateIdFromEntropySize } from 'lucia';
import validator from 'validator';
import type { Actions, PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
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

		const id = generateIdFromEntropySize(10);
		const passwordHash = await hash(password);

		try {
			await db.insert(user).values({ id, username, name, passwordHash, roles });
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao criar um novo usuário',
			});
		}
	},
};
