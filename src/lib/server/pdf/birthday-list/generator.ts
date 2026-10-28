import { generateSheetPdf, type GeneratedSheet } from '#lib/server/pdf/sheet/document.js';
import { formatCalendarMonth } from '#lib/utils/calendar-month.js';
import type { BirthdayListDocument } from './content';
import { layoutBirthdayList } from './layout';

export const generateBirthdayListPdf = (document: BirthdayListDocument): Promise<GeneratedSheet> =>
	generateSheetPdf({
		title: `Aniversariantes — ${formatCalendarMonth(document.month)}`,
		layout: (measurers) => layoutBirthdayList(document, measurers),
	});
