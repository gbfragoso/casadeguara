import { db } from '#lib/server/database/connection.js';
import { PalestraModel } from '#lib/server/models/palestra.js';
import { PalestranteModel } from '#lib/server/models/palestrante.js';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from './palestra-test-support';
import { createJpeg } from './palestrante-photo-support';

const talks = new PalestraModel(db);
const speakers = new PalestranteModel(db);
const WIDE_LIMIT = 100;
const HOME_LIMIT = 4;

const pickIds = (cards: { id: number }[], ids: number[]) =>
	cards.filter(({ id }) => ids.includes(id)).map(({ id }) => id);

describe('PalestraModel.listUpcomingPublic', () => {
	it('lists only talks with a title and a speaker', async () => {
		await withTalkFixtures(async ({ insertTalk, insertSpeaker, token }) => {
			const palestranteId = await insertSpeaker(`Pública Amorim ${token}`);
			const ready = await insertTalk({ data: '2801-03-02', horario: '19:30', titulo: 'A prece', palestranteId });
			const untitled = await insertTalk({ data: '2801-03-02', horario: '19:30', titulo: '  ', palestranteId });
			const speakerless = await insertTalk({ data: '2801-03-02', horario: '19:30', titulo: 'A fé' });

			const upcoming = await talks.listUpcomingPublic({ today: '2801-03-01', now: '08:00' }, WIDE_LIMIT);

			expect(pickIds(upcoming, [ready, untitled, speakerless])).toEqual([ready]);
		});
	});

	it('drops a talk of the current day once its time has passed', async () => {
		await withTalkFixtures(async ({ insertTalk, insertSpeaker, token }) => {
			const palestranteId = await insertSpeaker(`Horário Amorim ${token}`);
			const ready = { titulo: 'A caridade', palestranteId };
			const morning = await insertTalk({ ...ready, data: '2802-03-02', horario: '08:45' });
			const evening = await insertTalk({ ...ready, data: '2802-03-02', horario: '19:30' });

			const upcoming = await talks.listUpcomingPublic({ today: '2802-03-02', now: '19:00' }, WIDE_LIMIT);

			expect(pickIds(upcoming, [morning, evening])).toEqual([evening]);
		});
	});

	it('exposes only the fields the public page shows', async () => {
		await withTalkFixtures(async ({ insertTalk, insertSpeaker, token }) => {
			const palestranteId = await insertSpeaker(`Campos Amorim ${token}`);
			const id = await insertTalk({ data: '2805-03-02', horario: '19:30', titulo: 'A paz', palestranteId });

			const upcoming = await talks.listUpcomingPublic({ today: '2805-03-01', now: '08:00' }, WIDE_LIMIT);
			const talk = upcoming.find((card) => card.id === id);

			expect([Object.keys(talk ?? {}), Object.keys(talk?.palestrante ?? {})]).toEqual([
				['id', 'data', 'horario', 'titulo', 'observacoes', 'local', 'reuniaoCom', 'palestrante'],
				['nome', 'temFoto'],
			]);
		});
	});

	it('orders by date, time and id and keeps only the requested count', async () => {
		await withTalkFixtures(async ({ insertTalk, insertSpeaker, token }) => {
			const palestranteId = await insertSpeaker(`Ordem Amorim ${token}`);
			const ready = { titulo: 'O perdão', palestranteId };
			const later = await insertTalk({ ...ready, data: '2803-03-04', horario: '08:00' });
			const evening = await insertTalk({ ...ready, data: '2803-03-03', horario: '19:30' });
			const first = await insertTalk({ ...ready, data: '2803-03-03', horario: '08:45' });
			const tied = await insertTalk({ ...ready, data: '2803-03-03', horario: '08:45' });
			await insertTalk({ ...ready, data: '2803-03-05', horario: '08:00' });

			const upcoming = await talks.listUpcomingPublic({ today: '2803-03-02', now: '08:00' }, HOME_LIMIT);

			expect(upcoming.map(({ id }) => id)).toEqual([first, tied, evening, later]);
		});
	});
});

describe('PalestraModel.findPublicSpeakerPhoto', () => {
	const withPhotographedSpeaker = <T>(callback: Parameters<typeof withTalkFixtures<T>>[0]) =>
		withTalkFixtures(async (fixtures) => {
			const palestranteId = await fixtures.insertSpeaker(`Foto Amorim ${fixtures.token}`);
			const [original, quadrada] = await Promise.all([createJpeg(), createJpeg({ r: 10, g: 20, b: 30 })]);
			await speakers.replacePhoto(palestranteId, { original, quadrada, miniatura: original }, 'integration-foto');
			return callback({ ...fixtures, insertTalk: (values) => fixtures.insertTalk({ palestranteId, ...values }) });
		});

	it('returns the square photo of an upcoming ready talk', async () => {
		await withPhotographedSpeaker(async ({ insertTalk }) => {
			const id = await insertTalk({ data: '2804-03-02', horario: '19:30', titulo: 'A esperança' });

			const photo = await talks.findPublicSpeakerPhoto(id, { today: '2804-03-01', now: '08:00' });

			expect(photo?.byteLength).toBeGreaterThan(0);
		});
	});

	it.each([
		['a past talk', { data: '2804-02-28', horario: '19:30', titulo: 'A esperança' }],
		['an untitled talk', { data: '2804-03-02', horario: '19:30', titulo: null }],
	])('hides the photo of %s', async (_scenario, values) => {
		await withPhotographedSpeaker(async ({ insertTalk }) => {
			const id = await insertTalk(values);

			const photo = await talks.findPublicSpeakerPhoto(id, { today: '2804-03-01', now: '08:00' });

			expect(photo).toBeNull();
		});
	});
});
