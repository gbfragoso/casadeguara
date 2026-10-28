import { CORRECTION_NOTICE } from '#lib/birthdays/format.js';
import {
	measureTextHeight,
	stackTexts,
	translateBlock,
	type SheetBlock,
	type SheetMeasurers,
	type SheetTextElement,
} from '#lib/server/pdf/sheet/elements.js';
import { createSheetText, type TextPlacement } from '#lib/server/pdf/sheet/text.js';
import { DATE_COLUMN_PLACEMENT, stackDateColumn } from '#lib/server/pdf/sheet/date-column.js';
import { CONTENT_LEFT, CONTENT_WIDTH, TEXT_LEFT, TEXT_WIDTH } from '#lib/server/pdf/sheet/typography.js';
import type { BirthdayGroupContent, BirthdayTextRole } from './content';
import { BIRTHDAY_STYLES, GROUP_PADDING, NOTICE_GAP } from './typography';

export type BirthdayBlock = SheetBlock<BirthdayTextRole>;

const createBirthdayText = (
	role: BirthdayTextRole,
	text: string,
	measurers: SheetMeasurers,
	placement: TextPlacement,
) => createSheetText(role, text, BIRTHDAY_STYLES[role], measurers, placement);

const stackWithoutGaps = (elements: SheetTextElement<BirthdayTextRole>[]) =>
	stackTexts(elements.map((element) => ({ element, gapBefore: 0 })));

const buildDateColumn = ({ dia, diaSemana }: BirthdayGroupContent, measurers: SheetMeasurers) => {
	const texts: [BirthdayTextRole, string | null][] = [
		['dia', dia],
		['diaSemana', diaSemana],
	];
	return stackDateColumn(
		texts.flatMap(([role, text]) =>
			text ? [createBirthdayText(role, text, measurers, DATE_COLUMN_PLACEMENT)] : [],
		),
		measurers,
	);
};

const buildNameColumn = ({ nomes }: BirthdayGroupContent, measurers: SheetMeasurers) => {
	const placement = { x: TEXT_LEFT, width: TEXT_WIDTH };
	return stackWithoutGaps(nomes.map((nome) => createBirthdayText('nome', nome, measurers, placement)));
};

const buildGroup = (group: BirthdayGroupContent, measurers: SheetMeasurers): BirthdayBlock => {
	const date = buildDateColumn(group, measurers);
	const names = buildNameColumn(group, measurers);
	return {
		elements: [...translateBlock(date, GROUP_PADDING), ...translateBlock(names, GROUP_PADDING)],
		height: Math.max(date.height, names.height) + 2 * GROUP_PADDING,
	};
};

const appendCorrectionNotice = (block: BirthdayBlock, measurers: SheetMeasurers): BirthdayBlock => {
	const notice = createBirthdayText('aviso', CORRECTION_NOTICE, measurers, { x: CONTENT_LEFT, width: CONTENT_WIDTH });
	const top = block.height + NOTICE_GAP;
	return { elements: [...block.elements, { ...notice, top }], height: top + measureTextHeight(notice) };
};

export const buildBirthdayBlocks = (groups: BirthdayGroupContent[], measurers: SheetMeasurers): BirthdayBlock[] =>
	groups.map((group, index) => {
		const block = buildGroup(group, measurers);
		return index === groups.length - 1 ? appendCorrectionNotice(block, measurers) : block;
	});
