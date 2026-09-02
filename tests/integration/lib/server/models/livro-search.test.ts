import { randomUUID } from 'node:crypto';

import { db } from '$lib/server/database/connection';
import { autor, autorHasLivro, editora, keyword, livro, livroHasKeyword, serie } from '$lib/server/database/schema';
import { buildBookSearchQuery, type LegacyBookSearchInput } from '$lib/server/models/livro-search';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

const EMPTY_INPUT: LegacyBookSearchInput = { tombo: '', titulo: '', editora: '', colecao: '', keyword: '', autor: '' };

async function createCatalog(token: string) {
	const [publisher] = await db
		.insert(editora)
		.values({ nome: `Editora ${token}` })
		.returning();
	const [collection] = await db
		.insert(serie)
		.values({ nome: `Coleção ${token}` })
		.returning();
	const [author] = await db
		.insert(autor)
		.values({ nome: `Autor ${token}` })
		.returning();
	const [key] = await db
		.insert(keyword)
		.values({ chave: `Chave ${token}` })
		.returning();
	return { publisher, collection, author, key };
}

async function createFixture() {
	const token = randomUUID().slice(0, 8);
	const catalog = await createCatalog(token);
	const [book] = await db
		.insert(livro)
		.values({
			tombo: token,
			titulo: `Título ${token}`,
			editora: catalog.publisher.ideditora,
			serie: catalog.collection.idserie,
			ordem: 1,
		})
		.returning();
	await db.insert(autorHasLivro).values({ autor: catalog.author.idautor, livro: book.idlivro });
	await db
		.insert(livroHasKeyword)
		.values({ livro: book.idlivro, keyword: catalog.key.idkeyword, referencia: 'Referência' });
	return { ...catalog, book };
}

async function deleteFixture(fixture: Awaited<ReturnType<typeof createFixture>>) {
	await db.delete(livroHasKeyword).where(eq(livroHasKeyword.livro, fixture.book.idlivro));
	await db.delete(autorHasLivro).where(eq(autorHasLivro.livro, fixture.book.idlivro));
	await db.delete(livro).where(eq(livro.idlivro, fixture.book.idlivro));
	await db.delete(keyword).where(eq(keyword.idkeyword, fixture.key.idkeyword));
	await db.delete(autor).where(eq(autor.idautor, fixture.author.idautor));
	await db.delete(serie).where(eq(serie.idserie, fixture.collection.idserie));
	await db.delete(editora).where(eq(editora.ideditora, fixture.publisher.ideditora));
}

async function expectJoinedQuery(fixture: Awaited<ReturnType<typeof createFixture>>) {
	const input = {
		tombo: fixture.book.tombo,
		titulo: fixture.book.titulo,
		editora: fixture.publisher.nome,
		colecao: String(fixture.collection.idserie),
		keyword: fixture.key.chave,
		autor: fixture.author.nome,
	};
	const query = buildBookSearchQuery(db, input);
	const compiled = query.toSQL();
	const rows = await query;

	expect(compiled.sql).toContain('inner join "autor_has_livro"');
	expect(compiled.sql).toContain('inner join "keyword"');
	expect(compiled.params).toEqual(expect.arrayContaining([fixture.book.tombo, fixture.collection.idserie, 50]));
	expect(rows).toEqual([
		{
			idlivro: fixture.book.idlivro,
			tombo: fixture.book.tombo,
			titulo: fixture.book.titulo,
			keyword: fixture.key.chave,
			referencia: 'Referência',
		},
	]);
}

describe('buildBookSearchQuery baseline', () => {
	it('executes the same parameterized query exposed by toSQL with every legacy join', async () => {
		const fixture = await createFixture();

		try {
			await expectJoinedQuery(fixture);
		} finally {
			await deleteFixture(fixture);
		}
	});

	it('preserves the legacy projection when optional joins are absent', async () => {
		const fixture = await createFixture();

		try {
			const query = buildBookSearchQuery(db, { ...EMPTY_INPUT, tombo: fixture.book.tombo });
			const compiled = query.toSQL();
			const rows = await query;

			expect(compiled.sql).not.toContain('join "autor"');
			expect(compiled.sql).not.toContain('join "keyword"');
			expect(rows).toEqual([
				{
					idlivro: fixture.book.idlivro,
					tombo: fixture.book.tombo,
					titulo: fixture.book.titulo,
					keyword: '',
					referencia: '',
				},
			]);
		} finally {
			await deleteFixture(fixture);
		}
	});
});
