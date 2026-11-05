import type { SheetTextStyle } from '#lib/server/pdf/sheet/elements.js';
import { RULE_THICKNESS } from '#lib/server/pdf/sheet/typography.js';
import type { AttendanceTextRole } from './content';

export const DATE_CELL_WIDTH = 18;
export const CHECKBOX_SIZE = 11;
export const CHECKBOX_BORDER_THICKNESS = 0.75;
export const ROW_HEIGHT = 16;
export const TABLE_HEADER_HEIGHT = 18;
export const NOTICE_GAP = 8;
export const NAME_MAX_SIZE = 10;
export const NAME_MIN_SIZE = 8;
export const NAME_PADDING_START = 4;
export const NAME_PADDING_END = 6;
export const DAY_NUMBER_SIZE = 6;

export const ATTENDANCE_STYLES: Record<AttendanceTextRole, SheetTextStyle> = {
	aviso: { size: 10, lineHeight: 13, weight: 'medium', color: 'neutral800' },
	coluna: { size: 8, lineHeight: TABLE_HEADER_HEIGHT - RULE_THICKNESS, weight: 'bold', color: 'neutral800' },
	nome: { size: NAME_MAX_SIZE, lineHeight: ROW_HEIGHT, weight: 'regular', color: 'neutral900' },
	dia: { size: DAY_NUMBER_SIZE, lineHeight: CHECKBOX_SIZE, weight: 'medium', color: 'neutral900' },
};
