import { File } from 'node:buffer';
import { describe, expect, it } from 'vitest';

import {
	NAME_MAX_LENGTH,
	createOptionalBirthdaySchema,
	createOptionalEmailSchema,
	createOptionalPhoneSchema,
	createOptionalPostalCodeSchema,
	createOptionalTextSchema,
	createRequiredNameSchema,
	createSearchNameSchema,
} from '$lib/validation/cadastros/common';

const REQUIRED = 'Nome do leitor é obrigatório.';
const INVALID = 'Nome do leitor inválido.';
const TOO_LONG = 'Nome do leitor excede o limite de caracteres.';

describe('common registration schemas', () => {
	it('normalizes a valid reader name once', () => {
		const result = createRequiredNameSchema('leitor').safeParse("  Conceição D'Ávila-2  ");

		expect(result).toMatchObject({ success: true, data: "CONCEIÇÃO D'ÁVILA-2" });
	});

	it.each([
		['missing', undefined, REQUIRED],
		['whitespace', '   ', REQUIRED],
		['file', new File(['name'], 'name.txt'), INVALID],
		['numeric', '12345', INVALID],
		['long', 'a'.repeat(NAME_MAX_LENGTH + 1), TOO_LONG],
	])('rejects a %s name', (_, value, message) => {
		const result = createRequiredNameSchema('leitor').safeParse(value);

		expect(result.error?.issues[0]?.message).toBe(message);
	});

	it('accepts a name at the database boundary', () => {
		const result = createRequiredNameSchema('leitor').safeParse('A'.repeat(NAME_MAX_LENGTH));

		expect(result).toMatchObject({ success: true, data: 'A'.repeat(NAME_MAX_LENGTH) });
	});

	it('accepts empty searches while rejecting non-letter values', () => {
		const empty = createSearchNameSchema('leitor').safeParse('  ');
		const numeric = createSearchNameSchema('leitor').safeParse('123');
		const long = createSearchNameSchema('leitor').safeParse('a'.repeat(NAME_MAX_LENGTH + 1));

		expect(empty).toMatchObject({ success: true, data: '' });
		expect(numeric.error?.issues[0]?.message).toBe(INVALID);
		expect(long.error?.issues[0]?.message).toBe(TOO_LONG);
	});

	it('normalizes optional contact and address fields', () => {
		const email = createOptionalEmailSchema().safeParse(' ana@example.com ');
		const celular = createOptionalPhoneSchema('Celular').safeParse('(71) 99999-9999');
		const cep = createOptionalPostalCodeSchema().safeParse('40000-000');
		const endereco = createOptionalTextSchema(80, 'Logradouro').safeParse('   ');

		expect(email).toMatchObject({ success: true, data: 'ana@example.com' });
		expect(celular).toMatchObject({ success: true, data: '71999999999' });
		expect(cep).toMatchObject({ success: true, data: '40000000' });
		expect(endereco).toMatchObject({ success: true, data: null });
	});

	it('enforces optional database boundaries after normalization', () => {
		const email = createOptionalEmailSchema().safeParse(`${'a'.repeat(49)}@example.com`);
		const address = createOptionalTextSchema(80, 'Logradouro').safeParse('a'.repeat(81));

		expect(email.error?.issues[0]?.message).toBe('E-mail inválido.');
		expect(address.error?.issues[0]?.message).toBe('Logradouro inválido.');
	});

	it.each([
		['email', createOptionalEmailSchema(), 'ana@', 'E-mail inválido.'],
		['cell phone', createOptionalPhoneSchema('Celular'), '+55 71 99999-9999', 'Celular inválido.'],
		['phone letters', createOptionalPhoneSchema('Telefone'), 'telefone', 'Telefone inválido.'],
		['postal code', createOptionalPostalCodeSchema(), '4000', 'CEP inválido.'],
		['birthday', createOptionalBirthdaySchema(), '2023-02-29', 'Data de aniversário inválida.'],
	])('rejects an invalid %s', (_, schema, value, message) => {
		const result = schema.safeParse(value);

		expect(result.error?.issues[0]?.message).toBe(message);
	});

	it('preserves calendar dates without creating a timezone value', () => {
		const result = createOptionalBirthdaySchema().safeParse('2024-02-29');

		expect(result).toMatchObject({ success: true, data: '2024-02-29' });
	});
});
