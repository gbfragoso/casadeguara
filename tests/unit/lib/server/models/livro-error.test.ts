import { DrizzleQueryError } from 'drizzle-orm';
import postgres from 'postgres';
import { describe, expect, it } from 'vitest';

import {
	DuplicateLivroTomboError,
	LivroHasDependentsError,
	LivroReferenceNotFoundError,
	translateLivroError,
} from '$lib/server/models/livro-error';

const databaseError = (code: string, constraint_name: string) => {
	const cause = new postgres.PostgresError('database failure');
	Object.assign(cause, { code, constraint_name });
	return new DrizzleQueryError('query', [], cause);
};

describe('livro persistence errors', () => {
	it('translates the known duplicate tombo constraint', () => {
		expect(() => translateLivroError(databaseError('23505', 'tombo_unico'))).toThrow(DuplicateLivroTomboError);
	});

	it('translates known references and dependent constraints', () => {
		expect(() => translateLivroError(databaseError('23503', 'fk_editora'))).toThrow(
			new LivroReferenceNotFoundError('editora'),
		);
		expect(() => translateLivroError(databaseError('23503', 'fk_autor'))).toThrow(
			new LivroReferenceNotFoundError('autores'),
		);
		expect(() => translateLivroError(databaseError('23503', 'fk_serie'))).toThrow(
			new LivroReferenceNotFoundError('colecao'),
		);
		expect(() => translateLivroError(databaseError('23503', 'fk_livro'))).toThrow(LivroHasDependentsError);
	});

	it('rethrows unknown causes unchanged', () => {
		const cause = new Error('unexpected');

		expect(() => translateLivroError(cause)).toThrow(cause);
		expect(() => translateLivroError(databaseError('23505', 'other_constraint'))).toThrow(/Failed query/);
	});
});
