import { describe, expect, it } from 'vitest';

import { moeda } from '$lib/utils/currency';

describe('moeda', () => {
	it('formats amounts as Brazilian reais', () => {
		const result = moeda(1234.5);

		expect(result).toContain('1.234,50');
		expect(result).toMatch(/R\$\s?1\.234,50/);
	});
});
