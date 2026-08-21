import { File } from 'node:buffer';
import sharp from 'sharp';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InvalidPhotoError, normalizePhoto } from '$lib/server/amigo-fraterno/photo-normalizer';
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
		const source = await sharp({ create: { width: 600, height: 300, channels: 4, background: '#00000000' } })
			.png()
			.toBuffer();

		const photo = await normalizePhoto(createInput(source));
		const metadata = await sharp(photo.bytes).metadata();

		expect(photo).toMatchObject({ contentType: 'image/jpeg', width: 300, height: 150 });
		expect(metadata).toMatchObject({ format: 'jpeg', width: 300, height: 150 });
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

	it('rejects bytes that cannot be decoded as an image', async () => {
		const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		await expect(normalizePhoto(createInput(new Uint8Array([0, 1, 2])))).rejects.toBeInstanceOf(InvalidPhotoError);
		expect(warning).toHaveBeenCalledWith('amigo_fraterno.photo_rejected', { reason: 'decode' });
	});
});
