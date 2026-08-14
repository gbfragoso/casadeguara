import { describe, expect, it, vi } from 'vitest';

import { DuplicateCadastroNameError } from '$lib/server/models/cadastro-error';
import { _createEditReaderHandlers } from '../../../../../../src/routes/(protected)/biblioteca/leitores/[id=integer]/+page.server';
import { createReaderRequest, readerContext } from './test-support';

describe('edit reader handlers', () => {
	it('enforces direct access before parsing or updating', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { getBiblioteca: vi.fn(), updateBiblioteca: vi.fn() };

		await expect(
			_createEditReaderHandlers(model).actions.default({ ...readerContext, locals: { user: null }, request }),
		).rejects.toMatchObject({ status: 302 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.updateBiblioteca).not.toHaveBeenCalled();
	});

	it('loads an approved detail DTO with masked identifiers only', async () => {
		const model = {
			getBiblioteca: vi.fn().mockResolvedValue({
				nome: 'MARIA',
				rg: '123456789',
				cpf: '12345678909',
				email: null,
				celular: null,
				telefone: null,
				logradouro: null,
				bairro: null,
				complemento: null,
				cidade: null,
				cep: null,
				trab: false,
				status: true,
				userCadastro: 'private',
			}),
			updateBiblioteca: vi.fn(),
		};

		await expect(_createEditReaderHandlers(model).load(readerContext)).resolves.toEqual({
			leitor: {
				nome: 'MARIA',
				rgMask: '12.***.***-89',
				cpfMask: '123.***.***-09',
				email: null,
				celular: null,
				telefone: null,
				logradouro: null,
				bairro: null,
				complemento: null,
				cidade: null,
				cep: null,
				trab: false,
				status: true,
			},
		});
	});

	it('updates normalized owned fields and permits explicit clearing', async () => {
		const model = { getBiblioteca: vi.fn(), updateBiblioteca: vi.fn().mockResolvedValue(true) };

		await expect(
			_createEditReaderHandlers(model).actions.default({
				...readerContext,
				request: createReaderRequest({
					nome: ' Maria ',
					email: '',
					cpf: '',
					removeRg: 'true',
					trab: 'false',
					status: 'false',
				}),
			}),
		).resolves.toEqual({ status: 200 });
		expect(model.updateBiblioteca).toHaveBeenCalledWith(
			4,
			{ nome: 'MARIA', email: null, rg: null, trab: false, status: false },
			'library-user',
		);
	});

	it.each([
		['missing', undefined, 404, 'Leitor não encontrado.'],
		['load failure', new Error('database unavailable'), 500, 'Falha ao recuperar os dados do leitor.'],
	])('maps %s detail results', async (_, result, status, message) => {
		const model = { getBiblioteca: vi.fn(), updateBiblioteca: vi.fn() };
		if (result instanceof Error) model.getBiblioteca.mockRejectedValue(result);
		else model.getBiblioteca.mockResolvedValue(result);

		await expect(_createEditReaderHandlers(model).load(readerContext)).rejects.toMatchObject({
			status,
			body: { message },
		});
	});

	it.each([
		['missing', false, 404, 'Leitor não encontrado.'],
		[
			'duplicate',
			new DuplicateCadastroNameError(),
			400,
			'Já existe um cadastro com nome idêntico. Consulte o cadastro existente.',
		],
		['database', new Error('database unavailable'), 500, 'Falha ao atualizar os dados do leitor.'],
	])('maps %s updates', async (_, result, status, message) => {
		const model = { getBiblioteca: vi.fn(), updateBiblioteca: vi.fn().mockResolvedValue(result) };
		if (result instanceof Error) model.updateBiblioteca.mockRejectedValue(result);
		const action = _createEditReaderHandlers(model).actions.default({
			...readerContext,
			request: createReaderRequest({ nome: 'Maria' }),
		});

		if (status === 400)
			await expect(action).resolves.toMatchObject({ status, data: { errors: { nome: [message] } } });
		else await expect(action).rejects.toMatchObject({ status, body: { message } });
	});
});
