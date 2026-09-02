import { randomUUID } from 'node:crypto';

import { db } from '$lib/server/database/connection';
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
import { LivroModel } from '$lib/server/models/livro';
import { buildBookSearchQuery } from '$lib/server/models/livro-search';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

const model = new LivroModel(db);

async function createFixture() {
	const token = `${randomUUID().replace(/\D/g, '').slice(0, 7).padEnd(7, '1')}1`;
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
	const [book] = await db
		.insert(livro)
		.values({
			tombo: token,
			titulo: `Título ${token}`,
			editora: publisher.ideditora,
			serie: collection.idserie,
			ordem: 2,
		})
		.returning();
	await db.insert(autorHasLivro).values({ autor: author.idautor, livro: book.idlivro });
	await db.insert(livroHasKeyword).values({ livro: book.idlivro, keyword: key.idkeyword, referencia: 'Referência' });
	return { token, publisher, collection, author, key, book };
}

async function destroyFixture(fixture: Awaited<ReturnType<typeof createFixture>>) {
	await db.delete(exemplar).where(eq(exemplar.livro, fixture.book.idlivro));
	await db.delete(livroHasKeyword).where(eq(livroHasKeyword.livro, fixture.book.idlivro));
	await db.delete(autorHasLivro).where(eq(autorHasLivro.livro, fixture.book.idlivro));
	await db.delete(livro).where(eq(livro.idlivro, fixture.book.idlivro));
	await db.delete(keyword).where(eq(keyword.idkeyword, fixture.key.idkeyword));
	await db.delete(autor).where(eq(autor.idautor, fixture.author.idautor));
	await db.delete(serie).where(eq(serie.idserie, fixture.collection.idserie));
	await db.delete(editora).where(eq(editora.ideditora, fixture.publisher.ideditora));
}

describe('LivroModel', () => {
	it('loads projected options and searches with combined filters', async () => {
		const fixture = await createFixture();

		try {
			const collections = await model.listCollectionOptions();
			const publishers = await model.listPublisherOptions();
			const books = await model.search({
				tombo: fixture.token,
				titulo: 'título',
				autor: 'autor',
				editora: 'editora',
				colecaoId: fixture.collection.idserie,
				keyword: 'chave',
			});

			expect(collections.find((item) => item.idserie === fixture.collection.idserie)).toMatchObject({
				idserie: fixture.collection.idserie,
				nome: fixture.collection.nome,
			});
			expect(publishers.find((item) => item.ideditora === fixture.publisher.ideditora)).toMatchObject({
				ideditora: fixture.publisher.ideditora,
				nome: fixture.publisher.nome,
			});
			expect(books).toEqual([
				{
					idlivro: fixture.book.idlivro,
					tombo: fixture.token,
					titulo: `Título ${fixture.token}`,
					keyword: `Chave ${fixture.token}`,
					referencia: 'Referência',
				},
			]);
		} finally {
			await destroyFixture(fixture);
		}
	});

	it('returns null relationships when keyword is not requested', async () => {
		const fixture = await createFixture();

		try {
			await expect(model.search({ tombo: fixture.token })).resolves.toEqual([
				{
					idlivro: fixture.book.idlivro,
					tombo: fixture.token,
					titulo: `Título ${fixture.token}`,
					keyword: null,
					referencia: null,
				},
			]);
		} finally {
			await destroyFixture(fixture);
		}
	});

	it('accepts an empty final search and preserves the legacy query contract', async () => {
		const fixture = await createFixture();

		try {
			const books = await model.search({});
			expect(books).toContainEqual({
				idlivro: fixture.book.idlivro,
				tombo: fixture.token,
				titulo: `Título ${fixture.token}`,
				keyword: null,
				referencia: null,
			});
			const query = buildBookSearchQuery(db, {
				tombo: '',
				titulo: '',
				editora: '',
				colecao: '',
				keyword: '',
				autor: '',
			});
			expect(query.toSQL().sql).toContain('select');
		} finally {
			await destroyFixture(fixture);
		}
	});
});
