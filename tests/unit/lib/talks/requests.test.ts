import type { ActionResult } from '$app/forms';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deleteTalk, sendTalkRequest, updateTalkField } from '#lib/talks/requests.js';
import { actionError, actionFailure, actionSuccess } from './action-results.js';

const FALLBACK = 'Não foi possível salvar. Tente de novo.';
const CONFLICT_MESSAGE = 'Outra pessoa alterou esta programação. O board foi atualizado; confira e tente de novo.';

const createContext = (result: ActionResult | Error) => ({
	submit: vi.fn(() => (result instanceof Error ? Promise.reject(result) : Promise.resolve(result))),
	refresh: vi.fn(() => Promise.resolve()),
	onNotice: vi.fn(),
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('sendTalkRequest', () => {
	it('refreshes the board after a successful action', async () => {
		const context = createContext(actionSuccess({ operacao: 'criar' }));

		const result = await sendTalkRequest(context, '?/criar', { data: '2026-03-09' }, FALLBACK);

		expect(result).toEqual({ ok: true });
		expect(context.submit).toHaveBeenCalledWith('?/criar', { data: '2026-03-09' });
		expect(context.refresh).toHaveBeenCalledOnce();
	});

	it('refreshes the board and shows the notice when another person changed the talk', async () => {
		const context = createContext(actionFailure(409, { codigo: 'conflito', mensagem: CONFLICT_MESSAGE }));

		const result = await sendTalkRequest(context, '?/mover', {}, FALLBACK);

		expect(result).toEqual({ ok: false, message: CONFLICT_MESSAGE, campo: undefined, stale: true });
		expect(context.refresh).toHaveBeenCalledOnce();
		expect(context.onNotice).toHaveBeenCalledWith(CONFLICT_MESSAGE);
	});

	it('returns a validation message with its field without refreshing the board', async () => {
		const message = 'O título deve ter até 120 caracteres.';
		const context = createContext(actionFailure(400, { codigo: 'validacao', campo: 'titulo', mensagem: message }));

		const result = await sendTalkRequest(context, '?/atualizar', {}, FALLBACK);

		expect(result).toEqual({ ok: false, message, campo: 'titulo', stale: false });
		expect(context.refresh).not.toHaveBeenCalled();
	});

	it('falls back to the generic message when the server fails unexpectedly', async () => {
		const context = createContext(actionError());

		const result = await sendTalkRequest(context, '?/mover', {}, FALLBACK);

		expect(result).toEqual({ ok: false, message: FALLBACK, campo: undefined, stale: false });
	});

	it('logs a network failure and falls back to the generic message', async () => {
		const logError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const cause = new TypeError('Failed to fetch');
		const context = createContext(cause);

		const result = await sendTalkRequest(context, '?/mover', {}, FALLBACK);

		expect(result).toEqual({ ok: false, message: FALLBACK, stale: false });
		expect(logError).toHaveBeenCalledWith('comunicacao.palestras.envio_falhou', {
			action: '?/mover',
			error: cause,
		});
	});
});

describe('talk card requests', () => {
	it('sends the changed field with the version the board loaded', async () => {
		const context = createContext(actionSuccess({ versao: 4 }));

		await updateTalkField(context, { id: 31, versao: 3 }, 'titulo', 'A prece');

		expect(context.submit).toHaveBeenCalledWith('?/atualizar', {
			id: '31',
			versao: '3',
			campo: 'titulo',
			valor: 'A prece',
		});
	});

	it('shows a delete failure in the board notice', async () => {
		const context = createContext(actionError());

		await deleteTalk(context, 31);

		expect(context.submit).toHaveBeenCalledWith('?/excluir', { id: '31' });
		expect(context.onNotice).toHaveBeenCalledWith('Não foi possível excluir a palestra. Tente de novo.');
	});
});
