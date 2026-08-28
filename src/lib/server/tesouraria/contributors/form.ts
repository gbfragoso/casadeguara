export type TesourariaFormErrors = Record<string, string[] | undefined>;
type TesourariaFormField = 'nome' | 'telefone' | 'trab';

export type TesourariaFormValues = Partial<Record<TesourariaFormField, string>>;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getString = (value: unknown, field: TesourariaFormField) =>
	isRecord(value) && typeof value[field] === 'string' ? value[field] : '';

export const getTesourariaSearchValues = (value: unknown) => ({ nome: getString(value, 'nome') });

export const getTesourariaFormValues = (value: unknown): TesourariaFormValues => ({
	nome: getString(value, 'nome'),
	telefone: getString(value, 'telefone'),
	trab: getString(value, 'trab'),
});

export const getTesourariaErrors = (errors: TesourariaFormErrors, formErrors: string[] = []): TesourariaFormErrors =>
	formErrors.length ? { ...errors, form: formErrors } : errors;
