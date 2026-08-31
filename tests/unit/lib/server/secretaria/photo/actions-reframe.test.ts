import { describe, expect, it, vi } from 'vitest';

import { reframePhoto, removePhoto } from '../../../../../../src/lib/server/secretaria/photo/actions';
import { context, createPositionRequest, sourcePhoto } from './actions-test-support';

describe('secretaria photo removal and reframe actions', () => {
	it('maps a photo removal failure without exposing the database cause', async () => {
		const model = { remove: vi.fn().mockRejectedValue(new Error('database password')) };

		await expect(removePhoto(model, context)).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao remover a foto do trabalhador.' },
		});
	});

	it('returns success when the photo facade removes an existing photo', async () => {
		const model = { remove: vi.fn().mockResolvedValue(true) };

		expect(await removePhoto(model, context)).toEqual({ operation: 'photoRemoved', status: 200 });
	});

	it('maps a missing cadastro during removal to not found', async () => {
		const model = { remove: vi.fn().mockResolvedValue(false) };

		await expect(removePhoto(model, context)).rejects.toMatchObject({ status: 404 });
	});

	it('reframes the current source and persists only a new card', async () => {
		const source = sourcePhoto();
		const model = { getSource: vi.fn().mockResolvedValue(source), reframe: vi.fn().mockResolvedValue('updated') };

		expect(await reframePhoto(model, { ...context, request: createPositionRequest() })).toEqual({
			operation: 'photoReframed',
			status: 200,
		});
		expect(model.reframe).toHaveBeenCalledWith(4, source, expect.any(Uint8Array), 'secretaria-user');
	});

	it('maps a reframe conflict to a retryable field error', async () => {
		const model = {
			getSource: vi.fn().mockResolvedValue(sourcePhoto()),
			reframe: vi.fn().mockResolvedValue('conflict'),
		};

		expect(await reframePhoto(model, { ...context, request: createPositionRequest() })).toMatchObject({
			status: 409,
			data: { errors: { enquadramento: expect.any(Array) } },
		});
	});

	it('maps missing source and facade results to not found', async () => {
		const noSource = { getSource: vi.fn().mockResolvedValue(null), reframe: vi.fn() };
		const missing = {
			getSource: vi.fn().mockResolvedValue(sourcePhoto()),
			reframe: vi.fn().mockResolvedValue('missing'),
		};

		await expect(reframePhoto(noSource, { ...context, request: createPositionRequest() })).rejects.toMatchObject({
			status: 404,
		});
		await expect(reframePhoto(missing, { ...context, request: createPositionRequest() })).rejects.toMatchObject({
			status: 404,
		});
	});

	it('maps reframe persistence failures without exposing the cause', async () => {
		const model = {
			getSource: vi.fn().mockResolvedValue(sourcePhoto()),
			reframe: vi.fn().mockRejectedValue(new Error('database password')),
		};

		await expect(reframePhoto(model, { ...context, request: createPositionRequest() })).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao reenquadrar a foto do trabalhador.' },
		});
	});

	it('rejects invalid or incompatible reframe requests before reading the source', async () => {
		const model = { getSource: vi.fn(), reframe: vi.fn() };
		const invalid = await reframePhoto(model, {
			...context,
			request: createPositionRequest({ focalX: 'NaN', focalY: '0.5', zoom: '1' }),
		});
		const incompatible = await reframePhoto(model, {
			...context,
			request: new Request('http://localhost', { method: 'POST', body: 'not form encoded' }),
		});

		expect(invalid).toMatchObject({ status: 400, data: { errors: { focalX: expect.any(Array) } } });
		expect(incompatible).toMatchObject({ status: 400, data: { errors: { enquadramento: expect.any(Array) } } });
		expect(model.getSource).not.toHaveBeenCalled();
	});
});
