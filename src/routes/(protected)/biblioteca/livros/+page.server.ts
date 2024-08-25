import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { autor, autor_has_livro, editora, livro, serie } from "$lib/database/schema";
import { error, fail, redirect } from '@sveltejs/kit';
import { and, count, eq, inArray } from "drizzle-orm";

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/");

	const page = Number(url.searchParams.get('page') || 1);
	const tombo = url.searchParams.get('tombo') || undefined;
	const titulo = url.searchParams.get('titulo') || undefined;
	const editor = url.searchParams.get('editora') || undefined;
	const colecao = url.searchParams.get('serie') || undefined;
	const author = url.searchParams.get('autor') || undefined;

	const tituloFilter = titulo ? ulike(livro.titulo, titulo + "%") : undefined;
	const tomboFilter = tombo ? eq(livro.tombo, tombo) : undefined;
	const editoraFilter = editor ? ulike(editora.nome, editor + "%") : undefined;
	const colecaoFilter = colecao ? ulike(serie.nome, colecao + "%") : undefined;
	let autorFilter = undefined;

	if (author) {
		const resultados = await db.select({ idlivro: autor_has_livro.livro }).from(autor_has_livro)
			.innerJoin(autor, eq(autor.idautor, autor_has_livro.autor))
			.where(ulike(autor.nome, author + '%'));

		autorFilter = inArray(livro.idlivro, resultados.flatMap(v => v.idlivro));
	}

	const where = and(tituloFilter, tomboFilter, editoraFilter, autorFilter, colecaoFilter);
	const livros = await db.select({ idlivro: livro.idlivro, tombo: livro.tombo, titulo: livro.titulo, editora: editora.nome })
		.from(livro).innerJoin(editora, eq(livro.editora, editora.ideditora))
		.leftJoin(serie, eq(livro.serie, serie.idserie))
		.where(where).orderBy(colecao ? livro.ordem : unaccent(livro.titulo)).offset((page - 1) * 5).limit(5);

	const counter = await db.select({ count: count() }).from(livro)
		.innerJoin(editora, eq(livro.editora, editora.ideditora))
		.leftJoin(serie, eq(livro.serie, serie.idserie))
		.where(where);

	const total = counter[0].count;

	return { livros, total, role : locals.user.roles };
};

export const actions: Actions = {
	excluir: async ({ url }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Nenhum livro foi selecionada para exclusão' });
		}

		try {
			await db.delete(livro).where(eq(livro.idlivro, Number(id)))
			return { status: 200 };
		} catch (err) {
			return error(500, { message: 'Falha ao excluir o livro' });
		}
	}
};