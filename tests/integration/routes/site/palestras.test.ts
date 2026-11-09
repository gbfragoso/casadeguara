import { afterEach, describe, expect, it, vi } from 'vitest';

import { withTalkFixtures } from '../../lib/server/models/palestra-test-support';
import { createRequestEvent, invoke } from '../../support/request-event';
import { load } from '../../../../src/routes/(site)/palestras/+page.server';

describe('talks route', () => {
	afterEach(() => vi.useRealTimers());

	it('lists the ready talks of the current month marking the held ones', async () => {
		await withTalkFixtures(async ({ insertTalk, insertSpeaker, token }) => {
			const palestranteId = await insertSpeaker(`Palestras Amorim ${token}`);
			const ready = { titulo: 'A indulgência', palestranteId };
			await insertTalk({ ...ready, data: '2900-04-30', horario: '19:30' });
			const held = await insertTalk({ ...ready, data: '2900-05-03', horario: '19:30' });
			const upcoming = await insertTalk({ ...ready, data: '2900-05-17', horario: '19:30' });
			await insertTalk({ ...ready, data: '2900-06-01', horario: '19:30' });
			vi.useFakeTimers({ toFake: ['Date'] });
			vi.setSystemTime(new Date('2900-05-10T14:00:00Z'));

			const data = await invoke(load, createRequestEvent());

			expect(data).toMatchObject({
				hoje: '2900-05-10',
				mes: 'maio de 2900',
				palestras: [
					{ id: held, realizada: true },
					{ id: upcoming, realizada: false },
				],
				programacaoIndisponivel: false,
			});
		});
	});
});
