import { afterEach, describe, expect, it } from 'vitest';

import { addCivilDays, formatCivilDate, formatMonthYear, readBahiaCivilDate } from '#lib/utils/date.js';

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

describe('formatMonthYear', () => {
	it('writes the month name and the year in Portuguese', () => {
		expect(formatMonthYear(new Date('2026-10-22T12:00:00Z'))).toBe('outubro de 2026');
	});

	it.each(['UTC', 'America/Sao_Paulo', 'Pacific/Auckland'])('keeps the UTC month in %s', (timeZone) => {
		process.env.TZ = timeZone;

		expect(formatMonthYear(new Date('2026-11-01T01:00:00Z'))).toBe('novembro de 2026');
	});
});

describe('readBahiaCivilDate', () => {
	it('keeps the Bahia day for an evening instant that is already tomorrow in UTC', () => {
		const eveningInBahia = new Date('2026-10-16T01:00:00Z');

		const civilDate = readBahiaCivilDate(eveningInBahia);

		expect(civilDate).toEqual(new Date('2026-10-15T00:00:00Z'));
	});

	it.each(['UTC', 'Pacific/Auckland'])('ignores the server time zone %s', (timeZone) => {
		process.env.TZ = timeZone;

		const civilDate = readBahiaCivilDate(new Date('2026-10-15T15:00:00Z'));

		expect(civilDate).toEqual(new Date('2026-10-15T00:00:00Z'));
	});
});

describe('addCivilDays', () => {
	it('moves the civil date across a month boundary', () => {
		const civilDate = addCivilDays(new Date('2026-10-25T00:00:00Z'), 14);

		expect(civilDate).toEqual(new Date('2026-11-08T00:00:00Z'));
	});
});
