import { describe, expect, it, vi } from 'vitest';

import { _createEditColecaoHandlers } from '../../../../../../src/routes/(protected)/biblioteca/colecoes/[id=integer]/+page.server';

const libraryUser = { roles: 'biblioteca' };
const context = { locals: { user: libraryUser }, params: { id: '4' } };
const createRequest = (name?: string | Blob) => {
	const formData = new FormData();
	if (typeof name === 'string') formData.set('nome', name);
	if (name instanceof Blob) formData.set('nome', name, 'collection.txt');

	return new Request('http://localhost', { method: 'POST', body: formData });
};

describe('edit collection handlers', () => {
	it('rejects unauthorized actions before parsing or updating', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { get: vi.fn(), update: vi.fn() };

		await expect(
			_createEditColecaoHandlers(model).actions.default({ ...context, locals: { user: null }, request }),
		).rejects.toMatchObject({ status: 302 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.update).not.toHaveBeenCalled();
	});

	it('loads an existing collection with the parsed identifier', async () => {
		const model = { get: vi.fn().mockResolvedValue({ idserie: 4, nome: 'ANA' }), update: vi.fn() };

		await expect(_createEditColecaoHandlers(model).load(context)).resolves.toEqual({
			colecao: { idserie: 4, nome: 'ANA' },
		});
		expect(model.get).toHaveBeenCalledWith(4);
	});

	it.each([
		['missing collection', undefined, 404, 'Coleção não encontrada.'],
		['database failure', new Error('database unavailable'), 500, 'Falha ao recuperar os dados da coleção'],
	])('returns %s load errors', async (_, result, status, message) => {
		const model = { get: vi.fn(), update: vi.fn() };
		if (result instanceof Error) model.get.mockRejectedValue(result);
		else model.get.mockResolvedValue(result);

		await expect(_createEditColecaoHandlers(model).load(context)).rejects.toMatchObject({
			status,
			body: { message },
		});
	});

	it('updates a collection with its normalized name', async () => {
		const model = { get: vi.fn(), update: vi.fn().mockResolvedValue(true) };

		await expect(
			_createEditColecaoHandlers(model).actions.default({ ...context, request: createRequest('  Ficção  ') }),
		).resolves.toEqual({ status: 200 });
		expect(model.update).toHaveBeenCalledWith(4, 'FICÇÃO');
	});

	it.each([
		['numeric', createRequest('123'), '123', 'Nome da coleção inválido.'],
		['file', createRequest(new Blob(['name'])), '', 'Nome da coleção inválido.'],
		['overlong', createRequest('a'.repeat(61)), 'a'.repeat(61), 'Nome da coleção excede o limite de caracteres.'],
	])('returns validation failures for %s input without updating', async (_, request, nome, message) => {
		const model = { get: vi.fn(), update: vi.fn() };

		await expect(_createEditColecaoHandlers(model).actions.default({ ...context, request })).resolves.toEqual({
			status: 400,
			data: { values: { nome }, errors: { nome: [message] } },
		});
		expect(model.update).not.toHaveBeenCalled();
	});

	it('returns not found when no collection is updated', async () => {
		const model = { get: vi.fn(), update: vi.fn().mockResolvedValue(false) };

		await expect(
			_createEditColecaoHandlers(model).actions.default({ ...context, request: createRequest('Ana') }),
		).rejects.toMatchObject({ status: 404, body: { message: 'Coleção não encontrada.' } });
	});

	it('translates update database failures', async () => {
		const model = { get: vi.fn(), update: vi.fn().mockRejectedValue(new Error('database unavailable')) };

		await expect(
			_createEditColecaoHandlers(model).actions.default({ ...context, request: createRequest('Ana') }),
		).rejects.toMatchObject({ status: 500, body: { message: 'Falha ao atualizar os dados da coleção' } });
	});
});
