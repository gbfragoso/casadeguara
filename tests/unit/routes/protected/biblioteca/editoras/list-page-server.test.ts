import { describe, expect, it, vi } from 'vitest';

import { _createListHandlers } from '../../../../../../src/routes/(protected)/biblioteca/editoras/+page.server';

const createRequest = (nome?: FormDataEntryValue) => {
	const formData = new FormData();
	if (nome !== undefined) formData.set('nome', nome);

	return new Request('http://localhost', { method: 'POST', body: formData });
};

describe('publisher list handlers', () => {
	it('redirects unauthenticated users', async () => {
		const handlers = _createListHandlers({ fetch: vi.fn() });

		await expect(handlers.load({ locals: { user: null } })).rejects.toMatchObject({ status: 302 });
	});

	it('fetches publishers with the validated search value', async () => {
		const editoras = [{ ideditora: 1, nome: 'EDITORA JOSÉ OLYMPIO' }];
		const model = { fetch: vi.fn().mockResolvedValue(editoras) };

		await expect(_createListHandlers(model).actions.default({ request: createRequest(' José ') })).resolves.toEqual(
			{
				editoras,
				values: { nome: 'José' },
			},
		);
		expect(model.fetch).toHaveBeenCalledWith('José');
	});

	it('returns flattened errors without fetching invalid searches', async () => {
		const model = { fetch: vi.fn() };

		await expect(_createListHandlers(model).actions.default({ request: createRequest('123') })).resolves.toEqual({
			status: 400,
			data: { values: { nome: '123' }, errors: { nome: ['Nome da editora inválido.'] } },
		});
		expect(model.fetch).not.toHaveBeenCalled();
	});

	it('translates database failures to a server error', async () => {
		const model = { fetch: vi.fn().mockRejectedValue(new Error('database unavailable')) };

		await expect(
			_createListHandlers(model).actions.default({ request: createRequest('Ana') }),
		).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao carregar a lista de editoras' },
		});
	});
});
