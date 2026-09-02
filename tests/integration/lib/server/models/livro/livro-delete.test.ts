import { randomUUID } from 'node:crypto';

import { db } from '$lib/server/database/connection';
import { editora, exemplar, livro } from '$lib/server/database/schema';
import { LivroModel } from '$lib/server/models/livro';
import { LivroHasDependentsError, LivroNotFoundError } from '$lib/server/models/livro-error';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

const model = new LivroModel(db);

const createBook = async () => {
	const token = randomUUID().replace(/\D/g, '').padEnd(8, '6').slice(0, 8);
	const [publisher] = await db
		.insert(editora)
		.values({ nome: `Editora ${token}` })
		.returning();
	const [book] = await db
		.insert(livro)
		.values({ tombo: token, titulo: `Livro ${token}`, editora: publisher.ideditora })
		.returning();
	return { publisher, book };
};

const cleanup = async (fixture: Awaited<ReturnType<typeof createBook>>) => {
	await db.delete(exemplar).where(eq(exemplar.livro, fixture.book.idlivro));
	await db.delete(livro).where(eq(livro.idlivro, fixture.book.idlivro));
	await db.delete(editora).where(eq(editora.ideditora, fixture.publisher.ideditora));
};

describe('LivroModel deletion', () => {
	it('distinguishes missing and dependent books', async () => {
		const fixture = await createBook();

		try {
			await expect(model.delete(0)).rejects.toBeInstanceOf(LivroNotFoundError);
			await expect(model.delete(32766)).rejects.toBeInstanceOf(LivroNotFoundError);
			await db.insert(exemplar).values({ livro: fixture.book.idlivro, numero: 1 });
			await expect(model.delete(fixture.book.idlivro)).rejects.toBeInstanceOf(LivroHasDependentsError);
		} finally {
			await cleanup(fixture);
		}
	});

	it('commits deletion of an eligible book', async () => {
		const fixture = await createBook();

		try {
			await model.delete(fixture.book.idlivro);

			await expect(db.select().from(livro).where(eq(livro.idlivro, fixture.book.idlivro))).resolves.toEqual([]);
		} finally {
			await cleanup(fixture);
		}
	});
});
