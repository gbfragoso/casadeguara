import type {
	BibliotecaCreateData,
	BibliotecaUpdateData,
	SecretariaCreateData,
	SecretariaFlagData,
	SecretariaUpdateData,
	TesourariaCreateData,
	TesourariaUpdateData,
} from './cadastro-inputs';

const toBirthday = (value: string | null) => (value === null ? null : new Date(value));

export const toBibliotecaValues = (input: BibliotecaCreateData | BibliotecaUpdateData) => ({
	nome: input.nome,
	...(input.rg !== undefined ? { rg: input.rg } : {}),
	...(input.cpf !== undefined ? { cpf: input.cpf } : {}),
	...(input.email !== undefined ? { email: input.email } : {}),
	...(input.celular !== undefined ? { celular: input.celular } : {}),
	...(input.telefone !== undefined ? { telefone: input.telefone } : {}),
	...(input.logradouro !== undefined ? { logradouro: input.logradouro } : {}),
	...(input.bairro !== undefined ? { bairro: input.bairro } : {}),
	...(input.complemento !== undefined ? { complemento: input.complemento } : {}),
	...(input.cidade !== undefined ? { cidade: input.cidade } : {}),
	...(input.cep !== undefined ? { cep: input.cep } : {}),
	...(input.trab !== undefined ? { trab: input.trab } : {}),
	...(input.status !== undefined ? { status: input.status } : {}),
});

export const toSecretariaValues = (input: SecretariaCreateData | SecretariaUpdateData) => ({
	nome: input.nome,
	...(input.rg !== undefined ? { rg: input.rg } : {}),
	...(input.cpf !== undefined ? { cpf: input.cpf } : {}),
	...(input.email !== undefined ? { email: input.email } : {}),
	...(input.celular !== undefined ? { celular: input.celular } : {}),
	...(input.telefone !== undefined ? { telefone: input.telefone } : {}),
	...(input.logradouro !== undefined ? { logradouro: input.logradouro } : {}),
	...(input.bairro !== undefined ? { bairro: input.bairro } : {}),
	...(input.complemento !== undefined ? { complemento: input.complemento } : {}),
	...(input.cidade !== undefined ? { cidade: input.cidade } : {}),
	...(input.cep !== undefined ? { cep: input.cep } : {}),
	...(input.aniversario !== undefined ? { aniversario: toBirthday(input.aniversario) } : {}),
	...(input.trab !== undefined ? { trab: input.trab } : {}),
});

export const toTesourariaValues = (input: TesourariaCreateData | TesourariaUpdateData) => ({
	nome: input.nome,
	...(input.telefone !== undefined ? { telefone: input.telefone } : {}),
	...(input.trab !== undefined ? { trab: input.trab } : {}),
});

export const toSecretariaFlagValue = ({ field, value }: SecretariaFlagData) => {
	if (field === 'trab') return { trab: value };
	if (field === 'frequencia') return { frequencia: value };

	return { desencarnado: value };
};
