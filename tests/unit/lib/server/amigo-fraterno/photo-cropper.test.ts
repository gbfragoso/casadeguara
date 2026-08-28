import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { PHOTO_FRAME } from '$lib/amigo-fraterno/card-geometry';
import { createCardPhoto } from '$lib/server/amigo-fraterno/photo-cropper';

const RGB_CHANNEL_COUNT = 3;

const createSplitPhoto = () =>
	sharp(
		Buffer.from(
			'<svg width="600" height="600"><rect width="300" height="600" fill="red"/><rect x="300" width="300" height="600" fill="blue"/></svg>',
		),
	)
		.jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
		.toBuffer();

const readCenterPixel = async (photo: Uint8Array) => {
	const pixels = await sharp(photo).removeAlpha().raw().toBuffer();
	const centerX = Math.floor(PHOTO_FRAME.outputWidth / 2);
	const centerY = Math.floor(PHOTO_FRAME.outputHeight / 2);
	const center = (centerY * PHOTO_FRAME.outputWidth + centerX) * RGB_CHANNEL_COUNT;
	return Array.from(pixels.subarray(center, center + RGB_CHANNEL_COUNT));
};

describe('createCardPhoto', () => {
	it('generates the exact card dimensions from the selected source region', async () => {
		const source = await createSplitPhoto();

		const [leftPhoto, rightPhoto] = await Promise.all([
			createCardPhoto(source, { focalX: 0, focalY: 0.5, zoom: 2 }),
			createCardPhoto(source, { focalX: 1, focalY: 0.5, zoom: 2 }),
		]);
		const [leftMetadata, rightMetadata, leftPixel, rightPixel] = await Promise.all([
			sharp(leftPhoto).metadata(),
			sharp(rightPhoto).metadata(),
			readCenterPixel(leftPhoto),
			readCenterPixel(rightPhoto),
		]);

		expect(leftMetadata).toMatchObject({ format: 'jpeg', width: 239, height: 300 });
		expect(rightMetadata).toMatchObject({ format: 'jpeg', width: 239, height: 300 });
		expect(leftPixel[0]).toBeGreaterThan(240);
		expect(leftPixel[2]).toBeLessThan(15);
		expect(rightPixel[0]).toBeLessThan(15);
		expect(rightPixel[2]).toBeGreaterThan(240);
	});

	it('rejects an undecodable source', async () => {
		await expect(
			createCardPhoto(new Uint8Array([0, 1, 2]), { focalX: 0.5, focalY: 0.5, zoom: 1 }),
		).rejects.toThrow();
	});
});
