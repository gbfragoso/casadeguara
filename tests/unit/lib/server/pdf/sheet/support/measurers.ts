import { readFileSync } from 'node:fs';

import fontkit from '@pdf-lib/fontkit';
import { PDFDocument } from 'pdf-lib';

import type { FontWeight } from '#lib/server/brand/fonts.js';
import type { SheetMeasurers } from '#lib/server/pdf/sheet/elements.js';

const FONT_DIRECTORY = 'src/lib/server/brand/fonts';
const FONT_FILES: Record<FontWeight, string> = {
	regular: 'Roboto-Regular',
	medium: 'Roboto-Medium',
	bold: 'Roboto-Bold',
};

const loadTestMeasurers = async (): Promise<SheetMeasurers> => {
	const document = await PDFDocument.create();
	document.registerFontkit(fontkit);
	const embed = (weight: FontWeight) =>
		document.embedFont(new Uint8Array(readFileSync(`${FONT_DIRECTORY}/${FONT_FILES[weight]}.ttf`)));
	const [regular, medium, bold] = await Promise.all([embed('regular'), embed('medium'), embed('bold')]);
	return { regular, medium, bold };
};

export const testMeasurers = await loadTestMeasurers();
