import { describe, expect, it } from 'vitest';

import { fitName } from '$lib/server/amigo-fraterno/pdf-text';

describe('PDF name fitting', () => {
	it('keeps a long name in at most two lines without omitting words', () => {
		const name = 'MARIA APARECIDA DE SOUZA NASCIMENTO FERREIRA';
		const measure = { widthOfTextAtSize: (text: string, size: number) => text.length * size };

		const fitted = fitName(name, measure, 100);

		expect(fitted.lines).toHaveLength(2);
		expect(fitted.lines.join(' ')).toBe(name);
	});
});
