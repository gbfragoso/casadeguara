import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAvisoEditHandlers } from '../../../../../../src/routes/(protected)/biblioteca/avisos/[id=integer]/+page.server';

const libraryUser = { roles: 'biblioteca', username: 'bibliotecaria' };
const aviso = { idaviso: 7, dataCadastro: new Date(), texto: 'Aviso carregado', username: 'bibliotecaria' };
const params = { id: `${aviso.idaviso}` };

describe('notice edit load handler', () => {
	afterEach(() => vi.restoreAllMocks());

	it('loads an existing notice through the model after authorizing the user', async () => {
		const model = { get: vi.fn().mockResolvedValue(aviso), update: vi.fn() };

		await expect(createAvisoEditHandlers(model).load({ locals: { user: libraryUser }, params })).resolves.toEqual({
			aviso,
		});
		expect(model.get).toHaveBeenCalledWith(aviso.idaviso);
	});

	it('returns not found when the notice does not exist', async () => {
		const model = { get: vi.fn().mockResolvedValue(undefined), update: vi.fn() };

		await expect(
			createAvisoEditHandlers(model).load({ locals: { user: libraryUser }, params }),
		).rejects.toMatchObject({
			status: 404,
		});
	});

	it('redirects an unauthenticated user before consulting the model', async () => {
		const model = { get: vi.fn(), update: vi.fn() };

		await expect(createAvisoEditHandlers(model).load({ locals: { user: null }, params })).rejects.toMatchObject({
			status: 302,
		});
		expect(model.get).not.toHaveBeenCalled();
	});

	it('translates a persistence failure to an internal error', async () => {
		const model = { get: vi.fn().mockRejectedValue(new Error('database unavailable')), update: vi.fn() };
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(
			createAvisoEditHandlers(model).load({ locals: { user: libraryUser }, params }),
		).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao baixar os dados do aviso' },
		});
		expect(errorSpy).toHaveBeenCalledOnce();
	});
});
