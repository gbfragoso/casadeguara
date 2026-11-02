import { describe, expect, it } from 'vitest';

import { fitWorkerName } from '#lib/server/pdf/attendance-list/names.js';
import { testMeasurers } from '../sheet/support/measurers';

const MINIMUM_SIZE = 8;
const LONG_NAME = 'MARIA CELESTINA RODRIGUES DA CUNHA FERNANDES';

const measureAtMinimum = (text: string) => testMeasurers.regular.widthOfTextAtSize(text, MINIMUM_SIZE);

describe('fitWorkerName', () => {
	it('TU-16 abbreviates middle names left to right and keeps particles', () => {
		const width = measureAtMinimum('MARIA C. R. DA CUNHA FERNANDES');

		const fitted = fitWorkerName(LONG_NAME, testMeasurers.regular, width);

		expect(fitted).toEqual({ text: 'MARIA C. R. DA CUNHA FERNANDES', size: MINIMUM_SIZE });
	});

	it('TU-17 truncates with an ellipsis when every middle name is abbreviated', () => {
		const width = measureAtMinimum('MARIA C. R. DA CUNHA');

		const fitted = fitWorkerName(LONG_NAME, testMeasurers.regular, width);

		expect(fitted.size).toBe(MINIMUM_SIZE);
		expect(fitted.text).toMatch(/^MARIA C\. R\. DA .*…$/);
		expect(measureAtMinimum(fitted.text)).toBeLessThanOrEqual(width);
	});
});
