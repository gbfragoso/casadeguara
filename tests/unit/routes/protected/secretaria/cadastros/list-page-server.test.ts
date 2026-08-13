import { describe, expect, it, vi } from 'vitest';

import { _createSecretariaListHandlers } from '../../../../../../src/routes/(protected)/secretaria/cadastros/+page.server';
import { createSecretariaRequest, secretariaUser } from './test-support';

describe('secretaria registration list handlers', () => {
	it('enforces exact secretaria access before parsing or fetching', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { fetchSecretaria: vi.fn() };

		expect(() =>
			_createSecretariaListHandlers(model).load({ locals: { user: { id: '1', roles: 'biblioteca' } } }),
		).toThrow(expect.objectContaining({ status: 401 }));
		await expect(
			_createSecretariaListHandlers(model).actions.default({ locals: { user: null }, request }),
		).rejects.toMatchObject({ status: 302 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.fetchSecretaria).not.toHaveBeenCalled();
	});

	it('searches with worker filtering and exposes only the secretaria list DTO', async () => {
		const model = {
			fetchSecretaria: vi.fn().mockResolvedValue([
				{
					idleitor: 4,
					nome: 'ANA',
					trab: true,
					frequencia: true,
					desencarnado: false,
					cpf: '12345678909',
					userCadastro: 'private',
				},
			]),
		};

		await expect(
			_createSecretariaListHandlers(model).actions.default({
				locals: { user: secretariaUser },
				request: createSecretariaRequest({ nome: ' Ana ', trabalhadores: 'true' }),
			}),
		).resolves.toEqual({
			cadastros: [{ idleitor: 4, nome: 'ANA', trab: true, frequencia: true, desencarnado: false }],
			values: { nome: ' Ana ', trabalhadores: 'true' },
		});
		expect(model.fetchSecretaria).toHaveBeenCalledWith('Ana', true);
	});

	it('rejects invalid and foreign search fields without fetching', async () => {
		const model = { fetchSecretaria: vi.fn() };

		await expect(
			_createSecretariaListHandlers(model).actions.default({
				locals: { user: secretariaUser },
				request: createSecretariaRequest({ nome: '123', trabalhadores: 'true', status: 'true' }),
			}),
		).resolves.toMatchObject({
			status: 400,
			data: {
				values: { nome: '123', trabalhadores: 'true' },
				errors: { nome: ['Nome do trabalhador inválido.'] },
			},
		});
		expect(model.fetchSecretaria).not.toHaveBeenCalled();
	});
});
