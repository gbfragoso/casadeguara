import { _createListAuthorHandlers } from '../../../../../../src/routes/(protected)/biblioteca/autores/+page.server';
import { afterEach, describe, expect, it, vi } from 'vitest';

function formRequest(nome?: FormDataEntryValue) {
	const form = new FormData();
	if (nome !== undefined) form.set('nome', nome);
	return new Request('http://localhost/biblioteca/autores', { method: 'POST', body: form });
}

afterEach(() => vi.restoreAllMocks());

describe('author list page handlers', () => {
	it('redirects an unauthenticated visitor', async () => {
		const handlers = _createListAuthorHandlers({ fetch: async () => [] });

		await expect(handlers.load({ locals: { user: null } })).rejects.toMatchObject({ status: 302, location: '/' });
	});

	it('fetches a valid persisted search value', async () => {
		const fetch = vi.fn(async () => [{ idautor: 1, nome: 'ÉRICO' }]);
		const handlers = _createListAuthorHandlers({ fetch });

		const result = await handlers.actions.default({ request: formRequest(' Érico ') });

		expect(fetch).toHaveBeenCalledWith('Érico');
		expect(result).toEqual({ autores: [{ idautor: 1, nome: 'ÉRICO' }], values: { nome: 'Érico' } });
	});

	it('returns flattened validation errors without fetching', async () => {
		const fetch = vi.fn(async () => []);
		const handlers = _createListAuthorHandlers({ fetch });

		const result = await handlers.actions.default({ request: formRequest('123') });

		expect(fetch).not.toHaveBeenCalled();
		expect(result).toEqual({
			status: 400,
			data: { values: { nome: '123' }, errors: { nome: ['Nome do autor inválido.'] } },
		});
	});

	it('translates database failures to a server error', async () => {
		const handlers = _createListAuthorHandlers({ fetch: async () => Promise.reject(new Error('database')) });
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(handlers.actions.default({ request: formRequest('Érico') })).rejects.toMatchObject({
			status: 500,
		});
	});
});
