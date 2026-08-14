import { File } from 'node:buffer';

import { describe, expect, it } from 'vitest';

import { KEYWORD_MAX_LENGTH, keywordSchema, keywordSearchSchema } from '$lib/validation/keyword';
import { getFieldErrors } from './field-errors';

const REQUIRED = 'Palavra-chave é obrigatória.';
const INVALID = 'Palavra-chave inválida.';
const TOO_LONG = 'Palavra-chave excede o limite de caracteres.';

describe('keywordSchema', () => {
	it.each([
		['normal term', 'Romance', 'ROMANCE'],
		['multiple words', 'Literatura brasileira', 'LITERATURA BRASILEIRA'],
		['accents', 'Ficção', 'FICÇÃO'],
		['apostrophe and hyphen', "D'Ávila-Silva", "D'ÁVILA-SILVA"],
		['catalog punctuation', 'C++', 'C++'],
		['digits with letters', 'Século 21', 'SÉCULO 21'],
		['surrounding whitespace', '  poesia  ', 'POESIA'],
		['Portuguese uppercase', 'ação', 'AÇÃO'],
	])('normalizes %s', (_, chave, expected) => {
		const result = keywordSchema.safeParse({ chave });

		expect(result).toMatchObject({ success: true, data: { chave: expected } });
	});

	it.each([
		['empty', '', REQUIRED],
		['whitespace', '   ', REQUIRED],
		['missing', undefined, REQUIRED],
		['file', new File(['keyword'], 'keyword.txt'), INVALID],
		['numeric', '12345', INVALID],
		['punctuation', "-.'&+", INVALID],
		['too long', 'a'.repeat(KEYWORD_MAX_LENGTH + 1), TOO_LONG],
	])('rejects %s values', (_, chave, message) => {
		const result = keywordSchema.safeParse({ chave });

		expect(getFieldErrors(result)?.chave).toEqual([message]);
	});

	it('accepts a keyword with the maximum length', () => {
		const result = keywordSchema.safeParse({ chave: `A${'a'.repeat(KEYWORD_MAX_LENGTH - 1)}` });

		expect(result).toMatchObject({ success: true });
	});
});

describe('keywordSearchSchema', () => {
	it.each([
		['empty search', '', ''],
		['trimmed search', '  Ficção  ', 'Ficção'],
	])('accepts %s', (_, chave, expected) => {
		const result = keywordSearchSchema.safeParse({ chave });

		expect(result).toMatchObject({ success: true, data: { chave: expected } });
	});

	it.each([
		['numeric search', '123', INVALID],
		['punctuation search', '+++', INVALID],
		['long search', 'a'.repeat(KEYWORD_MAX_LENGTH + 1), TOO_LONG],
		['missing search', undefined, INVALID],
		['file search', new File(['keyword'], 'keyword.txt'), INVALID],
	])('rejects %s', (_, chave, message) => {
		const result = keywordSearchSchema.safeParse({ chave });

		expect(getFieldErrors(result)?.chave).toEqual([message]);
	});
});
