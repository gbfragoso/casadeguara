import { describe, expect, it, vi } from 'vitest';

import { _createListHandlers } from '../../../../../../src/routes/(protected)/biblioteca/keywords/+page.server';

const libraryUser = { roles: 'biblioteca' };
const createRequest = (key?: string | Blob) => {
	const formData = new FormData();
	if (typeof key === 'string') formData.set('chave', key);
	if (key instanceof Blob) formData.set('chave', key, 'keyword.txt');

	return new Request('http://localhost', { method: 'POST', body: formData });
};

describe('keyword list handlers', () => {
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
		).rejects.toMatchObject({
			status: 302,
		});
		expect(formData).not.toHaveBeenCalled();
		expect(model.fetch).not.toHaveBeenCalled();
	});

	it('fetches keywords with a validated search', async () => {
		const keywords = [{ idkeyword: 1, chave: 'FICÇÃO' }];
		const model = { fetch: vi.fn().mockResolvedValue(keywords) };

		await expect(
			_createListHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createRequest(' Ficção '),
			}),
		).resolves.toEqual({ keywords, values: { chave: 'Ficção' } });
		expect(model.fetch).toHaveBeenCalledWith('Ficção');
	});

	it.each([
		['missing', createRequest(), ''],
		['file', createRequest(new Blob(['key'])), ''],
	])('returns flattened errors for %s searches without fetching', async (_, request, chave) => {
		const model = { fetch: vi.fn() };

		await expect(
			_createListHandlers(model).actions.default({ locals: { user: libraryUser }, request }),
		).resolves.toEqual({
			status: 400,
			data: { values: { chave }, errors: { chave: ['Palavra-chave inválida.'] } },
		});
		expect(model.fetch).not.toHaveBeenCalled();
	});

	it('keeps empty searches unfiltered', async () => {
		const model = { fetch: vi.fn().mockResolvedValue([]) };

		await _createListHandlers(model).actions.default({ locals: { user: libraryUser }, request: createRequest('') });

		expect(model.fetch).toHaveBeenCalledWith('');
	});

	it('translates database failures', async () => {
		const model = { fetch: vi.fn().mockRejectedValue(new Error('database unavailable')) };

		await expect(
			_createListHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createRequest('Ana'),
			}),
		).rejects.toMatchObject({ status: 500, body: { message: 'Falha ao carregar a lista de palavras-chave' } });
	});
});
