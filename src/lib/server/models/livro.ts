import { db } from '$lib/server/database/connection';
import { unaccent } from '$lib/server/database/functions';
import { autor, exemplar, editora, livro, serie } from '$lib/server/database/schema';
import { BOOK_SMALLINT_MAX, type LivroCreateInput, type LivroSearchInput } from '$lib/validation/livro';
import { eq, inArray } from 'drizzle-orm';

import { insertLivroAggregate } from './livro-create';
import { buildBookSearchQuery } from './livro-search';
import {
	DuplicateLivroTomboError,
	LivroHasDependentsError,
	LivroNotFoundError,
	LivroReferenceNotFoundError,
	withLivroErrorTranslation,
} from './livro-error';

export type CatalogOption = { id: number; nome: string };
export type CollectionOption = { idserie: number; nome: string };
export type PublisherOption = { ideditora: number; nome: string };
export type AuthorOption = { idautor: number; nome: string };
export type LivroListItem = {
	idlivro: number;
	tombo: string;
	titulo: string;
	keyword: string | null;
	referencia: string | null;
};

const collectionFields = { idserie: serie.idserie, nome: serie.nome };
const publisherFields = { ideditora: editora.ideditora, nome: editora.nome };
const authorFields = { idautor: autor.idautor, nome: autor.nome };

export class LivroModel {
	constructor(private readonly database: typeof db = db) {}

	listCollectionOptions(): Promise<CollectionOption[]> {
		return this.database.select(collectionFields).from(serie).orderBy(unaccent(serie.nome), serie.idserie);
	}

	listPublisherOptions(): Promise<PublisherOption[]> {
		return this.database.select(publisherFields).from(editora).orderBy(unaccent(editora.nome), editora.ideditora);
	}

	listAuthorOptions(): Promise<AuthorOption[]> {
		return this.database.select(authorFields).from(autor).orderBy(unaccent(autor.nome), autor.idautor);
	}

	async search(input: LivroSearchInput): Promise<LivroListItem[]> {
		const rows = await buildBookSearchQuery(this.database, input);
		return rows.map((row) => ({
			idlivro: row.idlivro,
			tombo: row.tombo,
			titulo: row.titulo,
			keyword: row.keyword,
			referencia: row.referencia,
		}));
	}

	async create(input: LivroCreateInput): Promise<{ idlivro: number }> {
		return withLivroErrorTranslation(async () => {
			await this.ensurePublisher(input.editoraId);
			if (input.colecaoId !== undefined) await this.ensureCollection(input.colecaoId);
			await this.ensureAuthors(input.autorIds);
			return this.database.transaction((transaction) => insertLivroAggregate(transaction, input));
		});
	}

	async delete(idlivro: number): Promise<void> {
		return withLivroErrorTranslation(async () => {
			if (!isPersistedIdentifier(idlivro)) throw new LivroNotFoundError();
			const [dependent] = await this.database
				.select({ idexemplar: exemplar.idexemplar })
				.from(exemplar)
				.where(eq(exemplar.livro, idlivro))
				.limit(1);
			if (dependent) throw new LivroHasDependentsError();
			await this.database.transaction(async (transaction) => {
				const [deleted] = await transaction
					.delete(livro)
					.where(eq(livro.idlivro, idlivro))
					.returning({ idlivro: livro.idlivro });
				if (!deleted) throw new LivroNotFoundError();
			});
		});
	}

	private async ensurePublisher(id: number): Promise<void> {
		if (!isPersistedIdentifier(id)) throw new LivroReferenceNotFoundError('editora');
		const [publisher] = await this.database
			.select({ id: editora.ideditora })
			.from(editora)
			.where(eq(editora.ideditora, id))
			.limit(1);
		if (!publisher) throw new LivroReferenceNotFoundError('editora');
	}

	private async ensureCollection(id: number): Promise<void> {
		if (!isPersistedIdentifier(id)) throw new LivroReferenceNotFoundError('colecao');
		const [collection] = await this.database
			.select({ id: serie.idserie })
			.from(serie)
			.where(eq(serie.idserie, id))
			.limit(1);
		if (!collection) throw new LivroReferenceNotFoundError('colecao');
	}

	private async ensureAuthors(ids: number[]): Promise<void> {
		if (ids.length === 0) return;
		if (ids.some((id) => !isPersistedIdentifier(id))) throw new LivroReferenceNotFoundError('autores');
		const authors = await this.database
			.select({ id: autor.idautor })
			.from(autor)
			.where(inArray(autor.idautor, ids));
		if (authors.length !== ids.length) throw new LivroReferenceNotFoundError('autores');
	}
}

const isPersistedIdentifier = (value: number) => Number.isInteger(value) && value > 0 && value <= BOOK_SMALLINT_MAX;

export const livroModel = new LivroModel();
export const bookModel = livroModel;
export { DuplicateLivroTomboError };
