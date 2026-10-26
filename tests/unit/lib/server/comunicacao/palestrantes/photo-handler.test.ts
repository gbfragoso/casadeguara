import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSpeakerPhotoHandler } from '#lib/server/comunicacao/palestrantes/photo-handler.js';
import type { SpeakerPhotoVariant } from '#lib/server/models/palestrante-photo.js';
import { createFakeSpeakers, SPEAKER_ID, VOLUNTEER } from './speaker-fakes';

const photo = new Uint8Array([255, 216, 255, 217]);

const requestPhoto = (
	speakers: ReturnType<typeof createFakeSpeakers>,
	variant: SpeakerPhotoVariant,
	roles: string | null = VOLUNTEER,
) => {
	const handler = createSpeakerPhotoHandler({ speakers }, variant);
	return handler({ locals: { user: roles === null ? null : { roles } }, params: { id: `${SPEAKER_ID}` } });
};

describe('speaker photo handler', () => {
	afterEach(() => vi.restoreAllMocks());

	it('answers 401 to an anonymous visitor', async () => {
		const speakers = createFakeSpeakers();

		const response = await requestPhoto(speakers, 'quadrada', null);

		expect(response.status).toBe(401);
		expect(speakers.getPhoto).not.toHaveBeenCalled();
	});

	it('answers 403 to a user without a Comunicação role', async () => {
		const speakers = createFakeSpeakers();

		const response = await requestPhoto(speakers, 'quadrada', 'secretaria');

		expect(response.status).toBe(403);
		expect(await response.json()).toEqual({ message: 'Usuário não possui acesso ao sistema da comunicação.' });
	});

	it('serves the requested variant as a private JPEG', async () => {
		const speakers = createFakeSpeakers();
		speakers.getPhoto.mockResolvedValue(photo);

		const response = await requestPhoto(speakers, 'miniatura');

		expect(speakers.getPhoto).toHaveBeenCalledWith(SPEAKER_ID, 'miniatura');
		expect(response.headers.get('cache-control')).toBe('private, no-store');
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(photo);
	});

	it('answers 404 for a speaker without a photo', async () => {
		const response = await requestPhoto(createFakeSpeakers(), 'original');

		expect(response.status).toBe(404);
	});

	it('answers 500 when the photo cannot be read', async () => {
		const speakers = createFakeSpeakers();
		speakers.getPhoto.mockRejectedValue(new Error('database down'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const response = await requestPhoto(speakers, 'quadrada');

		expect(response.status).toBe(500);
	});
});
