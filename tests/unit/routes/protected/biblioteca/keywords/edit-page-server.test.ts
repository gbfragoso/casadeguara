import { describe, expect, it, vi } from 'vitest';

import { _createEditKeywordHandlers } from '../../../../../../src/routes/(protected)/biblioteca/keywords/[id=integer]/+page.server';

const libraryUser = { roles: 'biblioteca' };
const context = { locals: { user: libraryUser }, params: { id: '4' } };
const createRequest = (key?: string | Blob) => {
	const formData = new FormData();
	if (typeof key === 'string') formData.set('chave', key);
	if (key instanceof Blob) formData.set('chave', key, 'keyword.txt');

	return new Request('http://localhost', { method: 'POST', body: formData });
};

describe('edit keyword handlers', () => {
	it('rejects unauthorized actions before parsing or updating', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { get: vi.fn(), update: vi.fn() };

		await expect(
			_createEditKeywordHandlers(model).actions.default({ ...context, locals: { user: null }, request }),
		).rejects.toMatchObject({ status: 302 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.update).not.toHaveBeenCalled();
	});

	it('loads an existing keyword with the parsed identifier', async () => {
		const model = { get: vi.fn().mockResolvedValue({ idkeyword: 4, chave: 'ANA' }), update: vi.fn() };

		await expect(_createEditKeywordHandlers(model).load(context)).resolves.toEqual({
			keyword: { idkeyword: 4, chave: 'ANA' },
		});
		expect(model.get).toHaveBeenCalledWith(4);
	});

	it.each([
		['missing keyword', undefined, 404, 'Palavra-chave não encontrada.'],
		['database failure', new Error('database unavailable'), 500, 'Falha ao recuperar os dados da palavra-chave'],
	])('returns %s load errors', async (_, result, status, message) => {
		const model = { get: vi.fn(), update: vi.fn() };
		if (result instanceof Error) model.get.mockRejectedValue(result);
		else model.get.mockResolvedValue(result);

		await expect(_createEditKeywordHandlers(model).load(context)).rejects.toMatchObject({
			status,
			body: { message },
		});
	});

	it('updates a keyword with its normalized key', async () => {
		const model = { get: vi.fn(), update: vi.fn().mockResolvedValue(true) };

		await expect(
			_createEditKeywordHandlers(model).actions.default({ ...context, request: createRequest('  Ficção  ') }),
		).resolves.toEqual({ status: 200 });
		expect(model.update).toHaveBeenCalledWith(4, 'FICÇÃO');
	});

	it.each([
		['numeric', createRequest('123'), '123'],
		['file', createRequest(new Blob(['key'])), ''],
	])('returns validation failures for %s input without updating', async (_, request, chave) => {
		const model = { get: vi.fn(), update: vi.fn() };

		await expect(
			_createEditKeywordHandlers(model).actions.default({ ...context, request }),
		).resolves.toEqual({
			status: 400,
			data: { values: { chave }, errors: { chave: ['Palavra-chave inválida.'] } },
		});
		expect(model.update).not.toHaveBeenCalled();
	});

	it('returns not found when no keyword is updated', async () => {
		const model = { get: vi.fn(), update: vi.fn().mockResolvedValue(false) };

		await expect(
			_createEditKeywordHandlers(model).actions.default({ ...context, request: createRequest('Ana') }),
		).rejects.toMatchObject({ status: 404, body: { message: 'Palavra-chave não encontrada.' } });
	});

	it('translates update database failures', async () => {
		const model = { get: vi.fn(), update: vi.fn().mockRejectedValue(new Error('database unavailable')) };

		await expect(
			_createEditKeywordHandlers(model).actions.default({ ...context, request: createRequest('Ana') }),
		).rejects.toMatchObject({ status: 500, body: { message: 'Falha ao atualizar os dados da palavra-chave' } });
	});
});
