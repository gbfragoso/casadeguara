import { isHttpError } from '@sveltejs/kit';
import { db } from '#lib/server/database/connection.js';
import { palestras } from '#lib/server/database/schema.js';
import { count } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from '../../../lib/server/models/palestra-test-support';
import type { TestUser } from '../../../support/request-event';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { actions } from '../../../../../src/routes/(protected)/comunicacao/palestras/+page.server';

const FUTURE_DATE = '2099-03-09';

const createUser = (roles: string): TestUser => ({
	id: 'integration-palestras',
	username: 'palestras',
	name: 'Palestras',
	roles,
});

const actionEvent = (roles: string, entries: Record<string, string>) => {
	const form = new FormData();
	Object.entries(entries).forEach(([key, value]) => form.set(key, value));

	return createRequestEvent({
		locals: { user: createUser(roles), session: null },
		request: new Request('http://localhost/comunicacao/palestras', { method: 'POST', body: form }),
	});
};

const countTalks = async () => (await db.select({ total: count() }).from(palestras))[0].total;

const captureHttpStatus = async (run: () => unknown) => {
	const thrown = await Promise.resolve()
		.then(run)
		.then(
			() => undefined,
			(reason: unknown) => reason,
		);
	return isHttpError(thrown) ? thrown.status : undefined;
};

describe('TI-15 talk board route', () => {
	it('lets a volunteer create a talk', async () => {
		await withTalkFixtures(async ({ readTalk, trackTalk }) => {
			const form = { data: FUTURE_DATE, horario: '08:45', local: 'Sede' };

			const result = (await invoke(actions.criar, actionEvent('comunicacao', form))) as { palestraId: number };
			trackTalk(result.palestraId);

			expect(await readTalk(result.palestraId)).toMatchObject({
				data: FUTURE_DATE,
				horario: '08:45:00',
				local: 'Sede',
				userCadastro: 'integration-palestras',
			});
		});
	});

	it('forbids a user without a Comunicação role and creates nothing', async () => {
		const before = await countTalks();
		const form = { data: FUTURE_DATE, horario: '08:45' };

		const status = await captureHttpStatus(() => invoke(actions.criar, actionEvent('secretaria', form)));

		expect(status).toBe(403);
		expect(await countTalks()).toBe(before);
	});

	it('forbids a volunteer from deleting a talk', async () => {
		await withTalkFixtures(async ({ insertTalk, readTalk }) => {
			const id = await insertTalk({ data: FUTURE_DATE, horario: '08:45' });

			const status = await captureHttpStatus(() =>
				invoke(actions.excluir, actionEvent('comunicacao', { id: String(id) })),
			);

			expect(status).toBe(403);
			expect(await readTalk(id)).toBeDefined();
		});
	});
});
