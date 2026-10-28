import { describe, expect, it } from 'vitest';

import { parseBirthdayMonth, readCurrentMonthValue, resolveReferenceMonth } from '#lib/birthdays/months.js';
import { readBahiaIsoDate } from '#lib/utils/date.js';

describe('TU-11 parseBirthdayMonth', () => {
	it('accepts January as month 1', () => {
		expect(parseBirthdayMonth('01')).toEqual({ value: '01', label: 'Janeiro', month: 1 });
	});

	it('accepts December as month 12', () => {
		expect(parseBirthdayMonth('12')).toEqual({ value: '12', label: 'Dezembro', month: 12 });
	});

	it.each([null, '', '0', '13', '1', 'abc'])('rejects %j', (value) => {
		expect(parseBirthdayMonth(value)).toBeUndefined();
	});
});

describe('TU-12 resolveReferenceMonth', () => {
	const today = '2026-10-27';

	it.each([
		[10, '2026-10'],
		[11, '2026-11'],
		[1, '2027-01'],
		[2, '2027-02'],
	])('resolves month %i to its next occurrence %s', (month, key) => {
		expect(resolveReferenceMonth(month, today).key).toBe(key);
	});
});

describe('TU-13 Salvador time zone decides the current month', () => {
	it('keeps October at 23:30 on October 31 in Salvador', () => {
		const lateOctoberNight = new Date('2026-11-01T02:30:00Z');

		const today = readBahiaIsoDate(lateOctoberNight);

		expect(today).toBe('2026-10-31');
		expect(resolveReferenceMonth(10, today).key).toBe('2026-10');
		expect(readCurrentMonthValue(today)).toBe('10');
	});
});
