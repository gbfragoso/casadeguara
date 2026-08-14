import { describe, expect, it, vi } from 'vitest';

import { DuplicateCadastroNameError } from '$lib/server/models/cadastro-error';
import { _createEditContributorHandlers } from '../../../../../../src/routes/(protected)/tesouraria/contribuintes/[id=integer]/+page.server';
import { contributorDetail, createTesourariaRequest, tesourariaContext } from './test-support';

describe('tesouraria contributor edit handlers', () => {
	it('enforces direct access before parsing, loading, or updating', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { getTesouraria: vi.fn(), updateTesouraria: vi.fn() };

		await expect(
			_createEditContributorHandlers(model).actions.default({
				...tesourariaContext,
				locals: { user: null },
				request,
			}),
		).rejects.toMatchObject({ status: 302 });
		await expect(
			_createEditContributorHandlers(model).load({
				...tesourariaContext,
				locals: { user: { id: '1', roles: 'biblioteca' } },
			}),
		).rejects.toMatchObject({ status: 401 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.getTesouraria).not.toHaveBeenCalled();
		expect(model.updateTesouraria).not.toHaveBeenCalled();
	});

	it('loads only the tesouraria contributor detail DTO', async () => {
		const model = {
			getTesouraria: vi.fn().mockResolvedValue(contributorDetail),
			updateTesouraria: vi.fn(),
		};

		await expect(_createEditContributorHandlers(model).load(tesourariaContext)).resolves.toEqual({
			contribuinte: { nome: 'MARIA', telefone: '7133333333', trab: true },
		});
	});

	it('updates only normalized tesouraria fields and rejects foreign fields without updating', async () => {
		const model = { getTesouraria: vi.fn(), updateTesouraria: vi.fn().mockResolvedValue(true) };

		await expect(
			_createEditContributorHandlers(model).actions.default({
				...tesourariaContext,
				request: createTesourariaRequest({ nome: ' Maria ', telefone: '', trab: 'false' }),
			}),
		).resolves.toEqual({ status: 200 });
		expect(model.updateTesouraria).toHaveBeenCalledWith(
			4,
			{ nome: 'MARIA', telefone: null, trab: false },
			'tesouraria-user',
		);

		await expect(
			_createEditContributorHandlers(model).actions.default({
				...tesourariaContext,
				request: createTesourariaRequest({ nome: 'Maria', trab: 'true', status: 'true' }),
			}),
		).resolves.toMatchObject({
			status: 400,
			data: { errors: { form: ['Dados do cadastro inválidos.'] } },
		});
		expect(model.updateTesouraria).toHaveBeenCalledTimes(1);
	});

	it.each([
		['missing detail', undefined, 404, 'Contribuinte não encontrado.'],
		['detail database', new Error('database unavailable'), 500, 'Falha ao recuperar os dados do contribuinte.'],
	])('maps %s outcomes', async (_, result, status, message) => {
		const model = { getTesouraria: vi.fn().mockResolvedValue(result), updateTesouraria: vi.fn() };
		if (result instanceof Error) model.getTesouraria.mockRejectedValue(result);

		await expect(_createEditContributorHandlers(model).load(tesourariaContext)).rejects.toMatchObject({
			status,
			body: { message },
		});
	});

	it.each([
		['missing update', false, 404, 'Contribuinte não encontrado.'],
		[
			'duplicate',
			new DuplicateCadastroNameError(),
			400,
			'Já existe um cadastro com nome idêntico. Consulte o cadastro existente.',
		],
		['database', new Error('database unavailable'), 500, 'Falha ao atualizar os dados do contribuinte.'],
	])('maps %s update outcomes', async (_, result, status, message) => {
		const model = { getTesouraria: vi.fn(), updateTesouraria: vi.fn().mockResolvedValue(result) };
		if (result instanceof Error) model.updateTesouraria.mockRejectedValue(result);
		const action = _createEditContributorHandlers(model).actions.default({
			...tesourariaContext,
			request: createTesourariaRequest({ nome: 'Maria', trab: 'true' }),
		});

		if (status === 400)
			await expect(action).resolves.toMatchObject({ status, data: { errors: { nome: [message] } } });
		else await expect(action).rejects.toMatchObject({ status, body: { message } });
	});
});
