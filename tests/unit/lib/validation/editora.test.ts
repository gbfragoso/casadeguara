import { File } from 'node:buffer';
import { describe, expect, it } from 'vitest';

import { PUBLISHER_NAME_MAX_LENGTH, editoraSchema, editoraSearchSchema } from '$lib/validation/editora';
import { getFieldErrors } from './field-errors';

const REQUIRED = 'Nome da editora é obrigatório.';
const INVALID = 'Nome da editora inválido.';
const TOO_LONG = 'Nome da editora excede o limite de caracteres.';

describe('editoraSchema', () => {
	it.each([
		['a normal name', 'Companhia das Letras', 'COMPANHIA DAS LETRAS'],
		['accents', 'Editora José Olympio', 'EDITORA JOSÉ OLYMPIO'],
		['symbols and initials', "J. R. R. D'Ávila-Silva 2", "J. R. R. D'ÁVILA-SILVA 2"],
		['surrounding whitespace', '  Editora 34  ', 'EDITORA 34'],
	])('normalizes %s', (_, nome, expected) => {
		const result = editoraSchema.safeParse({ nome });

		expect(result).toMatchObject({ success: true, data: { nome: expected } });
	});

	it.each([
		['empty', '', REQUIRED],
		['whitespace', '   ', REQUIRED],
		['missing', null, REQUIRED],
		['file', new File(['publisher'], 'publisher.txt'), INVALID],
		['numeric', '12345', INVALID],
		['punctuation', "-.'", INVALID],
		['too long', 'a'.repeat(PUBLISHER_NAME_MAX_LENGTH + 1), TOO_LONG],
	])('rejects %s values', (_, nome, message) => {
		const result = editoraSchema.safeParse({ nome });

		expect(getFieldErrors(result)?.nome).toEqual([message]);
	});

	it('accepts a name with the maximum length', () => {
		const result = editoraSchema.safeParse({ nome: `A${'a'.repeat(PUBLISHER_NAME_MAX_LENGTH - 1)}` });

		expect(result).toMatchObject({ success: true });
	});
});

describe('editoraSearchSchema', () => {
	it.each([
		['empty search', '', ''],
		['trimmed search', '  José  ', 'José'],
	])('accepts %s', (_, nome, expected) => {
		const result = editoraSearchSchema.safeParse({ nome });

		expect(result).toMatchObject({ success: true, data: { nome: expected } });
	});

	it.each([
		['numeric search', '123', INVALID],
		['long search', 'a'.repeat(PUBLISHER_NAME_MAX_LENGTH + 1), TOO_LONG],
		['missing search', undefined, INVALID],
	])('rejects %s', (_, nome, message) => {
		const result = editoraSearchSchema.safeParse({ nome });

		expect(getFieldErrors(result)?.nome).toEqual([message]);
	});
});
