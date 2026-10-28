import { PDFDocument } from 'pdf-lib';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/server', async () => {
	const { readFileSync } = await import('node:fs');
	return { read: (asset: string) => new Response(readFileSync(asset.replace(/^\//, ''))) };
});

import { generateBirthdayListPdf } from '#lib/server/pdf/birthday-list/generator.js';
import { createBirthdayDocument, FULL_MONTH_PEOPLE } from './support/birthday-fixtures';

const A4_PORTRAIT = { width: 595.28, height: 841.89 };

describe('TU-34 generateBirthdayListPdf', () => {
	it('generates titled A4 portrait pages for the birthday list', async () => {
		const document = createBirthdayDocument(FULL_MONTH_PEOPLE);

		const result = await generateBirthdayListPdf(document);

		const pdf = await PDFDocument.load(result.bytes);
		expect(pdf.getPageCount()).toBe(result.pageCount);
		expect(pdf.getPages().map((page) => page.getSize())).toEqual(
			Array.from({ length: result.pageCount }, () => A4_PORTRAIT),
		);
		expect(pdf.getTitle()).toBe('Aniversariantes — novembro de 2026');
	});
});
