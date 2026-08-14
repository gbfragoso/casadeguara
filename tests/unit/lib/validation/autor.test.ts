import { File } from 'node:buffer';
import { describe, expect, it } from 'vitest';

import { AUTHOR_NAME_MAX_LENGTH, authorSchema, authorSearchSchema } from '$lib/validation/autor';
import { getFieldErrors } from './field-errors';

const REQUIRED = 'Nome do autor é obrigatório.';
const INVALID = 'Nome do autor inválido.';
const TOO_LONG = 'Nome do autor excede o limite de caracteres.';

describe('authorSchema', () => {
	it.each([
		['a normal name', 'Maria Silva', 'MARIA SILVA'],
		['accents', 'Conceição Evaristo', 'CONCEIÇÃO EVARISTO'],
		['symbols and initials', "J. R. R. D'Ávila-Silva 2", "J. R. R. D'ÁVILA-SILVA 2"],
		['surrounding whitespace', '  Lygia Fagundes Telles  ', 'LYGIA FAGUNDES TELLES'],
	])('normalizes %s', (_, nome, expected) => {
		const result = authorSchema.safeParse({ nome });

		expect(result).toMatchObject({ success: true, data: { nome: expected } });
	});

	it.each([
		['empty', '', REQUIRED],
		['whitespace', '   ', REQUIRED],
		['missing', null, REQUIRED],
		['file', new File(['author'], 'author.txt'), INVALID],
		['numeric', '12345', INVALID],
		['punctuation', "-.'", INVALID],
		['too long', 'a'.repeat(AUTHOR_NAME_MAX_LENGTH + 1), TOO_LONG],
	])('rejects %s values', (_, nome, message) => {
		const result = authorSchema.safeParse({ nome });

		expect(getFieldErrors(result)?.nome).toEqual([message]);
	});

	it('accepts a name with the maximum length', () => {
		const result = authorSchema.safeParse({ nome: `A${'a'.repeat(AUTHOR_NAME_MAX_LENGTH - 1)}` });

		expect(result).toMatchObject({ success: true });
	});
});

describe('authorSearchSchema', () => {
	it.each([
		['empty search', '', ''],
		['trimmed search', '  Conceição  ', 'Conceição'],
	])('accepts %s', (_, nome, expected) => {
		const result = authorSearchSchema.safeParse({ nome });

		expect(result).toMatchObject({ success: true, data: { nome: expected } });
	});

	it.each([
		['numeric search', '123', INVALID],
		['long search', 'a'.repeat(AUTHOR_NAME_MAX_LENGTH + 1), TOO_LONG],
		['missing search', undefined, INVALID],
	])('rejects %s', (_, nome, message) => {
		const result = authorSearchSchema.safeParse({ nome });

		expect(getFieldErrors(result)?.nome).toEqual([message]);
	});
});
