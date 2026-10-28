import { stackTexts, translateBlock, type SheetBlock, type SheetMeasurers } from '#lib/server/pdf/sheet/elements.js';
import { createSheetText, type TextPlacement } from '#lib/server/pdf/sheet/text.js';
import { DATE_COLUMN_PLACEMENT, stackDateColumn } from '#lib/server/pdf/sheet/date-column.js';
import { BODY_HEIGHT, TEXT_LEFT, TEXT_WIDTH } from '#lib/server/pdf/sheet/typography.js';
import type { ProgramEntryContent } from './content';
import { ENTRY_PADDING, ENTRY_STYLES, type ProgramEntryRole } from './typography';

export type EntryLayout = SheetBlock<ProgramEntryRole>;

const mergeLineBreaks = (text: string) => text.replace(/\s+/g, ' ');

const createEntryText = (role: ProgramEntryRole, text: string, measurers: SheetMeasurers, placement: TextPlacement) =>
	createSheetText(role, text, ENTRY_STYLES[role], measurers, placement);

const buildDateColumn = ({ dia, diaSemana, horario }: ProgramEntryContent, measurers: SheetMeasurers) =>
	stackDateColumn(
		[
			createEntryText('dia', dia, measurers, DATE_COLUMN_PLACEMENT),
			createEntryText('diaSemana', diaSemana, measurers, DATE_COLUMN_PLACEMENT),
			createEntryText('horario', horario, measurers, DATE_COLUMN_PLACEMENT),
		],
		measurers,
	);

const buildTextColumn = (content: ProgramEntryContent, measurers: SheetMeasurers) => {
	const placement = { x: TEXT_LEFT, width: TEXT_WIDTH };
	const details: [ProgramEntryRole, string | null][] = [
		['observacao', content.observacao],
		['palestrante', content.palestrante],
		['local', content.local],
	];
	const detailTexts = details.flatMap(([role, text]) =>
		text ? [createEntryText(role, text, measurers, placement)] : [],
	);
	const title = createEntryText('titulo', content.titulo, measurers, placement);
	return stackTexts([title, ...detailTexts].map((element) => ({ element, gapBefore: 0 })));
};

const layoutEntry = (content: ProgramEntryContent, measurers: SheetMeasurers): EntryLayout => {
	const date = buildDateColumn(content, measurers);
	const text = buildTextColumn(content, measurers);
	const contentHeight = Math.max(date.height, text.height);
	const centerInRow = (block: EntryLayout) =>
		translateBlock(block, ENTRY_PADDING + (contentHeight - block.height) / 2);
	return {
		elements: [...centerInRow(date), ...centerInRow(text)],
		height: contentHeight + 2 * ENTRY_PADDING,
	};
};

const mergeEntryLineBreaks = (content: ProgramEntryContent): ProgramEntryContent => ({
	...content,
	titulo: mergeLineBreaks(content.titulo),
	observacao: content.observacao && mergeLineBreaks(content.observacao),
	palestrante: mergeLineBreaks(content.palestrante),
	local: content.local && mergeLineBreaks(content.local),
});

export const buildEntry = (content: ProgramEntryContent, measurers: SheetMeasurers): EntryLayout => {
	const entry = layoutEntry(content, measurers);
	if (entry.height <= BODY_HEIGHT) return entry;
	return layoutEntry(mergeEntryLineBreaks(content), measurers);
};
