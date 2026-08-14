import { describe, expect, it, vi } from 'vitest';

import { DuplicateCadastroNameError } from '$lib/server/models/cadastro-error';
import { _createNewContributorHandlers } from '../../../../../../src/routes/(protected)/tesouraria/contribuintes/novo/+page.server';
import { createTesourariaRequest, tesourariaUser } from './test-support';

describe('new tesouraria contributor handlers', () => {
	it('enforces exact tesouraria access before parsing or creating', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { createTesouraria: vi.fn() };

		expect(() =>
			_createNewContributorHandlers(model).load({ locals: { user: { id: '1', roles: 'secretaria' } } }),
		).toThrow(expect.objectContaining({ status: 401 }));
		await expect(
			_createNewContributorHandlers(model).actions.default({ locals: { user: null }, request }),
		).rejects.toMatchObject({ status: 302 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.createTesouraria).not.toHaveBeenCalled();
	});

	it('does not expose authentication data from the creation load', () => {
		const model = { createTesouraria: vi.fn() };

		expect(_createNewContributorHandlers(model).load({ locals: { user: tesourariaUser } })).toBeUndefined();
	});

	it('creates only a normalized tesouraria patch with an explicit false worker value', async () => {
		const model = { createTesouraria: vi.fn().mockResolvedValue([{ idleitor: 4 }]) };

		await expect(
			_createNewContributorHandlers(model).actions.default({
				locals: { user: tesourariaUser },
				request: createTesourariaRequest({ nome: ' Maria ', telefone: '(71) 3333-3333', trab: 'false' }),
			}),
		).resolves.toEqual({ status: 201 });
		expect(model.createTesouraria).toHaveBeenCalledWith(
			{ nome: 'MARIA', telefone: '7133333333', trab: false },
			'tesouraria-user',
		);
	});

	it('defaults a missing optional worker field to false and rejects foreign fields without persisting', async () => {
		const model = { createTesouraria: vi.fn().mockResolvedValue([{ idleitor: 4 }]) };

		await expect(
			_createNewContributorHandlers(model).actions.default({
				locals: { user: tesourariaUser },
				request: createTesourariaRequest({ nome: 'Maria' }),
			}),
		).resolves.toEqual({ status: 201 });
		expect(model.createTesouraria).toHaveBeenLastCalledWith({ nome: 'MARIA', trab: false }, 'tesouraria-user');

		await expect(
			_createNewContributorHandlers(model).actions.default({
				locals: { user: tesourariaUser },
				request: createTesourariaRequest({ nome: 'Maria', cpf: '12345678909' }),
			}),
		).resolves.toMatchObject({
			status: 400,
			data: { errors: { form: ['Dados do cadastro inválidos.'] } },
		});
		expect(model.createTesouraria).toHaveBeenCalledTimes(1);
	});

	it.each([
		[
			'duplicate',
			new DuplicateCadastroNameError(),
			400,
			'Já existe um cadastro com nome idêntico. Consulte o cadastro existente.',
		],
		['database', new Error('database unavailable'), 500, 'Falha ao criar um novo contribuinte.'],
	])('maps %s creation failures', async (_, cause, status, message) => {
		const model = { createTesouraria: vi.fn().mockRejectedValue(cause) };
		const action = _createNewContributorHandlers(model).actions.default({
			locals: { user: tesourariaUser },
			request: createTesourariaRequest({ nome: 'Maria', trab: 'true' }),
		});

		if (status === 400)
			await expect(action).resolves.toMatchObject({ status, data: { errors: { nome: [message] } } });
		else await expect(action).rejects.toMatchObject({ status, body: { message } });
	});
});
