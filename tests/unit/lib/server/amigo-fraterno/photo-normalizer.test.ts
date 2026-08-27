import { File } from 'node:buffer';
import sharp from 'sharp';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InvalidPhotoError, normalizePhoto, normalizePhotoSource } from '$lib/server/amigo-fraterno/photo-normalizer';
import type { PhotoUploadInput } from '$lib/validation/cadastros/foto';

const toArrayBuffer = (bytes: Uint8Array) => {
	const buffer = new ArrayBuffer(bytes.byteLength);
	new Uint8Array(buffer).set(bytes);

	return buffer;
};

const createInput = (bytes: Uint8Array, type = 'image/png'): PhotoUploadInput => ({
	foto: new File([toArrayBuffer(bytes)], 'foto', { type }),
});

describe('normalizePhoto', () => {
	afterEach(() => vi.restoreAllMocks());
	it('normalizes a transparent image without cropping or enlarging it', async () => {
		const source = await sharp({ create: { width: 2_400, height: 600, channels: 4, background: '#00000000' } })
			.png()
			.toBuffer();

		const photo = await normalizePhoto(createInput(source));
		const metadata = await sharp(photo.bytes).metadata();
		const pixels = await sharp(photo.bytes).raw().toBuffer();

		expect(photo).toMatchObject({ contentType: 'image/jpeg', width: 1_200, height: 300 });
		expect(metadata).toMatchObject({ format: 'jpeg', width: 1_200, height: 300 });
		expect(metadata.exif).toBeUndefined();
		expect(metadata.icc).toBeUndefined();
		expect(Array.from(pixels.subarray(0, 3))).toEqual([255, 255, 255]);
	});

	it('auto-orients an EXIF JPEG before removing its metadata', async () => {
		const source = await sharp({ create: { width: 300, height: 600, channels: 3, background: '#224466' } })
			.withMetadata({ orientation: 6 })
			.jpeg()
			.toBuffer();

		const photo = await normalizePhotoSource(createInput(source, 'image/jpeg').foto);
		const metadata = await sharp(photo.bytes).metadata();

		expect(photo).toMatchObject({ width: 600, height: 300 });
		expect(metadata.orientation).toBeUndefined();
		expect(metadata.exif).toBeUndefined();
	});

	it('rejects an image below the minimum dimensions', async () => {
		const source = await sharp({ create: { width: 299, height: 300, channels: 3, background: '#ffffff' } })
			.jpeg()
			.toBuffer();

		const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		await expect(normalizePhoto(createInput(source, 'image/jpeg'))).rejects.toMatchObject({ reason: 'dimensions' });
		expect(warning).toHaveBeenCalledWith('amigo_fraterno.photo_rejected', { reason: 'dimensions' });
	});

	it('rejects an image above the decoded pixel limit', async () => {
		const source = await sharp({ create: { width: 6_001, height: 4_000, channels: 3, background: '#ffffff' } })
			.jpeg()
			.toBuffer();
		const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		await expect(normalizePhotoSource(createInput(source, 'image/jpeg').foto)).rejects.toMatchObject({
			reason: 'dimensions',
		});
		expect(warning).toHaveBeenCalledWith('amigo_fraterno.photo_rejected', { reason: 'dimensions' });
	});

	it('rejects decoded content outside JPEG and PNG', async () => {
		const source = await sharp({ create: { width: 300, height: 300, channels: 3, background: '#ffffff' } })
			.webp()
			.toBuffer();
		const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		await expect(normalizePhotoSource(createInput(source).foto)).rejects.toMatchObject({ reason: 'format' });
		expect(warning).toHaveBeenCalledWith('amigo_fraterno.photo_rejected', { reason: 'format' });
	});

	it('rejects bytes that cannot be decoded as an image', async () => {
		const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		await expect(normalizePhoto(createInput(new Uint8Array([0, 1, 2])))).rejects.toBeInstanceOf(InvalidPhotoError);
		expect(warning).toHaveBeenCalledWith('amigo_fraterno.photo_rejected', { reason: 'decode' });
	});
});
