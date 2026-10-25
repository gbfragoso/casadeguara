import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';
import {
	COORDINATOR,
	createBoard,
	createFakeSpeakers,
	createFakeTalks,
	createTalkCard,
	TODAY,
	VOLUNTEER,
} from './board-fakes';

const BOARD_URL = 'http://localhost/comunicacao/palestras';

describe('talk board load', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('loads the agenda by default', async () => {
		const talks = createFakeTalks();
		const agenda = [createTalkCard(31, TODAY)];
		talks.listAgenda.mockResolvedValue(agenda);
		const speakers = createFakeSpeakers([{ id: 4, nome: 'Carmélia Amorim' }]);

		const { result } = await runHandler(createBoard(talks, speakers).load, { roles: VOLUNTEER, url: BOARD_URL });

		expect(result).toEqual({
			visao: 'agenda',
			hoje: TODAY,
			palestras: agenda,
			horariosSugeridos: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null },
			palestrantes: [{ id: 4, nome: 'Carmélia Amorim' }],
			localPadrao: DEFAULT_TALK_LOCATION,
			isAdmin: false,
		});
		expect(talks.listAgenda).toHaveBeenCalledWith(TODAY);
	});

	it('loads the requested history page', async () => {
		const talks = createFakeTalks();
		const history = [createTalkCard(7, '2026-02-23')];
		talks.listHistory.mockResolvedValue({ rows: history, hasNext: true });

		const { result } = await runHandler(createBoard(talks).load, {
			roles: VOLUNTEER,
			url: `${BOARD_URL}?visao=historico&pagina=2`,
		});

		expect(result).toMatchObject({ visao: 'historico', palestras: history, pagina: 2, temProxima: true });
		expect(talks.listHistory).toHaveBeenCalledWith(TODAY, 2);
		expect(talks.listAgenda).not.toHaveBeenCalled();
	});

	it('falls back to the first history page for an invalid page', async () => {
		const talks = createFakeTalks();

		await runHandler(createBoard(talks).load, { roles: VOLUNTEER, url: `${BOARD_URL}?visao=historico&pagina=-3` });

		expect(talks.listHistory).toHaveBeenCalledWith(TODAY, 1);
	});

	it('flags the coordination as admin', async () => {
		const { result } = await runHandler(createBoard().load, { roles: COORDINATOR, url: BOARD_URL });

		expect(result).toMatchObject({ isAdmin: true });
	});

	it('forbids a user without a Comunicação role', async () => {
		const { error } = await expectHttpError(createBoard().load, { roles: 'secretaria', url: BOARD_URL });

		expect(error.status).toBe(403);
	});

	it('redirects an anonymous visitor', async () => {
		const { redirect } = await expectRedirect(createBoard().load, { url: BOARD_URL });

		expect(redirect).toMatchObject({ status: 302, location: '/' });
	});

	it('fails with 500 when the agenda cannot be read', async () => {
		const talks = createFakeTalks();
		talks.listAgenda.mockRejectedValue(new Error('database offline'));
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const { error } = await expectHttpError(createBoard(talks).load, { roles: VOLUNTEER, url: BOARD_URL });

		expect(error.status).toBe(500);
	});
});
