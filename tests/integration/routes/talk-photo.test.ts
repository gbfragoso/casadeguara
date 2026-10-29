import { db } from '#lib/server/database/connection.js';
import { PalestranteModel } from '#lib/server/models/palestrante.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { withTalkFixtures } from '../lib/server/models/palestra-test-support';
import { createJpeg } from '../lib/server/models/palestrante-photo-support';
import { createRequestEvent, invoke } from '../support/request-event';
import { GET } from '../../../src/routes/palestras/[id=integer]/foto/+server';

const speakers = new PalestranteModel(db);

describe('public talk photo route', () => {
	afterEach(() => vi.useRealTimers());

	it('serves the speaker photo of the upcoming talk to an anonymous visitor', async () => {
		await withTalkFixtures(async ({ insertTalk, insertSpeaker, token }) => {
			const palestranteId = await insertSpeaker(`Rota Amorim ${token}`);
			const photo = await createJpeg();
			await speakers.replacePhoto(palestranteId, { original: photo, quadrada: photo, miniatura: photo }, 'rota');
			const id = await insertTalk({ data: '2902-05-10', horario: '19:30', titulo: 'A paz', palestranteId });
			vi.useFakeTimers({ toFake: ['Date'] });
			vi.setSystemTime(new Date('2902-05-10T12:00:00Z'));

			const response = await invoke(GET, createRequestEvent({ params: { id: `${id}` } }));

			expect(response.status).toBe(200);
			expect(response.headers.get('content-type')).toBe('image/jpeg');
		});
	});
});
