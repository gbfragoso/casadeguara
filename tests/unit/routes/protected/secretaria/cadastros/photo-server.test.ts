import { describe, expect, it, vi } from 'vitest';

import { _createPhotoHandler } from '../../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/foto/+server';

const secretariaUser = { roles: 'secretaria' };
const bibliotecaUser = { roles: 'biblioteca' };
const context = { params: { id: '4' } };

describe('secretaria photo endpoint', () => {
	it('serves a private JPEG to a regular secretaria user', async () => {
		const response = await _createPhotoHandler({
			getCard: vi.fn().mockResolvedValue(Uint8Array.of(1, 2)),
		})({
			...context,
			locals: { user: secretariaUser },
		});

		expect(response.headers.get('cache-control')).toBe('private, no-store');
		expect(response.headers.get('content-type')).toBe('image/jpeg');
		expect(await response.bytes()).toEqual(Uint8Array.of(1, 2));
	});

	it.each([
		['unauthenticated', null],
		['biblioteca', bibliotecaUser],
	])('rejects %s direct photo requests', async (_, user) => {
		const model = { getCard: vi.fn() };
		const response = await _createPhotoHandler(model)({ ...context, locals: { user } });

		expect(response.status).toBe(401);
		expect(model.getCard).not.toHaveBeenCalled();
	});

	it.each([
		['missing', undefined, 404, 'Foto não encontrada.'],
		['database failure', new Error('database'), 500, 'Falha ao recuperar a foto do trabalhador.'],
	])('maps %s to a safe message', async (_, outcome, status, message) => {
		const model = { getCard: vi.fn().mockResolvedValue(outcome) };
		if (outcome instanceof Error) model.getCard.mockRejectedValue(outcome);
		const response = await _createPhotoHandler(model)({ ...context, locals: { user: secretariaUser } });

		expect(response.status).toBe(status);
		await expect(response.json()).resolves.toEqual({ message });
	});
});
