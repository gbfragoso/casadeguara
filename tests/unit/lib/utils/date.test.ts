import { afterEach, describe, expect, it } from 'vitest';

import { formatCivilDate } from '$lib/utils/date';

const originalTimeZone = process.env.TZ;

afterEach(() => {
	if (originalTimeZone === undefined) delete process.env.TZ;
	else process.env.TZ = originalTimeZone;
});

describe('formatCivilDate', () => {
	it.each(['UTC', 'America/Sao_Paulo', 'Pacific/Auckland'])('keeps the civil day in %s', (timeZone) => {
		process.env.TZ = timeZone;

		expect(formatCivilDate('2026-09-02')).toBe('02/09/2026');
	});

	it('returns an empty value for a missing date', () => {
		expect(formatCivilDate(null)).toBe('');
		expect(formatCivilDate(undefined)).toBe('');
	});

	it('preserves an unexpected representation', () => {
		expect(formatCivilDate('2026/09/02')).toBe('2026/09/02');
	});
});
