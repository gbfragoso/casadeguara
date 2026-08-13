import { z } from 'zod';

export const CPF_INVALID_MESSAGE = 'CPF inválido.';
export const RG_INVALID_MESSAGE = 'RG inválido.';

const IDENTIFIER_PATTERN = /^[\d.\s-]*$/;
const RG_MIN_LENGTH = 5;
const RG_MAX_LENGTH = 12;

const calculateCpfCheckDigit = (digits: string, weight: number) => {
	const sum = [...digits].reduce((total, digit, index) => total + Number(digit) * (weight - index), 0);
	const result = (sum * 10) % 11;

	return result === 10 ? 0 : result;
};

const isValidCpf = (value: string) => {
	if (/^(\d)\1{10}$/.test(value)) return false;

	return (
		value.length === 11 &&
		calculateCpfCheckDigit(value.slice(0, 9), 10) === Number(value[9]) &&
		calculateCpfCheckDigit(value.slice(0, 10), 11) === Number(value[10])
	);
};

const createIdentifierReplacementSchema = (message: string, isValid: (value: string) => boolean) =>
	z
		.string({ error: message })
		.trim()
		.refine((value) => value === '' || IDENTIFIER_PATTERN.test(value), message)
		.transform((value) => (value === '' ? undefined : value.replace(/\D/g, '')))
		.refine((value) => value === undefined || isValid(value), message);

export const cpfReplacementSchema = createIdentifierReplacementSchema(CPF_INVALID_MESSAGE, isValidCpf);

// Brazilian RG lengths and checksum rules vary by issuing state, so only 5-12 stored digits are accepted.
export const rgReplacementSchema = createIdentifierReplacementSchema(
	RG_INVALID_MESSAGE,
	(value) => value.length >= RG_MIN_LENGTH && value.length <= RG_MAX_LENGTH,
);
