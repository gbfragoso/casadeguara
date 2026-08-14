import { z } from 'zod';

export const NAME_MAX_LENGTH = 60;
export const EMAIL_MAX_LENGTH = 60;
export const PHONE_MAX_LENGTH = 12;
export const ADDRESS_MAX_LENGTH = 80;
export const DISTRICT_MAX_LENGTH = 30;
export const CITY_MAX_LENGTH = 100;
export const COMPLEMENT_MAX_LENGTH = 100;
export const POSTAL_CODE_LENGTH = 8;

const LETTER_PATTERN = /\p{L}/u;
const PHONE_PATTERN = /^[\d\s()+-]*$/;
const POSTAL_CODE_PATTERN = /^[\d\s-]*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_SCHEMA = z.email();
const PHONE_DIGIT_LENGTHS = [10, 11];

export type RegistrationTerm = 'leitor' | 'trabalhador' | 'contribuinte';

const getNameMessages = (term: RegistrationTerm) => ({
	required: `Nome do ${term} é obrigatório.`,
	invalid: `Nome do ${term} inválido.`,
	tooLong: `Nome do ${term} excede o limite de caracteres.`,
});

const createNullableTextSchema = (message: string) =>
	z
		.string({ error: message })
		.trim()
		.transform((value) => (value === '' ? null : value));

export const createRequiredNameSchema = (term: RegistrationTerm) => {
	const messages = getNameMessages(term);

	return z
		.string({
			error: (issue) =>
				issue.input === undefined || issue.input === null ? messages.required : messages.invalid,
		})
		.trim()
		.min(1, messages.required)
		.max(NAME_MAX_LENGTH, messages.tooLong)
		.refine((value) => value === '' || LETTER_PATTERN.test(value), messages.invalid)
		.transform((value) => value.toLocaleUpperCase('pt-BR'));
};

export const createSearchNameSchema = (term: RegistrationTerm) => {
	const messages = getNameMessages(term);

	return z
		.string({ error: messages.invalid })
		.trim()
		.max(NAME_MAX_LENGTH, messages.tooLong)
		.refine((value) => value === '' || LETTER_PATTERN.test(value), messages.invalid);
};

export const createOptionalTextSchema = (maxLength: number, field: string) =>
	createNullableTextSchema(`${field} inválido.`).refine(
		(value) => value === null || value.length <= maxLength,
		`${field} inválido.`,
	);

export const createOptionalEmailSchema = () =>
	createNullableTextSchema('E-mail inválido.')
		.refine((value) => value === null || value.length <= EMAIL_MAX_LENGTH, 'E-mail inválido.')
		.refine((value) => value === null || EMAIL_SCHEMA.safeParse(value).success, 'E-mail inválido.');

// Stores Brazilian national phone numbers without country code: 10 landline or 11 mobile digits.
export const createOptionalPhoneSchema = (field: 'Celular' | 'Telefone') =>
	createNullableTextSchema(`${field} inválido.`)
		.refine((value) => value === null || PHONE_PATTERN.test(value), `${field} inválido.`)
		.transform((value) => value?.replace(/\D/g, '') ?? null)
		.refine((value) => value === null || value.length <= PHONE_MAX_LENGTH, `${field} inválido.`)
		.refine((value) => value === null || PHONE_DIGIT_LENGTHS.includes(value.length), `${field} inválido.`);

export const createOptionalPostalCodeSchema = () =>
	createNullableTextSchema('CEP inválido.')
		.refine((value) => value === null || POSTAL_CODE_PATTERN.test(value), 'CEP inválido.')
		.transform((value) => value?.replace(/\D/g, '') ?? null)
		.refine((value) => value === null || value.length === POSTAL_CODE_LENGTH, 'CEP inválido.');

const isCalendarDate = (value: string) => {
	const [year, month, day] = value.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));

	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

export const createOptionalBirthdaySchema = () =>
	createNullableTextSchema('Data de aniversário inválida.').refine(
		(value) => value === null || (DATE_PATTERN.test(value) && isCalendarDate(value)),
		'Data de aniversário inválida.',
	);

export const createCheckboxSchema = (message: string) =>
	z.enum(['true', 'false'], { error: message }).transform((value) => value === 'true');
