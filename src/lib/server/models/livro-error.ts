import { DrizzleQueryError } from 'drizzle-orm';
import postgres from 'postgres';

export const DUPLICATE_LIVRO_TOMBO_MESSAGE = 'Tombo já cadastrado.';
export const LIVRO_REFERENCE_NOT_FOUND_MESSAGE = 'Referência do livro não encontrada.';
export const LIVRO_NOT_FOUND_MESSAGE = 'Livro não encontrado.';
export const LIVRO_HAS_DEPENDENTS_MESSAGE = 'Livro possui exemplares relacionados.';

export type LivroReferenceField = 'editora' | 'colecao' | 'autores';

export class DuplicateLivroTomboError extends Error {
	readonly field = 'tombo';

	constructor() {
		super(DUPLICATE_LIVRO_TOMBO_MESSAGE);
		this.name = 'DuplicateLivroTomboError';
	}
}

export class LivroReferenceNotFoundError extends Error {
	constructor(readonly field: LivroReferenceField) {
		super(LIVRO_REFERENCE_NOT_FOUND_MESSAGE);
		this.name = 'LivroReferenceNotFoundError';
	}
}

export class LivroNotFoundError extends Error {
	constructor() {
		super(LIVRO_NOT_FOUND_MESSAGE);
		this.name = 'LivroNotFoundError';
	}
}

export class LivroHasDependentsError extends Error {
	constructor() {
		super(LIVRO_HAS_DEPENDENTS_MESSAGE);
		this.name = 'LivroHasDependentsError';
	}
}

type DatabaseError = postgres.PostgresError;

const getDatabaseError = (cause: unknown): DatabaseError | undefined => {
	if (!(cause instanceof DrizzleQueryError)) return undefined;
	return cause.cause instanceof postgres.PostgresError ? cause.cause : undefined;
};

const translateConstraint = (databaseError: DatabaseError): Error | undefined => {
	if (databaseError.code === '23505' && databaseError.constraint_name === 'tombo_unico') {
		return new DuplicateLivroTomboError();
	}

	if (databaseError.code !== '23503') return undefined;
	if (databaseError.constraint_name === 'fk_editora') return new LivroReferenceNotFoundError('editora');
	if (databaseError.constraint_name === 'fk_serie') return new LivroReferenceNotFoundError('colecao');
	if (databaseError.constraint_name === 'fk_autor') return new LivroReferenceNotFoundError('autores');
	if (databaseError.constraint_name === 'fk_livro') return new LivroHasDependentsError();
	return undefined;
};

export const translateLivroError = (cause: unknown): never => {
	const databaseError = getDatabaseError(cause);
	const translated = databaseError ? translateConstraint(databaseError) : undefined;
	if (translated) throw translated;
	throw cause;
};

export const withLivroErrorTranslation = <Result>(operation: () => Promise<Result>): Promise<Result> =>
	operation().catch(translateLivroError);

export const translateBookError = translateLivroError;
export const withBookErrorTranslation = withLivroErrorTranslation;
