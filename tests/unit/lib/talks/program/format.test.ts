import { describe, expect, it } from 'vitest';

import {
	buildProgramFileName,
	describeEmptyProgram,
	describeReadyProgram,
	formatWeekdayAbbreviation,
} from '#lib/talks/program/format.js';
import type { ProgramMonth } from '#lib/talks/program/months.js';

const NOVEMBER: ProgramMonth = { key: '2026-11', year: 2026, month: 11 };

describe('TU-09 program file name and month messages', () => {
	it('names the file after the month key', () => {
		expect(buildProgramFileName(NOVEMBER)).toBe('programacao-palestras-2026-11.pdf');
	});

	it('describes the month without talks', () => {
		expect(describeEmptyProgram(NOVEMBER)).toBe('Nenhuma palestra cadastrada em novembro de 2026.');
	});

	it('describes the month ready for printing', () => {
		expect(describeReadyProgram(NOVEMBER)).toBe('Programação de novembro de 2026 pronta para impressão.');
	});
});

describe('TU-10 formatWeekdayAbbreviation', () => {
	it.each([
		['2026-11-02', 'SEG'],
		['2026-11-03', 'TER'],
		['2026-11-04', 'QUA'],
		['2026-11-05', 'QUI'],
		['2026-11-06', 'SEX'],
		['2026-11-07', 'SÁB'],
		['2026-11-08', 'DOM'],
	])('abbreviates %s as %s', (data, abbreviation) => {
		expect(formatWeekdayAbbreviation(data)).toBe(abbreviation);
	});
});
