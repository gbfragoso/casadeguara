import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { autor, autorHasLivro, editora, keyword, livro, livroHasKeyword, serie, exemplar } from '$lib/database/schema';
import { error } from '@sveltejs/kit';
import { and, eq, sql, inArray } from 'drizzle-orm';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const colecoes = async () => {
			return db.select().from(serie).orderBy(unaccent(serie.nome));
		};
		return { colecoes: colecoes() };
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Falha ao carregar os dados da página' });
	}
};

export const actions: Actions = {
	pesquisar: async ({ request }) => {
		const form = await request.formData();
		const titulo = form.get('titulo') as string;
		const editor = form.get('editora') as string;
		const colecao = form.get('serie') as string;
		const key = form.get('keyword') as string;
		const author = form.get('autor') as string;

		const tituloFilter = titulo ? ulike(livro.titulo, titulo + '%') : undefined;
		const editoraFilter = editor ? ulike(editora.nome, editor + '%') : undefined;
		const colecaoFilter = colecao ? eq(livro.serie, Number(colecao)) : undefined;
		const autorFilter = author ? ulike(autor.nome, author + '%') : undefined;
		const keywordFilter = key ? ulike(keyword.chave, key + '%') : undefined;
		const where = and(tituloFilter, editoraFilter, autorFilter, colecaoFilter, keywordFilter);

		try {
			let query = db
				.select({
					idlivro: exemplar.livro,
					titulo: livro.titulo,
					autores: sql<String>`null as autores`,
					disponiveis: sql<Number>`SUM(CASE WHEN status = 'Disponível' THEN 1 ELSE 0 END)`,
				})
				.from(exemplar)
				.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
				.$dynamic()
				.where(where)
				.groupBy(exemplar.livro, livro.titulo)
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

			var vals = [];
			for (var i = 0; i < livros.length; i++) {
				vals.push(livros[i].idlivro);
			}

			let resultados = db
				.select({
					livro: autorHasLivro.livro,
					nome: autor.nome,
				})
				.from(autorHasLivro)
				.innerJoin(autor, eq(autorHasLivro.autor, autor.idautor))
				.where(inArray(autorHasLivro.livro, vals));

			const autores = await resultados;
			const map = new Map();
			for (var i = 0; i < autores.length; i++) {
				if (!map.has(autores[i].livro)) {
					map.set(autores[i].livro, []);
				}
				map.get(autores[i].livro).push(autores[i].nome);
			}

			for (var i = 0; i < livros.length; i++) {
				livros[i].autores = map.get(livros[i].idlivro);
			}

			return { livros };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de livros',
			});
		}
	},
} satisfies Actions;
