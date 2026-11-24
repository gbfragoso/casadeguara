import { PDFDocument } from 'pdf-lib';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/server', async () => {
	const { readFile } = await import('node:fs/promises');
	let readCount = 0;
	const assets = [
		await readFile('src/lib/server/pdf/amigo-fraterno/assets/NotoSans-Regular.ttf'),
		await readFile('src/lib/server/brand/casa-de-guara.png'),
	];
	return { read: () => new Response(assets[readCount++ % assets.length]) };
});

import { createCardSlots, PHOTO_FRAME } from '#lib/image/geometry/card.js';
import { loadPdfAssets } from '#lib/server/pdf/amigo-fraterno/assets.js';
import { drawBlankCard } from '#lib/server/pdf/amigo-fraterno/card.js';

type Area = { x: number; y: number; width: number; height: number };

const [slot] = createCardSlots();
const photoFrame: Area = {
	x: slot.x + 246,
	y: slot.y + 12,
	width: PHOTO_FRAME.widthPoints,
	height: PHOTO_FRAME.heightPoints,
};

const overlaps = (first: Area, second: Area) =>
	first.x < second.x + second.width &&
	second.x < first.x + first.width &&
	first.y < second.y + second.height &&
	second.y < first.y + first.height;

const drawBlankCardOnSpiedPage = async () => {
	const document = await PDFDocument.create();
	const assets = await loadPdfAssets(document);
	const page = document.addPage();
	const spies = {
		drawText: vi.spyOn(page, 'drawText'),
		drawLine: vi.spyOn(page, 'drawLine'),
		drawImage: vi.spyOn(page, 'drawImage'),
		drawRectangle: vi.spyOn(page, 'drawRectangle'),
	};
	await drawBlankCard(page, slot, assets, '22/11/2026');
	return spies;
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe('blank amigo fraterno card', () => {
	it('prints the next draw date without a card number', async () => {
		const { drawText } = await drawBlankCardOnSpiedPage();

		const texts = drawText.mock.calls.map(([text]) => text);

		expect(texts).toContain('Próximo sorteio: 22/11/2026');
		expect(texts.some((text) => /^\d+$/.test(text))).toBe(false);
	});

	it('draws fill lines where the number and the stub and body names go', async () => {
		const { drawLine } = await drawBlankCardOnSpiedPage();

		const starts = drawLine.mock.calls.map(([options]) => options.start);

		expect(starts).toEqual(
			expect.arrayContaining([
				{ x: slot.x + 14, y: slot.y + slot.height - 25 },
				{ x: slot.x + 14, y: slot.y + slot.height - 68 },
				{ x: slot.x + 344, y: slot.y + slot.height - 83 },
			]),
		);
	});

	it('leaves the photo frame empty', async () => {
		const { drawImage, drawRectangle } = await drawBlankCardOnSpiedPage();

		const outlines = drawRectangle.mock.calls.map(([options]) => options);
		const images = drawImage.mock.calls.map(([, options]) => options as Area);

		expect(outlines).toContainEqual(expect.objectContaining(photoFrame));
		expect(images.filter((image) => overlaps(image, photoFrame))).toEqual([]);
	});
});
