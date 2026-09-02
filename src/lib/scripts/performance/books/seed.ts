import { createCatalogRows } from './catalog-rows';
import { createBookAuthorRows, createBookKeywordRows, createCopyRows } from './relations';
import {
	autor,
	autorHasLivro,
	editora,
	exemplar,
	keyword,
	livro,
	livroHasKeyword,
	serie,
} from '$lib/server/database/schema';
import type { db } from '$lib/server/database/connection';
import { sql } from 'drizzle-orm';

async function resetSequences(database: typeof db) {
	await database.execute(
		sql`SELECT setval(pg_get_serial_sequence('autor', 'idautor'), (SELECT max(idautor) FROM autor))`,
	);
	await database.execute(
		sql`SELECT setval(pg_get_serial_sequence('editora', 'ideditora'), (SELECT max(ideditora) FROM editora))`,
	);
	await database.execute(
		sql`SELECT setval(pg_get_serial_sequence('keyword', 'idkeyword'), (SELECT max(idkeyword) FROM keyword))`,
	);
	await database.execute(
		sql`SELECT setval(pg_get_serial_sequence('serie', 'idserie'), (SELECT max(idserie) FROM serie))`,
	);
	await database.execute(
		sql`SELECT setval(pg_get_serial_sequence('livro', 'idlivro'), (SELECT max(idlivro) FROM livro))`,
	);
	await database.execute(
		sql`SELECT setval(pg_get_serial_sequence('exemplar', 'idexemplar'), (SELECT max(idexemplar) FROM exemplar))`,
	);
}

export async function seedBookProfile(database: typeof db) {
	const catalog = createCatalogRows();
	const bookAuthors = createBookAuthorRows();
	const bookKeywords = createBookKeywordRows();
	const copies = createCopyRows();
	await database.transaction(async (transaction) => {
		await transaction.insert(editora).values(catalog.publishers);
		await transaction.insert(serie).values(catalog.collections);
		await transaction.insert(autor).values(catalog.authors);
		await transaction.insert(keyword).values(catalog.keywords);
		await transaction.insert(livro).values(catalog.books);
		await transaction.insert(autorHasLivro).values(bookAuthors);
		await transaction.insert(livroHasKeyword).values(bookKeywords);
		await transaction.insert(exemplar).values(copies);
	});
	await resetSequences(database);
	await database.execute(sql`ANALYZE`);
}
