import { db } from '#lib/server/database/connection.js';
import { PalestraModel } from '#lib/server/models/palestra.js';
import { PalestranteModel } from '#lib/server/models/palestrante.js';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from './palestra-test-support';
import { createJpeg } from './palestrante-photo-support';

const talks = new PalestraModel(db);
const speakers = new PalestranteModel(db);
const MISSING_TALK_ID = 2_147_483_647;
const talkValues = { data: '2099-03-09', horario: '08:45', titulo: 'A prece' };

describe('TI-05 PalestraModel art source', () => {
	it('reads the art source with the square photo', async () => {
		await withTalkFixtures(async ({ insertSpeaker, insertTalk, token }) => {
			const palestranteId = await insertSpeaker(`Arte Amorim ${token}`);
			const [original, quadrada] = await Promise.all([createJpeg(), createJpeg({ r: 10, g: 20, b: 30 })]);
			await speakers.replacePhoto(palestranteId, { original, quadrada, miniatura: original }, 'integration-arte');
			const id = await insertTalk({ ...talkValues, palestranteId });

			const source = await talks.findArtSource(id);

			expect(source).toMatchObject({
				id,
				versao: 1,
				data: '2099-03-09',
				horario: '08:45',
				titulo: 'A prece',
				palestrante: { nome: `Arte Amorim ${token}`, foto: quadrada },
			});
		});
	});

	it('reads a speaker without a photo as a null photo', async () => {
		await withTalkFixtures(async ({ insertSpeaker, insertTalk, token }) => {
			const palestranteId = await insertSpeaker(`Arte Sem Foto ${token}`);
			const id = await insertTalk({ ...talkValues, palestranteId });

			const source = await talks.findArtSource(id);

			expect(source?.palestrante).toEqual({ nome: `Arte Sem Foto ${token}`, foto: null });
		});
	});

	it('reads nothing for a missing talk', async () => {
		const source = await talks.findArtSource(MISSING_TALK_ID);

		expect(source).toBeUndefined();
	});
});
