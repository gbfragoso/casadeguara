import { afterEach, describe, expect, it, vi } from 'vitest';

import { createLancamentoDescriptionHandlers } from '#lib/server/tesouraria/lancamentos/description-handlers.js';
import { alreadyReversedError, notFoundError, validationError } from '#lib/server/tesouraria/lancamentos/errors.js';
import { createRequestEvent } from '../../../../../integration/support/request-event';

type DescriptionModel = Parameters<typeof createLancamentoDescriptionHandlers>[0]['model'];

const user = { id: 'tesoureiro', roles: 'tesouraria', username: 'tesoureiro', name: 'Tesoureiro' };

const formEvent = (entries: Record<string, string>) => {
	const form = new FormData();
	Object.entries(entries).forEach(([key, value]) => form.set(key, value));
	return createRequestEvent({
		locals: { user, session: null },
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});
};

const createModel = (overrides: Partial<DescriptionModel> = {}): DescriptionModel => ({
	updateDescription: vi.fn().mockResolvedValue({ id: 7, descricao: 'Doação corrigida' }),
	...overrides,
});

const editDescription = (model: DescriptionModel, entries = { id: '7', descricao: '  Doação corrigida  ' }) =>
	createLancamentoDescriptionHandlers({ model }).actions.editarDescricao(formEvent(entries));

afterEach(() => {
	vi.restoreAllMocks();
});

describe('editarDescricao action', () => {
	it('authorizes before reading the form or calling the model', async () => {
		const model = createModel();
		const requireAccess = vi.fn(() => {
			throw new Error('forbidden');
		});
		const event = formEvent({ id: '7', descricao: 'Doação' });
		const readRequest = vi.spyOn(event.request, 'formData');

		const action = createLancamentoDescriptionHandlers({ model, requireAccess }).actions.editarDescricao(event);

		await expect(action).rejects.toThrow('forbidden');
		expect(readRequest).not.toHaveBeenCalled();
		expect(model.updateDescription).not.toHaveBeenCalled();
	});

	it('returns not found for an invalid id without calling the model', async () => {
		const model = createModel();

		const result = await editDescription(model, { id: 'abc', descricao: 'Doação' });

		expect(result).toMatchObject({ status: 404, data: { message: 'Lançamento não encontrado.' } });
		expect(model.updateDescription).not.toHaveBeenCalled();
	});

	it('returns the schema message for an invalid description without calling the model', async () => {
		const model = createModel();

		const result = await editDescription(model, { id: '7', descricao: '   ' });

		expect(result).toMatchObject({ status: 400, data: { message: 'Descrição é obrigatória.' } });
		expect(model.updateDescription).not.toHaveBeenCalled();
	});

	it('saves the normalized description as the authenticated user', async () => {
		const model = createModel();
		const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

		const result = await editDescription(model);

		expect(result).toEqual({ id: 7, descricao: 'Doação corrigida' });
		expect(model.updateDescription).toHaveBeenCalledWith(7, 'Doação corrigida', user.id);
		expect(info).toHaveBeenCalledWith('treasury.launches.description_updated', { id: 7, userId: user.id });
	});

	it.each([
		[validationError('Descrição inválida.'), 400],
		[notFoundError(), 404],
		[alreadyReversedError(), 409],
	])('translates the model error %s', async (cause, status) => {
		const model = createModel({ updateDescription: vi.fn().mockRejectedValue(cause) });

		const result = await editDescription(model);

		expect(result).toMatchObject({ status, data: { message: cause.message } });
	});

	it('fails with 500 without leaking an unexpected cause', async () => {
		const model = createModel({ updateDescription: vi.fn().mockRejectedValue(new Error('secret cause')) });
		const logError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const action = editDescription(model);

		await expect(action).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao alterar a descrição do lançamento.' },
		});
		expect(logError).toHaveBeenCalledWith('treasury.launches.description_update_failed');
		expect(logError.mock.calls.flat()).not.toContain('secret cause');
	});
});
