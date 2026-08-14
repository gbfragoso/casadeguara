import { describe, expect, it, vi } from 'vitest';

import { DuplicateCadastroNameError } from '$lib/server/models/cadastro-error';
import { _createNewReaderHandlers } from '../../../../../../src/routes/(protected)/biblioteca/leitores/novo/+page.server';
import { createReaderRequest } from './test-support';

const libraryUser = { id: 'library-user', roles: 'biblioteca:admin' };

describe('new reader handlers', () => {
	it('enforces direct biblioteca access before parsing or creating', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { createBiblioteca: vi.fn() };

		expect(() => _createNewReaderHandlers(model).load({ locals: { user: libraryUser } })).not.toThrow();
		await expect(
			_createNewReaderHandlers(model).actions.default({
				locals: { user: { id: '1', roles: 'secretaria' } },
				request,
			}),
		).rejects.toMatchObject({ status: 401 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.createBiblioteca).not.toHaveBeenCalled();
	});

	it('creates a normalized biblioteca patch with the authenticated audit actor', async () => {
		const model = { createBiblioteca: vi.fn().mockResolvedValue([{ idleitor: 4 }]) };

		await expect(
			_createNewReaderHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createReaderRequest({
					nome: ' Maria ',
					rg: '12.345.678-9',
					cpf: '123.456.789-09',
					email: '',
					trab: 'false',
					status: 'false',
				}),
			}),
		).resolves.toEqual({ status: 201 });
		expect(model.createBiblioteca).toHaveBeenCalledWith(
			{ nome: 'MARIA', rg: '123456789', cpf: '12345678909', email: null, trab: false, status: false },
			'library-user',
		);
	});

	it('does not create on invalid input and redacts failed identifier values', async () => {
		const model = { createBiblioteca: vi.fn() };

		await expect(
			_createNewReaderHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createReaderRequest({ nome: 'Maria', cpf: '111.111.111-11', userCadastro: 'forged' }),
			}),
		).resolves.toMatchObject({ status: 400, data: { values: { nome: 'Maria', cpf: '', rg: '' } } });
		expect(model.createBiblioteca).not.toHaveBeenCalled();
	});

	it.each([
		[
			'duplicate',
			new DuplicateCadastroNameError(),
			400,
			'Já existe um cadastro com nome idêntico. Consulte o cadastro existente.',
		],
		['database', new Error('cpf=12345678909'), 500, 'Falha ao criar um novo leitor.'],
	])('maps %s creation failures', async (_, cause, status, message) => {
		const model = { createBiblioteca: vi.fn().mockRejectedValue(cause) };
		const action = _createNewReaderHandlers(model).actions.default({
			locals: { user: libraryUser },
			request: createReaderRequest({ nome: 'Maria' }),
		});

		if (status === 400)
			await expect(action).resolves.toMatchObject({ status, data: { errors: { nome: [message] } } });
		else await expect(action).rejects.toMatchObject({ status, body: { message } });
	});
});
