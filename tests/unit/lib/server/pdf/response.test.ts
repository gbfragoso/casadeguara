import { describe, expect, it } from 'vitest';

import { createPdfResponse } from '#lib/server/pdf/response.js';

describe('TU-05 createPdfResponse', () => {
	it('serves the PDF inline with its file name and without caching or sniffing', async () => {
		const bytes = new Uint8Array([37, 80, 68, 70]);

		const response = createPdfResponse(bytes, 'aniversariantes-2026-11.pdf');

		expect(Object.fromEntries(response.headers)).toEqual({
			'cache-control': 'private, no-store',
			'content-disposition': 'inline; filename="aniversariantes-2026-11.pdf"',
			'content-type': 'application/pdf',
			'x-content-type-options': 'nosniff',
		});
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
	});
});
