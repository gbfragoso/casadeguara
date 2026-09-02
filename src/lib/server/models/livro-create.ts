import { db } from '$lib/server/database/connection';
import { autor, autorHasLivro, exemplar, livro } from '$lib/server/database/schema';
import type { LivroCreateInput } from '$lib/validation/livro';

type LivroTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const insertNewAuthor = async (transaction: LivroTransaction, name: string | undefined) => {
	if (name === undefined) return [];
	const [created] = await transaction.insert(autor).values({ nome: name }).returning({ idautor: autor.idautor });
	return [created.idautor];
};

export const insertLivroAggregate = async (transaction: LivroTransaction, input: LivroCreateInput) => {
	const [created] = await transaction
		.insert(livro)
		.values({
			tombo: input.tombo,
			titulo: input.titulo,
			editora: input.editoraId,
			serie: input.colecaoId,
			ordem: input.ordem,
		})
		.returning({ idlivro: livro.idlivro });
	const newAuthorIds = await insertNewAuthor(transaction, input.novoAutor);
	const authorIds = [...input.autorIds, ...newAuthorIds];
	await transaction
		.insert(autorHasLivro)
		.values(authorIds.map((authorId) => ({ autor: authorId, livro: created.idlivro })));
	await transaction.insert(exemplar).values({ livro: created.idlivro, numero: 1, status: 'Disponível' });
	return created;
};
