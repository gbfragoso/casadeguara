import { describe, expect, it } from 'vitest';

import { parseAmigoFraternoPdfRequest } from '#lib/validation/pdf/amigo-fraterno.js';

describe('parseAmigoFraternoPdfRequest', () => {
	it('accepts an existing draw date', () => {
		const params = new URLSearchParams({ nextDrawDate: '2026-12-20' });

		const result = parseAmigoFraternoPdfRequest(params);

		expect(result).toMatchObject({ success: true, data: { nextDrawDate: '2026-12-20' } });
	});

	it('rejects an impossible draw date', () => {
		const params = new URLSearchParams({ nextDrawDate: '2026-02-30' });

		const result = parseAmigoFraternoPdfRequest(params);

		expect(result.error?.issues[0]?.message).toBe('Informe uma data de sorteio válida.');
	});

	it.each([
		['an extra parameter', 'nextDrawDate=2026-12-20&mes=12'],
		['another parameter name', 'data=2026-12-20'],
	])('rejects a request with %s', (_, query) => {
		const params = new URLSearchParams(query);

		const result = parseAmigoFraternoPdfRequest(params);

		expect(result.success).toBe(false);
	});
});
