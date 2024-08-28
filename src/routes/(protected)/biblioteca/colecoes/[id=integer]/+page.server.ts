import { db } from '$lib/database/connection';
import { serie } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const colecao = await db
			.select()
			.from(serie)
			.where(eq(serie.idserie, Number(params.id)));
		if (!colecao) {
			throw fail(404, {
				message: 'Coleção não encontrada',
			});
		}
		return { colecao: colecao[0] };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao recuperar os dados da coleção',
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
			await db
				.update(serie)
				.set({ nome: nome.toUpperCase() })
				.where(eq(serie.idserie, Number(params.id)));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao atualizar os dados da coleção',
			});
		}
	},
};
