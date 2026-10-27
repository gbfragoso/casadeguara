import fontkit from '@pdf-lib/fontkit';
import type { PDFDocument, PDFFont, PDFImage } from 'pdf-lib';

import { readBrandFont, type FontWeight } from '#lib/server/brand/fonts.js';
import { loadBrandLogo } from '#lib/server/brand/logo.js';

export type ProgramAssets = { fonts: Record<FontWeight, PDFFont>; logo: PDFImage };

const embedBrandFont = async (document: PDFDocument, weight: FontWeight) =>
	document.embedFont(await readBrandFont(weight));

export const embedProgramAssets = async (document: PDFDocument): Promise<ProgramAssets> => {
	document.registerFontkit(fontkit);
	const [regular, medium, bold, logo] = await Promise.all([
		embedBrandFont(document, 'regular'),
		embedBrandFont(document, 'medium'),
		embedBrandFont(document, 'bold'),
		loadBrandLogo().then((bytes) => document.embedPng(bytes)),
	]);
	return { fonts: { regular, medium, bold }, logo };
};
