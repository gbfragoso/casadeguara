import { db } from '$lib/database/connection';
import { leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const nome = form.get('nome') as string;
		const telefone = form.get('telefone') as string;
		const trabalhador = Boolean(form.get('trabalhador'));

		if (validator.isEmpty(nome, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do contribuinte é obrigatório',
			};
		}

		if (validator.isNumeric(nome)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do contribuinte não pode conter somente números',
			};
		}

		if (telefone && !validator.isNumeric(telefone)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Telefone só pode conter números',
			};
		}

		try {
			await db.insert(leitor).values({ nome: nome.toUpperCase(), telefone, trab: trabalhador });
			return { status: 201 };
		} catch (err) {
			console.error(err);
			if (err instanceof Error && err.message.includes('duplicate key value violates')) {
				return {
					status: 400,
					field: 'nome',
					message: 'Já existe um cadastro com nome idêntico, favor consultar',
				};
			}
			return error(500, { message: 'Falha ao cadastrar um novo contribuinte' });
		}
	},
} satisfies Actions;
