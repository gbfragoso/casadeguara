import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getBahiaMonthWindow } from '$lib/server/tesouraria/lancamentos/month-window';

const originalTimeZone = process.env.TZ;
const referenceInstant = new Date('2026-09-15T12:00:00.000Z');
const expectedKeys = [
	'2025-10',
	'2025-11',
	'2025-12',
	'2026-01',
	'2026-02',
	'2026-03',
	'2026-04',
	'2026-05',
	'2026-06',
	'2026-07',
	'2026-08',
	'2026-09',
];

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(referenceInstant);
});

afterEach(() => {
	vi.useRealTimers();
	if (originalTimeZone === undefined) delete process.env.TZ;
	else process.env.TZ = originalTimeZone;
});

describe('getBahiaMonthWindow', () => {
	it.each(['UTC', 'America/Bahia', 'Pacific/Auckland'])('is deterministic in %s', (timeZone) => {
		process.env.TZ = timeZone;

		const window = getBahiaMonthWindow(new Date());

		expect(window.keys).toEqual(expectedKeys);
		expect(window.start.toISOString()).toBe('2025-10-01T00:00:00.000Z');
		expect(window.endExclusive.toISOString()).toBe('2026-10-01T00:00:00.000Z');
	});

	it('uses the Bahia civil month at the UTC boundary', () => {
		process.env.TZ = 'UTC';

		const beforeBoundary = getBahiaMonthWindow(new Date('2026-01-01T02:59:59.999Z'));
		const atBoundary = getBahiaMonthWindow(new Date('2026-01-01T03:00:00.000Z'));

		expect(beforeBoundary.keys.at(-1)).toBe('2025-12');
		expect(beforeBoundary.endExclusive.toISOString()).toBe('2026-01-01T00:00:00.000Z');
		expect(atBoundary.keys.at(-1)).toBe('2026-01');
		expect(atBoundary.start.toISOString()).toBe('2025-02-01T00:00:00.000Z');
	});

	it('rejects an invalid reference date', () => {
		expect(() => getBahiaMonthWindow(new Date(Number.NaN))).toThrow(RangeError);
	});
});
