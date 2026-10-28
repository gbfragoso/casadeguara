import type { SheetTextStyle } from '#lib/server/pdf/sheet/elements.js';
import type { BirthdayTextRole } from './content';

export const BIRTHDAY_STYLES: Record<BirthdayTextRole, SheetTextStyle> = {
	dia: { size: 20, lineHeight: 16, weight: 'bold', color: 'primary' },
	diaSemana: { size: 10, lineHeight: 12, weight: 'medium', color: 'primary700' },
	nome: { size: 12, lineHeight: 14, weight: 'regular', color: 'neutral900' },
	aviso: { size: 10, lineHeight: 13, weight: 'medium', color: 'neutral800' },
};

export const GROUP_PADDING = 4;
export const NOTICE_GAP = 10;
