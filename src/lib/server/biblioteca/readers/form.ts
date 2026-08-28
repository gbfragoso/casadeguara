export type ReaderFormErrors = Record<string, string[] | undefined>;
type ReaderFormField =
	| 'nome'
	| 'email'
	| 'celular'
	| 'telefone'
	| 'logradouro'
	| 'bairro'
	| 'complemento'
	| 'cidade'
	| 'cep'
	| 'trab'
	| 'status'
	| 'removeRg'
	| 'removeCpf';

export type ReaderFormValues = Partial<Record<ReaderFormField, string>> & {
	rg: string;
	cpf: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getString = (value: unknown, field: string) =>
	isRecord(value) && typeof value[field] === 'string' ? value[field] : '';

export const getReaderSearchValues = (value: unknown) => ({ nome: getString(value, 'nome') });

export const getReaderFormValues = (value: unknown): ReaderFormValues => ({
	nome: getString(value, 'nome'),
	email: getString(value, 'email'),
	celular: getString(value, 'celular'),
	telefone: getString(value, 'telefone'),
	logradouro: getString(value, 'logradouro'),
	bairro: getString(value, 'bairro'),
	complemento: getString(value, 'complemento'),
	cidade: getString(value, 'cidade'),
	cep: getString(value, 'cep'),
	trab: getString(value, 'trab'),
	status: getString(value, 'status'),
	removeRg: getString(value, 'removeRg'),
	removeCpf: getString(value, 'removeCpf'),
	rg: '',
	cpf: '',
});

export const getReaderErrors = (errors: ReaderFormErrors): ReaderFormErrors => errors;
