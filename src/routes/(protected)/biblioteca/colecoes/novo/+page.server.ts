import { db } from '$lib/database/connection';
import { serie } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const nome = form.get('nome') as string;

		if (validator.isEmpty(nome, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome da coleção é obrigatório',
			};
		}

		if (validator.isNumeric(nome)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do coleção não pode conter somente números',
			};
		}

		try {
			await db.insert(serie).values({ nome: nome.toUpperCase() });
			return { status: 201 };
		} catch (err) {
			return error(500, { message: 'Falha ao criar uma nova coleção' });
		}
	},
} satisfies Actions;
