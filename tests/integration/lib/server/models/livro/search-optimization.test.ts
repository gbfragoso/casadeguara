import { randomUUID } from 'node:crypto';

import { db } from '$lib/server/database/connection';
import { autor, autorHasLivro, keyword, livro, livroHasKeyword } from '$lib/server/database/schema';
import { LivroModel } from '$lib/server/models/livro';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

const model = new LivroModel(db);

async function createFixture() {
	const token = randomUUID().slice(0, 8);
	const authorPrefix = `Autor ${token}`;
	const keywordPrefix = `Chave ${token}`;
	const [book] = await db
		.insert(livro)
		.values({ tombo: token, titulo: `Título ${token}` })
		.returning();
	const [author] = await db.insert(autor).values({ nome: authorPrefix }).returning();
	const [otherAuthor] = await db
		.insert(autor)
		.values({ nome: `${authorPrefix} extra` })
		.returning();
	const [key] = await db.insert(keyword).values({ chave: keywordPrefix }).returning();
	const [otherKey] = await db
		.insert(keyword)
		.values({ chave: `${keywordPrefix} extra` })
		.returning();
	await db.insert(autorHasLivro).values([
		{ autor: author.idautor, livro: book.idlivro },
		{ autor: otherAuthor.idautor, livro: book.idlivro },
	]);
	await db.insert(livroHasKeyword).values([
		{ livro: book.idlivro, keyword: key.idkeyword, referencia: 'Referencia principal' },
		{ livro: book.idlivro, keyword: otherKey.idkeyword, referencia: 'Referencia adicional' },
	]);
	return { book, authorPrefix, keywordPrefix, key, otherKey, author, otherAuthor };
}

async function destroyFixture(fixture: Awaited<ReturnType<typeof createFixture>>) {
	await db.delete(livroHasKeyword).where(eq(livroHasKeyword.livro, fixture.book.idlivro));
	await db.delete(autorHasLivro).where(eq(autorHasLivro.livro, fixture.book.idlivro));
	await db.delete(livro).where(eq(livro.idlivro, fixture.book.idlivro));
	await db.delete(keyword).where(eq(keyword.idkeyword, fixture.key.idkeyword));
	await db.delete(keyword).where(eq(keyword.idkeyword, fixture.otherKey.idkeyword));
	await db.delete(autor).where(eq(autor.idautor, fixture.author.idautor));
	await db.delete(autor).where(eq(autor.idautor, fixture.otherAuthor.idautor));
}

describe('optimized book search', () => {
	it('keeps distinct keyword relations without multiplying rows for matching authors', async () => {
		const fixture = await createFixture();

		try {
			const rows = await model.search({ autor: fixture.authorPrefix, keyword: fixture.keywordPrefix });

			expect(rows).toHaveLength(2);
			expect(rows).toEqual(
				expect.arrayContaining([
					{
						idlivro: fixture.book.idlivro,
						tombo: fixture.book.tombo,
						titulo: fixture.book.titulo,
						keyword: fixture.key.chave,
						referencia: 'Referencia principal',
					},
					{
						idlivro: fixture.book.idlivro,
						tombo: fixture.book.tombo,
						titulo: fixture.book.titulo,
						keyword: fixture.otherKey.chave,
						referencia: 'Referencia adicional',
					},
				]),
			);
		} finally {
			await destroyFixture(fixture);
		}
	});
});
