import { fitText } from '#lib/image/text/fit.js';
import type { ProgramEntryContent } from './content';
import {
	stackTexts,
	translateBlock,
	type ProgramBlock,
	type ProgramMeasurers,
	type ProgramTextElement,
	type ProgramTextRole,
} from './elements';
import {
	CONTENT_LEFT,
	DATE_COLUMN_WIDTH,
	ENTRY_PADDING,
	TEXT_LEFT,
	TEXT_STYLES,
	TEXT_WIDTH,
	TITLE_GAP,
} from './typography';

export type EntryLayout = ProgramBlock;

export type TextPlacement = { x: number; width: number; align?: ProgramTextElement['align'] };

const FIXED_SIZE_STEP = 1;

export const createTextElement = (
	role: ProgramTextRole,
	text: string,
	measurers: ProgramMeasurers,
	placement: TextPlacement,
): ProgramTextElement => {
	const style = TEXT_STYLES[role];
	const { lines } = fitText(text, measurers[style.weight], {
		width: placement.width,
		maxLines: Number.POSITIVE_INFINITY,
		maxSize: style.size,
		minSize: style.size,
		step: FIXED_SIZE_STEP,
		breakWords: true,
	});
	return {
		kind: 'text',
		role,
		lines,
		x: placement.x,
		top: 0,
		width: placement.width,
		align: placement.align ?? 'start',
		...style,
	};
};

const buildDateColumn = ({ dia, diaSemana, horario }: ProgramEntryContent, measurers: ProgramMeasurers) => {
	const placement = { x: CONTENT_LEFT, width: DATE_COLUMN_WIDTH, align: 'center' } as const;
	return stackTexts(
		[
			createTextElement('dia', dia, measurers, placement),
			createTextElement('diaSemana', diaSemana, measurers, placement),
			createTextElement('horario', horario, measurers, placement),
		].map((element) => ({ element, gapBefore: 0 })),
	);
};

const buildTextColumn = (content: ProgramEntryContent, measurers: ProgramMeasurers) => {
	const placement = { x: TEXT_LEFT, width: TEXT_WIDTH };
	const details: [ProgramTextRole, string | null][] = [
		['observacao', content.observacao],
		['palestrante', content.palestrante],
		['local', content.local],
	];
	const detailItems = details
		.flatMap(([role, text]) => (text ? [createTextElement(role, text, measurers, placement)] : []))
		.map((element, index) => ({ element, gapBefore: index === 0 ? TITLE_GAP : 0 }));
	const title = createTextElement('titulo', content.titulo, measurers, placement);
	return stackTexts([{ element: title, gapBefore: 0 }, ...detailItems]);
};

export const buildEntry = (content: ProgramEntryContent, measurers: ProgramMeasurers): EntryLayout => {
	const date = buildDateColumn(content, measurers);
	const text = buildTextColumn(content, measurers);
	return {
		elements: [...translateBlock(date, ENTRY_PADDING), ...translateBlock(text, ENTRY_PADDING)],
		height: Math.max(date.height, text.height) + 2 * ENTRY_PADDING,
	};
};
