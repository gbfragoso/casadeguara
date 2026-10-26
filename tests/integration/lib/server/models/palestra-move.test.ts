import { db } from '#lib/server/database/connection.js';
import { PalestraModel } from '#lib/server/models/palestra.js';
import { describe, expect, it } from 'vitest';

import { createAbcScenario, EDITOR_ID, rangeOf, readSlots } from './palestra-move-support';
import { withTalkFixtures } from './palestra-test-support';

const model = new PalestraModel(db);
const scenario = createAbcScenario(2201);
const [D1, D2, D3] = scenario.slots;

describe('TI-06 PalestraModel.move', () => {
	it('gives B the first slot and A the second when A is dropped on B', async () => {
		await withTalkFixtures(async (fixtures) => {
			const { a, b } = await scenario.insert(fixtures);

			const outcome = await model.move(
				{ originId: a, targetId: b, range: rangeOf([a, b]) },
				scenario.today,
				EDITOR_ID,
			);

			expect(outcome).toEqual({ status: 'moved', slot: { data: '2201-03-07', horario: '14:30' } });
			expect(await readSlots(fixtures, [b, a])).toEqual([D1, D2]);
		});
	});

	it('shifts B and C up when A is dropped on C', async () => {
		await withTalkFixtures(async (fixtures) => {
			const { a, b, c } = await scenario.insert(fixtures);

			await model.move({ originId: a, targetId: c, range: rangeOf([a, b, c]) }, scenario.today, EDITOR_ID);

			expect(await readSlots(fixtures, [b, c, a])).toEqual([D1, D2, D3]);
		});
	});

	it('shifts A and B down when C is dropped on A, keeping the other fields with each card', async () => {
		await withTalkFixtures(async (fixtures) => {
			const { a, b, c, details } = await scenario.insert(fixtures);

			await model.move({ originId: c, targetId: a, range: rangeOf([a, b, c]) }, scenario.today, EDITOR_ID);

			expect(await readSlots(fixtures, [c, a, b])).toEqual([D1, D2, D3]);
			expect(await fixtures.readTalk(c)).toMatchObject({
				...details,
				titulo: 'C',
				versao: 2,
				userAlteracao: EDITOR_ID,
			});
		});
	});
});

describe('TI-07 PalestraModel.move between equal slots', () => {
	it('changes nothing and keeps the versions', async () => {
		await withTalkFixtures(async ({ insertTalk, readTalk }) => {
			const first = await insertTalk({ data: '2202-03-02', horario: '08:45' });
			const second = await insertTalk({ data: '2202-03-02', horario: '08:45' });
			const request = { originId: first, targetId: second, range: rangeOf([first, second]) };

			const outcome = await model.move(request, scenario.today, EDITOR_ID);

			expect(outcome).toEqual({ status: 'unchanged', slot: { data: '2202-03-02', horario: '08:45' } });
			expect([(await readTalk(first))?.versao, (await readTalk(second))?.versao]).toEqual([1, 1]);
		});
	});
});
