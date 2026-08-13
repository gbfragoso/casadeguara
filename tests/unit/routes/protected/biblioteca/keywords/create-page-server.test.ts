import { describe, expect, it, vi } from 'vitest';

import { _createNewKeywordHandlers } from '../../../../../../src/routes/(protected)/biblioteca/keywords/novo/+page.server';

const libraryUser = { roles: 'biblioteca' };
const createRequest = (key?: string | Blob) => {
	const formData = new FormData();
	if (typeof key === 'string') formData.set('chave', key);
	if (key instanceof Blob) formData.set('chave', key, 'keyword.txt');

	return new Request('http://localhost', { method: 'POST', body: formData });
};

describe('new keyword handlers', () => {
	it('allows a library loader', () => {
		const model = { create: vi.fn() };

		expect(() => _createNewKeywordHandlers(model).load({ locals: { user: libraryUser } })).not.toThrow();
	});

	it('rejects wrong-role actions before parsing or creating', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { create: vi.fn() };

		await expect(
			_createNewKeywordHandlers(model).actions.default({ locals: { user: { roles: 'secretaria' } }, request }),
		).rejects.toMatchObject({ status: 401 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.create).not.toHaveBeenCalled();
	});

	it('creates a keyword with its normalized key', async () => {
		const model = { create: vi.fn().mockResolvedValue([]) };

		await expect(
			_createNewKeywordHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createRequest('  Ficção  '),
			}),
		).resolves.toEqual({ status: 201 });
		expect(model.create).toHaveBeenCalledWith('FICÇÃO');
	});

	it.each([
		['empty', createRequest('   '), '   ', 'Palavra-chave é obrigatória.'],
		['file', createRequest(new Blob(['key'])), '', 'Palavra-chave inválida.'],
	])('returns a failure for %s input without creating', async (_, request, chave, message) => {
		const model = { create: vi.fn() };

		await expect(
			_createNewKeywordHandlers(model).actions.default({ locals: { user: libraryUser }, request }),
		).resolves.toEqual({ status: 400, data: { values: { chave }, errors: { chave: [message] } } });
		expect(model.create).not.toHaveBeenCalled();
	});

	it('translates database failures', async () => {
		const model = { create: vi.fn().mockRejectedValue(new Error('database unavailable')) };

		await expect(
			_createNewKeywordHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createRequest('Ana'),
			}),
		).rejects.toMatchObject({ status: 500, body: { message: 'Falha ao cadastrar nova palavra-chave' } });
	});
});
