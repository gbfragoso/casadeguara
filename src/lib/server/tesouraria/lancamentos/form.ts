import { flattenError, type ZodError } from 'zod';

export type LancamentoFormErrors = Record<string, string[] | undefined>;
export type LancamentoFormValues = Record<string, string>;

const getString = (input: unknown, field: string) => {
	if (typeof input !== 'object' || input === null) return '';
	const value = Reflect.get(input, field);
	if (typeof value === 'string') return value;
	return typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
};

const getFields = (input: unknown, fields: string[]): LancamentoFormValues =>
	fields.reduce((values, field) => ({ ...values, [field]: getString(input, field) }), {});

export const getLancamentoFormValues = (input: unknown): LancamentoFormValues =>
	getFields(input, ['tipo', 'contraparteId', 'descricao', 'valor', 'dataLancamento', 'depositado']);

export const getLancamentoSearchValues = (input: unknown): LancamentoFormValues =>
	getFields(input, [
		'tipo',
		'contraparte',
		'descricao',
		'dataInicio',
		'dataFim',
		'dataRegistro',
		'depositado',
		'trabalhadores',
	]);

export const getEstornoSearchValues = (input: unknown): LancamentoFormValues =>
	getFields(input, [
		'tipo',
		'contraparte',
		'descricao',
		'lancamentoInicio',
		'lancamentoFim',
		'estornoInicio',
		'estornoFim',
	]);

export const getReasonValues = (input: unknown) => getFields(input, ['motivo']);

export const getLancamentoErrors = (error: ZodError, formErrors: string[] = []): LancamentoFormErrors => {
	const flattened = flattenError(error).fieldErrors;
	return formErrors.length ? { ...flattened, form: formErrors } : flattened;
};

export const getDomainErrors = (message: string, field?: string): LancamentoFormErrors =>
	field ? { [field]: [message] } : { form: [message] };
