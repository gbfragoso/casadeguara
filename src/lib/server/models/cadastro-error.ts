import { DrizzleQueryError } from 'drizzle-orm';
import postgres from 'postgres';

export const DUPLICATE_CADASTRO_NAME_MESSAGE =
	'J\u00e1 existe um cadastro com nome id\u00eantico. Consulte o cadastro existente.';

export class DuplicateCadastroNameError extends Error {
	constructor() {
		super(DUPLICATE_CADASTRO_NAME_MESSAGE);
		this.name = 'DuplicateCadastroNameError';
	}
}

const getPostgresError = (error: unknown) => {
	if (error instanceof DrizzleQueryError && error.cause instanceof postgres.PostgresError) return error.cause;
};

export const translateCadastroError = (error: unknown): never => {
	const databaseError = getPostgresError(error);

	if (databaseError?.code === '23505' && databaseError.constraint_name === 'unique_leitor') {
		throw new DuplicateCadastroNameError();
	}

	throw error;
};

export const withCadastroErrorTranslation = <Result>(operation: () => Promise<Result>) =>
	operation().catch(translateCadastroError);
