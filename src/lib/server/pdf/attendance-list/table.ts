import type { SheetBoxElement, SheetElement, SheetMeasurers } from '#lib/server/pdf/sheet/elements.js';
import { createSheetText } from '#lib/server/pdf/sheet/text.js';
import { CONTENT_LEFT, CONTENT_WIDTH, RULE_THICKNESS } from '#lib/server/pdf/sheet/typography.js';
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

export type AttendanceTable = { days: string[]; measurers: SheetMeasurers };

type TableElement = SheetElement<AttendanceTextRole>;

const NAME_TEXT_LEFT = CONTENT_LEFT + NAME_PADDING_START;
const CHECKBOX_INSET_X = (DATE_CELL_WIDTH - CHECKBOX_SIZE) / 2;
const CHECKBOX_INSET_Y = (ROW_HEIGHT - CHECKBOX_SIZE) / 2;

const measureNameTextWidth = (dayCount: number) =>
	CONTENT_WIDTH - dayCount * DATE_CELL_WIDTH - NAME_PADDING_START - NAME_PADDING_END;

const locateDateCell = (dayCount: number, index: number) =>
	CONTENT_LEFT + CONTENT_WIDTH - (dayCount - index) * DATE_CELL_WIDTH;

const isBandedRow = (rowIndex: number) => rowIndex % 2 === 1;

export const countRowsFitting = (height: number) => Math.floor((height - TABLE_HEADER_HEIGHT) / ROW_HEIGHT);

export const buildTableHeader = ({ days, measurers }: AttendanceTable, top: number): TableElement[] => {
	const style = ATTENDANCE_STYLES.coluna;
	const dayCells = days.map((day, index) => ({
		...createSheetText('coluna', day, style, measurers, {
			x: locateDateCell(days.length, index),
			width: DATE_CELL_WIDTH,
			align: 'center',
		}),
		top,
	}));
	const namePlacement = { x: NAME_TEXT_LEFT, width: measureNameTextWidth(days.length) };
	return [
		{ ...createSheetText('coluna', 'Nome', style, measurers, namePlacement), top },
		...dayCells,
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

const buildCheckbox = (dayCount: number, index: number, rowTop: number): SheetBoxElement => ({
	kind: 'box',
	role: 'marcacao',
	x: locateDateCell(dayCount, index) + CHECKBOX_INSET_X,
	top: rowTop + CHECKBOX_INSET_Y,
	width: CHECKBOX_SIZE,
	height: CHECKBOX_SIZE,
	border: { color: 'neutral600', thickness: CHECKBOX_BORDER_THICKNESS },
});

const buildNameText = ({ days, measurers }: AttendanceTable, name: string, top: number) => {
	const style = ATTENDANCE_STYLES.nome;
	const width = measureNameTextWidth(days.length);
	const fitted = fitWorkerName(name, measurers[style.weight], width);
	const placement = { x: NAME_TEXT_LEFT, width };
	return { ...createSheetText('nome', fitted.text, { ...style, size: fitted.size }, measurers, placement), top };
};

export const buildWorkerRow = (table: AttendanceTable, name: string, rowIndex: number, top: number): TableElement[] => [
	...(isBandedRow(rowIndex) ? [buildBand(top)] : []),
	buildNameText(table, name, top),
	...table.days.map((_, index) => buildCheckbox(table.days.length, index, top)),
];
