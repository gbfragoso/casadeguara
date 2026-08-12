import { describe, expect, it, vi } from 'vitest';

import { _createEditAuthorHandlers } from '../../../../../../src/routes/(protected)/biblioteca/autores/[id=integer]/+page.server';

const createRequest = (nome?: FormDataEntryValue) => {
	const formData = new FormData();
	if (nome !== undefined) formData.set('nome', nome);

	return new Request('http://localhost', { method: 'POST', body: formData });
};

const context = { locals: { user: { id: 'admin' } }, params: { id: '4' } };

describe('edit author handlers', () => {
	it('redirects unauthenticated users', async () => {
		const handlers = _createEditAuthorHandlers({ get: vi.fn(), update: vi.fn() });

		await expect(handlers.load({ ...context, locals: { user: null } })).rejects.toMatchObject({ status: 302 });
	});

	it('loads an existing author with the parsed route identifier', async () => {
		const model = { get: vi.fn().mockResolvedValue({ idautor: 4, nome: 'ANA' }), update: vi.fn() };

		await expect(_createEditAuthorHandlers(model).load(context)).resolves.toEqual({
			autor: { idautor: 4, nome: 'ANA' },
		});
		expect(model.get).toHaveBeenCalledWith(4);
	});

	it('returns a not-found error for a missing author', async () => {
		const handlers = _createEditAuthorHandlers({ get: vi.fn().mockResolvedValue(undefined), update: vi.fn() });

		await expect(handlers.load(context)).rejects.toMatchObject({
			status: 404,
			body: { message: 'Autor não encontrado.' },
		});
	});

	it('translates failed loads to a server error', async () => {
		const handlers = _createEditAuthorHandlers({
			get: vi.fn().mockRejectedValue(new Error('database unavailable')),
			update: vi.fn(),
		});

		await expect(handlers.load(context)).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao baixar os dados do autor' },
		});
	});

	it('updates an author with the normalized name', async () => {
		const model = { get: vi.fn(), update: vi.fn().mockResolvedValue(true) };

		await expect(
			_createEditAuthorHandlers(model).actions.default({
				request: createRequest('  Ana  '),
				params: context.params,
			}),
		).resolves.toEqual({ status: 200 });
		expect(model.update).toHaveBeenCalledWith(4, 'ANA');
	});

	it('returns validation errors without updating', async () => {
		const model = { get: vi.fn(), update: vi.fn() };

		await expect(
			_createEditAuthorHandlers(model).actions.default({ request: createRequest('123'), params: context.params }),
		).resolves.toEqual({
			status: 400,
			data: { values: { nome: '123' }, errors: { nome: ['Nome do autor inválido.'] } },
		});
		expect(model.update).not.toHaveBeenCalled();
	});

	it('returns not found when the author cannot be updated', async () => {
		const handlers = _createEditAuthorHandlers({ get: vi.fn(), update: vi.fn().mockResolvedValue(false) });

		await expect(
			handlers.actions.default({ request: createRequest('Ana'), params: context.params }),
		).rejects.toMatchObject({ status: 404 });
	});

	it('translates failed updates to a server error', async () => {
		const handlers = _createEditAuthorHandlers({
			get: vi.fn(),
			update: vi.fn().mockRejectedValue(new Error('database unavailable')),
		});

		await expect(
			handlers.actions.default({ request: createRequest('Ana'), params: context.params }),
		).rejects.toMatchObject({ status: 500, body: { message: 'Falha ao atualizar os dados do autor' } });
	});
});
