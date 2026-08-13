import { describe, expect, it } from 'vitest';

import {
	tesourariaCreateSchema,
	tesourariaSearchSchema,
	tesourariaUpdateSchema,
} from '$lib/validation/cadastros/tesouraria';

describe('tesouraria registration schemas', () => {
	it('normalizes only treasury-owned fields', () => {
		const result = tesourariaCreateSchema.safeParse({ nome: '  Ana 3 ', telefone: '(71) 3333-3333', trab: 'true' });

		expect(result).toMatchObject({ success: true, data: { nome: 'ANA 3', telefone: '7133333333', trab: true } });
	});

	it.each([
		[undefined, 'Nome do contribuinte é obrigatório.'],
		['123', 'Nome do contribuinte inválido.'],
		['a'.repeat(61), 'Nome do contribuinte excede o limite de caracteres.'],
	])('returns the exact name error', (nome, message) => {
		const result = tesourariaCreateSchema.safeParse({ nome });

		expect(result.error?.flatten().fieldErrors.nome).toEqual([message]);
	});

	it('rejects foreign dashboard fields and invalid phone values', () => {
		const foreign = tesourariaCreateSchema.safeParse({ nome: 'Ana', cpf: '12345678909' });
		const phone = tesourariaCreateSchema.safeParse({ nome: 'Ana', telefone: '123' });

		expect(foreign.success).toBe(false);
		expect(phone.error?.flatten().fieldErrors.telefone).toEqual(['Telefone inválido.']);
	});

	it('normalizes an empty update field to null and exact false', () => {
		const result = tesourariaUpdateSchema.safeParse({ nome: 'Ana', telefone: '', trab: 'false' });

		expect(result).toMatchObject({ success: true, data: { nome: 'ANA', telefone: null, trab: false } });
	});

	it('allows empty searches but rejects missing or unexpected values', () => {
		const empty = tesourariaSearchSchema.safeParse({ nome: '' });
		const missing = tesourariaSearchSchema.safeParse({});
		const extra = tesourariaSearchSchema.safeParse({ nome: '', status: 'false' });

		expect(empty).toMatchObject({ success: true, data: { nome: '' } });
		expect(missing.error?.flatten().fieldErrors.nome).toEqual(['Nome do contribuinte inválido.']);
		expect(extra.success).toBe(false);
	});
});
