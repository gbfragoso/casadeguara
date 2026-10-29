import { afterEach, describe, expect, it, vi } from 'vitest';

import { withTalkFixtures } from '../lib/server/models/palestra-test-support';
import { createRequestEvent, invoke } from '../support/request-event';
import { load } from '../../../src/routes/+page.server';

describe('home route', () => {
	afterEach(() => vi.useRealTimers());

	it('highlights the next ready talk once the morning one is over', async () => {
		await withTalkFixtures(async ({ insertTalk, insertSpeaker, token }) => {
			const palestranteId = await insertSpeaker(`Início Amorim ${token}`);
			const ready = { titulo: 'A gratidão', palestranteId };
			await insertTalk({ ...ready, data: '2901-05-10', horario: '08:45' });
			const tonight = await insertTalk({ ...ready, data: '2901-05-10', horario: '19:30' });
			const tomorrow = await insertTalk({ ...ready, data: '2901-05-11', horario: '19:30' });
			vi.useFakeTimers({ toFake: ['Date'] });
			vi.setSystemTime(new Date('2901-05-10T14:00:00Z'));

			const data = await invoke(load, createRequestEvent());

			expect(data).toMatchObject({
				hoje: '2901-05-10',
				destaque: { id: tonight },
				programacaoIndisponivel: false,
			});
			expect(data?.seguintes.map(({ id }: { id: number }) => id)).toEqual([tomorrow]);
		});
	});
});
