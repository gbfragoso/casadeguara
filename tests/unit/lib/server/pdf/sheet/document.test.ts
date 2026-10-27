import { PDFDocument } from 'pdf-lib';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/server', async () => {
	const { readFileSync } = await import('node:fs');
	return { read: (asset: string) => new Response(readFileSync(asset.replace(/^\//, ''))) };
});

import { generateSheetPdf } from '#lib/server/pdf/sheet/document.js';
import { composeSheetPages } from '#lib/server/pdf/sheet/pages.js';
import { BODY_HEIGHT } from '#lib/server/pdf/sheet/typography.js';
import { createTextBlock, SHEET_FRAME } from './support/sheet-fixtures';

const A4_PORTRAIT = { width: 595.28, height: 841.89 };
const TITLE = 'Aniversariantes — novembro de 2026';

describe('TU-04 generateSheetPdf', () => {
	it('generates titled A4 portrait pages from the layout', async () => {
		const blocks = ['Primeiro', 'Segundo'].map((text) => createTextBlock(text, BODY_HEIGHT));

		const result = await generateSheetPdf({
			title: TITLE,
			layout: (measurers) => composeSheetPages(SHEET_FRAME, blocks, measurers),
		});

		const document = await PDFDocument.load(result.bytes);
		expect(result.pageCount).toBe(2);
		expect(document.getPages().map((page) => page.getSize())).toEqual([A4_PORTRAIT, A4_PORTRAIT]);
		expect(document.getTitle()).toBe(TITLE);
		expect(document.getAuthor()).toBe('Grupo Espírita Casa de Guará');
	});
});
