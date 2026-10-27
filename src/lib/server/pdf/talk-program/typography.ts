import type { SheetTextStyle } from '#lib/server/pdf/sheet/elements.js';

export type ProgramEntryRole = 'dia' | 'diaSemana' | 'horario' | 'titulo' | 'observacao' | 'palestrante' | 'local';

export const ENTRY_STYLES: Record<ProgramEntryRole, SheetTextStyle> = {
	dia: { size: 20, lineHeight: 20, weight: 'bold', color: 'primary' },
	diaSemana: { size: 10, lineHeight: 12, weight: 'medium', color: 'primary700' },
	horario: { size: 10, lineHeight: 12, weight: 'regular', color: 'primary700' },
	titulo: { size: 13, lineHeight: 16, weight: 'bold', color: 'neutral900' },
	observacao: { size: 10.5, lineHeight: 13, weight: 'regular', color: 'neutral800' },
	palestrante: { size: 10.5, lineHeight: 13, weight: 'medium', color: 'neutral800' },
	local: { size: 10.5, lineHeight: 13, weight: 'regular', color: 'neutral800' },
};

export const ENTRY_PADDING = 4;
export const TITLE_GAP = 2;
