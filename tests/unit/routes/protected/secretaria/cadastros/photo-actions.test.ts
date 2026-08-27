import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { INVALID_PHOTO_MESSAGE } from '$lib/validation/cadastros/foto';
import {
	reframePhoto,
	removePhoto,
	savePhoto,
} from '../../../../../../src/routes/(protected)/secretaria/cadastros/photo-actions';

const context = {
	locals: { user: { id: 'secretaria-user', roles: 'secretaria' } },
	params: { id: '4' },
	request: new Request('http://localhost', { method: 'POST' }),
};

const createPhotoRequest = (photo: File) => {
	const form = new FormData();
	form.set('foto', photo);
	form.set('focalX', '0.5');
	form.set('focalY', '0.5');
	form.set('zoom', '1');
	return new Request('http://localhost', { method: 'POST', body: form });
};

const createPositionRequest = (position = { focalX: '0.5', focalY: '0.5', zoom: '1' }) => {
	const form = new URLSearchParams(position);
	return new Request('http://localhost', { method: 'POST', body: form });
};

const validPhoto = () =>
	new File([readFileSync('tests/fixtures/amigo-fraterno-photo.jpeg')], 'photo.jpeg', { type: 'image/jpeg' });

describe('secretaria photo action failures', () => {
	it('maps an incompatible request body to a safe upload field error', async () => {
		const model = { replace: vi.fn() };
		const request = new Request('http://localhost', { method: 'POST', body: 'not multipart' });

		const result = await savePhoto(model, { ...context, request });

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

	it('maps an invalid upload to a safe form message without writing', async () => {
		const model = { replace: vi.fn(), remove: vi.fn(), getSource: vi.fn(), reframe: vi.fn() };
		const result = await savePhoto(model, {
			...context,
			request: createPhotoRequest(new File(['invalid'], 'photo.txt', { type: 'text/plain' })),
		});

		expect(result).toMatchObject({ status: 400, data: { errors: { foto: [INVALID_PHOTO_MESSAGE] } } });
		expect(model.replace).not.toHaveBeenCalled();
	});

	it('normalizes and persists a valid upload through the photo facade', async () => {
		const model = {
			replace: vi.fn().mockResolvedValue(true),
			remove: vi.fn(),
			getSource: vi.fn(),
			reframe: vi.fn(),
		};

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
		const model = {
			replace: vi.fn().mockResolvedValue(false),
			remove: vi.fn(),
			getSource: vi.fn(),
			reframe: vi.fn(),
		};

		await expect(savePhoto(model, { ...context, request: createPhotoRequest(validPhoto()) })).rejects.toMatchObject(
			{
				status: 404,
			},
		);
	});

	it('maps a decode failure to a safe validation message', async () => {
		const model = { replace: vi.fn(), remove: vi.fn(), getSource: vi.fn(), reframe: vi.fn() };
		const invalidImage = new File(['not-an-image'], 'photo.jpeg', { type: 'image/jpeg' });

		const result = await savePhoto(model, { ...context, request: createPhotoRequest(invalidImage) });

		expect(result).toMatchObject({ status: 400, data: { errors: { foto: expect.any(Array) } } });
		expect(model.replace).not.toHaveBeenCalled();
	});

	it('maps a persistence failure without exposing the database cause', async () => {
		const model = {
			replace: vi.fn().mockRejectedValue(new Error('database password')),
			remove: vi.fn(),
			getSource: vi.fn(),
			reframe: vi.fn(),
		};

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
			getSource: vi.fn(),
			reframe: vi.fn(),
		};

		await expect(removePhoto(model, context)).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao remover a foto do trabalhador.' },
		});
	});

	it('returns success when the photo facade removes an existing photo', async () => {
		const model = {
			replace: vi.fn(),
			remove: vi.fn().mockResolvedValue(true),
			getSource: vi.fn(),
			reframe: vi.fn(),
		};

		await expect(removePhoto(model, context)).resolves.toEqual({ operation: 'photoRemoved', status: 200 });
	});

	it('maps a missing cadastro during removal to not found', async () => {
		const model = {
			replace: vi.fn(),
			remove: vi.fn().mockResolvedValue(false),
			getSource: vi.fn(),
			reframe: vi.fn(),
		};

		await expect(removePhoto(model, context)).rejects.toMatchObject({ status: 404 });
	});

	it('reframes the current source and persists only a new card', async () => {
		const source = new Uint8Array(readFileSync('tests/fixtures/amigo-fraterno-photo.jpeg'));
		const model = {
			replace: vi.fn(),
			remove: vi.fn(),
			getSource: vi.fn().mockResolvedValue(source),
			reframe: vi.fn().mockResolvedValue('updated'),
		};

		await expect(reframePhoto(model, { ...context, request: createPositionRequest() })).resolves.toEqual({
			operation: 'photoReframed',
			status: 200,
		});
		expect(model.reframe).toHaveBeenCalledWith(4, source, expect.any(Uint8Array), 'secretaria-user');
	});

	it('maps a reframe conflict to a retryable field error', async () => {
		const model = {
			replace: vi.fn(),
			remove: vi.fn(),
			getSource: vi
				.fn()
				.mockResolvedValue(new Uint8Array(readFileSync('tests/fixtures/amigo-fraterno-photo.jpeg'))),
			reframe: vi.fn().mockResolvedValue('conflict'),
		};

		await expect(reframePhoto(model, { ...context, request: createPositionRequest() })).resolves.toMatchObject({
			status: 409,
			data: {
				errors: {
					enquadramento: ['A foto foi alterada em outra operação. Recarregue a página e tente novamente.'],
				},
			},
		});
	});

	it('does not reframe when no source exists', async () => {
		const model = {
			replace: vi.fn(),
			remove: vi.fn(),
			getSource: vi.fn().mockResolvedValue(null),
			reframe: vi.fn(),
		};

		await expect(reframePhoto(model, { ...context, request: createPositionRequest() })).rejects.toMatchObject({
			status: 404,
		});
		expect(model.reframe).not.toHaveBeenCalled();
	});

	it('maps a missing photo result from the facade to not found', async () => {
		const model = {
			replace: vi.fn(),
			remove: vi.fn(),
			getSource: vi
				.fn()
				.mockResolvedValue(new Uint8Array(readFileSync('tests/fixtures/amigo-fraterno-photo.jpeg'))),
			reframe: vi.fn().mockResolvedValue('missing'),
		};

		await expect(reframePhoto(model, { ...context, request: createPositionRequest() })).rejects.toMatchObject({
			status: 404,
		});
	});

	it('maps a reframe persistence failure without exposing the cause', async () => {
		const model = {
			replace: vi.fn(),
			remove: vi.fn(),
			getSource: vi
				.fn()
				.mockResolvedValue(new Uint8Array(readFileSync('tests/fixtures/amigo-fraterno-photo.jpeg'))),
			reframe: vi.fn().mockRejectedValue(new Error('database password')),
		};

		await expect(reframePhoto(model, { ...context, request: createPositionRequest() })).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao reenquadrar a foto do trabalhador.' },
		});
	});

	it('rejects an invalid reframe position before reading the source', async () => {
		const model = { replace: vi.fn(), remove: vi.fn(), getSource: vi.fn(), reframe: vi.fn() };

		const result = await reframePhoto(model, {
			...context,
			request: createPositionRequest({ focalX: 'NaN', focalY: '0.5', zoom: '1' }),
		});

		expect(result).toMatchObject({ status: 400, data: { errors: { focalX: expect.any(Array) } } });
		expect(model.getSource).not.toHaveBeenCalled();
	});

	it('maps an incompatible reframe body to an enquadramento error', async () => {
		const model = { getSource: vi.fn(), reframe: vi.fn() };
		const request = new Request('http://localhost', { method: 'POST', body: 'not form encoded' });

		const result = await reframePhoto(model, { ...context, request });

		expect(result).toMatchObject({ status: 400, data: { errors: { enquadramento: expect.any(Array) } } });
		expect(model.getSource).not.toHaveBeenCalled();
	});
});
