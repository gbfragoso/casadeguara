export type SecretariaFormErrors = Record<string, string[] | undefined>;
type SecretariaFormField =
	| 'nome'
	| 'email'
	| 'celular'
	| 'telefone'
	| 'logradouro'
	| 'bairro'
	| 'complemento'
	| 'cidade'
	| 'cep'
	| 'aniversario'
	| 'trab'
	| 'removeRg'
	| 'removeCpf';

export type SecretariaFormValues = Partial<Record<SecretariaFormField, string>> & {
	rg: string;
	cpf: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getString = (value: unknown, field: string) =>
	isRecord(value) && typeof value[field] === 'string' ? value[field] : '';

export const getSecretariaSearchValues = (value: unknown) => ({
	nome: getString(value, 'nome'),
	trabalhadores: getString(value, 'trabalhadores'),
});

export const getSecretariaFormValues = (value: unknown): SecretariaFormValues => ({
	nome: getString(value, 'nome'),
	email: getString(value, 'email'),
	celular: getString(value, 'celular'),
	telefone: getString(value, 'telefone'),
	logradouro: getString(value, 'logradouro'),
	bairro: getString(value, 'bairro'),
	complemento: getString(value, 'complemento'),
	cidade: getString(value, 'cidade'),
	cep: getString(value, 'cep'),
	aniversario: getString(value, 'aniversario'),
	trab: getString(value, 'trab'),
	removeRg: getString(value, 'removeRg'),
	removeCpf: getString(value, 'removeCpf'),
	rg: '',
	cpf: '',
});

export const getSecretariaErrors = (errors: SecretariaFormErrors, formErrors: string[] = []): SecretariaFormErrors =>
	formErrors.length ? { ...errors, form: formErrors } : errors;
