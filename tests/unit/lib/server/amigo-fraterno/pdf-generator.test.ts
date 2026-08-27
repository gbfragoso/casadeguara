import { readFile } from 'node:fs/promises';

import { PDFDocument } from 'pdf-lib';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/server', async () => {
	const { readFile } = await import('node:fs/promises');
	let readCount = 0;
	const assets = [
		await readFile('src/lib/server/amigo-fraterno/assets/NotoSans-Regular.ttf'),
		await readFile('src/lib/server/amigo-fraterno/assets/casa-de-guara.png'),
	];
	return { read: () => new Response(assets[readCount++ % assets.length]) };
});

import { generateAmigoFraternoPdf, sortPdfParticipants } from '$lib/server/amigo-fraterno/pdf-generator';

describe('amigo fraterno PDF generator', () => {
	it('sorts participant names and uses identifier as a stable tiebreaker', () => {
		const participants = [
			{ id: 3, name: 'MARIA', photo: null },
			{ id: 2, name: 'ANA', photo: null },
			{ id: 1, name: 'MARIA', photo: null },
		];

		expect(sortPdfParticipants(participants).map(({ id }) => id)).toEqual([2, 1, 3]);
	});

	it('generates readable A4 pages for participants with and without photos', async () => {
		const photo = new Uint8Array(await readFile('tests/fixtures/amigo-fraterno-photo.jpeg'));
		const participants = Array.from({ length: 7 }, (_, index) => ({
			id: index,
			name: `PARTICIPANTE ${index}`,
			photo: index === 0 ? photo : null,
		}));

		const result = await generateAmigoFraternoPdf(participants, '2026-11-22');
		const document = await PDFDocument.load(result.bytes);

		expect(result.pageCount).toBe(2);
		expect(document.getPageCount()).toBe(2);
		expect(document.getPage(0).getSize()).toMatchObject({ width: 595.28, height: 841.89 });
	});
});
