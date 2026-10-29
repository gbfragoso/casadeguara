import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PalestraModel } from '#lib/server/models/palestra.js';
import { createTalkPhotoHandler } from '#lib/server/public/talk-photo-handler.js';

const TALK_ID = 42;
const BAHIA_MORNING = new Date('2026-10-28T11:00:00Z');
const photo = new Uint8Array([255, 216, 255, 217]);

type FindPhoto = PalestraModel['findPublicSpeakerPhoto'];

const requestPhoto = (findPublicSpeakerPhoto: FindPhoto) => {
	const handler = createTalkPhotoHandler({ talks: { findPublicSpeakerPhoto }, clock: () => BAHIA_MORNING });
	return handler({ params: { id: `${TALK_ID}` } });
};

describe('talk photo handler', () => {
	afterEach(() => vi.restoreAllMocks());

	it('serves the square speaker photo of an upcoming talk', async () => {
		const findPhoto = vi.fn<FindPhoto>().mockResolvedValue(photo);

		const response = await requestPhoto(findPhoto);

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('image/jpeg');
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(photo);
		expect(findPhoto).toHaveBeenCalledWith(TALK_ID, { today: '2026-10-28', now: '06:00' });
	});

	it('lets browsers and shared caches keep the public photo for an hour', async () => {
		const response = await requestPhoto(vi.fn<FindPhoto>().mockResolvedValue(photo));

		expect(response.headers.get('cache-control')).toBe('public, max-age=3600');
	});

	it('answers 404 when the talk has no public photo', async () => {
		const response = await requestPhoto(vi.fn<FindPhoto>().mockResolvedValue(null));

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ message: 'Foto não encontrada.' });
	});

	it('answers 500 and logs when reading the photo fails', async () => {
		const cause = new Error('banco fora do ar');
		const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const response = await requestPhoto(vi.fn<FindPhoto>().mockRejectedValue(cause));

		expect(response.status).toBe(500);
		expect(log).toHaveBeenCalledWith('inicio.palestras.falha', expect.objectContaining({ palestraId: TALK_ID }));
	});
});
