import { isHttpError } from '@sveltejs/kit';
import { db } from '#lib/server/database/connection.js';
import { palestras } from '#lib/server/database/schema.js';
import { DEFAULT_MEETING_ACTIVITIES } from '#lib/talks/defaults.js';
import type { TalkCard } from '#lib/talks/types.js';
import { TALK_TITLE_MAX_LENGTH } from '#lib/validation/comunicacao/palestras.js';
import { count } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from '../../../lib/server/models/palestra-test-support';
import type { TestUser } from '../../../support/request-event';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { actions, load } from '../../../../../src/routes/(protected)/comunicacao/palestras/+page.server';

const FUTURE_DATE = '2099-03-09';
const BOARD_URL = 'http://localhost/comunicacao/palestras';
const VOLUNTEER = 'comunicacao';
const LEGACY_NOTES_LENGTH = 120;

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
		request: new Request(BOARD_URL, { method: 'POST', body: form }),
	});
};

const loadAgendaCard = async (id: number) => {
	const event = createRequestEvent({
		locals: { user: createUser(VOLUNTEER), session: null },
		url: new URL(BOARD_URL),
	});
	const board = (await invoke(load, event)) as { palestras: TalkCard[] };
	return board.palestras.find((talk) => talk.id === id);
};

const updateField = (id: number, campo: string, valor: string) =>
	invoke(actions.atualizar, actionEvent(VOLUNTEER, { id: String(id), versao: '1', campo, valor }));

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
			const form = { data: FUTURE_DATE, horario: '08:45', local: 'Sede', reuniaoCom: '' };

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

describe('talk meeting activities and text limits', () => {
	it('TI-02 saves normalized meeting activities through ?/atualizar', async () => {
		await withTalkFixtures(async ({ insertTalk, readTalk }) => {
			const id = await insertTalk({ data: FUTURE_DATE, horario: '08:45' });

			await updateField(id, 'reuniaoCom', 'Palestra doutrinária\n\n  Passes e água fluidificada  ');

			expect(await readTalk(id)).toMatchObject({
				reuniaoCom: ['Palestra doutrinária', 'Passes e água fluidificada'],
				versao: 2,
			});
		});
	});

	it('TI-03 creates a talk with edited meeting activities and lists them on the board', async () => {
		await withTalkFixtures(async ({ trackTalk }) => {
			const activities = DEFAULT_MEETING_ACTIVITIES.slice(1);
			const form = { data: FUTURE_DATE, horario: '08:45', reuniaoCom: activities.join('\n') };

			const result = (await invoke(actions.criar, actionEvent(VOLUNTEER, form))) as { palestraId: number };
			trackTalk(result.palestraId);

			expect((await loadAgendaCard(result.palestraId))?.reuniaoCom).toEqual(activities);
		});
	});

	it('TI-04 rejects a title above the new limit and keeps the saved title', async () => {
		await withTalkFixtures(async ({ insertTalk, readTalk }) => {
			const id = await insertTalk({ data: FUTURE_DATE, horario: '08:45', titulo: 'A prece' });

			const result = await updateField(id, 'titulo', 'a'.repeat(TALK_TITLE_MAX_LENGTH + 1));

			expect(result).toMatchObject({ status: 400, data: { campo: 'titulo' } });
			expect(await readTalk(id)).toMatchObject({ titulo: 'A prece', versao: 1 });
		});
	});

	it('TI-04 keeps legacy notes above the new limit visible on the board', async () => {
		await withTalkFixtures(async ({ insertTalk }) => {
			const observacoes = 'o'.repeat(LEGACY_NOTES_LENGTH);
			const id = await insertTalk({ data: FUTURE_DATE, horario: '08:45', observacoes });

			const card = await loadAgendaCard(id);

			expect(card?.observacoes).toBe(observacoes);
		});
	});
});
