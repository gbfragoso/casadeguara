import fontkit from '@pdf-lib/fontkit';

import type { FontWeight } from '#lib/server/brand/fonts.js';
import type { SheetTextElement } from '#lib/server/pdf/sheet/elements.js';
import { readTestFont } from './measurers';

const DESCENDERS = 'gjpqyçÇ';
const ACCENTED_CAPITALS = 'ÁÂÃÉÊÍÓÔÕÚ';

const listGlyphBoxes = (weight: FontWeight, text: string) => {
	const font = fontkit.create(readTestFont(weight));
	return font.layout(text).glyphs.map(({ bbox }) => ({
		top: bbox.maxY / font.unitsPerEm,
		bottom: bbox.minY / font.unitsPerEm,
	}));
};

export const measureDeepestDescender = ({ weight, size }: SheetTextElement) =>
	-Math.min(...listGlyphBoxes(weight, DESCENDERS).map(({ bottom }) => bottom)) * size;

export const measureTallestAccentedCapital = ({ weight, size }: SheetTextElement) =>
	Math.max(...listGlyphBoxes(weight, ACCENTED_CAPITALS).map(({ top }) => top)) * size;
