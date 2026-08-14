import { describe, expect, it } from 'vitest';

import {
	secretariaCreateSchema,
	secretariaSearchSchema,
	secretariaUpdateSchema,
} from '$lib/validation/cadastros/secretaria';
import { getFieldErrors } from '../field-errors';

describe('secretaria registration schemas', () => {
	it('normalizes the secretaria birthday and shared owned fields', () => {
		const result = secretariaCreateSchema.safeParse({
			nome: '  João  ',
			cpf: '12345678909',
			rg: '123456789',
			aniversario: '2024-02-29',
			trab: 'false',
		});

		expect(result).toMatchObject({
			success: true,
			data: { nome: 'JOÃO', cpf: '12345678909', rg: '123456789', aniversario: '2024-02-29', trab: false },
		});
	});

	it.each([
		[undefined, 'Nome do trabalhador é obrigatório.'],
		['123', 'Nome do trabalhador inválido.'],
		['a'.repeat(61), 'Nome do trabalhador excede o limite de caracteres.'],
	])('returns the exact name error', (nome, message) => {
		const result = secretariaCreateSchema.safeParse({ nome });

		expect(getFieldErrors(result)?.nome).toEqual([message]);
	});

	it('rejects biblioteca fields and invalid birthdays', () => {
		const foreign = secretariaCreateSchema.safeParse({ nome: 'João', status: 'true' });
		const date = secretariaCreateSchema.safeParse({ nome: 'João', aniversario: '2023-02-29' });

		expect(foreign.success).toBe(false);
		expect(getFieldErrors(date)?.aniversario).toEqual(['Data de aniversário inválida.']);
	});

	it('rejects invalid CPF checksums and RG lengths', () => {
		const result = secretariaCreateSchema.safeParse({ nome: 'João', cpf: '12345678900', rg: '1234' });

		expect(getFieldErrors(result)).toMatchObject({ cpf: ['CPF inválido.'], rg: ['RG inválido.'] });
	});

	it('normalizes empty fields to null and explicit identifier removal', () => {
		const result = secretariaUpdateSchema.safeParse({
			nome: 'João',
			celular: '',
			aniversario: '',
			removeCpf: 'true',
		});

		expect(result).toMatchObject({
			success: true,
			data: { nome: 'JOÃO', celular: null, aniversario: null, cpf: null },
		});
	});

	it('rejects simultaneous RG replacement and removal', () => {
		const result = secretariaUpdateSchema.safeParse({ nome: 'João', rg: '123456789', removeRg: 'true' });

		expect(getFieldErrors(result)).toMatchObject({ rg: ['RG inválido.'] });
	});

	it('supports trimmed search names and rejects numeric values', () => {
		const valid = secretariaSearchSchema.safeParse({ nome: '  João  ', trabalhadores: 'true' });
		const invalid = secretariaSearchSchema.safeParse({ nome: '42' });

		expect(valid).toMatchObject({ success: true, data: { nome: 'João', trabalhadores: true } });
		expect(getFieldErrors(invalid)?.nome).toEqual(['Nome do trabalhador inválido.']);
	});
});
