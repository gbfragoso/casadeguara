import { db } from '$lib/database/connection';
import { editora } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const resultado = await db
			.select()
			.from(editora)
			.where(eq(editora.ideditora, Number(params.id)));
		if (!resultado) {
			throw fail(404, { message: 'Editora não encontrada' });
		}
		return { editora: resultado[0] };
	} catch (err) {
		throw error(500, 'Falha ao buscar os dados da editora');
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await request.formData();
		const nome = form.get('nome') as string;

		if (validator.isEmpty(nome, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome da editora é obrigatório',
			};
		}

		if (validator.isNumeric(nome)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do editora não pode conter somente números',
			};
		}

		try {
			await db
				.update(editora)
				.set({ nome: nome.toUpperCase() })
				.where(eq(editora.ideditora, Number(params.id)));
			return { status: 200 };
		} catch (err) {
			return error(500, {
				message: 'Falha ao atualizar os dados da editora',
			});
		}
	},
};
