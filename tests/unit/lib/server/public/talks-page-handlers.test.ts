import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MonthRange } from '#lib/server/models/palestra-program.js';
import { createTalksPageLoad } from '#lib/server/public/talks-page-handlers.js';
import type { MonthTalk, PublicTalkCard } from '#lib/talks/types.js';

const BAHIA_EVENING = new Date('2026-11-10T22:15:00Z');
const BAHIA_OCTOBER_NIGHT = new Date('2026-11-01T02:00:00Z');

const createTalk = (id: number, data: string, horario: string): PublicTalkCard => ({
	id,
	data,
	horario,
	titulo: `Palestra ${id}`,
	observacoes: null,
	local: null,
	reuniaoCom: [],
	palestrante: { nome: `Palestrante ${id}`, temFoto: true },
});

const createTalks = (talks: PublicTalkCard[]) => ({
	listMonthPublic: vi.fn<(range: MonthRange) => Promise<PublicTalkCard[]>>().mockResolvedValue(talks),
});

const pickHeldFlags = (talks: readonly MonthTalk[]) => talks.map(({ id, realizada }) => [id, realizada]);

describe('createTalksPageLoad', () => {
	afterEach(() => vi.restoreAllMocks());

	it('asks for the talks of the current Bahia month', async () => {
		const talks = createTalks([]);

		const data = await createTalksPageLoad({ talks, clock: () => BAHIA_EVENING })();

		expect(talks.listMonthPublic).toHaveBeenCalledWith({ firstDay: '2026-11-01', nextMonthFirstDay: '2026-12-01' });
		expect(data.mes).toBe('novembro de 2026');
	});

	it('keeps October while it is still October 31 in Bahia', async () => {
		const talks = createTalks([]);

		const data = await createTalksPageLoad({ talks, clock: () => BAHIA_OCTOBER_NIGHT })();

		expect(talks.listMonthPublic).toHaveBeenCalledWith({ firstDay: '2026-10-01', nextMonthFirstDay: '2026-11-01' });
		expect(data).toMatchObject({ hoje: '2026-10-31', mes: 'outubro de 2026' });
	});

	it('marks as held only the talks that started more than two hours ago', async () => {
		const morning = createTalk(1, '2026-11-10', '08:45');
		const startedAnHourAgo = createTalk(2, '2026-11-10', '18:15');
		const nextWeek = createTalk(3, '2026-11-17', '19:30');
		const talks = createTalks([morning, startedAnHourAgo, nextWeek]);

		const data = await createTalksPageLoad({ talks, clock: () => BAHIA_EVENING })();

		expect(pickHeldFlags(data.palestras)).toEqual([
			[1, true],
			[2, false],
			[3, false],
		]);
	});

	it('returns empty lists when the month has no ready talk', async () => {
		const talks = createTalks([]);

		const data = await createTalksPageLoad({ talks, clock: () => BAHIA_EVENING })();

		expect(data).toEqual({
			hoje: '2026-11-10',
			mes: 'novembro de 2026',
			palestras: [],
			programacaoIndisponivel: false,
		});
	});

	it('flags the program as unavailable and logs when the model fails', async () => {
		const cause = new Error('banco fora do ar');
		const talks = { listMonthPublic: vi.fn().mockRejectedValue(cause) };
		const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const data = await createTalksPageLoad({ talks, clock: () => BAHIA_EVENING })();

		expect(data).toMatchObject({ palestras: [], programacaoIndisponivel: true });
		expect(log).toHaveBeenCalledWith('palestras.mes.falha', expect.objectContaining({ error: cause }));
	});
});
