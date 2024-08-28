import { db } from '$lib/database/connection';
import { keyword } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const chave = form.get('chave') as string;

		if (validator.isEmpty(chave, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'chave',
				message: 'Descrição da palavra-chave é obrigatório',
			};
		}

		if (validator.isNumeric(chave)) {
			return {
				status: 400,
				field: 'chave',
				message: 'Palavra-chave não pode conter somente números',
			};
		}

		try {
			await db.insert(keyword).values({ chave: chave.toUpperCase() });
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao cadastrar nova palavra-chave',
			});
		}
	},
};
