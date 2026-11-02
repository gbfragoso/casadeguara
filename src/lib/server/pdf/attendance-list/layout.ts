import { ATTENDANCE_NOTICE } from '#lib/attendance/format.js';
import {
	measureTextHeight,
	type SheetElement,
	type SheetFrameRole,
	type SheetMeasurers,
	type SheetPageLayout,
	type SheetTextElement,
} from '#lib/server/pdf/sheet/elements.js';
import { frameSheetPages, type SheetFrame } from '#lib/server/pdf/sheet/pages.js';
import { createSheetText } from '#lib/server/pdf/sheet/text.js';
import { BODY_HEIGHT, BODY_TOP, CONTENT_LEFT, CONTENT_WIDTH } from '#lib/server/pdf/sheet/typography.js';
import { formatDateColumn, normalizeWorkerName, type AttendanceListDocument, type AttendanceTextRole } from './content';
import { paginateRows } from './pagination';
import { buildTableHeader, buildWorkerRow, countRowsFitting, type AttendanceTable } from './table';
import { ATTENDANCE_STYLES, NOTICE_GAP, ROW_HEIGHT, TABLE_HEADER_HEIGHT } from './typography';

type PageBody = SheetElement<AttendanceTextRole>[];

const buildTable = (table: AttendanceTable, names: string[], top: number): PageBody => {
	const rowsTop = top + TABLE_HEADER_HEIGHT;
	return [
		...buildTableHeader(table, top),
		...names.flatMap((name, index) => buildWorkerRow(table, name, index, rowsTop + index * ROW_HEIGHT)),
	];
};

const measureNoticeHeight = (notice: SheetTextElement) => measureTextHeight(notice) + NOTICE_GAP;

const buildFirstPage = (table: AttendanceTable, notice: SheetTextElement<'aviso'>, names: string[]): PageBody => [
	{ ...notice, top: BODY_TOP },
	...buildTable(table, names, BODY_TOP + measureNoticeHeight(notice)),
];

export const layoutAttendanceList = (
	document: AttendanceListDocument,
	measurers: SheetMeasurers,
): SheetPageLayout<AttendanceTextRole | SheetFrameRole>[] => {
	const table = { days: document.dates.map(formatDateColumn), measurers };
	const notice = createSheetText('aviso', ATTENDANCE_NOTICE, ATTENDANCE_STYLES.aviso, measurers, {
		x: CONTENT_LEFT,
		width: CONTENT_WIDTH,
	});
	const [firstNames, ...nextPagesNames] = paginateRows(
		document.workers.map(normalizeWorkerName),
		countRowsFitting(BODY_HEIGHT - measureNoticeHeight(notice)),
		countRowsFitting(BODY_HEIGHT),
	);
	const bodies = [
		buildFirstPage(table, notice, firstNames),
		...nextPagesNames.map((names) => buildTable(table, names, BODY_TOP)),
	];
	const frame: SheetFrame = { heading: { kind: 'free', text: document.title }, generatedOn: document.generatedOn };
	return frameSheetPages(frame, bodies, measurers);
};
