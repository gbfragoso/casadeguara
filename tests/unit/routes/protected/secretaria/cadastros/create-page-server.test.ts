import { describe, expect, it, vi } from 'vitest';

import { DuplicateCadastroNameError } from '$lib/server/models/cadastro-error';
import { _createNewSecretariaHandlers } from '../../../../../../src/routes/(protected)/secretaria/cadastros/novo/+page.server';
import { createSecretariaRequest, secretariaUser } from './test-support';

describe('new secretaria registration handlers', () => {
	it('enforces exact secretaria access before parsing or creating', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { createSecretaria: vi.fn() };

		await expect(
			_createNewSecretariaHandlers(model).actions.default({
				locals: { user: { id: '1', roles: 'tesouraria' } },
				request,
			}),
		).rejects.toMatchObject({ status: 401 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.createSecretaria).not.toHaveBeenCalled();
	});

	it('creates a normalized secretaria patch with explicit false and null values', async () => {
		const model = { createSecretaria: vi.fn().mockResolvedValue([{ idleitor: 4 }]) };

		await expect(
			_createNewSecretariaHandlers(model).actions.default({
				locals: { user: secretariaUser },
				request: createSecretariaRequest({
					nome: ' Maria ',
					rg: '12.345.678-9',
					cpf: '123.456.789-09',
					email: '',
					celular: '',
					telefone: '',
					aniversario: '',
					trab: 'false',
				}),
			}),
		).resolves.toEqual({ status: 201 });
		expect(model.createSecretaria).toHaveBeenCalledWith(
			{
				nome: 'MARIA',
				rg: '123456789',
				cpf: '12345678909',
				email: null,
				celular: null,
				telefone: null,
				aniversario: null,
				trab: false,
			},
			'secretaria-user',
		);
	});

	it('rejects invalid or foreign input without persisting and redacts identifiers', async () => {
		const model = { createSecretaria: vi.fn() };

		await expect(
			_createNewSecretariaHandlers(model).actions.default({
				locals: { user: secretariaUser },
				request: createSecretariaRequest({ nome: '123', cpf: '111.111.111-11', status: 'true' }),
			}),
		).resolves.toMatchObject({
			status: 400,
			data: { values: { nome: '123', cpf: '', rg: '' }, errors: { nome: ['Nome do trabalhador inválido.'] } },
		});
		expect(model.createSecretaria).not.toHaveBeenCalled();
	});

	it.each([
		[
			'duplicate',
			new DuplicateCadastroNameError(),
			400,
			'Já existe um cadastro com nome idêntico. Consulte o cadastro existente.',
		],
		['database', new Error('cpf=12345678909'), 500, 'Falha ao criar um novo trabalhador.'],
	])('maps %s creation failures', async (_, cause, status, message) => {
		const model = { createSecretaria: vi.fn().mockRejectedValue(cause) };
		const action = _createNewSecretariaHandlers(model).actions.default({
			locals: { user: secretariaUser },
			request: createSecretariaRequest({ nome: 'Maria', trab: 'true' }),
		});

		if (status === 400)
			await expect(action).resolves.toMatchObject({ status, data: { errors: { nome: [message] } } });
		else await expect(action).rejects.toMatchObject({ status, body: { message } });
	});
});
