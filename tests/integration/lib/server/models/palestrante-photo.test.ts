import { db } from '#lib/server/database/connection.js';
import { createSquarePhoto, createThumbnail } from '#lib/server/image/cropper.js';
import { PalestranteModel } from '#lib/server/models/palestrante.js';
import type { SpeakerPhotoSet } from '#lib/server/models/palestrante-photo.js';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from './palestra-test-support';
import { createJpeg, readImageSize, readSpeakerPhotos, readSpeakerRow } from './palestrante-photo-support';

const model = new PalestranteModel(db);
const ACTOR_ID = 'photo-integration';
const CENTER = { focalX: 0.5, focalY: 0.5, zoom: 1 };
const DETAILED_PHOTO = () => new Uint8Array(readFileSync('tests/fixtures/amigo-fraterno-photo.jpeg'));
const ZOOMED = { focalX: 0.3, focalY: 0.5, zoom: 2 };

const framePhotos = async (original: Uint8Array, position = CENTER): Promise<SpeakerPhotoSet> => {
	const quadrada = await createSquarePhoto(original, position);
	return { original, quadrada, miniatura: await createThumbnail(quadrada) };
};

describe('TI-14 PalestranteModel photos', () => {
	it('stores a square photo of 800 px and a thumbnail of 128 px, auditing the change', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			const id = await insertSpeaker(`Ana Amorim ${token}`);

			expect(await model.replacePhoto(id, await framePhotos(await createJpeg()), ACTOR_ID)).toBe(true);

			expect(await readImageSize((await model.getPhoto(id, 'quadrada')) ?? new Uint8Array())).toEqual({
				width: 800,
				height: 800,
			});
			expect(await readImageSize((await model.getPhoto(id, 'miniatura')) ?? new Uint8Array())).toEqual({
				width: 128,
				height: 128,
			});
			expect(await readSpeakerRow(id)).toMatchObject({
				userAlteracao: ACTOR_ID,
				dataAlteracao: expect.any(Date),
			});
			expect(await model.get(id)).toMatchObject({ temFoto: true, fotoVersao: expect.any(String) });
		});
	});

	it('reframes from the same original', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			const id = await insertSpeaker(`Bia Amorim ${token}`);
			const original = DETAILED_PHOTO();
			await model.replacePhoto(id, await framePhotos(original), ACTOR_ID);
			const before = await readSpeakerPhotos(id);

			const outcome = await model.reframePhoto(id, await framePhotos(original, ZOOMED), ACTOR_ID);

			expect(outcome).toBe('updated');
			expect((await readSpeakerPhotos(id))?.quadrada).not.toEqual(before?.quadrada);
		});
	});

	it('refuses to reframe when the original changed meanwhile', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			const id = await insertSpeaker(`Caio Amorim ${token}`);
			await model.replacePhoto(id, await framePhotos(await createJpeg()), ACTOR_ID);
			const before = await readSpeakerPhotos(id);
			const stale = await createJpeg({ r: 0, g: 0, b: 200 });

			const outcome = await model.reframePhoto(id, await framePhotos(stale, ZOOMED), ACTOR_ID);

			expect(outcome).toBe('conflict');
			expect(await readSpeakerPhotos(id)).toEqual(before);
		});
	});

	it('reports a reframe of a speaker without photo as missing', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			const id = await insertSpeaker(`Davi Amorim ${token}`);

			expect(await model.reframePhoto(id, await framePhotos(await createJpeg()), ACTOR_ID)).toBe('missing');
		});
	});

	it('removes the photo', async () => {
		await withTalkFixtures(async ({ insertSpeaker, token }) => {
			const id = await insertSpeaker(`Edu Amorim ${token}`);
			await model.replacePhoto(id, await framePhotos(await createJpeg()), ACTOR_ID);

			expect(await model.removePhoto(id, ACTOR_ID)).toBe(true);

			expect(await model.getPhoto(id, 'quadrada')).toBeNull();
			expect(await model.get(id)).toMatchObject({ temFoto: false, fotoVersao: null });
		});
	});

	it('writes nothing for an unknown speaker', async () => {
		const photos = await framePhotos(await createJpeg());

		expect(await model.replacePhoto(-1, photos, ACTOR_ID)).toBe(false);
		expect(await model.removePhoto(-1, ACTOR_ID)).toBe(false);
		expect(await model.getPhoto(-1, 'original')).toBeUndefined();
	});
});
