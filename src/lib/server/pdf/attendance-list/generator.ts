import { generateSheetPdf, type GeneratedSheet } from '#lib/server/pdf/sheet/document.js';
import type { AttendanceListDocument } from './content';
import { layoutAttendanceList } from './layout';

export const generateAttendanceListPdf = (document: AttendanceListDocument): Promise<GeneratedSheet> =>
	generateSheetPdf({ title: document.title, layout: (measurers) => layoutAttendanceList(document, measurers) });
