import { describe, expect, it } from 'vitest';

import { buildAttendanceFileName } from '#lib/attendance/format.js';

describe('buildAttendanceFileName', () => {
	it('names the file after the start and end of the period', () => {
		const period = { start: '2026-11-01', end: '2026-11-30' };

		const fileName = buildAttendanceFileName(period);

		expect(fileName).toBe('frequencia-2026-11-01-a-2026-11-30.pdf');
	});
});
