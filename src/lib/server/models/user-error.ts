import { DrizzleQueryError } from 'drizzle-orm';
import postgres from 'postgres';

const UNIQUE_VIOLATION = '23505';
const USERNAME_UNIQUE_INDEX = 'User_username_key';

export const DUPLICATE_USERNAME_MESSAGE = 'Já existe um usuário com este login.';

export class DuplicateUsernameError extends Error {
	constructor() {
		super(DUPLICATE_USERNAME_MESSAGE);
		this.name = 'DuplicateUsernameError';
	}
}

const isDuplicateUsername = (error: unknown) =>
	error instanceof DrizzleQueryError &&
	error.cause instanceof postgres.PostgresError &&
	error.cause.code === UNIQUE_VIOLATION &&
	error.cause.constraint_name === USERNAME_UNIQUE_INDEX;

export const translateUserError = (error: unknown): never => {
	if (isDuplicateUsername(error)) throw new DuplicateUsernameError();

	throw error;
};
