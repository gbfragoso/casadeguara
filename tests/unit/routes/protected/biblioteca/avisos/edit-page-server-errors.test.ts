import { afterEach, describe, expect, it, vi } from 'vitest';

import { _createAvisoEditHandlers } from '../../../../../../src/routes/(protected)/biblioteca/avisos/[id=integer]/+page.server';

const libraryUser = { roles: 'biblioteca', username: 'bibliotecaria' };
const params = { id: '7' };

const createRequest = (texto?: FormDataEntryValue) => {
	const formData = new FormData();
	if (texto !== undefined) formData.set('texto', texto);

	return new Request('http://localhost', { method: 'POST', body: formData });
};

describe('notice edit action', () => {
	afterEach(() => vi.restoreAllMocks());

	it('updates a valid notice once', async () => {
		const model = { get: vi.fn(), update: vi.fn().mockResolvedValue(true) };

		await expect(
			_createAvisoEditHandlers(model).actions.default({
				locals: { user: libraryUser },
				params,
				request: createRequest('  Texto preservado  '),
			}),
		).resolves.toEqual({ status: 200 });
		expect(model.update).toHaveBeenCalledWith(7, '  Texto preservado  ');
	});

	it('returns validation failures without updating', async () => {
		const model = { get: vi.fn(), update: vi.fn() };

		await expect(
			_createAvisoEditHandlers(model).actions.default({
				locals: { user: libraryUser },
				params,
				request: createRequest('   '),
			}),
		).resolves.toMatchObject({ status: 400, data: { values: { texto: '   ' } } });
		expect(model.update).not.toHaveBeenCalled();
	});

	it('returns not found when the update has no matching notice', async () => {
		const model = { get: vi.fn(), update: vi.fn().mockResolvedValue(false) };

		await expect(
			_createAvisoEditHandlers(model).actions.default({
				locals: { user: libraryUser },
				params,
				request: createRequest('Aviso'),
			}),
		).rejects.toMatchObject({ status: 404 });
	});

	it('translates an update persistence failure to an internal error', async () => {
		const model = { get: vi.fn(), update: vi.fn().mockRejectedValue(new Error('database unavailable')) };
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(
			_createAvisoEditHandlers(model).actions.default({
				locals: { user: libraryUser },
				params,
				request: createRequest('Aviso'),
			}),
		).rejects.toMatchObject({ status: 500, body: { message: 'Falha ao atualizar o texto do aviso' } });
		expect(errorSpy).toHaveBeenCalledOnce();
	});
});
