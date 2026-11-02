import { describe, expect, it } from 'vitest';

import { type AttendanceWeekday, countAttendanceDates, listAttendanceDates } from '#lib/attendance/dates.js';

const NOVEMBER_2026 = { start: '2026-11-01', end: '2026-11-30' };
const MONDAY: AttendanceWeekday = 1;
const TUESDAY: AttendanceWeekday = 2;
const THURSDAY: AttendanceWeekday = 4;

describe('TU-01 listAttendanceDates', () => {
	it('lists the Monday, Tuesday and Thursday dates of November 2026', () => {
		const weekdays = [MONDAY, TUESDAY, THURSDAY];

		const dates = listAttendanceDates(NOVEMBER_2026, weekdays);

		expect(dates).toEqual([
			'2026-11-02',
			'2026-11-03',
			'2026-11-05',
			'2026-11-09',
			'2026-11-10',
			'2026-11-12',
			'2026-11-16',
			'2026-11-17',
			'2026-11-19',
			'2026-11-23',
			'2026-11-24',
			'2026-11-26',
			'2026-11-30',
		]);
	});

	it('lists a weekday once when it is repeated', () => {
		const period = { start: '2026-11-02', end: '2026-11-09' };

		const dates = listAttendanceDates(period, [MONDAY, MONDAY]);

		expect(dates).toEqual(['2026-11-02', '2026-11-09']);
	});
});

describe('TU-02 countAttendanceDates', () => {
	it('counts dates of a multi-century period without iterating every day', () => {
		const twoCenturies = { start: '1900-01-01', end: '2099-12-31' };

		const count = countAttendanceDates(twoCenturies, [MONDAY]);

		expect(count).toBe(10_436);
	});

	it('counts the same dates it lists', () => {
		const weekdays = [MONDAY, TUESDAY, THURSDAY];

		const count = countAttendanceDates(NOVEMBER_2026, weekdays);

		expect(count).toBe(listAttendanceDates(NOVEMBER_2026, weekdays).length);
	});

	it('counts no date when the only day of the period is another weekday', () => {
		const sunday = { start: '2026-11-01', end: '2026-11-01' };

		const count = countAttendanceDates(sunday, [MONDAY]);

		expect(count).toBe(0);
	});
});
