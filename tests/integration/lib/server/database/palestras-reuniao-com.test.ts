import { DEFAULT_MEETING_ACTIVITIES } from '#lib/talks/defaults.js';
import { MEETING_ACTIVITIES_MAX_COUNT, MEETING_ACTIVITY_MAX_LENGTH } from '#lib/validation/comunicacao/palestras.js';
import { describe, expect, it } from 'vitest';

import { withTalkFixtures } from '../models/palestra-test-support';

const TALK_SLOT = { data: '2351-03-09', horario: '08:45' };
const CHECK_VIOLATION = '23514';
const STRING_TOO_LONG = '22001';

describe('TI-01 palestras.reuniao_com', () => {
	it('fills meeting activities with the default list', async () => {
		await withTalkFixtures(async ({ insertTalk, readTalk }) => {
			const id = await insertTalk(TALK_SLOT);

			const talk = await readTalk(id);

			expect(talk?.reuniaoCom).toEqual(DEFAULT_MEETING_ACTIVITIES);
		});
	});

	it('rejects more than five meeting activities', async () => {
		await withTalkFixtures(async ({ insertTalk }) => {
			const reuniaoCom = Array.from(
				{ length: MEETING_ACTIVITIES_MAX_COUNT + 1 },
				(_, index) => `Atividade ${index}`,
			);

			const insertion = insertTalk({ ...TALK_SLOT, reuniaoCom });

			await expect(insertion).rejects.toMatchObject({ cause: { code: CHECK_VIOLATION } });
		});
	});

	it('rejects a meeting activity longer than 32 characters', async () => {
		await withTalkFixtures(async ({ insertTalk }) => {
			const reuniaoCom = ['a'.repeat(MEETING_ACTIVITY_MAX_LENGTH + 1)];

			const insertion = insertTalk({ ...TALK_SLOT, reuniaoCom });

			await expect(insertion).rejects.toMatchObject({ cause: { code: STRING_TOO_LONG } });
		});
	});
});
