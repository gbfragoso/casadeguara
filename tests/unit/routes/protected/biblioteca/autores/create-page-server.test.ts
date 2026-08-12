import { describe, expect, it, vi } from 'vitest';

import { _createNewAuthorHandlers } from '../../../../../../src/routes/(protected)/biblioteca/autores/novo/+page.server';

const createRequest = (nome?: FormDataEntryValue) => {
	const formData = new FormData();
	if (nome !== undefined) formData.set('nome', nome);

	return new Request('http://localhost', { method: 'POST', body: formData });
};

describe('new author handlers', () => {
	it('redirects unauthenticated users', async () => {
		const handlers = _createNewAuthorHandlers({ create: vi.fn() });

		await expect(handlers.load({ locals: { user: null } })).rejects.toMatchObject({ status: 302 });
	});

	it('creates an author with the normalized name', async () => {
		const model = { create: vi.fn().mockResolvedValue([]) };

		await expect(
			_createNewAuthorHandlers(model).actions.default({ request: createRequest('  Conceição  ') }),
		).resolves.toEqual({
			status: 201,
		});
		expect(model.create).toHaveBeenCalledWith('CONCEIÇÃO');
	});

	it('returns flattened errors without creating an invalid author', async () => {
		const model = { create: vi.fn() };

		await expect(
			_createNewAuthorHandlers(model).actions.default({ request: createRequest('   ') }),
		).resolves.toEqual({
			status: 400,
			data: { values: { nome: '   ' }, errors: { nome: ['Nome do autor é obrigatório.'] } },
		});
		expect(model.create).not.toHaveBeenCalled();
	});

	it('translates database failures to a server error', async () => {
		const model = { create: vi.fn().mockRejectedValue(new Error('database unavailable')) };

		await expect(
			_createNewAuthorHandlers(model).actions.default({ request: createRequest('Ana') }),
		).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao criar um novo autor' },
		});
	});
});
