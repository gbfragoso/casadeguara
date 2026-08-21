import { read } from '$app/server';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument } from 'pdf-lib';

import logoAsset from './assets/casa-de-guara.png';
import fontAsset from './assets/NotoSans-Regular.ttf';

export const loadPdfAssets = async (document: PDFDocument) => {
	document.registerFontkit(fontkit);
	const [fontBytes, logoBytes] = await Promise.all([read(fontAsset).arrayBuffer(), read(logoAsset).arrayBuffer()]);
	const [font, logo] = await Promise.all([document.embedFont(fontBytes), document.embedPng(logoBytes)]);
	return { font, logo };
};
