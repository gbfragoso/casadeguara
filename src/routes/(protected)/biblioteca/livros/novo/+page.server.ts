import { livro, editora, serie } from "$lib/database/schema";
import { db } from '$lib/database/connection';
import { error, redirect } from '@sveltejs/kit';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/");

	try {
		const editoras = await db.select().from(editora).orderBy(editora.nome);
		const colecoes = await db.select().from(serie).orderBy(serie.nome);
		return { editoras, colecoes };
	} catch (err) {
		return error(500, { message: 'Falha ao baixar os dados do livro' });
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const tombo = form.get('tombo') as string;
		const titulo = form.get('titulo') as string;
		const editora = Number(form.get('editora'));
		const serie = Number(form.get('colecao'));
		const ordem = Number(form.get('ordem'));

		if (validator.isEmpty(titulo, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'nome',
				message: 'Título da obra é obrigatório'
			}
		}

		if (validator.isNumeric(titulo)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Título da obra não pode conter somente números'
			}
		}

		try {
			await db.insert(livro).values({ tombo, titulo, editora, serie, ordem });
			return { status: 201 };
		} catch (err) {
			return error(500, { message: 'Falha ao cadastrar um novo livro' });
		}
	}
} satisfies Actions;
