import type { TestDatabase } from './cadastros-database';
import { createLivroCatalogDefinition, type BookKey, type LivroCatalogDefinition } from './livros-fixture';

type IdentifiedOption = { id: number; nome: string };
export type BookSnapshot = { idlivro: number; tombo: string; titulo: string };
export type BookAggregateSnapshot = BookSnapshot & {
	authors: string[];
	copies: { numero: number; status: string }[];
};
export type LivroCatalog = {
	token: string;
	definition: LivroCatalogDefinition;
	editora: IdentifiedOption[];
	colecao: IdentifiedOption[];
	autor: IdentifiedOption[];
	keyword: IdentifiedOption[];
	livros: Record<BookKey, BookSnapshot>;
};

const insertOptions = async (database: TestDatabase, table: string, column: string, names: string[]) => {
	const rows: IdentifiedOption[] = [];
	for (const nome of names) {
		const [row] = await database.unsafe<IdentifiedOption[]>(
			`insert into ${table} (${column}) values ($1) returning ${table === 'editora' ? 'ideditora' : table === 'serie' ? 'idserie' : table === 'autor' ? 'idautor' : 'idkeyword'} as id, ${column} as nome`,
			[nome],
		);
		if (!row) throw new Error(`Opção de catálogo não foi criada: ${nome}`);
		rows.push(row);
	}
	return rows;
};

const insertBook = async (
	database: TestDatabase,
	book: LivroCatalogDefinition['livros'][number],
	publishers: IdentifiedOption[],
	collections: IdentifiedOption[],
) => {
	const [row] = await database<BookSnapshot[]>`
		insert into livro (tombo, titulo, editora, serie, ordem)
		values (${book.tombo}, ${book.titulo}, ${publishers[book.publisherIndex].id}, ${collections[book.collectionIndex].id}, ${book.ordem})
		returning idlivro, tombo, titulo
	`;
	if (!row) throw new Error(`Livro de teste não foi criado: ${book.titulo}`);
	return row;
};

const insertRelations = async (
	database: TestDatabase,
	definition: LivroCatalogDefinition,
	books: Record<BookKey, BookSnapshot>,
	authors: IdentifiedOption[],
	keywords: IdentifiedOption[],
) => {
	await Promise.all(
		definition.livros.flatMap((book) => {
			const row = books[book.key];
			const author =
				book.authorIndex === undefined
					? Promise.resolve()
					: database`
				insert into autor_has_livro (autor, livro) values (${authors[book.authorIndex].id}, ${row.idlivro})`;
			const keywordRows = book.keywords.map(
				({ keywordIndex, referencia }) => database`
				insert into livro_has_keyword (livro, keyword, referencia)
				values (${row.idlivro}, ${keywords[keywordIndex].id}, ${referencia})`,
			);
			return [author, ...keywordRows];
		}),
	);
};

export const createBookCatalog = async (database: TestDatabase, token: string): Promise<LivroCatalog> => {
	const definition = createLivroCatalogDefinition(token);
	const editora = await insertOptions(database, 'editora', 'nome', definition.editora);
	const colecao = await insertOptions(database, 'serie', 'nome', definition.colecao);
	const autor = await insertOptions(database, 'autor', 'nome', definition.autor);
	const keyword = await insertOptions(database, 'keyword', 'chave', definition.keyword);
	const insertedBooks = await Promise.all(
		definition.livros.map((book) => insertBook(database, book, editora, colecao)),
	);
	const livros = Object.fromEntries(
		insertedBooks.map((book, index) => [definition.livros[index].key, book]),
	) as Record<BookKey, BookSnapshot>;
	await insertRelations(database, definition, livros, autor, keyword);
	const relatedBook = livros.related;
	const relatedDefinition = definition.livros.find((book) => book.key === 'related');
	if (relatedDefinition?.hasExemplar) {
		await database`insert into exemplar (livro, numero, status) values (${relatedBook.idlivro}, 1, 'Disponível')`;
	}
	return { token, definition, editora, colecao, autor, keyword, livros };
};

export const countBooksByTitle = async (database: TestDatabase, titulo: string) => {
	const [row] = await database<
		{ count: number }[]
	>`select count(*)::int as count from livro where titulo = ${titulo}`;
	return row?.count ?? 0;
};

export const readBookByTitle = async (database: TestDatabase, titulo: string): Promise<BookSnapshot | null> => {
	const [book] = await database<BookSnapshot[]>`
		select idlivro, tombo, titulo from livro where titulo = ${titulo}
	`;
	return book ?? null;
};

export const readBookAggregateByTitle = async (
	database: TestDatabase,
	titulo: string,
): Promise<BookAggregateSnapshot | null> => {
	const book = await readBookByTitle(database, titulo);
	if (!book) return null;
	const authors = await database<{ nome: string }[]>`
		select autor.nome from autor
		join autor_has_livro on autor_has_livro.autor = autor.idautor
		where autor_has_livro.livro = ${book.idlivro}
		order by autor.nome
	`;
	const copies = await database<{ numero: number; status: string }[]>`
		select numero, status from exemplar where livro = ${book.idlivro} order by numero
	`;
	return { ...book, authors: authors.map(({ nome }) => nome), copies };
};

export const deleteBookCatalog = async (database: TestDatabase, token: string) => {
	const titlePattern = `%${token.toUpperCase()}%`;
	await database`delete from emprestimo where exemplar in (select idexemplar from exemplar join livro on livro.idlivro = exemplar.livro where livro.titulo like ${titlePattern})`;
	await database`delete from exemplar using livro where exemplar.livro = livro.idlivro and livro.titulo like ${titlePattern}`;
	await database`delete from livro_has_keyword using livro where livro_has_keyword.livro = livro.idlivro and livro.titulo like ${titlePattern}`;
	await database`delete from autor_has_livro using livro where autor_has_livro.livro = livro.idlivro and livro.titulo like ${titlePattern}`;
	await database`delete from livro where titulo like ${titlePattern}`;
	await database`delete from keyword where chave like ${titlePattern}`;
	await database`delete from autor where nome like ${titlePattern}`;
	await database`delete from serie where nome like ${titlePattern}`;
	await database`delete from editora where nome like ${titlePattern}`;
};
