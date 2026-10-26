import { readFileSync } from 'node:fs';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSpeakerPhotoActions } from '#lib/server/comunicacao/palestrantes/photo-actions.js';
import { INVALID_PHOTO_MESSAGE, PHOTO_MAX_BYTES, PHOTO_POSITION_MESSAGE } from '#lib/validation/photo.js';
import { createRequestEvent, invoke } from '../../../../../integration/support/request-event';
import { expectHttpError } from '../../../../support/handler-event';
import { createFakeSpeakers, SPEAKER_ID, VOLUNTEER } from './speaker-fakes';

const FIXTURE_PATH = 'tests/fixtures/amigo-fraterno-photo.jpeg';
const CENTER = { focalX: '0.5', focalY: '0.5', zoom: '1' };

const photoEvent = (body: BodyInit, roles = VOLUNTEER) =>
	createRequestEvent({
		locals: { user: { id: 'voluntario-1', username: 'v', name: 'Voluntário', roles }, session: null },
		params: { id: `${SPEAKER_ID}` },
		request: new Request('http://localhost/', { method: 'POST', body }),
	});

const uploadBody = (photo: File) => {
	const form = new FormData();
	form.set('foto', photo);
	Object.entries(CENTER).forEach(([name, value]) => form.set(name, value));
	return form;
};

const validPhoto = () => new File([readFileSync(FIXTURE_PATH)], 'foto.jpeg', { type: 'image/jpeg' });

describe('speaker photo upload', () => {
	afterEach(() => vi.restoreAllMocks());

	it.each([
		['a GIF', new File(['GIF89a'], 'foto.gif', { type: 'image/gif' })],
		[
			'a file larger than 3 MiB',
			new File([new Uint8Array(PHOTO_MAX_BYTES + 1)], 'foto.png', { type: 'image/png' }),
		],
	])('TU-19 rejects %s without saving', async (_, photo) => {
		const speakers = createFakeSpeakers();
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		const result = await invoke(createSpeakerPhotoActions({ speakers }).salvarFoto, photoEvent(uploadBody(photo)));

		expect(result).toMatchObject({
			status: 400,
			data: { operation: 'photoSaved', errors: { foto: [INVALID_PHOTO_MESSAGE] } },
		});
		expect(speakers.replacePhoto).not.toHaveBeenCalled();
		expect(warn).toHaveBeenCalledWith(
			'comunicacao.palestrantes.foto_rejeitada',
			expect.objectContaining({ palestranteId: SPEAKER_ID }),
		);
	});

	it('rejects a body that is not multipart', async () => {
		const speakers = createFakeSpeakers();
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		const result = await invoke(createSpeakerPhotoActions({ speakers }).salvarFoto, photoEvent('foto'));

		expect(result).toMatchObject({ status: 400, data: { errors: { foto: [INVALID_PHOTO_MESSAGE] } } });
	});

	it('rejects an image that cannot be decoded', async () => {
		const speakers = createFakeSpeakers();
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const broken = new File(['not a jpeg'], 'foto.jpeg', { type: 'image/jpeg' });

		const result = await invoke(createSpeakerPhotoActions({ speakers }).salvarFoto, photoEvent(uploadBody(broken)));

		expect(result).toMatchObject({ status: 400, data: { errors: { foto: [INVALID_PHOTO_MESSAGE] } } });
		expect(speakers.replacePhoto).not.toHaveBeenCalled();
	});

	it('saves the original, the square photo and the thumbnail', async () => {
		const speakers = createFakeSpeakers();

		const result = await invoke(
			createSpeakerPhotoActions({ speakers }).salvarFoto,
			photoEvent(uploadBody(validPhoto())),
		);

		expect(result).toEqual({ operation: 'photoSaved', status: 200 });
		expect(speakers.replacePhoto).toHaveBeenCalledWith(
			SPEAKER_ID,
			{ original: expect.any(Uint8Array), quadrada: expect.any(Uint8Array), miniatura: expect.any(Uint8Array) },
			'voluntario-1',
		);
	});

	it('answers 404 when the speaker no longer exists', async () => {
		const speakers = createFakeSpeakers();
		speakers.replacePhoto.mockResolvedValue(false);

		const thrown = await Promise.resolve(
			invoke(createSpeakerPhotoActions({ speakers }).salvarFoto, photoEvent(uploadBody(validPhoto()))),
		).catch((reason: unknown) => reason);

		expect(thrown).toMatchObject({ status: 404 });
	});

	it('denies a user without a Comunicação role before reading the body', async () => {
		const { event, error } = await expectHttpError(
			createSpeakerPhotoActions({ speakers: createFakeSpeakers() }).salvarFoto,
			{
				roles: 'secretaria',
			},
		);

		expect(error.status).toBe(403);
		expect(event.request.bodyUsed).toBe(false);
	});
});

