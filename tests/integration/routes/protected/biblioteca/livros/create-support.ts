import { randomUUID } from 'node:crypto';

import { db } from '$lib/server/database/connection';
import { autor, autorHasLivro, editora, exemplar, livro, serie } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';

export async function createBookReferences() {
	const suffix = randomUUID().slice(0, 8);
	const [publisher] = await db
		.insert(editora)
		.values({ nome: `Editora ${suffix}` })
		.returning();
	const [collection] = await db
		.insert(serie)
		.values({ nome: `Coleção ${suffix}` })
		.returning();
	const [author] = await db
		.insert(autor)
		.values({ nome: `Autor ${suffix}` })
		.returning();
	return { publisher, collection, author };
}

export const createBookForm = (publisherId: number, collectionId: number, authorId: number, tombo: string) => {
	const form = new FormData();
	form.set('tombo', tombo);
	form.set('titulo', 'Tenda dos Milagres');
	form.set('editora', `${publisherId}`);
	form.set('colecao', `${collectionId}`);
	form.set('ordem', '2');
	form.append('autores', `${authorId}`);
	return form;
};

export const deleteBookByTombo = async (tombo: string) => {
	const [book] = await db.select({ id: livro.idlivro }).from(livro).where(eq(livro.tombo, tombo));
	if (!book) return;
	await db.delete(exemplar).where(eq(exemplar.livro, book.id));
	await db.delete(autorHasLivro).where(eq(autorHasLivro.livro, book.id));
	await db.delete(livro).where(eq(livro.idlivro, book.id));
};

export const deleteBookReferences = async (references: Awaited<ReturnType<typeof createBookReferences>>) => {
	await db.delete(autor).where(eq(autor.idautor, references.author.idautor));
	await db.delete(serie).where(eq(serie.idserie, references.collection.idserie));
	await db.delete(editora).where(eq(editora.ideditora, references.publisher.ideditora));
};
