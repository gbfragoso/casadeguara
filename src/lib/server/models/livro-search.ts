import type { db } from '$lib/server/database/connection';
import { ulike, unaccent } from '$lib/server/database/functions';
import { autor, autorHasLivro, editora, keyword, livro, livroHasKeyword } from '$lib/server/database/schema';
import type { LivroSearchInput } from '$lib/validation/livro';
import { and, eq, sql } from 'drizzle-orm';

export type LegacyBookSearchInput = {
	tombo: string;
	titulo: string;
	editora: string;
	colecao: string;
	keyword: string;
	autor: string;
};

export const BOOK_SEARCH_LIMIT = 50;

const createLegacyFilters = (input: LegacyBookSearchInput) =>
	and(
		input.titulo ? ulike(livro.titulo, `${input.titulo}%`) : undefined,
		input.tombo ? eq(livro.tombo, input.tombo) : undefined,
		input.editora ? ulike(editora.nome, `${input.editora}%`) : undefined,
		input.autor ? ulike(autor.nome, `${input.autor}%`) : undefined,
		input.colecao ? eq(livro.serie, Number(input.colecao)) : undefined,
		input.keyword ? ulike(keyword.chave, `${input.keyword}%`) : undefined,
	);

const buildLegacyQuery = (database: typeof db, input: LegacyBookSearchInput) => {
	let query = database
		.select({
			idlivro: livro.idlivro,
			tombo: livro.tombo,
			titulo: livro.titulo,
			keyword: input.keyword ? sql<string>`"keyword"."chave"` : sql<string>`'' as keyword`,
			referencia: input.keyword ? sql<string>`"livro_has_keyword"."referencia"` : sql<string>`'' as referencia`,
		})
		.from(livro)
		.$dynamic()
		.where(createLegacyFilters(input))
		.orderBy(input.colecao ? livro.ordem : unaccent(livro.titulo))
		.limit(BOOK_SEARCH_LIMIT);

	if (input.editora) query = query.leftJoin(editora, eq(livro.editora, editora.ideditora));
	if (input.autor) {
		query = query
			.innerJoin(autorHasLivro, eq(autorHasLivro.livro, livro.idlivro))
			.innerJoin(autor, eq(autorHasLivro.autor, autor.idautor));
	}
	if (input.keyword) {
		query = query
			.leftJoin(livroHasKeyword, eq(livroHasKeyword.livro, livro.idlivro))
			.innerJoin(keyword, eq(livroHasKeyword.keyword, keyword.idkeyword));
	}
	return query;
};

const createFinalFilters = (input: LivroSearchInput) =>
	and(
		input.tombo ? eq(livro.tombo, input.tombo) : undefined,
		input.titulo ? ulike(livro.titulo, `${input.titulo}%`) : undefined,
		input.autor
			? sql`exists (
				select 1
				from ${autorHasLivro}
				inner join ${autor} on ${eq(autorHasLivro.autor, autor.idautor)}
				where ${eq(autorHasLivro.livro, livro.idlivro)}
				and ${ulike(autor.nome, `${input.autor}%`)}
			)`
			: undefined,
		input.editora ? ulike(editora.nome, `${input.editora}%`) : undefined,
		input.colecaoId !== undefined ? eq(livro.serie, input.colecaoId) : undefined,
		input.keyword ? ulike(keyword.chave, `${input.keyword}%`) : undefined,
	);

const createFinalQuery = (database: typeof db, input: LivroSearchInput) => {
	const hasKeyword = Boolean(input.keyword);
	let query = database
		.select({
			idlivro: livro.idlivro,
			tombo: livro.tombo,
			titulo: livro.titulo,
			keyword: hasKeyword ? keyword.chave : sql<string | null>`null`.as('keyword'),
			referencia: hasKeyword ? livroHasKeyword.referencia : sql<string | null>`null`.as('referencia'),
		})
		.from(livro)
		.$dynamic()
		.where(createFinalFilters(input));
	if (input.editora) query = query.innerJoin(editora, eq(livro.editora, editora.ideditora));
	if (input.keyword) {
		query = query
			.innerJoin(livroHasKeyword, eq(livroHasKeyword.livro, livro.idlivro))
			.innerJoin(keyword, eq(livroHasKeyword.keyword, keyword.idkeyword));
	}
	const order =
		input.colecaoId !== undefined
			? sql`${livro.ordem} asc nulls last, unaccent(${livro.titulo}), ${livro.idlivro}`
			: sql`unaccent(${livro.titulo}), ${livro.idlivro}`;
	const fullOrder = hasKeyword ? sql`${order}, ${livroHasKeyword.keyword}` : order;
	return query.orderBy(fullOrder).limit(BOOK_SEARCH_LIMIT);
};

const buildFinalQuery = (database: typeof db, input: LivroSearchInput) => createFinalQuery(database, input);

const isFinalInput = (input: LivroSearchInput | LegacyBookSearchInput): input is LivroSearchInput =>
	'colecaoId' in input || !('colecao' in input);

export function buildBookSearchQuery(database: typeof db, input: LivroSearchInput): ReturnType<typeof buildFinalQuery>;
export function buildBookSearchQuery(
	database: typeof db,
	input: LegacyBookSearchInput,
): ReturnType<typeof buildLegacyQuery>;
export function buildBookSearchQuery(database: typeof db, input: LivroSearchInput | LegacyBookSearchInput) {
	return isFinalInput(input) ? buildFinalQuery(database, input) : buildLegacyQuery(database, input);
}
