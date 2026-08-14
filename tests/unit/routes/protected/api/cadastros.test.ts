import { describe, expect, it, vi } from 'vitest';

import { _createCadastroFlagHandler } from '../../../../../src/routes/(protected)/api/cadastros/+server';

const secretariaUser = { id: 'secretaria-user', roles: 'secretaria:admin' };

const createRequest = (body: unknown) =>
	new Request('http://localhost/api/cadastros', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});

const getResponse = async (response: Response) => ({ status: response.status, body: await response.json() });

describe('secretaria registration flag endpoint', () => {
	it('rejects unauthenticated and foreign dashboard callers without redirecting or mutating', async () => {
		const model = { updateSecretariaFlag: vi.fn() };
		const handler = _createCadastroFlagHandler(model);

		const unauthenticated = await getResponse(
			await handler({ locals: { user: null }, request: createRequest({ id: 4, field: 'trab', value: true }) }),
		);
		const unauthorized = await getResponse(
			await handler({
				locals: { user: { id: '1', roles: 'biblioteca' } },
				request: createRequest({ id: 4, field: 'trab', value: true }),
			}),
		);

		expect(unauthenticated).toMatchObject({ status: 401, body: { message: expect.any(String) } });
		expect(unauthorized).toMatchObject({ status: 401, body: { message: expect.any(String) } });
		expect(model.updateSecretariaFlag).not.toHaveBeenCalled();
	});

	it.each([
		['malformed JSON', new Request('http://localhost', { method: 'POST', body: '{' })],
		['string id', createRequest({ id: '4', field: 'trab', value: true })],
		['string boolean', createRequest({ id: 4, field: 'trab', value: 'true' })],
		['multiple fields', createRequest({ id: 4, field: 'trab', value: true, frequencia: true })],
		['arbitrary column', createRequest({ id: 4, field: 'status', value: true })],
	])('rejects %s bodies before the model call', async (_, request) => {
		const model = { updateSecretariaFlag: vi.fn() };
		const response = await _createCadastroFlagHandler(model)({ locals: { user: secretariaUser }, request });

		expect(await getResponse(response)).toMatchObject({ status: 400, body: { errors: expect.any(Object) } });
		expect(model.updateSecretariaFlag).not.toHaveBeenCalled();
	});

	it('updates exactly one allowed flag with the authenticated audit actor', async () => {
		const model = { updateSecretariaFlag: vi.fn().mockResolvedValue(true) };

		const response = await _createCadastroFlagHandler(model)({
			locals: { user: secretariaUser },
			request: createRequest({ id: 4, field: 'frequencia', value: false }),
		});

		expect(await getResponse(response)).toEqual({
			status: 200,
			body: { message: 'Cadastro atualizado com sucesso.' },
		});
		expect(model.updateSecretariaFlag).toHaveBeenCalledWith(
			4,
			{ field: 'frequencia', value: false },
			'secretaria-user',
		);
	});

	it.each([
		['missing', false, 404, 'Cadastro não encontrado.'],
		['database failure', new Error('database unavailable'), 500, 'Falha ao atualizar o cadastro.'],
	])('maps %s flag mutations to structured Portuguese errors', async (_, outcome, status, message) => {
		const model = { updateSecretariaFlag: vi.fn().mockResolvedValue(outcome) };
		if (outcome instanceof Error) model.updateSecretariaFlag.mockRejectedValue(outcome);

		const response = await _createCadastroFlagHandler(model)({
			locals: { user: secretariaUser },
			request: createRequest({ id: 4, field: 'desencarnado', value: true }),
		});

		expect(await getResponse(response)).toEqual({ status, body: { message } });
	});
});
