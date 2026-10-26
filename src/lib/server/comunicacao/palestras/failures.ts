import { DUPLICATE_PALESTRANTE_NAME_MESSAGE } from '#lib/server/models/palestrante-error.js';
import { error, fail } from '@sveltejs/kit';
import { flattenError, type ZodError } from 'zod';

export type TalkOperation = 'criar' | 'atualizar' | 'mover' | 'excluir';
export type TalkFailureCode =
	'validacao' | 'data-passada' | 'nome-duplicado' | 'historico-bloqueado' | 'inexistente' | 'conflito';

export type TalkActionFailure = {
	operacao: TalkOperation;
	codigo: TalkFailureCode;
	palestraId?: number;
	campo?: string;
	mensagem: string;
};

type FailureDetails = { palestraId?: number; campo?: string; mensagem?: string };
type InputFailureDetails = { palestraId?: number; valueField?: string };

const INVALID_INPUT_MESSAGE = 'Dados inválidos.';
const UNEXPECTED_FAILURE_MESSAGE = 'Não foi possível concluir a operação. Nada foi alterado.';

const FAILURE_STATUS: Record<TalkFailureCode, number> = {
	validacao: 400,
	'data-passada': 400,
	'nome-duplicado': 400,
	'historico-bloqueado': 403,
	inexistente: 404,
	conflito: 409,
};

const FAILURE_MESSAGES: Record<TalkFailureCode, string> = {
	validacao: INVALID_INPUT_MESSAGE,
	'data-passada': 'Somente a coordenação pode usar uma data anterior a hoje.',
	'nome-duplicado': DUPLICATE_PALESTRANTE_NAME_MESSAGE,
	'historico-bloqueado': 'Somente a coordenação pode alterar palestras que já aconteceram.',
	inexistente: 'Esta palestra não existe mais. O board foi atualizado.',
	conflito: 'Outra pessoa alterou esta programação. O board foi atualizado; confira e tente de novo.',
};

export const readTalkFailureMessage = (codigo: 'inexistente' | 'conflito') => FAILURE_MESSAGES[codigo];

export const rejectTalk = (operacao: TalkOperation, codigo: TalkFailureCode, details: FailureDetails = {}) => {
	const failure: TalkActionFailure = {
		operacao,
		codigo,
		...details,
		mensagem: details.mensagem ?? FAILURE_MESSAGES[codigo],
	};
	return fail(FAILURE_STATUS[codigo], failure);
};

export const rejectInvalidInput = (
	operacao: TalkOperation,
	cause: ZodError<Record<string, unknown>>,
	details: InputFailureDetails = {},
) => {
	const { formErrors, fieldErrors } = flattenError(cause);
	const [field, messages = formErrors] = Object.entries(fieldErrors).at(0) ?? [];
	const campo = field === 'valor' ? details.valueField : field;
	return rejectTalk(operacao, 'validacao', { palestraId: details.palestraId, campo, mensagem: messages[0] });
};

export const rejectConflict = (operacao: TalkOperation, palestraId: number, actorId: string) => {
	console.warn('comunicacao.palestras.conflito', { operacao, palestraId, actorId });
	return rejectTalk(operacao, 'conflito', { palestraId });
};

export const runTalkOperation = async <Result>(
	operacao: TalkOperation | 'carregar',
	run: () => Promise<Result>,
	palestraId?: number,
): Promise<Result> => {
	try {
		return await run();
	} catch (cause) {
		console.error('comunicacao.palestras.falha', { operacao, palestraId, error: cause });
		error(500, UNEXPECTED_FAILURE_MESSAGE);
	}
};
