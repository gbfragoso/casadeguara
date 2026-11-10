import { describe, expect, it } from 'vitest';

import { formatDocumentTitle } from '#lib/brand/document-title.js';

describe('formatDocumentTitle', () => {
	it('ends the page and module names with the system name', () => {
		const title = formatDocumentTitle('Lançamentos', 'Tesouraria');

		expect(title).toBe('Lançamentos · Tesouraria · Casa de Guará');
	});

	it('names a module home page only once', () => {
		const title = formatDocumentTitle('Secretaria', 'Secretaria');

		expect(title).toBe('Secretaria · Casa de Guará');
	});

	it('skips missing and blank sections', () => {
		const title = formatDocumentTitle('Entrar', undefined, '  ');

		expect(title).toBe('Entrar · Casa de Guará');
	});
});
