import { describe, expect, it, vi } from 'vitest';

import { _createReaderListHandlers } from '../../../../../../src/routes/(protected)/biblioteca/leitores/+page.server';
import { createReaderRequest, libraryUser } from './test-support';

describe('reader list handlers', () => {
	it('enforces exact biblioteca access before parsing or fetching', async () => {
		const request = new Request('http://localhost', { method: 'POST' });
		const formData = vi.spyOn(request, 'formData');
		const model = { fetchBiblioteca: vi.fn() };

		expect(() =>
			_createReaderListHandlers(model).load({ locals: { user: { id: '1', roles: 'bibliotecario' } } }),
		).toThrow(expect.objectContaining({ status: 401 }));
		await expect(
			_createReaderListHandlers(model).actions.default({ locals: { user: null }, request }),
		).rejects.toMatchObject({ status: 302 });
		expect(formData).not.toHaveBeenCalled();
		expect(model.fetchBiblioteca).not.toHaveBeenCalled();
	});

	it('searches with a normalized name and exposes only the list DTO', async () => {
		const model = {
			fetchBiblioteca: vi.fn().mockResolvedValue([
				{
					idleitor: 4,
					nome: 'ANA',
					trab: false,
					status: true,
					cpf: '12345678909',
					userCadastro: 'private',
				},
			]),
		};

		await expect(
			_createReaderListHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createReaderRequest({ nome: ' Ana ' }),
			}),
		).resolves.toEqual({
			leitores: [{ idleitor: 4, nome: 'ANA', trab: false, status: true }],
			values: { nome: 'Ana' },
		});
		expect(model.fetchBiblioteca).toHaveBeenCalledWith('Ana');
	});

	it('keeps safe invalid search values without fetching', async () => {
		const model = { fetchBiblioteca: vi.fn() };

		await expect(
			_createReaderListHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createReaderRequest({ nome: '123' }),
			}),
		).resolves.toEqual({
			status: 400,
			data: { values: { nome: '123' }, errors: { nome: ['Nome do leitor inválido.'] } },
		});
		expect(model.fetchBiblioteca).not.toHaveBeenCalled();
	});

	it('maps unavailable searches to a private server error', async () => {
		const model = { fetchBiblioteca: vi.fn().mockRejectedValue(new Error('cpf=12345678909')) };

		await expect(
			_createReaderListHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createReaderRequest({ nome: '' }),
			}),
		).rejects.toMatchObject({ status: 500, body: { message: 'Falha ao carregar a lista de leitores.' } });
	});
});
