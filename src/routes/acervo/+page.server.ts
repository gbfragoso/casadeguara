import { db } from '$lib/server/database/connection';
import { ulike, unaccent } from '$lib/server/database/functions';
import {
	autor,
	autorHasLivro,
	editora,
	keyword,
	livro,
	livroHasKeyword,
	serie,
	exemplar,
} from '$lib/server/database/schema';
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
	default: async ({ request }) => {
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
					autores: sql<string[]>`null as autores`,
					disponiveis: sql<number>`SUM(CASE WHEN status = 'Disponível' THEN 1 ELSE 0 END)`,
				})
				.from(exemplar)
				.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
				.$dynamic()
				.where(where)
				.groupBy(exemplar.livro, livro.titulo)
				.orderBy(unaccent(livro.titulo))
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

			const vals = livros.map(({ idlivro }) => idlivro);

			const resultados = db
				.select({
					livro: autorHasLivro.livro,
					nome: autor.nome,
				})
				.from(autorHasLivro)
				.innerJoin(autor, eq(autorHasLivro.autor, autor.idautor))
				.where(inArray(autorHasLivro.livro, vals))
				.orderBy(autor.nome);

			const autores = await resultados;
			const autoresPorLivro = autores.reduce<Map<number, string[]>>((map, { livro, nome }) => {
				const nomes = map.get(livro) ?? [];
				nomes.push(nome);
				map.set(livro, nomes);
				return map;
			}, new Map());

			livros.forEach((item) => {
				item.autores = autoresPorLivro.get(item.idlivro) ?? [];
			});

			return { livros };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a lista de livros',
			});
		}
	},
} satisfies Actions;
