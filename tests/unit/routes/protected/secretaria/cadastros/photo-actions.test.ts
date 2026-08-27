import { readFileSync } from 'node:fs';

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

const validPhoto = () =>
	new File([readFileSync('tests/fixtures/amigo-fraterno-photo.jpeg')], 'photo.jpeg', { type: 'image/jpeg' });

describe('secretaria photo action failures', () => {
	it('maps an invalid upload to a safe form message without writing', async () => {
		const model = { replace: vi.fn(), remove: vi.fn() };
		const result = await savePhoto(model, {
			...context,
			request: createPhotoRequest(new File(['invalid'], 'photo.txt', { type: 'text/plain' })),
		});

		expect(result).toMatchObject({ status: 400, data: { errors: { foto: ['Foto inválida.'] } } });
		expect(model.replace).not.toHaveBeenCalled();
	});

	it('normalizes and persists a valid upload through the photo facade', async () => {
		const model = { replace: vi.fn().mockResolvedValue(true), remove: vi.fn() };

		const result = await savePhoto(model, { ...context, request: createPhotoRequest(validPhoto()) });

		expect(result).toEqual({ operation: 'photoSaved', status: 200 });
		expect(model.replace).toHaveBeenCalledWith(
			4,
			expect.any(Uint8Array),
			expect.any(Uint8Array),
			'secretaria-user',
		);
	});

	it('maps a missing cadastro after a valid upload to not found', async () => {
		const model = { replace: vi.fn().mockResolvedValue(false), remove: vi.fn() };

		await expect(savePhoto(model, { ...context, request: createPhotoRequest(validPhoto()) })).rejects.toMatchObject(
			{
				status: 404,
			},
		);
	});

	it('maps a decode failure to a safe validation message', async () => {
		const model = { replace: vi.fn(), remove: vi.fn() };
		const invalidImage = new File(['not-an-image'], 'photo.jpeg', { type: 'image/jpeg' });

		const result = await savePhoto(model, { ...context, request: createPhotoRequest(invalidImage) });

		expect(result).toMatchObject({ status: 400, data: { errors: { foto: expect.any(Array) } } });
		expect(model.replace).not.toHaveBeenCalled();
	});

	it('maps a persistence failure without exposing the database cause', async () => {
		const model = { replace: vi.fn().mockRejectedValue(new Error('database password')), remove: vi.fn() };

		await expect(savePhoto(model, { ...context, request: createPhotoRequest(validPhoto()) })).rejects.toMatchObject(
			{
				status: 500,
				body: { message: 'Falha ao salvar a foto do trabalhador.' },
			},
		);
	});

	it('maps a photo removal failure without exposing the database cause', async () => {
		const model = {
			replace: vi.fn(),
			remove: vi.fn().mockRejectedValue(new Error('database password')),
		};

		await expect(removePhoto(model, context)).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao remover a foto do trabalhador.' },
		});
	});

	it('returns success when the photo facade removes an existing photo', async () => {
		const model = { replace: vi.fn(), remove: vi.fn().mockResolvedValue(true) };

		await expect(removePhoto(model, context)).resolves.toEqual({ operation: 'photoRemoved', status: 200 });
	});

	it('maps a missing cadastro during removal to not found', async () => {
		const model = { replace: vi.fn(), remove: vi.fn().mockResolvedValue(false) };

		await expect(removePhoto(model, context)).rejects.toMatchObject({ status: 404 });
	});
});
