import { db } from '#lib/server/database/connection.js';
import { palestras } from '#lib/server/database/schema.js';
import { PalestraModel } from '#lib/server/models/palestra.js';
import type { TalkDatabase, TalkTransaction } from '#lib/server/models/palestra-projections.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createAbcScenario, EDITOR_ID, rangeOf, readSlots } from './palestra-move-support';
import { withTalkFixtures } from './palestra-test-support';

const model = new PalestraModel(db);
const scenario = createAbcScenario(2251);
const [D1, D2, D3] = scenario.slots;
const SECOND_UPDATE = 2;

const failOnUpdate = (transaction: TalkTransaction, failingUpdate: number) => {
	let updates = 0;
	return new Proxy(transaction, {
		get(target, property, receiver) {
			if (property !== 'update') return Reflect.get(target, property, receiver);
			return (...args: Parameters<TalkTransaction['update']>) => {
				updates += 1;
				if (updates === failingUpdate) throw new Error('Falha simulada no UPDATE.');
				return target.update(...args);
			};
		},
	});
};

const createFailingDatabase = (failingUpdate: number): TalkDatabase =>
	new Proxy(db, {
		get(target, property, receiver) {
			if (property !== 'transaction') return Reflect.get(target, property, receiver);
			return (callback: Parameters<TalkDatabase['transaction']>[0]) =>
				target.transaction((transaction) => callback(failOnUpdate(transaction, failingUpdate)));
		},
	});

describe('TI-08 PalestraModel.move conflicts', () => {
	it('rejects an outdated version without changing any row', async () => {
		await withTalkFixtures(async (fixtures) => {
			const { a, b } = await scenario.insert(fixtures);
			const range = [rangeOf([a])[0], { id: b, versao: 2 }];

			const outcome = await model.move({ originId: a, targetId: b, range }, scenario.today, EDITOR_ID);

			expect(outcome).toEqual({ status: 'conflict' });
			expect(await readSlots(fixtures, [a, b])).toEqual([D1, D2]);
		});
	});

	it('rejects a range whose talk was removed', async () => {
		await withTalkFixtures(async (fixtures) => {
			const { a, b, c } = await scenario.insert(fixtures);
			await db.delete(palestras).where(eq(palestras.id, c));

			const outcome = await model.move(
				{ originId: a, targetId: c, range: rangeOf([a, b, c]) },
				scenario.today,
				EDITOR_ID,
			);

			expect(outcome).toEqual({ status: 'conflict' });
			expect(await readSlots(fixtures, [a, b])).toEqual([D1, D2]);
		});
	});

	it('rejects a range with a talk inserted between its ends', async () => {
		await withTalkFixtures(async (fixtures) => {
			const { a, b } = await scenario.insert(fixtures);
			await fixtures.insertTalk({ data: '2251-03-05', horario: '08:45' });

			const outcome = await model.move(
				{ originId: a, targetId: b, range: rangeOf([a, b]) },
				scenario.today,
				EDITOR_ID,
			);

			expect(outcome).toEqual({ status: 'conflict' });
			expect(await readSlots(fixtures, [a, b])).toEqual([D1, D2]);
		});
	});

	it('rejects a range that starts before today', async () => {
		await withTalkFixtures(async (fixtures) => {
			const { a, b } = await scenario.insert(fixtures);

			const outcome = await model.move(
				{ originId: a, targetId: b, range: rangeOf([a, b]) },
				'2251-03-05',
				EDITOR_ID,
			);

			expect(outcome).toEqual({ status: 'conflict' });
		});
	});

	it('rejects an origin that is not an end of the range', async () => {
		await withTalkFixtures(async (fixtures) => {
			const { a, b, c } = await scenario.insert(fixtures);

			const outcome = await model.move(
				{ originId: b, targetId: c, range: rangeOf([a, b, c]) },
				scenario.today,
				EDITOR_ID,
			);

			expect(outcome).toEqual({ status: 'conflict' });
		});
	});
});

describe('TI-09 PalestraModel.move rollback', () => {
	it('restores every date when an update fails', async () => {
		await withTalkFixtures(async (fixtures) => {
			const { a, b, c } = await scenario.insert(fixtures);
			const failingModel = new PalestraModel(createFailingDatabase(SECOND_UPDATE));
			const request = { originId: a, targetId: c, range: rangeOf([a, b, c]) };

			await expect(failingModel.move(request, scenario.today, EDITOR_ID)).rejects.toThrow(
				'Falha simulada no UPDATE.',
			);

			expect(await readSlots(fixtures, [a, b, c])).toEqual([D1, D2, D3]);
		});
	});
});
