import { PageSizes, PDFDocument } from 'pdf-lib';

import { INSTITUTION_NAME } from '#lib/brand/institution.js';
import { embedSheetAssets } from './assets';
import type { SheetMeasurers, SheetPageLayout } from './elements';
import { drawSheetPage } from './renderer';

export type GeneratedSheet = { bytes: Uint8Array; pageCount: number };

export type SheetDocument = { title: string; layout: (measurers: SheetMeasurers) => SheetPageLayout[] };

const SHEET_LANGUAGE = 'pt-BR';

export const generateSheetPdf = async ({ title, layout }: SheetDocument): Promise<GeneratedSheet> => {
	const document = await PDFDocument.create();
	document.setTitle(title, { showInWindowTitleBar: true });
	document.setAuthor(INSTITUTION_NAME);
	document.setLanguage(SHEET_LANGUAGE);
	const assets = await embedSheetAssets(document);
	const pages = layout(assets.fonts);
	pages.forEach((page) => drawSheetPage(document.addPage(PageSizes.A4), page, assets));
	return { bytes: await document.save(), pageCount: pages.length };
};
