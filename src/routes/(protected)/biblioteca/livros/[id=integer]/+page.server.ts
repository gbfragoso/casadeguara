import { livro, editora, serie } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, fail, redirect } from '@sveltejs/kit';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/");
	
	try {
		const resultado = await db.select().from(livro).where(eq(livro.idlivro, Number(params.id)));
		if (!resultado) {
			throw fail(404, { message: 'Livro não encontrado' });
		}
		const editoras = await db.select().from(editora).orderBy(editora.nome);
		const colecoes = await db.select().from(serie).orderBy(serie.nome);
		return { livro: resultado[0], editoras, colecoes };
	} catch (err) {
		return error(500, { message: 'Falha ao baixar os dados do livro' });
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
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
			await db.update(livro).set({ tombo, titulo, editora, serie, ordem }).where(eq(livro.idlivro, Number(params.id)));
			return { status: 200 };
		} catch (err) {
			return error(500, { message: 'Falha ao atualizar os dados do livro' });
		}
	}
};
