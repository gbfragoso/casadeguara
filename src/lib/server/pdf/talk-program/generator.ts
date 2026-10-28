import { generateSheetPdf, type GeneratedSheet } from '#lib/server/pdf/sheet/document.js';
import { formatCalendarMonth } from '#lib/utils/calendar-month.js';
import type { TalkProgramDocument } from './content';
import { layoutTalkProgram } from './layout';

export const generateTalkProgramPdf = (program: TalkProgramDocument): Promise<GeneratedSheet> =>
	generateSheetPdf({
		title: `Programação de palestras — ${formatCalendarMonth(program.month)}`,
		layout: (measurers) => layoutTalkProgram(program, measurers),
	});
