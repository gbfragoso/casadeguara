import { describe, expect, it, vi } from 'vitest';

import { _createEditEditoraHandlers } from '../../../../../../src/routes/(protected)/biblioteca/editoras/[id=integer]/+page.server';

const createRequest = (nome?: FormDataEntryValue) => {
	const formData = new FormData();
	if (nome !== undefined) formData.set('nome', nome);

	return new Request('http://localhost', { method: 'POST', body: formData });
};

const context = { locals: { user: { id: 'admin' } }, params: { id: '4' } };

describe('edit publisher handlers', () => {
	it('redirects unauthenticated users', async () => {
		const handlers = _createEditEditoraHandlers({ get: vi.fn(), update: vi.fn() });

		await expect(handlers.load({ ...context, locals: { user: null } })).rejects.toMatchObject({ status: 302 });
	});

	it('loads an existing publisher with the parsed route identifier', async () => {
		const model = { get: vi.fn().mockResolvedValue({ ideditora: 4, nome: 'ANA' }), update: vi.fn() };

		await expect(_createEditEditoraHandlers(model).load(context)).resolves.toEqual({
			editora: { ideditora: 4, nome: 'ANA' },
		});
		expect(model.get).toHaveBeenCalledWith(4);
	});

	it.each([
		['returns a not-found error for a missing publisher', undefined, 404, 'Editora não encontrada.'],
		[
			'translates failed loads to a server error',
			new Error('database unavailable'),
			500,
			'Falha ao buscar os dados da editora',
		],
	])('%s', async (_, outcome, status, message) => {
		const get = outcome instanceof Error ? vi.fn().mockRejectedValue(outcome) : vi.fn().mockResolvedValue(outcome);

		await expect(_createEditEditoraHandlers({ get, update: vi.fn() }).load(context)).rejects.toMatchObject({
			status,
			body: { message },
		});
	});

	it('updates a publisher with the normalized name', async () => {
		const model = { get: vi.fn(), update: vi.fn().mockResolvedValue(true) };

		await expect(
			_createEditEditoraHandlers(model).actions.default({
				request: createRequest('  Ana  '),
				params: context.params,
			}),
		).resolves.toEqual({ status: 200 });
		expect(model.update).toHaveBeenCalledWith(4, 'ANA');
	});

	it('returns validation errors without updating', async () => {
		const model = { get: vi.fn(), update: vi.fn() };

		await expect(
			_createEditEditoraHandlers(model).actions.default({
				request: createRequest('123'),
				params: context.params,
			}),
		).resolves.toEqual({
			status: 400,
			data: { values: { nome: '123' }, errors: { nome: ['Nome da editora inválido.'] } },
		});
		expect(model.update).not.toHaveBeenCalled();
	});

	it.each([
		['returns not found when the publisher cannot be updated', false, 404, 'Editora não encontrada.'],
		[
			'translates failed updates to a server error',
			new Error('database unavailable'),
			500,
			'Falha ao atualizar os dados da editora',
		],
	])('%s', async (_, outcome, status, message) => {
		const update =
			outcome instanceof Error ? vi.fn().mockRejectedValue(outcome) : vi.fn().mockResolvedValue(outcome);
		const handlers = _createEditEditoraHandlers({ get: vi.fn(), update });

		await expect(
			handlers.actions.default({ request: createRequest('Ana'), params: context.params }),
		).rejects.toMatchObject({
			status,
			body: { message },
		});
	});
});
