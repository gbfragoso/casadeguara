import fontkit from '@pdf-lib/fontkit';
import type { PDFDocument, PDFFont, PDFImage } from 'pdf-lib';

import { readBrandFont, type FontWeight } from '#lib/server/brand/fonts.js';
import { loadBrandLogo } from '#lib/server/brand/logo.js';

export type SheetAssets = { fonts: Record<FontWeight, PDFFont>; logo: PDFImage };

type SheetAssetBytes = { fonts: Record<FontWeight, Uint8Array>; logo: Uint8Array };

let cachedBytes: Promise<SheetAssetBytes> | undefined;

const readAssetBytes = async (): Promise<SheetAssetBytes> => {
	const [regular, medium, bold, logo] = await Promise.all([
		readBrandFont('regular'),
		readBrandFont('medium'),
		readBrandFont('bold'),
		loadBrandLogo(),
	]);
	return { fonts: { regular, medium, bold }, logo };
};

const forgetFailedRead = (error: unknown): never => {
	cachedBytes = undefined;
	throw error;
};

const loadAssetBytes = (): Promise<SheetAssetBytes> => {
	cachedBytes ??= readAssetBytes().catch(forgetFailedRead);
	return cachedBytes;
};

export const embedSheetAssets = async (document: PDFDocument): Promise<SheetAssets> => {
	document.registerFontkit(fontkit);
	const bytes = await loadAssetBytes();
	const embedFont = (weight: FontWeight) => document.embedFont(bytes.fonts[weight], { subset: true });
	const [regular, medium, bold, logo] = await Promise.all([
		embedFont('regular'),
		embedFont('medium'),
		embedFont('bold'),
		document.embedPng(bytes.logo),
	]);
	return { fonts: { regular, medium, bold }, logo };
};
