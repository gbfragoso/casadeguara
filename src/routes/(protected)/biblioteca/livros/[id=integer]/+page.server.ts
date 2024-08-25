import { db } from '$lib/database/connection';
import { editora, livro, serie } from "$lib/database/schema";
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from "drizzle-orm";
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
	default: async ({ request, params }) => {
		const form = await request.formData();
		const tombo = form.get('tombo') as string;
		const titulo = form.get('titulo') as string;
		const editora = form.get('editora');
		const serie = form.get('colecao');
		const ordem = form.get('ordem');

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

		if (!editora) {
			return {
				status: 400,
				field: 'editora',
				message: 'Editora da obra é obrigatório'
			}
		}

		try {
			await db.update(livro)
				.set({ tombo, titulo, editora: Number(editora), serie: (serie ? Number(serie) : null), ordem: (ordem ? Number(ordem) : null) })
				.where(eq(livro.idlivro, Number(params.id)));
			return { status: 200 };
		} catch (err) {
			console.log(err)
			return error(500, { message: 'Falha ao atualizar os dados do livro' });
		}
	}
};
