import type { SeedSql } from './sql';
import type { SeedCalendar } from './calendar';

type Book = {
	tombo: string;
	titulo: string;
	editora: number;
	serie: number | null;
	ordem: number | null;
	autor: number;
	keywords: readonly { keyword: number; referencia: string | null }[];
	exemplares: readonly string[];
};
type Ids = { idlivro: number }[];

export const SEARCH_TITLE_PREFIX = 'Caminhos';
export const DISPOSABLE_BOOK = { tombo: '9001', titulo: 'Volume Descartável da Linha de Base' } as const;
const RENEWED_LOAN_RENEWALS = 1;

const PUBLISHERS = ['Editora Aurora Fictícia', 'Editora Horizonte Fictícia'];
const COLLECTIONS = ['Coleção Caminhos Fictícia'];
const AUTHORS = ['Clara Ventura Fictícia', 'Paulo Sereno Fictício'];
const KEYWORDS = ['Caridade', 'Esperança'];
const BOOKS: readonly Book[] = [
	{
		...{ tombo: '1001', titulo: 'Caminhos da Luz', editora: 0, serie: 0, ordem: 1, autor: 0 },
		keywords: [{ keyword: 0, referencia: 'Capítulo 3' }],
		exemplares: ['Disponível', 'Emprestado', 'Arquivado'],
	},
	{
		...{ tombo: '1002', titulo: 'Caminhos do Amanhã', editora: 0, serie: 0, ordem: 2, autor: 1 },
		keywords: [{ keyword: 1, referencia: 'Prefácio' }],
		exemplares: ['Disponível'],
	},
	{
		...{ tombo: '1003', titulo: 'Jardim das Virtudes', editora: 1, serie: null, ordem: null, autor: 0 },
		keywords: [
			{ keyword: 0, referencia: null },
			{ keyword: 1, referencia: 'Capítulo 1' },
		],
		exemplares: ['Disponível', 'Disponível'],
	},
];
const NOTICES = [
	{ data: '2026-01-10', texto: 'Reunião de voluntários da biblioteca no sábado, às 9h.' },
	{ data: '2026-02-14', texto: 'Novos livros da Coleção Caminhos disponíveis para empréstimo.' },
];

const insertNames = async (database: SeedSql, table: string, columns: [string, string], names: string[]) => {
	const [idColumn, nameColumn] = columns;
	const rows = await database.unsafe<{ id: number }[]>(
		`insert into ${table} (${nameColumn}) select unnest($1::text[]) returning ${idColumn} as id`,
		[names],
	);
	return rows.map((row) => row.id);
};

const insertBook = async (database: SeedSql, book: Book, references: Record<string, number[]>) => {
	const serie = book.serie === null ? null : references.serie[book.serie];
	const [{ idlivro }] = await database<Ids>`
		insert into livro (tombo, titulo, editora, serie, ordem)
		values (${book.tombo}, ${book.titulo}, ${references.editora[book.editora]}, ${serie}, ${book.ordem})
		returning idlivro
	`;
	await database`insert into autor_has_livro (autor, livro) values (${references.autor[book.autor]}, ${idlivro})`;
	for (const { keyword, referencia } of book.keywords) {
		await database`
			insert into livro_has_keyword (livro, keyword, referencia)
			values (${idlivro}, ${references.keyword[keyword]}, ${referencia})
		`;
	}
	const copies = await database<{ idexemplar: number }[]>`
		insert into exemplar (livro, numero, status)
		select ${idlivro}, numero, status from unnest(${book.exemplares.map((_, index) => index + 1)}::int[],
			${[...book.exemplares]}::text[]) as copies(numero, status)
		returning idexemplar
	`;
	return { idlivro, copies: copies.map((copy) => copy.idexemplar) };
};

const insertLoans = async (database: SeedSql, readers: number[], copies: number[][], calendar: SeedCalendar) => {
	const [activeLoan] = await database<{ idemp: number }[]>`
		insert into emprestimo (leitor, exemplar, data_emprestimo, data_devolucao, user_emprestimo)
		values (${readers[0]}, ${copies[0][1]}, ${calendar.today}, ${calendar.dueDate}, 'linha-de-base-admin')
		returning idemp
	`;
	await database`
		insert into emprestimo (leitor, exemplar, data_emprestimo, data_devolucao, data_devolvido, renovacoes,
			user_emprestimo, user_devolucao)
		values (${readers[1]}, ${copies[1][0]}, ${calendar.today}, ${calendar.dueDate}, ${calendar.today},
			${RENEWED_LOAN_RENEWALS}, 'linha-de-base-admin', 'linha-de-base-admin')
	`;
	return activeLoan.idemp;
};

const insertNotices = (database: SeedSql) =>
	database`
		insert into aviso (data_cadastro, texto, username)
		select data, texto, 'Helena Administradora' from unnest(${NOTICES.map((notice) => notice.data)}::date[],
			${NOTICES.map((notice) => notice.texto)}::text[]) as notices(data, texto)
	`;

export const insertLibrary = async (database: SeedSql, readers: number[], calendar: SeedCalendar) => {
	const references = {
		editora: await insertNames(database, 'editora', ['ideditora', 'nome'], PUBLISHERS),
		serie: await insertNames(database, 'serie', ['idserie', 'nome'], COLLECTIONS),
		autor: await insertNames(database, 'autor', ['idautor', 'nome'], AUTHORS),
		keyword: await insertNames(database, 'keyword', ['idkeyword', 'chave'], KEYWORDS),
	};
	const books = [];
	for (const book of BOOKS) books.push(await insertBook(database, book, references));
	await insertNotices(database);
	const copies = books.map((book) => book.copies);
	return {
		bookWithCopiesId: books[0].idlivro,
		loanReceiptId: await insertLoans(database, readers, copies, calendar),
	};
};
