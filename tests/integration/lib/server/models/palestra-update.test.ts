import { db } from '#lib/server/database/connection.js';
import { palestrantes } from '#lib/server/database/schema.js';
import { PalestraModel } from '#lib/server/models/palestra.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from './palestra-test-support';

const model = new PalestraModel(db);
const EDITOR_ID = 'editor-integration';
const VOLUNTEER_RULES = { today: '2301-03-05', allowPast: false };
const COORDINATION_RULES = { today: '2301-03-05', allowPast: true };

const listDates = async (today: string, ids: number[]) =>
	(await model.listAgenda(today)).filter(({ id }) => ids.includes(id)).map(({ data }) => data);

describe('TI-03 PalestraModel.update of the date', () => {
	it('reorders the agenda, records the editor and increments the version', async () => {
		await withTalkFixtures(async ({ insertTalk, readTalk }) => {
			const first = await insertTalk({ data: '2301-03-02', horario: '08:45' });
			const ids = [first, await insertTalk({ data: '2301-03-07', horario: '14:30' })];
			ids.push(await insertTalk({ data: '2301-03-09', horario: '08:45' }));

			const outcome = await model.update(
				{ id: first, versao: 1 },
				{ campo: 'data', valor: '2301-03-08' },
				COORDINATION_RULES,
				EDITOR_ID,
			);

			expect(outcome).toEqual({ status: 'updated', versao: 2 });
			expect(await listDates('2301-03-01', ids)).toEqual(['2301-03-07', '2301-03-08', '2301-03-09']);
			expect(await readTalk(first)).toMatchObject({
				userAlteracao: EDITOR_ID,
				dataAlteracao: expect.any(Date),
				versao: 2,
			});
		});
	});
});

describe('TI-04 PalestraModel.update of a past talk', () => {
	it('brings the talk back to the agenda at the position of its new date', async () => {
		await withTalkFixtures(async ({ insertTalk }) => {
			const past = await insertTalk({ data: '2301-02-23', horario: '08:45' });
			const ids = [past, await insertTalk({ data: '2301-03-09', horario: '08:45' })];
			ids.push(await insertTalk({ data: '2301-03-16', horario: '08:45' }));

			await model.update(
				{ id: past, versao: 1 },
				{ campo: 'data', valor: '2301-03-12' },
				COORDINATION_RULES,
				EDITOR_ID,
			);

			expect(await listDates(COORDINATION_RULES.today, ids)).toEqual(['2301-03-09', '2301-03-12', '2301-03-16']);
		});
	});
});

describe('TI-05 PalestraModel.update rejections', () => {
	it.each([
		['an outdated version', '2301-03-09', 2, VOLUNTEER_RULES, 'conflict'],
		['a past talk for a volunteer', '2301-03-02', 1, VOLUNTEER_RULES, 'locked'],
	])('rejects %s without changing the row', async (_, data, versao, rules, status) => {
		await withTalkFixtures(async ({ insertTalk, readTalk }) => {
			const id = await insertTalk({ data, horario: '08:45', titulo: 'A prece' });
			const before = await readTalk(id);

			const outcome = await model.update({ id, versao }, { campo: 'titulo', valor: 'Outro' }, rules, EDITOR_ID);

			expect(outcome).toEqual({ status });
			expect(await readTalk(id)).toEqual(before);
		});
	});

	it('reports a talk removed by someone else', async () => {
		const outcome = await model.update(
			{ id: -1, versao: 1 },
			{ campo: 'titulo', valor: 'A prece' },
			VOLUNTEER_RULES,
			EDITOR_ID,
		);

		expect(outcome).toEqual({ status: 'missing' });
	});

	it('rejects a speaker that does not exist', async () => {
		await withTalkFixtures(async ({ insertTalk }) => {
			const id = await insertTalk({ data: '2301-03-09', horario: '08:45' });

			const outcome = await model.update(
				{ id, versao: 1 },
				{ campo: 'palestranteId', valor: -1 },
				VOLUNTEER_RULES,
				EDITOR_ID,
			);

			expect(outcome).toEqual({ status: 'missing-speaker' });
		});
	});
});

describe('PalestraModel.update with a new speaker', () => {
	it('creates the speaker and associates it in the same change', async () => {
		await withTalkFixtures(async ({ insertTalk, readTalk, token }) => {
			const id = await insertTalk({ data: '2301-03-09', horario: '08:45' });

			await model.update(
				{ id, versao: 1 },
				{ campo: 'novoPalestrante', valor: `Novo Nome ${token}` },
				VOLUNTEER_RULES,
				EDITOR_ID,
			);

			const [speaker] = await db
				.select()
				.from(palestrantes)
				.where(eq(palestrantes.nome, `Novo Nome ${token}`));
			expect(await readTalk(id)).toMatchObject({ palestranteId: speaker.id, versao: 2 });
			expect(speaker).toMatchObject({ nomeBusca: `novo nome ${token}`, userCadastro: EDITOR_ID });
		});
	});

	it('rejects a name that already exists and keeps the talk unchanged', async () => {
		await withTalkFixtures(async ({ insertTalk, insertSpeaker, readTalk, token }) => {
			await insertSpeaker(`Carmélia Amorim ${token}`);
			const id = await insertTalk({ data: '2301-03-09', horario: '08:45' });

			const change = { campo: 'novoPalestrante', valor: `carmelia AMORIM ${token}` } as const;
			const outcome = await model.update({ id, versao: 1 }, change, VOLUNTEER_RULES, EDITOR_ID);

			expect(outcome).toEqual({ status: 'duplicate-speaker' });
			expect(await readTalk(id)).toMatchObject({ palestranteId: null, versao: 1 });
		});
	});
});
