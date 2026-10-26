import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	addCivilDays,
	formatCivilDate,
	formatCivilDateWithWeekday,
	formatMonthName,
	formatMonthYear,
	formatWeekday,
	readBahiaCivilDate,
	readBahiaIsoDate,
	readIsoWeekday,
} from '#lib/utils/date.js';

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

describe('TU-30 readBahiaIsoDate', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('keeps the Bahia day one minute before midnight, when UTC is already tomorrow', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-03T02:59:00Z'));

		const today = readBahiaIsoDate(new Date());

		expect(today).toBe('2026-03-02');
	});

	it('moves to the next Bahia day at midnight', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-03T03:00:00Z'));

		const today = readBahiaIsoDate(new Date());

		expect(today).toBe('2026-03-03');
	});
});

describe('TU-30 formatCivilDateWithWeekday', () => {
	it.each([
		['2026-03-02', 'Segunda-feira, 02/03/2026'],
		['2026-03-07', 'Sábado, 07/03/2026'],
		['2026-03-08', 'Domingo, 08/03/2026'],
	])('writes %s with its capitalised weekday', (civilDate, expected) => {
		expect(formatCivilDateWithWeekday(civilDate)).toBe(expected);
	});

	it.each(['UTC', 'Pacific/Auckland', 'America/Bahia'])('keeps the civil weekday in %s', (timeZone) => {
		process.env.TZ = timeZone;

		expect(formatCivilDateWithWeekday('2026-03-02')).toBe('Segunda-feira, 02/03/2026');
	});
});

describe('TU-30 readIsoWeekday', () => {
	it.each([
		['2026-03-02', 1],
		['2026-03-07', 6],
		['2026-03-08', 7],
	])('reads %s as ISO weekday %i', (civilDate, weekday) => {
		expect(readIsoWeekday(civilDate)).toBe(weekday);
	});

	it.each(['UTC', 'Pacific/Auckland'])('ignores the server time zone %s', (timeZone) => {
		process.env.TZ = timeZone;

		expect(readIsoWeekday('2026-03-08')).toBe(7);
	});
});

describe('formatWeekday', () => {
	it.each([
		['2026-10-26', 'Segunda-feira'],
		['2026-03-08', 'Domingo'],
	])('writes the capitalised weekday of %s', (civilDate, expected) => {
		expect(formatWeekday(civilDate)).toBe(expected);
	});
});

describe('formatMonthName', () => {
	it('writes the month name in Portuguese', () => {
		expect(formatMonthName('2026-10-26')).toBe('outubro');
	});

	it.each(['UTC', 'Pacific/Auckland', 'America/Bahia'])('keeps the civil month in %s', (timeZone) => {
		process.env.TZ = timeZone;

		expect(formatMonthName('2026-03-01')).toBe('março');
	});
});
