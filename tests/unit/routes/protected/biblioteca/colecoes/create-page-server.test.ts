import { describe, expect, it, vi } from 'vitest';

import { _createNewColecaoHandlers } from '../../../../../../src/routes/(protected)/biblioteca/colecoes/novo/+page.server';

const libraryUser = { roles: 'biblioteca' };
const createRequest = (name?: string | Blob) => {
	const formData = new FormData();
	if (typeof name === 'string') formData.set('nome', name);
	if (name instanceof Blob) formData.set('nome', name, 'collection.txt');

	return new Request('http://localhost', { method: 'POST', body: formData });
};

describe('new collection handlers', () => {
	it('allows a library loader', () => {
		const model = { create: vi.fn() };

		expect(() => _createNewColecaoHandlers(model).load({ locals: { user: libraryUser } })).not.toThrow();
	});

	it('rejects wrong-role actions before parsing or creating', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { create: vi.fn() };

		await expect(
			_createNewColecaoHandlers(model).actions.default({ locals: { user: { roles: 'secretaria' } }, request }),
		).rejects.toMatchObject({ status: 401 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.create).not.toHaveBeenCalled();
	});

	it('creates a collection with its normalized name', async () => {
		const model = { create: vi.fn().mockResolvedValue([]) };

		await expect(
			_createNewColecaoHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createRequest('  Ficção  '),
			}),
		).resolves.toEqual({ status: 201 });
		expect(model.create).toHaveBeenCalledWith('FICÇÃO');
	});

	it.each([
		['blank', createRequest('   '), '   ', 'Nome da coleção é obrigatório.'],
		['missing', createRequest(), '', 'Nome da coleção é obrigatório.'],
		['file', createRequest(new Blob(['name'])), '', 'Nome da coleção inválido.'],
		['invalid', createRequest('123'), '123', 'Nome da coleção inválido.'],
		['overlong', createRequest('a'.repeat(61)), 'a'.repeat(61), 'Nome da coleção excede o limite de caracteres.'],
	])('returns a failure for %s input without creating', async (_, request, nome, message) => {
		const model = { create: vi.fn() };

		await expect(
			_createNewColecaoHandlers(model).actions.default({ locals: { user: libraryUser }, request }),
		).resolves.toEqual({ status: 400, data: { values: { nome }, errors: { nome: [message] } } });
		expect(model.create).not.toHaveBeenCalled();
	});

	it('translates database failures', async () => {
		const model = { create: vi.fn().mockRejectedValue(new Error('database unavailable')) };

		await expect(
			_createNewColecaoHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createRequest('Ana'),
			}),
		).rejects.toMatchObject({ status: 500, body: { message: 'Falha ao criar uma nova coleção' } });
	});
});
