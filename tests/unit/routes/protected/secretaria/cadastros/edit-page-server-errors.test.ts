import { describe, expect, it, vi } from 'vitest';

import { DuplicateCadastroNameError } from '$lib/server/models/cadastro-error';
import { _createEditSecretariaHandlers } from '../../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server';
import { createSecretariaRequest, secretariaContext, secretariaDetail } from './test-support';

describe('secretaria registration edit errors', () => {
	it.each([
		['missing', undefined, 404, 'Trabalhador não encontrado.'],
		['database', new Error('database unavailable'), 500, 'Falha ao recuperar os dados do trabalhador.'],
	])('maps %s detail outcomes', async (_, result, status, message) => {
		const model = { getSecretaria: vi.fn().mockResolvedValue(result), updateSecretaria: vi.fn() };
		if (result instanceof Error) model.getSecretaria.mockRejectedValue(result);

		await expect(_createEditSecretariaHandlers(model).load(secretariaContext)).rejects.toMatchObject({
			status,
			body: { message },
		});
	});

	it('keeps a missing birthday null in the detail DTO', async () => {
		const model = {
			getSecretaria: vi.fn().mockResolvedValue({ ...secretariaDetail, aniversario: null }),
			updateSecretaria: vi.fn(),
		};

		await expect(_createEditSecretariaHandlers(model).load(secretariaContext)).resolves.toMatchObject({
			trabalhador: { aniversario: null },
		});
	});

	it('does not update when a foreign form field is sent', async () => {
		const model = { getSecretaria: vi.fn(), updateSecretaria: vi.fn() };

		await expect(
			_createEditSecretariaHandlers(model).actions.default({
				...secretariaContext,
				request: createSecretariaRequest({ nome: 'Maria', trab: 'true', status: 'true' }),
			}),
		).resolves.toMatchObject({
			status: 400,
			data: { errors: { form: ['Dados do cadastro inválidos.'] } },
		});
		expect(model.updateSecretaria).not.toHaveBeenCalled();
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
