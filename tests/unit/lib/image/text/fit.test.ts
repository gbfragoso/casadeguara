import { describe, expect, it } from 'vitest';

import { fitText, type FitOptions } from '#lib/image/text/fit.js';

const measure = { widthOfTextAtSize: (text: string, size: number) => text.length * size };
const options: FitOptions = { width: 100, maxLines: 2, maxSize: 20, minSize: 10, step: 2, breakWords: false };

describe('TU-11 fitText', () => {
	it('keeps the maximum size when the text already fits', () => {
		const fitted = fitText('CASA DE GUARÁ', measure, { ...options, maxLines: 3 });

		expect(fitted).toEqual({ lines: ['CASA', 'DE', 'GUARÁ'], size: 20, fits: true });
	});

	it('shrinks the text in steps until it fits the line limit', () => {
		const fitted = fitText('AMOR PAZ', measure, { ...options, width: 120, maxLines: 1 });

		expect(fitted).toEqual({ lines: ['AMOR PAZ'], size: 14, fits: true });
	});

	it('breaks a word without spaces that is wider than the line', () => {
		const fitted = fitText('W'.repeat(25), measure, { ...options, maxLines: 3, breakWords: true });

		expect(fitted).toEqual({ lines: ['W'.repeat(10), 'W'.repeat(10), 'W'.repeat(5)], size: 10, fits: true });
	});

	it('reports that the text does not fit below the minimum size', () => {
		const text = 'UM DOIS TRES QUATRO CINCO SEIS';

		const fitted = fitText(text, measure, options);

		expect(fitted.fits).toBe(false);
		expect(fitted.size).toBe(10);
		expect(fitted.lines.join(' ')).toBe(text);
	});

	it('tries the minimum size when the step does not land on it', () => {
		const fitted = fitText('ABCDEFGHIJ', measure, {
			...options,
			maxLines: 1,
			maxSize: 15,
			step: 4,
			breakWords: true,
		});

		expect(fitted).toEqual({ lines: ['ABCDEFGHIJ'], size: 10, fits: true });
	});
});
