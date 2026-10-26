import { db } from '#lib/server/database/connection.js';
import { PalestranteModel } from '#lib/server/models/palestrante.js';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from '../../../lib/server/models/palestra-test-support';
import { createJpeg } from '../../../lib/server/models/palestrante-photo-support';
import { createRequestEvent, invoke, type TestUser } from '../../../support/request-event';
import { GET as getSquare } from '../../../../../src/routes/(protected)/comunicacao/palestrantes/[id=integer]/foto/+server';
import { GET as getThumbnail } from '../../../../../src/routes/(protected)/comunicacao/palestrantes/[id=integer]/foto/miniatura/+server';
import { GET as getOriginal } from '../../../../../src/routes/(protected)/comunicacao/palestrantes/[id=integer]/foto/original/+server';

const model = new PalestranteModel(db);

const createUser = (roles: string): TestUser => ({ id: 'integration-foto', username: 'foto', name: 'Foto', roles });

const photoEvent = (id: number, user: TestUser | null) =>
	createRequestEvent({ locals: { user, session: null }, params: { id: `${id}` } });

const withSpeakerPhoto = (callback: (id: number) => Promise<void>) =>
	withTalkFixtures(async ({ insertSpeaker, token }) => {
		const id = await insertSpeaker(`Foto Amorim ${token}`);
		const photo = await createJpeg();
		await model.replacePhoto(id, { original: photo, quadrada: photo, miniatura: photo }, 'integration-foto');
		await callback(id);
	});

describe('TI-19 speaker photo routes', () => {
	it('answers 401 to an anonymous visitor', async () => {
		await withSpeakerPhoto(async (id) => {
			const response = await invoke(getSquare, photoEvent(id, null));

			expect(response.status).toBe(401);
		});
	});

	it('answers 403 to a user without a Comunicação role', async () => {
		await withSpeakerPhoto(async (id) => {
			const response = await invoke(getThumbnail, photoEvent(id, createUser('secretaria')));

			expect(response.status).toBe(403);
		});
	});

	it.each([
		['square', getSquare],
		['thumbnail', getThumbnail],
		['original', getOriginal],
	])('serves the %s photo privately to the Comunicação', async (_, handler) => {
		await withSpeakerPhoto(async (id) => {
			const response = await invoke(handler, photoEvent(id, createUser('comunicacao')));

			expect(response.status).toBe(200);
			expect(response.headers.get('content-type')).toBe('image/jpeg');
			expect(response.headers.get('cache-control')).toBe('private, no-store');
		});
	});
});
