import { afterEach, describe, expect, it, vi } from 'vitest';

import { _createAvisosPageHandlers } from '../../../../../../src/routes/(protected)/biblioteca/avisos/+page.server';

const libraryUser = { roles: 'biblioteca', username: 'bibliotecaria' };

const createRequest = (texto?: FormDataEntryValue) => {
	const formData = new FormData();
	if (texto !== undefined) formData.set('texto', texto);

	return new Request('http://localhost', { method: 'POST', body: formData });
};

describe('notice list handlers', () => {
	afterEach(() => vi.restoreAllMocks());

	it('loads notices through the model after authorizing the user', async () => {
		const avisos = [{ idaviso: 3, dataCadastro: new Date(), texto: 'Aviso', username: 'bibliotecaria' }];
		const model = { create: vi.fn(), listRecent: vi.fn().mockResolvedValue(avisos) };

		await expect(_createAvisosPageHandlers(model).load({ locals: { user: libraryUser } })).resolves.toEqual({
			avisos,
		});
		expect(model.listRecent).toHaveBeenCalledOnce();
	});

	it('redirects an unauthenticated load before consulting the model', async () => {
		const model = { create: vi.fn(), listRecent: vi.fn() };

		await expect(_createAvisosPageHandlers(model).load({ locals: { user: null } })).rejects.toMatchObject({
			status: 302,
		});
		expect(model.listRecent).not.toHaveBeenCalled();
	});

	it('translates a list persistence failure to an internal error', async () => {
		const model = { create: vi.fn(), listRecent: vi.fn().mockRejectedValue(new Error('database unavailable')) };
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(_createAvisosPageHandlers(model).load({ locals: { user: libraryUser } })).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao carregar a lista de avisos' },
		});
		expect(errorSpy).toHaveBeenCalledOnce();
	});

	it('creates a validated notice with the authenticated username', async () => {
		const model = { create: vi.fn().mockResolvedValue({}), listRecent: vi.fn() };

		await expect(
			_createAvisosPageHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createRequest('  Aviso preservado  '),
			}),
		).resolves.toEqual({ status: 201 });
		expect(model.create).toHaveBeenCalledWith('  Aviso preservado  ', libraryUser.username);
	});
});
