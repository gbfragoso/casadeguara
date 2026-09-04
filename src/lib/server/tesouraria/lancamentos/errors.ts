export type LancamentoErrorCode =
	| 'VALIDATION_ERROR'
	| 'LANCAMENTO_NOT_FOUND'
	| 'LANCAMENTO_ALREADY_REVERSED'
	| 'LANCAMENTO_NOT_DEPOSITABLE'
	| 'PERSISTENCE_ERROR';

export class LancamentoError extends Error {
	readonly code: LancamentoErrorCode;

	constructor(code: LancamentoErrorCode, message: string) {
		super(message);
		this.name = 'LancamentoError';
		this.code = code;
	}
}

export const notFoundError = () => new LancamentoError('LANCAMENTO_NOT_FOUND', 'Lançamento não encontrado.');

export const alreadyReversedError = () =>
	new LancamentoError('LANCAMENTO_ALREADY_REVERSED', 'Lançamento já estornado.');

export const notDepositableError = () =>
	new LancamentoError('LANCAMENTO_NOT_DEPOSITABLE', 'Lançamento não pode ser baixado.');

export const validationError = (message: string) => new LancamentoError('VALIDATION_ERROR', message);

export const persistenceError = (cause?: unknown) => {
	const error = new LancamentoError('PERSISTENCE_ERROR', 'Falha ao persistir lançamento.');
	if (cause !== undefined) error.cause = cause;
	return error;
};

const getDatabaseCode = (cause: unknown): unknown => {
	if (!cause || typeof cause !== 'object') return undefined;
	if ('code' in cause && typeof cause.code === 'string') return cause.code;
	if ('cause' in cause) return getDatabaseCode(cause.cause);
	return undefined;
};

export const isUniqueViolation = (cause: unknown) => getDatabaseCode(cause) === '23505';

export const mapPersistenceError = (cause: unknown): LancamentoError => {
	if (cause instanceof LancamentoError) return cause;
	if (isUniqueViolation(cause)) return alreadyReversedError();
	if (getDatabaseCode(cause) === '23503') return validationError('Contraparte não encontrada.');
	if (getDatabaseCode(cause) === '23514') return validationError('Forma de lançamento inválida.');
	return persistenceError(cause);
};
