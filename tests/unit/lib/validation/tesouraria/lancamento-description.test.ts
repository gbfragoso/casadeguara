import { describe, expect, it } from 'vitest';

import { lancamentoDescriptionSchema } from '#lib/validation/tesouraria/lancamentos.js';
import { getFieldErrors } from '../field-errors';

describe('lancamentoDescriptionSchema', () => {
	it('accepts a valid id and a trimmed description', () => {
		const result = lancamentoDescriptionSchema.safeParse({ id: ' 12 ', descricao: '  Doação corrigida  ' });

		expect(result).toMatchObject({ success: true, data: { id: 12, descricao: 'Doação corrigida' } });
	});

	it.each([
		['blank', '   ', 'Descrição é obrigatória.'],
		['numeric only', '12345', 'Descrição não pode conter somente números.'],
		['too long', 'a'.repeat(201), 'Descrição inválida.'],
	])('rejects a %s description', (_case, descricao, message) => {
		const result = lancamentoDescriptionSchema.safeParse({ id: '12', descricao });

		expect(getFieldErrors(result)?.descricao).toEqual([message]);
	});

	it.each(['', '0', '-1', '1.5', 'abc', '2147483648'])('rejects the invalid id "%s"', (id) => {
		const result = lancamentoDescriptionSchema.safeParse({ id, descricao: 'Doação' });

		expect(getFieldErrors(result)?.id).toEqual(['Lançamento não encontrado.']);
	});

	it('rejects extra fields', () => {
		const result = lancamentoDescriptionSchema.safeParse({ id: '12', descricao: 'Doação', valor: '10.00' });

		expect(result.success).toBe(false);
	});
});
