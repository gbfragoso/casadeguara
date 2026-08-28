import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it, vi } from 'vitest';

import { calculateCoverPlacement, drawPhoto, type PhotoFrame } from '$lib/server/pdf/amigo-fraterno/photo';

const frame: PhotoFrame = { x: 10, y: 20, width: 86, height: 108 };

describe('PDF photo drawing', () => {
	it.each([
		['landscape', 1200, 600, { x: -55, y: 20, width: 216, height: 108 }],
		['portrait', 600, 1200, { x: 10, y: -12, width: 86, height: 172 }],
	] as const)('uses cover placement for %s images', (_orientation, imageWidth, imageHeight, expected) => {
		const placement = calculateCoverPlacement(imageWidth, imageHeight, frame);

		expect(placement).toEqual(expected);
		expect(placement.width / placement.height).toBeCloseTo(imageWidth / imageHeight);
		expect(placement.width).toBeGreaterThanOrEqual(frame.width);
		expect(placement.height).toBeGreaterThanOrEqual(frame.height);
	});

	it('clips the image before drawing the frame border', async () => {
		const document = await PDFDocument.create();
		const page = document.addPage([200, 200]);
		const bytes = await sharp({
			create: { width: 1200, height: 600, channels: 3, background: { r: 12, g: 34, b: 56 } },
		})
			.jpeg()
			.toBuffer();
		const operators = vi.spyOn(page, 'pushOperators');
		const drawImage = vi.spyOn(page, 'drawImage');
		const drawRectangle = vi.spyOn(page, 'drawRectangle');

		await drawPhoto(page, bytes, frame);

		expect(drawImage).toHaveBeenCalledTimes(1);
		expect(drawImage.mock.calls[0]?.[1]).toEqual(
			expect.objectContaining({ x: -55, y: 20, width: 216, height: 108 }),
		);
		expect(operators.mock.calls.flat().map(String)).toEqual(
			expect.arrayContaining(['q', expect.stringMatching(/ re$/), 'W', 'n', 'Q']),
		);
		expect(drawRectangle).toHaveBeenLastCalledWith({ ...frame, borderColor: expect.anything(), borderWidth: 0.75 });
	});

	it('draws only the empty frame when no photo exists', async () => {
		const document = await PDFDocument.create();
		const page = document.addPage([200, 200]);
		const drawImage = vi.spyOn(page, 'drawImage');
		const drawRectangle = vi.spyOn(page, 'drawRectangle');

		await drawPhoto(page, null, frame);

		expect(drawImage).not.toHaveBeenCalled();
		expect(drawRectangle).toHaveBeenCalledTimes(1);
		expect(drawRectangle).toHaveBeenCalledWith({ ...frame, borderColor: expect.anything(), borderWidth: 0.75 });
	});
});
