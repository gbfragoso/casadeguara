import { db } from '$lib/database/connection';
import { user } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { hash } from 'argon2';
import { eq } from 'drizzle-orm';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');
	if (locals.user.id !== String(params.id)) redirect(302, '/');

	try {
		const resultado = await db
			.select()
			.from(user)
			.where(eq(user.id, String(params.id)));

		if (!resultado) {
			throw fail(404, { message: 'Usuário não encontrado' });
		}

		return { usuario: resultado[0] };
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Falha ao baixar os dados do usuário' });
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;
		const name = formData.get('name') as string;

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
				.set({ name, passwordHash })
				.where(eq(user.id, params.id));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao atualizar os dados do usuário',
			});
		}
	},
};
