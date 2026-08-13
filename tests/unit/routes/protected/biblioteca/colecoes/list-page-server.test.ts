import { describe, expect, it, vi } from 'vitest';

import { _createListHandlers } from '../../../../../../src/routes/(protected)/biblioteca/colecoes/+page.server';

const libraryUser = { roles: 'biblioteca' };
const createRequest = (name?: string | Blob) => {
	const formData = new FormData();
	if (typeof name === 'string') formData.set('nome', name);
	if (name instanceof Blob) formData.set('nome', name, 'collection.txt');

	return new Request('http://localhost', { method: 'POST', body: formData });
};

describe('collection list handlers', () => {
	it('allows a library loader without fetching', () => {
		const model = { fetch: vi.fn() };

		expect(_createListHandlers(model).load({ locals: { user: libraryUser } })).toBeUndefined();
		expect(model.fetch).not.toHaveBeenCalled();
	});

	it('rejects a wrong-role loader before fetching', () => {
		const model = { fetch: vi.fn() };

		expect(() => _createListHandlers(model).load({ locals: { user: { roles: 'secretaria' } } })).toThrow(
			expect.objectContaining({ status: 401 }),
		);
		expect(model.fetch).not.toHaveBeenCalled();
	});

	it('rejects unauthorized actions before parsing or fetching', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { fetch: vi.fn() };

		await expect(
			_createListHandlers(model).actions.default({ locals: { user: null }, request }),
		).rejects.toMatchObject({ status: 302 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.fetch).not.toHaveBeenCalled();
	});

	it('fetches collections with a trimmed validated search', async () => {
		const colecoes = [{ idserie: 1, nome: 'FICÇÃO' }];
		const model = { fetch: vi.fn().mockResolvedValue(colecoes) };

		await expect(
			_createListHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createRequest(' Ficção '),
			}),
		).resolves.toEqual({ colecoes, values: { nome: 'Ficção' } });
		expect(model.fetch).toHaveBeenCalledWith('Ficção');
	});

	it('keeps empty searches unfiltered', async () => {
		const model = { fetch: vi.fn().mockResolvedValue([]) };

		await _createListHandlers(model).actions.default({ locals: { user: libraryUser }, request: createRequest('') });

		expect(model.fetch).toHaveBeenCalledWith('');
	});

	it.each([
		['invalid', createRequest('123'), '123', 'Nome da coleção inválido.'],
		['missing', createRequest(), '', 'Nome da coleção inválido.'],
		['file', createRequest(new Blob(['name'])), '', 'Nome da coleção inválido.'],
	])('returns flattened errors for %s searches without fetching', async (_, request, nome, message) => {
		const model = { fetch: vi.fn() };

		await expect(
			_createListHandlers(model).actions.default({ locals: { user: libraryUser }, request }),
		).resolves.toEqual({ status: 400, data: { values: { nome }, errors: { nome: [message] } } });
		expect(model.fetch).not.toHaveBeenCalled();
	});

	it('translates database failures', async () => {
		const model = { fetch: vi.fn().mockRejectedValue(new Error('database unavailable')) };

		await expect(
			_createListHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createRequest('Ana'),
			}),
		).rejects.toMatchObject({ status: 500, body: { message: 'Falha ao carregar a lista de coleções' } });
	});
});
