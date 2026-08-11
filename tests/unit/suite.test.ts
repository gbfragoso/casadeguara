import { describe, expect, it } from 'vitest';

describe('suíte unitária', () => {
	it('executa uma asserção determinística', () => {
		const valores = [1, 2, 3];

		const total = valores.reduce((soma, valor) => soma + valor, 0);

		expect(total).toBe(6);
	});
});
