import { describe, expect, it } from 'vitest';

import { fitName } from '#lib/server/pdf/amigo-fraterno/text.js';

describe('PDF name fitting', () => {
	it('keeps a long name in at most two lines without omitting words', () => {
		const name = 'MARIA APARECIDA DE SOUZA NASCIMENTO FERREIRA';
		const measure = { widthOfTextAtSize: (text: string, size: number) => text.length * size };

		const fitted = fitName(name, measure, 100);

		expect(fitted.lines).toHaveLength(2);
		expect(fitted.lines.join(' ')).toBe(name);
	});

	it('keeps a single word wider than the line unbroken at the initial size', () => {
		const measure = { widthOfTextAtSize: (text: string, size: number) => text.length * size };

		const fitted = fitName('NASCIMENTO', measure, 50);

		expect(fitted).toEqual({ lines: ['NASCIMENTO'], size: 12 });
	});

	it('falls back to the minimum size when the name cannot fit in two lines', () => {
		const measure = { widthOfTextAtSize: (text: string, size: number) => text.length * size };

		const fitted = fitName('ANA BIA CIA DIA', measure, 12);

		expect(fitted).toEqual({ lines: ['ANA', 'BIA', 'CIA', 'DIA'], size: 4 });
	});
});
