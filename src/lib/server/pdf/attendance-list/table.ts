import type {
	SheetBoxElement,
	SheetElement,
	SheetMeasurers,
	SheetTextElement,
} from '#lib/server/pdf/sheet/elements.js';
import { createSheetText } from '#lib/server/pdf/sheet/text.js';
import { CONTENT_LEFT, CONTENT_WIDTH, RULE_THICKNESS } from '#lib/server/pdf/sheet/typography.js';
import { describeAttendanceColumns, type AttendanceColumn } from './columns';
import type { AttendanceTextRole } from './content';
import { fitWorkerName } from './names';
import {
	ATTENDANCE_STYLES,
	CHECKBOX_BORDER_THICKNESS,
	CHECKBOX_SIZE,
	DATE_CELL_WIDTH,
	NAME_PADDING_END,
	NAME_PADDING_START,
	ROW_HEIGHT,
	TABLE_HEADER_HEIGHT,
} from './typography';

export type AttendanceTable = {
	columns: AttendanceColumn[];
	dayNumbers: SheetTextElement<'dia'>[];
	measurers: SheetMeasurers;
};

type TableElement = SheetElement<AttendanceTextRole>;

const NAME_TEXT_LEFT = CONTENT_LEFT + NAME_PADDING_START;
const CHECKBOX_INSET_X = (DATE_CELL_WIDTH - CHECKBOX_SIZE) / 2;
const CHECKBOX_INSET_Y = (ROW_HEIGHT - CHECKBOX_SIZE) / 2;

const measureNameTextWidth = (columnCount: number) =>
	CONTENT_WIDTH - columnCount * DATE_CELL_WIDTH - NAME_PADDING_START - NAME_PADDING_END;

const locateDateCell = (columnCount: number, index: number) =>
	CONTENT_LEFT + CONTENT_WIDTH - (columnCount - index) * DATE_CELL_WIDTH;

const placeInDateCell = (columnCount: number, index: number) => ({
	x: locateDateCell(columnCount, index),
	width: DATE_CELL_WIDTH,
	align: 'center' as const,
});

const isBandedRow = (rowIndex: number) => rowIndex % 2 === 1;

export const countRowsFitting = (height: number) => Math.floor((height - TABLE_HEADER_HEIGHT) / ROW_HEIGHT);

export const createAttendanceTable = (dates: string[], measurers: SheetMeasurers): AttendanceTable => {
	const columns = describeAttendanceColumns(dates);
	const dayNumbers = columns.map(({ day }, index) =>
		createSheetText('dia', day, ATTENDANCE_STYLES.dia, measurers, placeInDateCell(columns.length, index)),
	);
	return { columns, dayNumbers, measurers };
};

export const buildTableHeader = ({ columns, measurers }: AttendanceTable, top: number): TableElement[] => {
	const style = ATTENDANCE_STYLES.coluna;
	const weekdayCells = columns.map(({ weekday }, index) => ({
		...createSheetText('coluna', weekday, style, measurers, placeInDateCell(columns.length, index)),
		top,
	}));
	const namePlacement = { x: NAME_TEXT_LEFT, width: measureNameTextWidth(columns.length) };
	return [
		{ ...createSheetText('coluna', 'Nome', style, measurers, namePlacement), top },
		...weekdayCells,
		{
			kind: 'rule',
			role: 'separador',
			x: CONTENT_LEFT,
			y: top + TABLE_HEADER_HEIGHT - RULE_THICKNESS,
			width: CONTENT_WIDTH,
			thickness: RULE_THICKNESS,
			color: 'neutral300',
		},
	];
};

const buildBand = (top: number): SheetBoxElement => ({
	kind: 'box',
	role: 'faixa',
	x: CONTENT_LEFT,
	top,
	width: CONTENT_WIDTH,
	height: ROW_HEIGHT,
	fill: 'neutral100',
});

const buildCheckbox = (columnCount: number, index: number, rowTop: number): SheetBoxElement => ({
	kind: 'box',
	role: 'marcacao',
	x: locateDateCell(columnCount, index) + CHECKBOX_INSET_X,
	top: rowTop + CHECKBOX_INSET_Y,
	width: CHECKBOX_SIZE,
	height: CHECKBOX_SIZE,
	border: { color: 'neutral600', thickness: CHECKBOX_BORDER_THICKNESS },
});

const buildNameText = ({ columns, measurers }: AttendanceTable, name: string, top: number) => {
	const style = ATTENDANCE_STYLES.nome;
	const width = measureNameTextWidth(columns.length);
	const fitted = fitWorkerName(name, measurers[style.weight], width);
	const placement = { x: NAME_TEXT_LEFT, width };
	return { ...createSheetText('nome', fitted.text, { ...style, size: fitted.size }, measurers, placement), top };
};

export const buildWorkerRow = (table: AttendanceTable, name: string, rowIndex: number, top: number): TableElement[] => [
	...(isBandedRow(rowIndex) ? [buildBand(top)] : []),
	buildNameText(table, name, top),
	...table.columns.map((_, index) => buildCheckbox(table.columns.length, index, top)),
	...table.dayNumbers.map((dayNumber) => ({ ...dayNumber, top: top + CHECKBOX_INSET_Y })),
];

const buildWeekDivider = (columnCount: number, index: number, top: number, bottom: number): SheetBoxElement => ({
	kind: 'box',
	role: 'divisoria',
	x: locateDateCell(columnCount, index) - RULE_THICKNESS / 2,
	top,
	width: RULE_THICKNESS,
	height: bottom - top,
	fill: 'neutral900',
});

export const buildWeekDividers = ({ columns }: AttendanceTable, top: number, bottom: number): SheetBoxElement[] =>
	columns.flatMap(({ startsWeek }, index) =>
		startsWeek ? [buildWeekDivider(columns.length, index, top, bottom)] : [],
	);
