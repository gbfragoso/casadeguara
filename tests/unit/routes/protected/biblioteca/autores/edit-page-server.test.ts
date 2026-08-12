import { _createEditAuthorHandlers } from '../../../../../../src/routes/(protected)/biblioteca/autores/[id=integer]/+page.server';
import { afterEach, describe, expect, it, vi } from 'vitest';

function formRequest(nome?: FormDataEntryValue) {
	const form = new FormData();
	if (nome !== undefined) form.set('nome', nome);
	return new Request('http://localhost/biblioteca/autores/1', { method: 'POST', body: form });
}

afterEach(() => vi.restoreAllMocks());

describe('edit author page handlers', () => {
	it('redirects an unauthenticated visitor', async () => {
		const handlers = _createEditAuthorHandlers({ get: async () => undefined, update: async () => false });

		await expect(handlers.load({ locals: { user: null }, params: { id: '1' } })).rejects.toMatchObject({
			status: 302,
		});
	});

	it('loads an existing author and returns 404 when missing', async () => {
		const handlers = _createEditAuthorHandlers({
			get: async (id) => (id === 1 ? { idautor: id, nome: 'ÉRICO' } : undefined),
			update: async () => true,
		});

		expect(await handlers.load({ locals: { user: {} }, params: { id: '1' } })).toEqual({
			autor: { idautor: 1, nome: 'ÉRICO' },
		});
		await expect(handlers.load({ locals: { user: {} }, params: { id: '2' } })).rejects.toMatchObject({
			status: 404,
		});
	});

	it('updates a normalized valid name', async () => {
		const update = vi.fn(async () => true);
		const handlers = _createEditAuthorHandlers({ get: async () => undefined, update });

		const result = await handlers.actions.default({ request: formRequest(' Érico '), params: { id: '2' } });

		expect(update).toHaveBeenCalledWith(2, 'ÉRICO');
		expect(result).toEqual({ status: 200 });
	});

	it('rejects invalid values and missing updates', async () => {
		const update = vi.fn(async () => false);
		const handlers = _createEditAuthorHandlers({ get: async () => undefined, update });

		const invalid = await handlers.actions.default({ request: formRequest('123'), params: { id: '2' } });

		expect(invalid).toMatchObject({ status: 400, data: { values: { nome: '123' } } });
		expect(update).not.toHaveBeenCalled();
		await expect(
			handlers.actions.default({ request: formRequest('Érico'), params: { id: '2' } }),
		).rejects.toMatchObject({ status: 404 });
	});

	it('translates database failures to server errors', async () => {
		const handlers = _createEditAuthorHandlers({
			get: async () => Promise.reject(new Error('database')),
			update: async () => Promise.reject(new Error('database')),
		});
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(handlers.load({ locals: { user: {} }, params: { id: '1' } })).rejects.toMatchObject({
			status: 500,
		});
		await expect(
			handlers.actions.default({ request: formRequest('Érico'), params: { id: '1' } }),
		).rejects.toMatchObject({ status: 500 });
	});
});
