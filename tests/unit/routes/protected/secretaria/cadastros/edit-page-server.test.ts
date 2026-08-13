import { describe, expect, it, vi } from 'vitest';

import { DuplicateCadastroNameError } from '$lib/server/models/cadastro-error';
import { _createEditSecretariaHandlers } from '../../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server';
import { createSecretariaRequest, secretariaContext } from './test-support';

describe('edit secretaria registration handlers', () => {
	it('enforces direct access before parsing or updating', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { getSecretaria: vi.fn(), updateSecretaria: vi.fn() };

		await expect(
			_createEditSecretariaHandlers(model).actions.default({
				...secretariaContext,
				locals: { user: null },
				request,
			}),
		).rejects.toMatchObject({ status: 302 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.updateSecretaria).not.toHaveBeenCalled();
	});

	it('loads a masked secretaria detail DTO with a timezone-safe birthday', async () => {
		const model = {
			getSecretaria: vi.fn().mockResolvedValue({
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
				aniversario: new Date('2024-02-29T00:00:00.000Z'),
				trab: false,
				userCadastro: 'private',
			}),
			updateSecretaria: vi.fn(),
		};

		await expect(_createEditSecretariaHandlers(model).load(secretariaContext)).resolves.toEqual({
			trabalhador: {
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
				aniversario: '2024-02-29',
				trab: false,
			},
		});
	});

	it('updates only normalized secretaria fields and permits clearing', async () => {
		const model = { getSecretaria: vi.fn(), updateSecretaria: vi.fn().mockResolvedValue(true) };

		await expect(
			_createEditSecretariaHandlers(model).actions.default({
				...secretariaContext,
				request: createSecretariaRequest({
					nome: ' Maria ',
					email: '',
					aniversario: '',
					removeRg: 'true',
					trab: 'false',
				}),
			}),
		).resolves.toEqual({ status: 200 });
		expect(model.updateSecretaria).toHaveBeenCalledWith(
			4,
			{ nome: 'MARIA', email: null, aniversario: null, rg: null, trab: false },
			'secretaria-user',
		);
	});

	it.each([
		['missing', false, 404, 'Trabalhador não encontrado.'],
		[
			'duplicate',
			new DuplicateCadastroNameError(),
			400,
			'Já existe um cadastro com nome idêntico. Consulte o cadastro existente.',
		],
		['database', new Error('database unavailable'), 500, 'Falha ao atualizar os dados do trabalhador.'],
	])('maps %s updates', async (_, result, status, message) => {
		const model = { getSecretaria: vi.fn(), updateSecretaria: vi.fn().mockResolvedValue(result) };
		if (result instanceof Error) model.updateSecretaria.mockRejectedValue(result);
		const action = _createEditSecretariaHandlers(model).actions.default({
			...secretariaContext,
			request: createSecretariaRequest({ nome: 'Maria', trab: 'true' }),
		});

		if (status === 400)
			await expect(action).resolves.toMatchObject({ status, data: { errors: { nome: [message] } } });
		else await expect(action).rejects.toMatchObject({ status, body: { message } });
	});
});
