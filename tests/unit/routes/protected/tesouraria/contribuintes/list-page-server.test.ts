import { describe, expect, it, vi } from 'vitest';

import { _createContributorListHandlers } from '../../../../../../src/routes/(protected)/tesouraria/contribuintes/+page.server';
import { createTesourariaRequest, tesourariaUser } from './test-support';

describe('tesouraria contributor list handlers', () => {
	it('enforces exact tesouraria access before parsing or fetching', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { fetchTesouraria: vi.fn() };

		expect(() =>
			_createContributorListHandlers(model).load({ locals: { user: { id: '1', roles: 'biblioteca' } } }),
		).toThrow(expect.objectContaining({ status: 401 }));
		await expect(
			_createContributorListHandlers(model).actions.default({ locals: { user: null }, request }),
		).rejects.toMatchObject({ status: 302 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.fetchTesouraria).not.toHaveBeenCalled();
	});

	it('does not expose authentication data from the list load', () => {
		const model = { fetchTesouraria: vi.fn() };

		expect(_createContributorListHandlers(model).load({ locals: { user: tesourariaUser } })).toBeUndefined();
	});

	it('retains a valid search and exposes only the tesouraria list DTO', async () => {
		const model = {
			fetchTesouraria: vi.fn().mockResolvedValue([
				{
					idleitor: 4,
					nome: 'ANA',
					telefone: '7133333333',
					trab: true,
					cpf: '12345678909',
					userCadastro: 'private',
				},
			]),
		};

		await expect(
			_createContributorListHandlers(model).actions.default({
				locals: { user: tesourariaUser },
				request: createTesourariaRequest({ nome: ' Ana ' }),
			}),
		).resolves.toEqual({
			contribuintes: [{ idleitor: 4, nome: 'ANA', telefone: '7133333333', trab: true }],
			values: { nome: ' Ana ' },
		});
		expect(model.fetchTesouraria).toHaveBeenCalledWith('Ana');
	});

	it('rejects invalid or foreign search fields without fetching', async () => {
		const model = { fetchTesouraria: vi.fn() };

		await expect(
			_createContributorListHandlers(model).actions.default({
				locals: { user: tesourariaUser },
				request: createTesourariaRequest({ nome: '123', status: 'true' }),
			}),
		).resolves.toMatchObject({
			status: 400,
			data: {
				values: { nome: '123' },
				errors: { nome: ['Nome do contribuinte inválido.'], form: ['Dados do cadastro inválidos.'] },
			},
		});
		expect(model.fetchTesouraria).not.toHaveBeenCalled();
	});

	it('keeps unknown list failures private', async () => {
		const model = { fetchTesouraria: vi.fn().mockRejectedValue(new Error('cpf=12345678909')) };

		await expect(
			_createContributorListHandlers(model).actions.default({
				locals: { user: tesourariaUser },
				request: createTesourariaRequest({ nome: 'Ana' }),
			}),
		).rejects.toMatchObject({ status: 500, body: { message: 'Falha ao carregar a lista de contribuintes.' } });
	});
});
