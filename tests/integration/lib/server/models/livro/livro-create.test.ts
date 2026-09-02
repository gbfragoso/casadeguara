import { randomUUID } from 'node:crypto';

import { db } from '$lib/server/database/connection';
import { autor, autorHasLivro, editora, exemplar, livro } from '$lib/server/database/schema';
import { LivroModel } from '$lib/server/models/livro';
import { DuplicateLivroTomboError, LivroReferenceNotFoundError } from '$lib/server/models/livro-error';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

const model = new LivroModel(db);

const createReferences = async () => {
	const token = randomUUID().slice(0, 8);
	const [publisher] = await db
		.insert(editora)
		.values({ nome: `Editora ${token}` })
		.returning();
	const [author] = await db
		.insert(autor)
		.values({ nome: `Autor ${token}` })
		.returning();
	return { token, publisher, author };
};

const deleteAggregate = async (tombo: string) => {
	const [book] = await db.select({ id: livro.idlivro }).from(livro).where(eq(livro.tombo, tombo));
	if (!book) return;
	await db.delete(exemplar).where(eq(exemplar.livro, book.id));
	await db.delete(autorHasLivro).where(eq(autorHasLivro.livro, book.id));
	await db.delete(livro).where(eq(livro.idlivro, book.id));
};

const deleteReferences = async (fixture: Awaited<ReturnType<typeof createReferences>>, newAuthor?: string) => {
	if (newAuthor) await db.delete(autor).where(eq(autor.nome, newAuthor));
	await db.delete(autor).where(eq(autor.idautor, fixture.author.idautor));
	await db.delete(editora).where(eq(editora.ideditora, fixture.publisher.ideditora));
};

describe('LivroModel creation', () => {
	it('loads authors and commits the complete book aggregate', async () => {
		const fixture = await createReferences();
		const tombo = `${fixture.token.replace(/\D/g, '').padEnd(8, '3').slice(0, 8)}`;
		const newAuthor = `NOVO AUTOR ${fixture.token.toUpperCase()}`;

		try {
			const options = await model.listAuthorOptions();
			const created = await model.create({
				tombo,
				titulo: 'Livro agregado',
				editoraId: fixture.publisher.ideditora,
				autorIds: [fixture.author.idautor],
				novoAutor: newAuthor,
			});
			const copies = await db.select().from(exemplar).where(eq(exemplar.livro, created.idlivro));
			const links = await db.select().from(autorHasLivro).where(eq(autorHasLivro.livro, created.idlivro));

			expect(options.some((item) => item.idautor === fixture.author.idautor)).toBe(true);
			expect(links).toHaveLength(2);
			expect(copies).toMatchObject([{ livro: created.idlivro, numero: 1, status: 'Disponível' }]);
		} finally {
			await deleteAggregate(tombo);
			await deleteReferences(fixture, newAuthor);
		}
	});

	it('keeps one complete aggregate under concurrent duplicate tombos', async () => {
		const fixture = await createReferences();
		const tombo = fixture.token.replace(/\D/g, '').padEnd(8, '4').slice(0, 8);
		const newAuthor = `AUTOR CONCORRENTE ${fixture.token.toUpperCase()}`;
		const input = {
			tombo,
			titulo: 'Livro concorrente',
			editoraId: fixture.publisher.ideditora,
			autorIds: [],
			novoAutor: newAuthor,
		};

		try {
			const results = await Promise.allSettled([model.create(input), model.create(input)]);
			const [book] = await db.select().from(livro).where(eq(livro.tombo, tombo));
			const copies = await db.select().from(exemplar).where(eq(exemplar.livro, book.idlivro));

			expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
			expect(
				results.some(
					(result) => result.status === 'rejected' && result.reason instanceof DuplicateLivroTomboError,
				),
			).toBe(true);
			expect(copies).toHaveLength(1);
		} finally {
			await deleteAggregate(tombo);
			await deleteReferences(fixture, newAuthor);
		}
	});

	it('rolls back the book when a later aggregate insert fails', async () => {
		const fixture = await createReferences();
		const tombo = fixture.token.replace(/\D/g, '').padEnd(8, '5').slice(0, 8);

		try {
			await expect(
				model.create({
					tombo,
					titulo: 'Livro revertido',
					editoraId: fixture.publisher.ideditora,
					autorIds: [fixture.author.idautor],
					novoAutor: 'A'.repeat(61),
				}),
			).rejects.toBeDefined();
			await expect(db.select().from(livro).where(eq(livro.tombo, tombo))).resolves.toEqual([]);
		} finally {
			await deleteAggregate(tombo);
			await deleteReferences(fixture);
		}
	});

	it('rejects missing and invalid author references', async () => {
		const fixture = await createReferences();
		const tombo = fixture.token.replace(/\D/g, '').padEnd(8, '7').slice(0, 8);

		try {
			await expect(
				model.create({
					tombo,
					titulo: 'Referência ausente',
					editoraId: fixture.publisher.ideditora,
					autorIds: [32766],
				}),
			).rejects.toBeInstanceOf(LivroReferenceNotFoundError);
			await expect(
				model.create({
					tombo,
					titulo: 'Identificador inválido',
					editoraId: fixture.publisher.ideditora,
					autorIds: [0],
				}),
			).rejects.toBeInstanceOf(LivroReferenceNotFoundError);
		} finally {
			await deleteAggregate(tombo);
			await deleteReferences(fixture);
		}
	});
});
