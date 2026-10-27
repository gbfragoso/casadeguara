import { describe, expect, it } from 'vitest';

import {
	findProgramMonth,
	formatProgramMonthOption,
	listProgramMonths,
	readMonthRange,
} from '#lib/talks/program/months.js';
import { readBahiaIsoDate } from '#lib/utils/date.js';

describe('TU-01 listProgramMonths', () => {
	it('offers the current and the next month', () => {
		const months = listProgramMonths('2026-10-27');

		expect(months.map((month) => month.key)).toEqual(['2026-10', '2026-11']);
		expect(months.map(formatProgramMonthOption)).toEqual(['Outubro de 2026', 'Novembro de 2026']);
	});
});

describe('TU-02 listProgramMonths at the turn of the year', () => {
	it('offers December and the January of the next year', () => {
		const months = listProgramMonths('2026-12-15');

		expect(months).toEqual([
			{ key: '2026-12', year: 2026, month: 12 },
			{ key: '2027-01', year: 2027, month: 1 },
		]);
		expect(months.map(formatProgramMonthOption)).toEqual(['Dezembro de 2026', 'Janeiro de 2027']);
	});
});

describe('TU-03 listProgramMonths with the Salvador civil date', () => {
	it('keeps October when it is still 31/10 at 23h30 in Salvador', () => {
		const today = readBahiaIsoDate(new Date('2026-11-01T02:30:00Z'));

		const months = listProgramMonths(today);

		expect(today).toBe('2026-10-31');
		expect(months.map((month) => month.key)).toEqual(['2026-10', '2026-11']);
	});
});

describe('TU-04 findProgramMonth', () => {
	it.each(['2026-10', '2026-11'])('accepts the allowed key %s', (key) => {
		expect(findProgramMonth(key, '2026-10-27')?.key).toBe(key);
	});

	it.each(['2026-09', '2026-12', '2026-1', 'abc', null])('rejects the key %s', (key) => {
		expect(findProgramMonth(key, '2026-10-27')).toBeUndefined();
	});
});

describe('TU-05 readMonthRange', () => {
	it('bounds November by its first day and the first day of December', () => {
		expect(readMonthRange({ key: '2026-11', year: 2026, month: 11 })).toEqual({
			firstDay: '2026-11-01',
			nextMonthFirstDay: '2026-12-01',
		});
	});

	it('bounds December by the first day of the next January', () => {
		expect(readMonthRange({ key: '2026-12', year: 2026, month: 12 })).toEqual({
			firstDay: '2026-12-01',
			nextMonthFirstDay: '2027-01-01',
		});
	});
});
