import { type IsoWeekday, readIsoWeekday } from '#lib/utils/date.js';

import { formatProgramMonth, type ProgramMonth } from './months';

const WEEKDAY_ABBREVIATIONS: Record<IsoWeekday, string> = {
	1: 'SEG',
	2: 'TER',
	3: 'QUA',
	4: 'QUI',
	5: 'SEX',
	6: 'SÁB',
	7: 'DOM',
};

export const buildProgramFileName = (month: ProgramMonth): string => `programacao-palestras-${month.key}.pdf`;

export const formatWeekdayAbbreviation = (data: string): string => WEEKDAY_ABBREVIATIONS[readIsoWeekday(data)];

export const describeEmptyProgram = (month: ProgramMonth): string =>
	`Nenhuma palestra cadastrada em ${formatProgramMonth(month)}.`;

export const describeReadyProgram = (month: ProgramMonth): string =>
	`Programação de ${formatProgramMonth(month)} pronta para impressão.`;
