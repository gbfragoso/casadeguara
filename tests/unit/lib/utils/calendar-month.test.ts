import { describe, expect, it } from 'vitest';

import { createCalendarMonth, followCalendarMonth, formatCalendarMonth } from '#lib/utils/calendar-month.js';

describe('TU-06 calendar month', () => {
	it('creates the month with a two-digit key', () => {
		expect(createCalendarMonth(2026, 11)).toEqual({ key: '2026-11', year: 2026, month: 11 });
	});

	it('follows December with the January of the next year', () => {
		const december = createCalendarMonth(2026, 12);

		const next = followCalendarMonth(december);

		expect(next).toEqual({ key: '2027-01', year: 2027, month: 1 });
	});

	it('follows a month within the same year', () => {
		const october = createCalendarMonth(2026, 10);

		const next = followCalendarMonth(october);

		expect(next).toEqual({ key: '2026-11', year: 2026, month: 11 });
	});

	it('labels the month with its name and year', () => {
		expect(formatCalendarMonth(createCalendarMonth(2027, 1))).toBe('janeiro de 2027');
	});
});
