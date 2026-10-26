import { read } from '$app/server';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument } from 'pdf-lib';

import { loadBrandLogo } from '#lib/server/brand/logo.js';
import fontAsset from './assets/NotoSans-Regular.ttf';

export const loadPdfAssets = async (document: PDFDocument) => {
	document.registerFontkit(fontkit);
	const [fontBytes, logoBytes] = await Promise.all([read(fontAsset).arrayBuffer(), loadBrandLogo()]);
	const [font, logo] = await Promise.all([document.embedFont(fontBytes), document.embedPng(logoBytes)]);
	return { font, logo };
};
