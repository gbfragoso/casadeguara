import { describe, expect, it, vi } from 'vitest';

import { _createEditSecretariaHandlers } from '../../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server';
import { createSecretariaRequest, secretariaContext, secretariaDetail } from './test-support';

describe('edit secretaria registration handlers', () => {
	it('enforces direct access before parsing or updating', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = {
			getSecretaria: vi.fn(),
			updateSecretaria: vi.fn(),
			replaceSecretariaPhoto: vi.fn(),
			removeSecretariaPhoto: vi.fn(),
		};

		await expect(
			_createEditSecretariaHandlers(model).actions.salvarCadastro({
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
			getSecretaria: vi.fn().mockResolvedValue(secretariaDetail),
			updateSecretaria: vi.fn(),
			replaceSecretariaPhoto: vi.fn(),
			removeSecretariaPhoto: vi.fn(),
		};

		await expect(_createEditSecretariaHandlers(model).load(secretariaContext)).resolves.toEqual({
			id: 4,
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
				hasPhoto: false,
			},
		});
	});

	it('updates only normalized secretaria fields and permits clearing', async () => {
		const model = {
			getSecretaria: vi.fn(),
			updateSecretaria: vi.fn().mockResolvedValue(true),
			replaceSecretariaPhoto: vi.fn(),
			removeSecretariaPhoto: vi.fn(),
		};

		await expect(
			_createEditSecretariaHandlers(model).actions.salvarCadastro({
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

	it('routes photo actions to the dedicated photo facade', async () => {
		const model = { getSecretaria: vi.fn(), updateSecretaria: vi.fn() };
		const photoModel = {
			replace: vi.fn(),
			remove: vi.fn().mockResolvedValue(true),
			getSource: vi.fn(),
			reframe: vi.fn(),
		};
		const handlers = _createEditSecretariaHandlers(model, photoModel);

		await expect(
			handlers.actions.salvarFoto({
				...secretariaContext,
				request: new Request('http://localhost', { method: 'POST', body: new FormData() }),
			}),
		).resolves.toMatchObject({ status: 400 });
		await expect(
			handlers.actions.removerFoto({
				...secretariaContext,
				request: new Request('http://localhost', { method: 'POST' }),
			}),
		).resolves.toEqual({
			operation: 'photoRemoved',
			status: 200,
		});
		expect(photoModel.remove).toHaveBeenCalledWith(4, 'secretaria-user');
		await expect(
			handlers.actions.reenquadrarFoto({
				...secretariaContext,
				request: new Request('http://localhost', {
					method: 'POST',
					body: new URLSearchParams({ focalX: '0.5', focalY: '0.5', zoom: '1' }),
				}),
			}),
		).rejects.toMatchObject({ status: 404 });
	});
});
