import { db } from '#lib/server/database/connection.js';
import { palestras } from '#lib/server/database/schema.js';
import { suggestTimes } from '#lib/server/models/palestra-board.js';
import type { TalkTransaction } from '#lib/server/models/palestra-projections.js';
import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { TEST_ACTOR_ID } from './palestra-test-support';

type Slot = { data: string; horario: string };

const suggestFromOnly = (slots: Slot[]) =>
	db.transaction(async (transaction: TalkTransaction) => {
		await transaction.execute(
			sql`create temp table palestras (like public.palestras including defaults) on commit drop`,
		);
		if (slots.length > 0) {
			await transaction.insert(palestras).values(slots.map((slot) => ({ ...slot, userCadastro: TEST_ACTOR_ID })));
		}
		return suggestTimes(transaction);
	});

describe('TI-10 PalestraModel.suggestTimes', () => {
	it('uses the time of the latest talk of each weekday', async () => {
		const suggestions = await suggestFromOnly([
			{ data: '2026-03-02', horario: '19:00' },
			{ data: '2026-03-09', horario: '08:45' },
			{ data: '2026-03-07', horario: '14:30' },
		]);

		expect(suggestions).toEqual({ 1: '08:45', 2: null, 3: null, 4: null, 5: null, 6: '14:30', 7: null });
	});

	it('breaks a tie on the latest date with the most recently created talk', async () => {
		const suggestions = await suggestFromOnly([
			{ data: '2026-03-04', horario: '10:00' },
			{ data: '2026-03-04', horario: '09:30' },
		]);

		expect(suggestions[3]).toBe('09:30');
	});

	it('leaves every weekday empty without talks', async () => {
		const suggestions = await suggestFromOnly([]);

		expect(suggestions).toEqual({ 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null });
	});
});
