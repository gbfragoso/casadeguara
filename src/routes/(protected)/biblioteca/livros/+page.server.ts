import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { autor, autorHasLivro, editora, keyword, livro, livroHasKeyword, serie } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
	return { role: locals.user.roles };
};

export const actions: Actions = {
	pesquisar: async ({ request }) => {
		const form = await request.formData();
		const tombo = form.get('tombo') as string;
		const titulo = form.get('titulo') as string;
		const editor = form.get('editora') as string;
		const colecao = form.get('serie') as string;
		const key = form.get('keyword') as string;
		const author = form.get('autor') as string;

		const tituloFilter = titulo ? ulike(livro.titulo, titulo + '%') : undefined;
		const tomboFilter = tombo ? eq(livro.tombo, tombo) : undefined;
		const editoraFilter = editor ? ulike(editora.nome, editor + '%') : undefined;
		const colecaoFilter = colecao ? ulike(serie.nome, colecao + '%') : undefined;

		let autorFilter = undefined;
		if (author) {
			const resultados = await db
				.select({ idlivro: autorHasLivro.livro })
				.from(autorHasLivro)
				.innerJoin(autor, eq(autor.idautor, autorHasLivro.autor))
				.where(ulike(autor.nome, author + '%'));

			autorFilter = inArray(
				livro.idlivro,
				resultados.flatMap((v) => v.idlivro),
			);
		}

		let keywordFilter = undefined;
		if (key) {
			const resultados = await db
				.select({ idlivro: livroHasKeyword.livro })
				.from(livroHasKeyword)
				.innerJoin(keyword, eq(keyword.idkeyword, livroHasKeyword.keyword))
				.where(ulike(keyword.chave, key + '%'));

			keywordFilter = inArray(
				livro.idlivro,
				resultados.flatMap((v) => v.idlivro),
			);
		}

		const where = and(tituloFilter, tomboFilter, editoraFilter, autorFilter, colecaoFilter, keywordFilter);

		try {
			const livros = await db
				.select({
					idlivro: livro.idlivro,
					tombo: livro.tombo,
					titulo: livro.titulo,
					editora: editora.nome,
				})
				.from(livro)
				.innerJoin(editora, eq(livro.editora, editora.ideditora))
				.leftJoin(serie, eq(livro.serie, serie.idserie))
				.where(where)
				.orderBy(colecao ? livro.ordem : unaccent(livro.titulo))
				.limit(50);

			return { livros };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de autores',
			});
		}
	},
	excluir: async ({ url }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, {
				message: 'Nenhum livro foi selecionada para exclusão',
			});
		}

		try {
			await db.delete(livro).where(eq(livro.idlivro, Number(id)));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao excluir o livro',
			});
		}
	},
} satisfies Actions;
