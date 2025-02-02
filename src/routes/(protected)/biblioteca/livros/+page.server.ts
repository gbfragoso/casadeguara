import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { autor, autorHasLivro, editora, keyword, livro, livroHasKeyword, serie } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const colecoes = async () => {
			return db.select().from(serie).orderBy(unaccent(serie.nome));
		};
		return { colecoes: colecoes(), role: locals.user.roles };
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Falha ao baixar os dados do livro' });
	}
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
		const colecaoFilter = colecao ? eq(livro.serie, Number(colecao)) : undefined;
		const autorFilter = author ? ulike(autor.nome, author + '%') : undefined;
		const keywordFilter = key ? ulike(keyword.chave, key + '%') : undefined;
		const where = and(tituloFilter, tomboFilter, editoraFilter, autorFilter, colecaoFilter, keywordFilter);

		try {
			let query = db
				.select({
					idlivro: livro.idlivro,
					tombo: livro.tombo,
					titulo: livro.titulo,
					keyword: key ? sql<string>`"keyword"."chave"` : sql<string>`'' as keyword`,
					referencia: key ? sql<string>`"livro_has_keyword"."referencia"` : sql<string>`'' as referencia`,
				})
				.from(livro)
				.$dynamic()
				.where(where)
				.orderBy(colecao ? livro.ordem : unaccent(livro.titulo))
				.limit(50);

			if (editor) {
				query = query.leftJoin(editora, eq(livro.editora, editora.ideditora));
			}
			if (author) {
				query = query
					.innerJoin(autorHasLivro, eq(autorHasLivro.livro, livro.idlivro))
					.innerJoin(autor, eq(autorHasLivro.autor, autor.idautor));
			}
			if (key) {
				query = query
					.leftJoin(livroHasKeyword, eq(livroHasKeyword.livro, livro.idlivro))
					.innerJoin(keyword, eq(livroHasKeyword.keyword, keyword.idkeyword));
			}
			const livros = await query;

			return { livros };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de livros',
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
