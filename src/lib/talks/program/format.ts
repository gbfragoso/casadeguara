import { formatCalendarMonth } from '#lib/utils/calendar-month.js';

import type { ProgramMonth } from './months';

export const buildProgramFileName = (month: ProgramMonth): string => `programacao-palestras-${month.key}.pdf`;

export const describeEmptyProgram = (month: ProgramMonth): string =>
	`Nenhuma palestra cadastrada em ${formatCalendarMonth(month)}.`;

export const describeReadyProgram = (month: ProgramMonth): string =>
	`Programação de ${formatCalendarMonth(month)} pronta para impressão.`;
