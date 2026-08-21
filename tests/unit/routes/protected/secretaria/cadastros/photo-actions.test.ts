import { describe, expect, it, vi } from 'vitest';

import { removePhoto, savePhoto } from '../../../../../../src/routes/(protected)/secretaria/cadastros/photo-actions';

const context = {
	locals: { user: { id: 'secretaria-user', roles: 'secretaria' } },
	params: { id: '4' },
	request: new Request('http://localhost', { method: 'POST' }),
};

const createPhotoRequest = (photo: File) => {
	const form = new FormData();
	form.set('foto', photo);
	return new Request('http://localhost', { method: 'POST', body: form });
};

describe('secretaria photo action failures', () => {
	it('maps an invalid upload to a safe form message without writing', async () => {
		const model = { replaceSecretariaPhoto: vi.fn(), removeSecretariaPhoto: vi.fn() };
		const result = await savePhoto(model, {
			...context,
			request: createPhotoRequest(new File(['invalid'], 'photo.txt', { type: 'text/plain' })),
		});

		expect(result).toMatchObject({ status: 400, data: { errors: { foto: ['Foto inválida.'] } } });
		expect(model.replaceSecretariaPhoto).not.toHaveBeenCalled();
	});

	it('maps a photo removal failure without exposing the database cause', async () => {
		const model = {
			replaceSecretariaPhoto: vi.fn(),
			removeSecretariaPhoto: vi.fn().mockRejectedValue(new Error('database password')),
		};

		await expect(removePhoto(model, context)).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao remover a foto do trabalhador.' },
		});
	});
});
