import { describe, expect, it, vi } from 'vitest';

import { INVALID_PHOTO_MESSAGE } from '$lib/validation/cadastros/foto';
import { savePhoto } from '../../../../../../src/lib/server/secretaria/photo/actions';
import { context, createPhotoRequest, validPhoto } from './actions-test-support';

describe('secretaria photo upload action', () => {
	it('maps an incompatible request body to a safe upload field error', async () => {
		const model = { replace: vi.fn() };
		const result = await savePhoto(model, {
			...context,
			request: new Request('http://localhost', { method: 'POST', body: 'not multipart' }),
		});

		expect(result).toMatchObject({ status: 400, data: { errors: { foto: [INVALID_PHOTO_MESSAGE] } } });
		expect(model.replace).not.toHaveBeenCalled();
	});

	it('maps unknown multipart fields to a form error without writing', async () => {
		const model = { replace: vi.fn() };
		const form = new FormData();
		form.set('foto', validPhoto());
		form.set('focalX', '0.5');
		form.set('focalY', '0.5');
		form.set('zoom', '1');
		form.set('privateBytes', 'secret');
		const result = await savePhoto(model, {
			...context,
			request: new Request('http://localhost', { method: 'POST', body: form }),
		});

		expect(result).toMatchObject({ status: 400, data: { errors: { form: expect.any(Array) } } });
		expect(model.replace).not.toHaveBeenCalled();
	});

	it('maps invalid and undecodable uploads to validation errors without writing', async () => {
		const model = { replace: vi.fn() };
		const invalidType = await savePhoto(model, {
			...context,
			request: createPhotoRequest(new File(['invalid'], 'photo.txt', { type: 'text/plain' })),
		});
		const invalidImage = await savePhoto(model, {
			...context,
			request: createPhotoRequest(new File(['invalid'], 'photo.jpeg', { type: 'image/jpeg' })),
		});

		expect(invalidType).toMatchObject({ status: 400, data: { errors: { foto: [INVALID_PHOTO_MESSAGE] } } });
		expect(invalidImage).toMatchObject({ status: 400, data: { errors: { foto: expect.any(Array) } } });
		expect(model.replace).not.toHaveBeenCalled();
	});

	it('normalizes and persists a valid upload through the photo facade', async () => {
		const model = { replace: vi.fn().mockResolvedValue(true) };
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
		const model = { replace: vi.fn().mockResolvedValue(false) };

		await expect(savePhoto(model, { ...context, request: createPhotoRequest(validPhoto()) })).rejects.toMatchObject(
			{ status: 404 },
		);
	});

	it('maps a persistence failure without exposing the database cause', async () => {
		const model = { replace: vi.fn().mockRejectedValue(new Error('database password')) };

		await expect(savePhoto(model, { ...context, request: createPhotoRequest(validPhoto()) })).rejects.toMatchObject(
			{ status: 500, body: { message: 'Falha ao salvar a foto do trabalhador.' } },
		);
	});
});
