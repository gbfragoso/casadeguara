import type { BibliotecaCreateInput, BibliotecaUpdateInput } from '#lib/validation/cadastros/biblioteca.js';
import type { SecretariaFlagsInput } from '#lib/validation/cadastros/flags.js';
import type { SecretariaCreateInput, SecretariaUpdateInput } from '#lib/validation/cadastros/secretaria.js';
import type { TesourariaCreateInput, TesourariaUpdateInput } from '#lib/validation/cadastros/tesouraria.js';

type BibliotecaField =
	| 'nome'
	| 'rg'
	| 'cpf'
	| 'email'
	| 'celular'
	| 'telefone'
	| 'logradouro'
	| 'bairro'
	| 'complemento'
	| 'cidade'
	| 'cep'
	| 'trab'
	| 'status';

type SecretariaField = Exclude<BibliotecaField, 'status'> | 'aniversario';
type TesourariaField = 'nome' | 'telefone' | 'trab';

export type BibliotecaCreateData = Pick<BibliotecaCreateInput, BibliotecaField>;
export type BibliotecaUpdateData = Pick<BibliotecaUpdateInput, BibliotecaField>;
export type SecretariaCreateData = Pick<SecretariaCreateInput, SecretariaField>;
export type SecretariaUpdateData = Pick<SecretariaUpdateInput, SecretariaField>;
export type TesourariaCreateData = Pick<TesourariaCreateInput, TesourariaField>;
export type TesourariaUpdateData = Pick<TesourariaUpdateInput, TesourariaField>;
export type SecretariaFlagData = Pick<SecretariaFlagsInput, 'field' | 'value'>;
