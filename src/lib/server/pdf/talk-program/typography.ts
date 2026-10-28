import type { FontWeight } from '#lib/server/brand/fonts.js';
import type { SheetTextStyle } from '#lib/server/pdf/sheet/elements.js';
import { computeLineHeight } from '#lib/server/pdf/sheet/line-box.js';
import type { SheetColor } from '#lib/server/pdf/sheet/palette.js';

export type ProgramEntryRole = 'dia' | 'diaSemana' | 'horario' | 'titulo' | 'observacao' | 'palestrante' | 'local';

export const ENTRY_LINE_GAP = 5.5;
const DATE_LINE_GAP = 5;

const createEntryStyle = (
	size: number,
	weight: FontWeight,
	color: SheetColor,
	lineGap = ENTRY_LINE_GAP,
): SheetTextStyle => ({
	size,
	lineHeight: computeLineHeight(size, lineGap),
	weight,
	color,
});

export const ENTRY_STYLES: Record<ProgramEntryRole, SheetTextStyle> = {
	dia: createEntryStyle(20, 'bold', 'primary', DATE_LINE_GAP),
	diaSemana: createEntryStyle(10, 'medium', 'primary700', DATE_LINE_GAP),
	horario: createEntryStyle(10, 'regular', 'primary700', DATE_LINE_GAP),
	titulo: createEntryStyle(12, 'bold', 'neutral900'),
	observacao: createEntryStyle(10, 'regular', 'neutral800'),
	palestrante: createEntryStyle(10, 'medium', 'neutral800'),
	local: createEntryStyle(10, 'regular', 'neutral800'),
};

export const ENTRY_PADDING = 3;
