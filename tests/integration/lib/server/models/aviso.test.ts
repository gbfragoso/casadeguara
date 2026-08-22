import { db } from '$lib/database/connection';
import { AvisoModel, RECENT_NOTICE_LIMIT } from '$lib/server/models/aviso';
import { describe, expect, it } from 'vitest';

import { withNotices } from './aviso-test-support';

const model = new AvisoModel(db);
const RECENT_DATE = new Date(2100, 0, 4);
const SHARED_DATE = new Date(2100, 0, 3);
const OLDEST_DATE = new Date(2100, 0, 2);

describe('AvisoModel', () => {
	it('lists five notices in deterministic order', async () => {
		await withNotices(
			[
				{ date: RECENT_DATE, suffix: 'recent' },
				{ date: SHARED_DATE, suffix: 'first-tie' },
				{ date: SHARED_DATE, suffix: 'second-tie' },
				{ date: OLDEST_DATE, suffix: 'oldest' },
				{ date: OLDEST_DATE, suffix: 'fifth' },
				{ date: null, suffix: 'without-date' },
			],
			async ({ notices }) => {
				const recentNotices = await model.listRecent();

				expect(recentNotices).toEqual([notices[0], notices[2], notices[1], notices[4], notices[3]]);
				expect(recentNotices).toHaveLength(RECENT_NOTICE_LIMIT);
			},
		);
	});

	it('gets an existing notice', async () => {
		await withNotices([{ date: RECENT_DATE, suffix: 'existing' }], async ({ notices }) => {
			const found = await model.get(notices[0].idaviso);

			expect(found).toEqual(notices[0]);
		});
	});

	it('returns undefined for a missing notice', async () => {
		expect(await model.get(-1)).toBeUndefined();
	});

	it('creates a notice with its exact text and author', async () => {
		await withNotices([], async ({ text, track }) => {
			const created = await model.create(text('created'), 'bibliotecaria');

			track(created);
			expect(created).toEqual({
				idaviso: expect.any(Number),
				dataCadastro: expect.any(Date),
				texto: text('created'),
				username: 'bibliotecaria',
			});
		});
	});

	it('updates an existing notice', async () => {
		await withNotices([{ date: RECENT_DATE, suffix: 'updatable' }], async ({ notices, text }) => {
			const updatedText = text('updated');

			expect(await model.update(notices[0].idaviso, updatedText)).toBe(true);
			expect(await model.get(notices[0].idaviso)).toEqual({ ...notices[0], texto: updatedText });
		});
	});

	it('reports a missing notice update', async () => {
		await withNotices([], async ({ text }) => {
			expect(await model.update(-1, text('missing'))).toBe(false);
		});
	});
});
