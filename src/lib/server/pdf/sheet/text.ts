import { fitText } from '#lib/image/text/fit.js';
import type { SheetMeasurers, SheetTextElement, SheetTextStyle } from './elements';

export type TextPlacement = { x: number; width: number; align?: SheetTextElement['align'] };

const FIXED_SIZE_STEP = 1;
const LINE_BREAK = /\r?\n/;

const splitParagraphs = (text: string) => text.split(LINE_BREAK).filter((paragraph) => paragraph.trim());

export const createSheetText = <Role extends string>(
	role: Role,
	text: string,
	style: SheetTextStyle,
	measurers: SheetMeasurers,
	placement: TextPlacement,
): SheetTextElement<Role> => {
	const wrapParagraph = (paragraph: string) =>
		fitText(paragraph, measurers[style.weight], {
			width: placement.width,
			maxLines: Number.POSITIVE_INFINITY,
			maxSize: style.size,
			minSize: style.size,
			step: FIXED_SIZE_STEP,
			breakWords: true,
		}).lines;
	const lines = splitParagraphs(text).flatMap(wrapParagraph);
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
