import { fitText, type TextMeasurer } from '#lib/image/text/fit.js';
import type { SheetFrameRole, SheetMeasurers, SheetTextElement, SheetTextStyle } from './elements';
import { FRAME_STYLES } from './typography';

export type TextPlacement = { x: number; width: number; align?: SheetTextElement['align'] };

const FIXED_SIZE_STEP = 1;
const SIZE_PRECISION = 100;
const LINE_BREAK = /\r?\n/;

const splitParagraphs = (text: string) => text.split(LINE_BREAK).filter((paragraph) => paragraph.trim());

export const toUpperCase = (text: string) => text.toLocaleUpperCase('pt-BR');

export const fitSizeToWidth = (text: string, measurer: TextMeasurer, maxSize: number, width: number) => {
	const proportionalSize = (maxSize * width) / measurer.widthOfTextAtSize(text, maxSize);
	return Math.min(maxSize, Math.floor(proportionalSize * SIZE_PRECISION) / SIZE_PRECISION);
};

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

export const createFrameText = (
	role: SheetFrameRole,
	text: string,
	measurers: SheetMeasurers,
	placement: TextPlacement,
) => createSheetText(role, text, FRAME_STYLES[role], measurers, placement);
