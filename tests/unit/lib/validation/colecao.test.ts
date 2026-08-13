import { File } from 'node:buffer';

import { describe, expect, it } from 'vitest';

import { COLLECTION_NAME_MAX_LENGTH, colecaoSchema, colecaoSearchSchema } from '$lib/validation/colecao';

const REQUIRED = 'Nome da coleção é obrigatório.';
const INVALID = 'Nome da coleção inválido.';
const TOO_LONG = 'Nome da coleção excede o limite de caracteres.';

describe('colecaoSchema', () => {
	it.each([
		['normal name', 'Romance', 'ROMANCE'],
		['accents', 'Ficção', 'FICÇÃO'],
		['apostrophe and hyphen', "D'Ávila-Silva", "D'ÁVILA-SILVA"],
		['initials and punctuation', 'A. & B. 21', 'A. & B. 21'],
		['surrounding whitespace', '  poesia  ', 'POESIA'],
		['Portuguese uppercase', 'ação', 'AÇÃO'],
	])('normalizes %s', (_, nome, expected) => {
		const result = colecaoSchema.safeParse({ nome });

		expect(result).toMatchObject({ success: true, data: { nome: expected } });
	});

	it.each([
		['empty', '', REQUIRED],
		['whitespace', '   ', REQUIRED],
		['missing', undefined, REQUIRED],
		['null', null, REQUIRED],
		['file', new File(['collection'], 'collection.txt'), INVALID],
		['numeric', '12345', INVALID],
		['punctuation', "-.&'+", INVALID],
		['too long', 'a'.repeat(COLLECTION_NAME_MAX_LENGTH + 1), TOO_LONG],
	])('rejects %s values', (_, nome, message) => {
		const result = colecaoSchema.safeParse({ nome });

		expect(result.error?.flatten().fieldErrors.nome).toEqual([message]);
	});

	it('accepts a name with the maximum length', () => {
		const result = colecaoSchema.safeParse({ nome: `A${'a'.repeat(COLLECTION_NAME_MAX_LENGTH - 1)}` });

		expect(result).toMatchObject({ success: true });
	});
});

describe('colecaoSearchSchema', () => {
	it.each([
		['empty search', '', ''],
		['trimmed search', '  Ficção  ', 'Ficção'],
	])('accepts %s', (_, nome, expected) => {
		const result = colecaoSearchSchema.safeParse({ nome });

		expect(result).toMatchObject({ success: true, data: { nome: expected } });
	});

	it.each([
		['numeric search', '123', INVALID],
		['punctuation search', '+++', INVALID],
		['long search', 'a'.repeat(COLLECTION_NAME_MAX_LENGTH + 1), TOO_LONG],
		['missing search', undefined, INVALID],
		['file search', new File(['collection'], 'collection.txt'), INVALID],
	])('rejects %s', (_, nome, message) => {
		const result = colecaoSearchSchema.safeParse({ nome });

		expect(result.error?.flatten().fieldErrors.nome).toEqual([message]);
	});
});
