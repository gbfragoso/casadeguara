import { describe, expect, it } from 'vitest';

import { AUTHOR_NAME_MAX_LENGTH, autorSchema, autorSearchSchema } from '$lib/validation/autor';

const required = 'Nome do autor é obrigatório.';
const invalid = 'Nome do autor inválido.';
const tooLong = 'Nome do autor excede o limite de caracteres.';
const letters = 'a'.repeat(AUTHOR_NAME_MAX_LENGTH);

describe('autorSchema', () => {
	it.each([
		['nome comum', 'Machado de Assis', 'MACHADO DE ASSIS'],
		['acentos', 'Érico Veríssimo', 'ÉRICO VERÍSSIMO'],
		['pontuação válida', "  D'Ávila-Silva, J.2  ", "D'ÁVILA-SILVA, J.2"],
		['limite', letters, letters.toUpperCase()],
	])('normaliza %s', (_, nome, expected) => {
		const result = autorSchema.safeParse({ nome });

		expect(result).toEqual({ success: true, data: { nome: expected } });
	});

	it.each([
		['vazio', '', required],
		['somente espaço', '  ', required],
		['ausente', undefined, invalid],
		['arquivo', new File(['nome'], 'autor.txt'), invalid],
		['números', '123', invalid],
		['pontuação', "-'.", invalid],
		['61 caracteres', `${letters}a`, tooLong],
	])('rejeita %s', (_, nome, message) => {
		const result = autorSchema.safeParse({ nome });

		expect(result.success).toBe(false);
		if (!result.success) expect(result.error.flatten().fieldErrors.nome).toContain(message);
	});
});

describe('autorSearchSchema', () => {
	it.each([
		['vazio', '', ''],
		['espaços', '  Érico  ', 'Érico'],
	])('aceita pesquisa %s', (_, nome, expected) => {
		const result = autorSearchSchema.safeParse({ nome });

		expect(result).toEqual({ success: true, data: { nome: expected } });
	});

	it.each([
		['não textual', new File(['nome'], 'autor.txt'), invalid],
		['sem letras', '123', invalid],
		['muito longa', `${letters}a`, tooLong],
	])('rejeita pesquisa %s', (_, nome, message) => {
		const result = autorSearchSchema.safeParse({ nome });

		expect(result.success).toBe(false);
		if (!result.success) expect(result.error.flatten().fieldErrors.nome).toContain(message);
	});
});
