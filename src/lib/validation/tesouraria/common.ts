import { z } from 'zod';

export const MAX_TEXT_LENGTH = 200;
export const INVALID_DATA_MESSAGE = 'Dados do lançamento inválidos.';
export const INVALID_ID_MESSAGE = 'Contraparte inválida.';
export const INVALID_DATE_MESSAGE = 'Data do lançamento inválida.';
export const INVALID_VALUE_MESSAGE = 'Valor inválido.';
export const INVALID_DESCRIPTION_MESSAGE = 'Descrição inválida.';
export const REQUIRED_DESCRIPTION_MESSAGE = 'Descrição é obrigatória.';
export const INVALID_BOOLEAN_MESSAGE = 'Valor booleano inválido.';
export const INVALID_FILTER_MESSAGE = 'Filtro incompatível com o tipo selecionado.';
export const INVALID_RANGE_MESSAGE = 'O início não pode ser posterior ao fim.';
export const REQUIRED_COUNTERPART_MESSAGE = 'Contraparte é obrigatória para entradas.';
export const REQUIRED_REASON_MESSAGE = 'Motivo do estorno é obrigatório.';
export const INVALID_REASON_MESSAGE = 'Motivo do estorno inválido.';
export const REQUIRED_IDS_MESSAGE = 'Selecione ao menos um lançamento.';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DECIMAL_PATTERN = /^-?\d+(?:\.\d+)?$/;
const NUMERIC_ONLY_PATTERN = /^\d+(?:\.\d+)?$/;

export const isCalendarDate = (value: string) => {
	if (!DATE_PATTERN.test(value)) return false;
	const [year, month, day] = value.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

export const normalizeInteger = (value: unknown, emptyValue: number | null | undefined) => {
	if (typeof value !== 'string') return value;
	const trimmed = value.trim();
	return trimmed === '' ? emptyValue : Number(trimmed);
};

export const integerSchema = (message = INVALID_ID_MESSAGE) =>
	z.number({ error: message }).int(message).positive(message).max(2_147_483_647, message);
export const dateSchema = z.string({ error: INVALID_DATE_MESSAGE }).trim().refine(isCalendarDate, INVALID_DATE_MESSAGE);
export const descriptionSchema = z
	.string({ error: REQUIRED_DESCRIPTION_MESSAGE })
	.trim()
	.min(1, REQUIRED_DESCRIPTION_MESSAGE)
	.max(MAX_TEXT_LENGTH, INVALID_DESCRIPTION_MESSAGE)
	.refine((value) => !NUMERIC_ONLY_PATTERN.test(value), 'Descrição não pode conter somente números.');
export const valueSchema = z
	.string({ error: INVALID_VALUE_MESSAGE })
	.trim()
	.min(1, INVALID_VALUE_MESSAGE)
	.regex(DECIMAL_PATTERN, INVALID_VALUE_MESSAGE);
export const normalizeBoolean = (value: unknown) =>
	typeof value !== 'string'
		? value
		: value.trim() === 'true' || value.trim() === 'on'
			? true
			: value.trim() === 'false'
				? false
				: value;
export const booleanSchema = z.preprocess(normalizeBoolean, z.boolean({ error: INVALID_BOOLEAN_MESSAGE }));
