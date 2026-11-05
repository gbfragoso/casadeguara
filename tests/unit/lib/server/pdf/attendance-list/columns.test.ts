import { describe, expect, it } from 'vitest';

import { describeAttendanceColumns } from '#lib/server/pdf/attendance-list/columns.js';

describe('describeAttendanceColumns', () => {
	it('starts a new week on Sunday', () => {
		const dates = ['2026-11-01', '2026-11-02', '2026-11-08', '2026-11-09'];

		const columns = describeAttendanceColumns(dates);

		expect(columns.map(({ startsWeek }) => startsWeek)).toEqual([false, false, true, false]);
	});

	it('starts a new week on every column of a Mondays-only period', () => {
		const mondays = ['2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23'];

		const columns = describeAttendanceColumns(mondays);

		expect(columns.map(({ startsWeek }) => startsWeek)).toEqual([false, true, true, true]);
	});

	it('describes the two-digit day and the pt-BR weekday abbreviation', () => {
		const [column] = describeAttendanceColumns(['2026-11-07']);

		expect(column).toMatchObject({ day: '07', weekday: 'SÁB' });
	});
});
