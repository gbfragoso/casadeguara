import type { SheetTextStyle } from '#lib/server/pdf/sheet/elements.js';
import { computeLineHeight } from '#lib/server/pdf/sheet/line-box.js';
import type { BirthdayTextRole } from './content';

const DATE_LINE_GAP = 3.5;

export const BIRTHDAY_STYLES: Record<BirthdayTextRole, SheetTextStyle> = {
	dia: { size: 20, lineHeight: computeLineHeight(20, DATE_LINE_GAP), weight: 'bold', color: 'primary' },
	diaSemana: { size: 10, lineHeight: computeLineHeight(10, DATE_LINE_GAP), weight: 'medium', color: 'primary700' },
	nome: { size: 12, lineHeight: 14, weight: 'regular', color: 'neutral900' },
	aviso: { size: 10, lineHeight: 13, weight: 'medium', color: 'neutral800' },
};

export const GROUP_PADDING = 4;
export const NOTICE_GAP = 10;
