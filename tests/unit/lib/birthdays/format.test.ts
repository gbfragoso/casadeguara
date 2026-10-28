import { describe, expect, it } from 'vitest';

import {
	buildBirthdayFileName,
	describeEmptyBirthdays,
	describeReadyBirthdays,
	formatBirthdayDate,
} from '#lib/birthdays/format.js';
import type { BirthdayMonthOption } from '#lib/birthdays/months.js';
import { createCalendarMonth } from '#lib/utils/calendar-month.js';

const november: BirthdayMonthOption = { value: '11', label: 'Novembro', month: 11 };

describe('TU-14 birthday file name and messages', () => {
	it('names the file after the reference month', () => {
		expect(buildBirthdayFileName(createCalendarMonth(2027, 1))).toBe('aniversariantes-2027-01.pdf');
	});

	it('describes an empty month with its lowercase name', () => {
		expect(describeEmptyBirthdays(november)).toBe('Nenhum aniversariante encontrado em novembro.');
	});

	it('describes a ready list with the reference month and year', () => {
		expect(describeReadyBirthdays(createCalendarMonth(2026, 11))).toBe(
			'Lista de aniversariantes de novembro de 2026 pronta para impressão.',
		);
	});

	it('formats the table date as DD/MM', () => {
		expect(formatBirthdayDate(3, november)).toBe('03/11');
	});
});
