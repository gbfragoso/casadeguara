import { describe, expect, it } from 'vitest';

import { createPhotoResponse } from '#lib/server/image/photo-response.js';

describe('createPhotoResponse', () => {
	it('serves the JPEG bytes inline without any shared cache', async () => {
		const photo = new Uint8Array([255, 216, 255, 217]);

		const response = createPhotoResponse(photo);

		expect(Object.fromEntries(response.headers)).toEqual({
			'cache-control': 'private, no-store',
			'content-disposition': 'inline',
			'content-type': 'image/jpeg',
			'x-content-type-options': 'nosniff',
		});
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(photo);
	});

	it('uses the cache policy chosen by the caller', () => {
		const response = createPhotoResponse(new Uint8Array([255, 216, 255, 217]), 'public, max-age=3600');

		expect(response.headers.get('cache-control')).toBe('public, max-age=3600');
	});
});
