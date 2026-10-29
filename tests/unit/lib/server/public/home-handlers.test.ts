import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PublicTalkMoment } from '#lib/server/models/palestra-public.js';
import { createHomeLoad, HOME_TALK_COUNT } from '#lib/server/public/home-handlers.js';
import type { PublicTalkCard } from '#lib/talks/types.js';

const BAHIA_EVENING = new Date('2026-10-28T22:15:00Z');
const BAHIA_AFTER_MIDNIGHT = new Date('2026-10-29T03:30:00Z');

const createTalk = (id: number): PublicTalkCard => ({
	id,
	data: '2026-10-29',
	horario: '19:30',
	titulo: `Palestra ${id}`,
	observacoes: null,
	local: null,
	reuniaoCom: [],
	palestrante: { nome: `Palestrante ${id}`, temFoto: false },
});

const createTalks = (talks: PublicTalkCard[]) => ({
	listUpcomingPublic: vi.fn(async (_moment: PublicTalkMoment, limit: number) => talks.slice(0, limit)),
});

describe('createHomeLoad', () => {
	afterEach(() => vi.restoreAllMocks());

	it('separates the next talk from the following three', async () => {
		const talks = createTalks([1, 2, 3, 4].map(createTalk));

		const data = await createHomeLoad({ talks, clock: () => BAHIA_EVENING })();

		expect(data.destaque?.id).toBe(1);
		expect(data.seguintes.map(({ id }) => id)).toEqual([2, 3, 4]);
		expect(data.programacaoIndisponivel).toBe(false);
	});

	it('keeps listing talks that started up to two hours ago', async () => {
		const talks = createTalks([]);

		await createHomeLoad({ talks, clock: () => BAHIA_EVENING })();

		expect(talks.listUpcomingPublic).toHaveBeenCalledWith({ today: '2026-10-28', now: '17:15' }, HOME_TALK_COUNT);
	});

	it('keeps the current Bahia day as today while the cutoff falls on the day before', async () => {
		const talks = createTalks([]);

		const data = await createHomeLoad({ talks, clock: () => BAHIA_AFTER_MIDNIGHT })();

		expect(data.hoje).toBe('2026-10-29');
		expect(talks.listUpcomingPublic).toHaveBeenCalledWith({ today: '2026-10-28', now: '22:30' }, HOME_TALK_COUNT);
	});

	it('has no highlight when the program is empty', async () => {
		const talks = createTalks([]);

		const data = await createHomeLoad({ talks, clock: () => BAHIA_EVENING })();

		expect(data).toEqual({ hoje: '2026-10-28', destaque: null, seguintes: [], programacaoIndisponivel: false });
	});

	it('flags the program as unavailable and logs when the model fails', async () => {
		const cause = new Error('banco fora do ar');
		const talks = { listUpcomingPublic: vi.fn().mockRejectedValue(cause) };
		const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const data = await createHomeLoad({ talks, clock: () => BAHIA_EVENING })();

		expect(data).toEqual({ hoje: '2026-10-28', destaque: null, seguintes: [], programacaoIndisponivel: true });
		expect(log).toHaveBeenCalledWith('inicio.palestras.falha', expect.objectContaining({ error: cause }));
	});
});
