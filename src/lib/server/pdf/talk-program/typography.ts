import { PageSizes } from 'pdf-lib';

import type { FontWeight } from '#lib/server/brand/fonts.js';
import type { ProgramTextRole } from './elements';
import type { ProgramColor } from './palette';

type TextStyle = { size: number; lineHeight: number; weight: FontWeight; color: ProgramColor };

export const TEXT_STYLES: Record<ProgramTextRole, TextStyle> = {
	dia: { size: 20, lineHeight: 20, weight: 'bold', color: 'primary' },
	diaSemana: { size: 10, lineHeight: 12, weight: 'medium', color: 'primary700' },
	horario: { size: 10, lineHeight: 12, weight: 'regular', color: 'primary700' },
	titulo: { size: 13, lineHeight: 16, weight: 'bold', color: 'neutral900' },
	observacao: { size: 10.5, lineHeight: 13, weight: 'regular', color: 'neutral800' },
	palestrante: { size: 10.5, lineHeight: 13, weight: 'medium', color: 'neutral800' },
	local: { size: 10.5, lineHeight: 13, weight: 'regular', color: 'neutral800' },
	instituicao: { size: 10, lineHeight: 12, weight: 'medium', color: 'neutral800' },
	cabecalho: { size: 18, lineHeight: 22, weight: 'bold', color: 'primary' },
	mes: { size: 13, lineHeight: 16, weight: 'medium', color: 'primary900' },
	rodape: { size: 9, lineHeight: 11, weight: 'regular', color: 'neutral600' },
	geracao: { size: 9, lineHeight: 11, weight: 'regular', color: 'neutral600' },
};

export const [PAGE_WIDTH, PAGE_HEIGHT] = PageSizes.A4;

const SIDE_MARGIN = 40;
export const TOP_MARGIN = 34;
const BOTTOM_MARGIN = 28;

export const CONTENT_LEFT = SIDE_MARGIN;
export const CONTENT_RIGHT = PAGE_WIDTH - SIDE_MARGIN;
export const CONTENT_WIDTH = CONTENT_RIGHT - CONTENT_LEFT;

export const DATE_COLUMN_WIDTH = 56;
const COLUMN_GAP = 12;
export const TEXT_LEFT = CONTENT_LEFT + DATE_COLUMN_WIDTH + COLUMN_GAP;
export const TEXT_WIDTH = CONTENT_RIGHT - TEXT_LEFT;

export const LOGO_SIZE = 54;
export const FILETE = { width: 48, thickness: 3, gapAbove: 10 } as const;
export const FILETE_TOP = TOP_MARGIN + LOGO_SIZE + FILETE.gapAbove;
const HEADER_GAP_BELOW = 14;
export const BODY_TOP = FILETE_TOP + FILETE.thickness + HEADER_GAP_BELOW;

export const RULE_THICKNESS = 0.5;
const FOOTER_GAP = 8;
export const FOOTER_COLUMN_GAP = 16;
export const FOOTER_TEXT_TOP = PAGE_HEIGHT - BOTTOM_MARGIN - TEXT_STYLES.rodape.lineHeight;
export const FOOTER_RULE_TOP = FOOTER_TEXT_TOP - FOOTER_GAP - RULE_THICKNESS;
export const BODY_BOTTOM = FOOTER_RULE_TOP;
export const BODY_HEIGHT = BODY_BOTTOM - BODY_TOP;

export const ENTRY_PADDING = 4;
export const TITLE_GAP = 2;
