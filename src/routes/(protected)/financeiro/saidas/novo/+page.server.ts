import { db } from '$lib/database/connection';
import { saidas } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const descricao = form.get('descricao') as string;
		const valor = form.get('valor') as string;
		const data_saida = form.get('data_saida') as string;

		if (validator.isEmpty(descricao, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'descricao',
				message: 'Descrição do pagamento é obrigatória',
			};
		}

		if (validator.isNumeric(descricao)) {
			return {
				status: 400,
				field: 'descricao',
				message: 'Descrição do pagamento não pode conter somente números',
			};
		}

		try {
			await db.insert(saidas).values({
				descricao: descricao,
				valor: valor,
				data_saida: new Date(data_saida),
			});
			return { status: 201 };
		} catch (err) {
			return error(500, {
				message: 'Falha ao cadastrar uma nova despesa',
			});
		}
	},
} satisfies Actions;
