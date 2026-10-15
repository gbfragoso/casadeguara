import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { editora, livro, serie } from '#lib/server/database/schema.js';
import { requireLibraryAccess } from '#lib/server/authorization/biblioteca.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import validator from 'validator';

const loadBookForm = async (id: number) => {
	try {
		const [book] = await db.select().from(livro).where(eq(livro.idlivro, id));
		const editoras = await db.select().from(editora).orderBy(editora.nome);
		const colecoes = await db.select().from(serie).orderBy(serie.nome);
		return { book, editoras, colecoes };
	} catch (err) {
		console.error(err);
		error(500, 'Falha ao baixar os dados do livro');
	}
};

const load = async ({ locals, params }: RequestEvent) => {
	requireLibraryAccess(locals.user);

	const { book, editoras, colecoes } = await loadBookForm(Number(params.id));
	if (!book) error(404, 'Livro não encontrado');

	return { livro: book, editoras, colecoes };
};

const actions: Actions = {
	default: async ({ request, params, locals }) => {
		requireLibraryAccess(locals.user);

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
				message: 'Título da obra é obrigatório',
			};
		}

		if (validator.isNumeric(titulo)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Título da obra não pode conter somente números',
			};
		}

		if (!editora) {
			return {
				status: 400,
				field: 'editora',
				message: 'Editora da obra é obrigatório',
			};
		}

		try {
			await db
				.update(livro)
				.set({
					tombo,
					titulo,
					editora: Number(editora),
					serie: serie ? Number(serie) : null,
					ordem: ordem ? Number(ordem) : null,
				})
				.where(eq(livro.idlivro, Number(params.id)));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, 'Falha ao atualizar os dados do livro');
		}
	},
};

export const createBibliotecaLivrosIdIntegerHandlers = () => ({
	load,
	actions,
});
