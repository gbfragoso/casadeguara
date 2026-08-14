import {
	ADDRESS_MAX_LENGTH,
	CITY_MAX_LENGTH,
	COMPLEMENT_MAX_LENGTH,
	DISTRICT_MAX_LENGTH,
	createCheckboxSchema,
	createOptionalEmailSchema,
	createOptionalPhoneSchema,
	createOptionalPostalCodeSchema,
	createOptionalTextSchema,
	createRequiredNameSchema,
	type RegistrationTerm,
} from './common';
import { cpfReplacementSchema, rgReplacementSchema } from './identifiers';

export const createPersonalRegistrationFields = (term: RegistrationTerm) => ({
	nome: createRequiredNameSchema(term),
	rg: rgReplacementSchema.optional(),
	cpf: cpfReplacementSchema.optional(),
	email: createOptionalEmailSchema().optional(),
	celular: createOptionalPhoneSchema('Celular').optional(),
	telefone: createOptionalPhoneSchema('Telefone').optional(),
	logradouro: createOptionalTextSchema(ADDRESS_MAX_LENGTH, 'Logradouro').optional(),
	bairro: createOptionalTextSchema(DISTRICT_MAX_LENGTH, 'Bairro').optional(),
	complemento: createOptionalTextSchema(COMPLEMENT_MAX_LENGTH, 'Complemento').optional(),
	cidade: createOptionalTextSchema(CITY_MAX_LENGTH, 'Cidade').optional(),
	cep: createOptionalPostalCodeSchema().optional(),
	trab: createCheckboxSchema('Trabalhador inválido.').optional(),
});
