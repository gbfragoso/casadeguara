import { db } from '#lib/server/database/connection.js';
import { HISTORY_PAGE_SIZE } from '#lib/server/models/palestra-board.js';
import { PalestraModel } from '#lib/server/models/palestra.js';
import { DEFAULT_MEETING_ACTIVITIES } from '#lib/talks/defaults.js';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from './palestra-test-support';

const model = new PalestraModel(db);
const HISTORY_ONLY_YEAR = 1001;

const pickIds = (talks: { id: number }[], ids: number[]) =>
	talks.filter(({ id }) => ids.includes(id)).map(({ id }) => id);

describe('TI-01 PalestraModel.listAgenda', () => {
	it('lists today onwards by date, time and creation order', async () => {
		await withTalkFixtures(async ({ insertTalk }) => {
			const yesterday = await insertTalk({ data: '2101-03-01', horario: '08:45' });
			const laterToday = await insertTalk({ data: '2101-03-02', horario: '14:30' });
			const firstToday = await insertTalk({ data: '2101-03-02', horario: '08:45' });
			const tiedToday = await insertTalk({ data: '2101-03-02', horario: '08:45' });
			const tomorrow = await insertTalk({ data: '2101-03-03', horario: '08:00' });

			const agenda = await model.listAgenda('2101-03-02');

			expect(pickIds(agenda, [yesterday, laterToday, firstToday, tiedToday, tomorrow])).toEqual([
				firstToday,
				tiedToday,
				laterToday,
				tomorrow,
			]);
		});
	});

	it('projects the card with its speaker and the time without seconds', async () => {
		await withTalkFixtures(async ({ insertTalk, insertSpeaker, token }) => {
			const speakerId = await insertSpeaker(`Carmélia Amorim ${token}`);
			const id = await insertTalk({
				data: '2102-03-02',
				horario: '08:45',
				titulo: 'A prece',
				palestranteId: speakerId,
			});

			const [card] = (await model.listAgenda('2102-03-02')).filter((talk) => talk.id === id);

			expect(card).toEqual({
				id,
				data: '2102-03-02',
				horario: '08:45',
				titulo: 'A prece',
				observacoes: null,
				local: null,
				reuniaoCom: DEFAULT_MEETING_ACTIVITIES,
				palestrante: { id: speakerId, nome: `Carmélia Amorim ${token}`, temFoto: false },
				versao: 1,
			});
		});
	});
});

describe('TI-02 PalestraModel.listHistory', () => {
	it('lists earlier talks from the most recent in pages of 20', async () => {
		await withTalkFixtures(async ({ insertTalk }) => {
			const days = Array.from({ length: HISTORY_PAGE_SIZE + 1 }, (_, index) => index + 1);
			const ids = await Promise.all(
				days.map((day) =>
					insertTalk({ data: `${HISTORY_ONLY_YEAR}-01-${String(day).padStart(2, '0')}`, horario: '08:45' }),
				),
			);
			const today = `${HISTORY_ONLY_YEAR + 1}-01-01`;

			const [first, second] = [await model.listHistory(today, 1), await model.listHistory(today, 2)];

			expect({ ids: first.rows.map(({ id }) => id), hasNext: first.hasNext }).toEqual({
				ids: ids.toReversed().slice(0, HISTORY_PAGE_SIZE),
				hasNext: true,
			});
			expect({ ids: second.rows.map(({ id }) => id), hasNext: second.hasNext }).toEqual({
				ids: [ids[0]],
				hasNext: false,
			});
		});
	});
});

describe('TI-11 PalestraModel.remove', () => {
	it('removes the talk from the agenda and the history', async () => {
		await withTalkFixtures(async ({ insertTalk }) => {
			const id = await insertTalk({ data: '2103-03-02', horario: '08:45' });

			const removed = await model.remove(id);

			expect(removed).toBe(true);
			expect(pickIds(await model.listAgenda('0001-01-01'), [id])).toEqual([]);
			expect(pickIds((await model.listHistory('9999-12-31', 1)).rows, [id])).toEqual([]);
		});
	});

	it('reports a talk that no longer exists', async () => {
		expect(await model.remove(-1)).toBe(false);
	});
});
