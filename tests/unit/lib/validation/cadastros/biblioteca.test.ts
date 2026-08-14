import { File } from 'node:buffer';
import { describe, expect, it } from 'vitest';

import {
	bibliotecaCreateSchema,
	bibliotecaSearchSchema,
	bibliotecaUpdateSchema,
} from '$lib/validation/cadastros/biblioteca';
import { getFieldErrors } from '../field-errors';

const validReader = {
	nome: '  Maria D’Ávila 2 ',
	rg: '12.345.678-9',
	cpf: '123.456.789-09',
	email: ' maria@example.com ',
	celular: '(71) 99999-9999',
	telefone: '(71) 3333-3333',
	logradouro: 'Rua das Flores',
	bairro: 'Centro',
	complemento: 'Casa 2',
	cidade: 'Salvador',
	cep: '40000-000',
	trab: 'true',
	status: 'false',
};

describe('biblioteca registration schemas', () => {
	it('normalizes only biblioteca-owned create fields', () => {
		const result = bibliotecaCreateSchema.safeParse(validReader);

		expect(result).toMatchObject({
			success: true,
			data: {
				...validReader,
				nome: 'MARIA D’ÁVILA 2',
				rg: '123456789',
				cpf: '12345678909',
				email: 'maria@example.com',
				celular: '71999999999',
				telefone: '7133333333',
				cep: '40000000',
				trab: true,
				status: false,
			},
		});
	});

	it.each([
		[undefined, 'Nome do leitor é obrigatório.'],
		['1234', 'Nome do leitor inválido.'],
		['a'.repeat(61), 'Nome do leitor excede o limite de caracteres.'],
	])('returns the exact name error', (nome, message) => {
		const result = bibliotecaCreateSchema.safeParse({ nome });

		expect(getFieldErrors(result)?.nome).toEqual([message]);
	});

	it('rejects foreign fields and malformed identifiers', () => {
		const foreign = bibliotecaCreateSchema.safeParse({ nome: 'Maria', aniversario: '2024-01-01' });
		const identifiers = bibliotecaCreateSchema.safeParse({ nome: 'Maria', cpf: '111.111.111-11', rg: '***' });

		expect(foreign.success).toBe(false);
		expect(getFieldErrors(identifiers)).toMatchObject({
			cpf: ['CPF inválido.'],
			rg: ['RG inválido.'],
		});
	});

	it('rejects files instead of converting them into a sensitive value', () => {
		const result = bibliotecaCreateSchema.safeParse({ nome: 'Maria', cpf: new File(['cpf'], 'cpf.txt') });

		expect(getFieldErrors(result)).toMatchObject({ cpf: ['CPF inválido.'] });
	});

	it('supports preserve, replace, and remove semantics for sensitive updates', () => {
		const preserve = bibliotecaUpdateSchema.safeParse({ nome: 'Maria', email: '', cpf: '', rg: '' });
		const replace = bibliotecaUpdateSchema.safeParse({ nome: 'Maria', cpf: '123.456.789-09', rg: '123456789' });
		const remove = bibliotecaUpdateSchema.safeParse({ nome: 'Maria', removeCpf: 'true', removeRg: 'true' });

		expect(preserve).toMatchObject({ success: true, data: { nome: 'MARIA', email: null } });
		expect(replace).toMatchObject({ success: true, data: { nome: 'MARIA', cpf: '12345678909', rg: '123456789' } });
		expect(remove).toMatchObject({ success: true, data: { nome: 'MARIA', cpf: null, rg: null } });
	});

	it('rejects concurrent sensitive replacement and removal', () => {
		const result = bibliotecaUpdateSchema.safeParse({ nome: 'Maria', cpf: '12345678909', removeCpf: 'true' });

		expect(getFieldErrors(result)).toMatchObject({ cpf: ['CPF inválido.'] });
	});

	it('keeps empty searches valid and rejects unexpected keys', () => {
		const search = bibliotecaSearchSchema.safeParse({ nome: '  ' });
		const extra = bibliotecaSearchSchema.safeParse({ nome: '', status: 'true' });

		expect(search).toMatchObject({ success: true, data: { nome: '' } });
		expect(extra.success).toBe(false);
	});
});