describe('speaker photo reframe', () => {
	afterEach(() => vi.restoreAllMocks());

	const reframe = (speakers: ReturnType<typeof createFakeSpeakers>, position: Record<string, string> = CENTER) =>
		invoke(createSpeakerPhotoActions({ speakers }).reenquadrarFoto, photoEvent(new URLSearchParams(position)));

	const withOriginal = () => {
		const speakers = createFakeSpeakers();
		speakers.getPhoto.mockResolvedValue(new Uint8Array(readFileSync(FIXTURE_PATH)));
		return speakers;
	};

	it('reframes from the stored original', async () => {
		const speakers = withOriginal();

		const result = await reframe(speakers);

		expect(result).toEqual({ operation: 'photoReframed', status: 200 });
		expect(speakers.getPhoto).toHaveBeenCalledWith(SPEAKER_ID, 'original');
		expect(speakers.reframePhoto).toHaveBeenCalledWith(SPEAKER_ID, expect.any(Object), 'voluntario-1');
	});

	it('reports a concurrent photo change', async () => {
		const speakers = withOriginal();
		speakers.reframePhoto.mockResolvedValue('conflict');

		const result = await reframe(speakers);

		expect(result).toMatchObject({
			status: 409,
			data: { operation: 'photoReframed', errors: { enquadramento: [expect.any(String)] } },
		});
	});

	it('answers 404 when the photo was removed meanwhile', async () => {
		const speakers = withOriginal();
		speakers.reframePhoto.mockResolvedValue('missing');

		await expect(reframe(speakers)).rejects.toMatchObject({ status: 404 });
	});

	it('answers 404 for a speaker without a photo', async () => {
		await expect(reframe(createFakeSpeakers())).rejects.toMatchObject({ status: 404 });
	});

	it('rejects an invalid position without reading the photo', async () => {
		const speakers = withOriginal();
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		const result = await reframe(speakers, { ...CENTER, zoom: '9' });

		expect(result).toMatchObject({ status: 400, data: { errors: { zoom: [PHOTO_POSITION_MESSAGE] } } });
		expect(speakers.getPhoto).not.toHaveBeenCalled();
	});

	it('rejects a position body that is not a form', async () => {
		const speakers = withOriginal();
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		const result = await invoke(createSpeakerPhotoActions({ speakers }).reenquadrarFoto, photoEvent('{'));

		expect(result).toMatchObject({ status: 400, data: { errors: { enquadramento: [PHOTO_POSITION_MESSAGE] } } });
	});
});

describe('speaker photo removal', () => {
	it('removes the photo', async () => {
		const speakers = createFakeSpeakers();

		const result = await invoke(createSpeakerPhotoActions({ speakers }).removerFoto, photoEvent(''));

		expect(result).toEqual({ operation: 'photoRemoved', status: 200 });
		expect(speakers.removePhoto).toHaveBeenCalledWith(SPEAKER_ID, 'voluntario-1');
	});

	it('answers 404 for an unknown speaker', async () => {
		const speakers = createFakeSpeakers();
		speakers.removePhoto.mockResolvedValue(false);

		await expect(
			Promise.resolve(invoke(createSpeakerPhotoActions({ speakers }).removerFoto, photoEvent(''))),
		).rejects.toMatchObject({ status: 404 });
	});
});
