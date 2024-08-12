import { autor, autor_has_livro, livro, editora } from "$lib/database/schema";
import { and, count, eq, inArray, ilike } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error, fail, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/");

	const page = Number(url.searchParams.get('page') || 1);
	const tombo = url.searchParams.get('tombo') || undefined;
	const titulo = url.searchParams.get('titulo') + "%" || undefined;
	const editor = url.searchParams.get('editora') + "%" || undefined;
	const author = url.searchParams.get('autor') + "%" || undefined;

	const tituloFilter = titulo ? ilike(livro.titulo, titulo) : undefined;
	const tomboFilter = tombo ? eq(livro.tombo, tombo) : undefined;
	const editoraFilter = editor ? ilike(editora.nome, editor) : undefined;
	let autorFilter = undefined;

	if (author) {
		const resultados = await db.select({ idlivro: autor_has_livro.livro }).from(autor_has_livro)
			.innerJoin(autor, eq(autor.idautor, autor_has_livro.autor))
			.where(ilike(autor.nome, author));

		autorFilter = inArray(livro.idlivro, resultados.flatMap(v => v.idlivro));
	}

	const where = and(tituloFilter, tomboFilter, editoraFilter, autorFilter);

	const livros = await db.select({ idlivro: livro.idlivro, tombo: livro.tombo, titulo: livro.titulo, editora: editora.nome })
		.from(livro).innerJoin(editora, eq(livro.editora, editora.ideditora))
		.where(where).orderBy(livro.titulo).offset((page - 1) * 10).limit(10);

	const counter = await db.select({ count: count() }).from(livro)
		.innerJoin(editora, eq(livro.editora, editora.ideditora))
		.where(where);

	const total = counter[0].count;

	return { livros, total };
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