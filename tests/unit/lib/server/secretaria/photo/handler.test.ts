import { afterEach, describe, expect, it, vi } from 'vitest';

import { createPhotoHandler } from '#lib/server/secretaria/photo/handler.js';

const secretaria = { roles: 'secretaria' };
const photo = new Uint8Array([255, 216, 255, 217]);

describe('createPhotoHandler', () => {
	afterEach(() => vi.restoreAllMocks());

	it('rejects a user without Secretaria access before reading the photo', async () => {
		const readPhoto = vi.fn();

		const response = await createPhotoHandler(readPhoto)({
			locals: { user: { roles: 'biblioteca' } },
			params: { id: '4' },
		});

		expect(response.status).toBe(401);
		expect(readPhoto).not.toHaveBeenCalled();
	});

	it('serves the stored photo as a private JPEG', async () => {
		const readPhoto = vi.fn().mockResolvedValue(photo);

		const response = await createPhotoHandler(readPhoto)({ locals: { user: secretaria }, params: { id: '4' } });

		expect(readPhoto).toHaveBeenCalledWith(4);
		expect(response.headers.get('cache-control')).toBe('private, no-store');
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(photo);
	});

	it('answers 404 when the cadastro has no photo', async () => {
		const response = await createPhotoHandler(vi.fn().mockResolvedValue(null))({
			locals: { user: secretaria },
			params: { id: '4' },
		});

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ message: 'Foto não encontrada.' });
	});

	it('answers 500 with a generic message when reading fails', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		const response = await createPhotoHandler(vi.fn().mockRejectedValue(new Error('database down')))({
			locals: { user: secretaria },
			params: { id: '4' },
		});

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ message: 'Falha ao recuperar a foto do trabalhador.' });
	});
});
