import { PDFDocument } from 'pdf-lib';
import { describe, expect, it, vi } from 'vitest';

const readAsset = vi.hoisted(() => vi.fn<(asset: string) => Response>());

vi.mock('$app/server', async () => {
	const { readFileSync } = await import('node:fs');
	readAsset.mockImplementation((asset) => new Response(readFileSync(asset.replace(/^\//, ''))));
	return { read: readAsset };
});

import { generateTalkProgramPdf } from '#lib/server/pdf/talk-program/generator.js';
import { createProgramDocument, FULL_MONTH_TALKS } from './support/program-fixtures';

const MAX_PROGRAM_BYTES = 150 * 1024;
const PROGRAM_ASSET_COUNT = 4;

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

	it('embeds only the font glyphs the program uses', async () => {
		const program = createProgramDocument(FULL_MONTH_TALKS);

		const result = await generateTalkProgramPdf(program);

		expect(result.bytes.byteLength).toBeLessThan(MAX_PROGRAM_BYTES);
	});

	it('reads the fonts and the logo once for every program it generates', async () => {
		vi.resetModules();
		const { generateTalkProgramPdf: generateWithFreshAssets } =
			await import('#lib/server/pdf/talk-program/generator.js');
		const program = createProgramDocument(FULL_MONTH_TALKS);

		await generateWithFreshAssets(program);
		await generateWithFreshAssets(program);

		expect(readAsset).toHaveBeenCalledTimes(PROGRAM_ASSET_COUNT);
	});
});
