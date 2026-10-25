import { DrizzleQueryError } from 'drizzle-orm';
import postgres from 'postgres';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';
const SPEAKER_NAME_UNIQUE_CONSTRAINT = 'palestrantes_nome_busca_key';
const TALK_SPEAKER_FOREIGN_KEY = 'palestras_palestrante_id_palestrantes_id_fk';

export const DUPLICATE_PALESTRANTE_NAME_MESSAGE = 'Já existe um palestrante com esse nome.';

export class DuplicatePalestranteNameError extends Error {
	constructor() {
		super(DUPLICATE_PALESTRANTE_NAME_MESSAGE);
		this.name = 'DuplicatePalestranteNameError';
	}
}

const hasConstraintViolation = (error: unknown, code: string, constraint: string) =>
	error instanceof DrizzleQueryError &&
	error.cause instanceof postgres.PostgresError &&
	error.cause.code === code &&
	error.cause.constraint_name === constraint;

export const isTalkSpeakerReferenceViolation = (error: unknown) =>
	hasConstraintViolation(error, FOREIGN_KEY_VIOLATION, TALK_SPEAKER_FOREIGN_KEY);

export const translatePalestranteError = (error: unknown): never => {
	if (hasConstraintViolation(error, UNIQUE_VIOLATION, SPEAKER_NAME_UNIQUE_CONSTRAINT)) {
		throw new DuplicatePalestranteNameError();
	}

	throw error;
};
