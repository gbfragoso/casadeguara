import { PDFDocument } from 'pdf-lib';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/server', async () => {
	const { readFileSync } = await import('node:fs');
	return { read: (asset: string) => new Response(readFileSync(asset.replace(/^\//, ''))) };
});

import { generateTalkProgramPdf } from '#lib/server/pdf/talk-program/generator.js';
import { createProgramDocument, FULL_MONTH_TALKS } from './support/program-fixtures';

describe('TU-29 generateTalkProgramPdf', () => {
	it('generates titled A4 portrait pages for the month program', async () => {
		const program = createProgramDocument(FULL_MONTH_TALKS);

		const result = await generateTalkProgramPdf(program);

		const document = await PDFDocument.load(result.bytes);
		expect(document.getPageCount()).toBe(result.pageCount);
		expect(document.getPages().map((page) => page.getSize())).toEqual(
			Array.from({ length: result.pageCount }, () => ({ width: 595.28, height: 841.89 })),
		);
		expect(document.getTitle()).toBe('Programação de palestras — novembro de 2026');
	});
});
