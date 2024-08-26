import { db } from '$lib/database/connection';
import { User } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
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

		const id = generateIdFromEntropySize(10);
		const password_hash = await hash(password);

		try {
			await db.insert(User).values({ id, username, name, password_hash, roles });
			return { status: 201 };
		} catch (err) {
			return error(500, { message: 'Falha ao criar um novo usuário' });
		}
	},
};
