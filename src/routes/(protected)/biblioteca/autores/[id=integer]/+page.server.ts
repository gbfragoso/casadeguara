import { db } from '$lib/database/connection';
import { autor } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const resultado = await db
			.select()
			.from(autor)
			.where(eq(autor.idautor, Number(params.id)));
		if (!resultado) {
			throw fail(404, { message: 'Autor não encontrado' });
		}
		return { autor: resultado[0] };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao baixar os dados do autor',
		});
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
				message: 'Nome do autor é obrigatório',
			};
		}

		if (validator.isNumeric(nome)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do autor não pode conter somente números',
			};
		}

		try {
			await db
				.update(autor)
				.set({ nome: nome.toUpperCase() })
				.where(eq(autor.idautor, Number(params.id)));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao atualizar os dados do autor',
			});
		}
	},
};
