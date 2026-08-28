import { afterEach, describe, expect, it, vi } from 'vitest';

import { db } from '$lib/server/database/connection';
import { SecretariaPhotoModel } from '$lib/server/models/secretaria-photo';

import { createRawCadastro, createTestName, deleteCadastro, model, readCadastro } from './test-support';

const photoModel = new SecretariaPhotoModel(db);

describe('CadastroModel secretaria photo updates', () => {
	afterEach(() => vi.restoreAllMocks());
	it('replaces, reads, and audits a photo without changing the participation flag', async () => {
		const created = await createRawCadastro(createTestName('photo-replace'));
		const source = new Uint8Array([1, 2, 3]);
		const card = new Uint8Array([4, 5]);

		try {
			expect(await photoModel.replace(created.idleitor, source, card, 'secretaria-actor')).toBe(true);
			expect(
				await photoModel.replace(created.idleitor, Uint8Array.of(6), Uint8Array.of(7), 'secretaria-actor'),
			).toBe(true);
			expect(await photoModel.getSource(created.idleitor)).toEqual(Uint8Array.of(6));
			expect(await photoModel.getCard(created.idleitor)).toEqual(Uint8Array.of(7));
			expect(await model.getSecretaria(created.idleitor)).toMatchObject({ hasPhoto: true });
			expect(await readCadastro(created.idleitor)).toMatchObject({
				amigoFraterno: false,
				userAlteracao: 'secretaria-actor',
				dataAlteracao: expect.any(Date),
			});
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('removes a photo atomically and allows idempotent removal', async () => {
		const created = await createRawCadastro(createTestName('photo-remove'));

		try {
			await photoModel.replace(created.idleitor, new Uint8Array([1]), new Uint8Array([2]), 'secretaria-actor');

			expect(await photoModel.remove(created.idleitor, 'secretaria-actor')).toBe(true);
			expect(await photoModel.remove(created.idleitor, 'secretaria-actor')).toBe(true);
			expect(await photoModel.getCard(created.idleitor)).toBeNull();
			expect(await model.getSecretaria(created.idleitor)).toMatchObject({ hasPhoto: false });
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('reports missing photo targets without writing a partial update', async () => {
		expect(await photoModel.replace(-1, new Uint8Array([1]), new Uint8Array([2]), 'secretaria-actor')).toBe(false);
		expect(await photoModel.getCard(-1)).toBeUndefined();
		expect(await photoModel.remove(-1, 'secretaria-actor')).toBe(false);
		expect(await photoModel.reframe(-1, Uint8Array.of(1), Uint8Array.of(2), 'secretaria-actor')).toBe('missing');
	});

	it('preserves the existing photo when its audit update fails', async () => {
		const created = await createRawCadastro(createTestName('photo-rollback'));
		const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		try {
			await expect(
				photoModel.replace(created.idleitor, new Uint8Array([1]), new Uint8Array([2]), 'x'.repeat(31)),
			).rejects.toThrow();
			expect(await photoModel.getCard(created.idleitor)).toBeNull();
			expect(errorLog).toHaveBeenCalledWith(
				'amigo_fraterno.photo_persistence_failed',
				expect.objectContaining({ cadastroId: created.idleitor }),
			);
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('reframes only when the expected source is still current', async () => {
		const created = await createRawCadastro(createTestName('photo-reframe'));
		const source = Uint8Array.of(1, 2);

		try {
			await photoModel.replace(created.idleitor, source, Uint8Array.of(3), 'secretaria-actor');
			expect(await photoModel.reframe(created.idleitor, source, Uint8Array.of(4), 'secretaria-actor')).toBe(
				'updated',
			);
			expect(await photoModel.getSource(created.idleitor)).toEqual(source);
			expect(await photoModel.getCard(created.idleitor)).toEqual(Uint8Array.of(4));
			expect(
				await photoModel.reframe(created.idleitor, Uint8Array.of(9), Uint8Array.of(8), 'secretaria-actor'),
			).toBe('conflict');
			expect(await photoModel.getCard(created.idleitor)).toEqual(Uint8Array.of(4));
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('reports a conflict when a reframe source is stale', async () => {
		const created = await createRawCadastro(createTestName('photo-stale-reframe'));
		const staleSource = Uint8Array.of(1, 2);

		try {
			await photoModel.replace(created.idleitor, staleSource, Uint8Array.of(3), 'secretaria-actor');
			await photoModel.replace(created.idleitor, Uint8Array.of(6, 7), Uint8Array.of(5), 'secretaria-actor');
			expect(await photoModel.reframe(created.idleitor, staleSource, Uint8Array.of(4), 'secretaria-actor')).toBe(
				'conflict',
			);
			expect(await photoModel.getCard(created.idleitor)).toEqual(Uint8Array.of(5));
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('keeps the photo when a removal audit cannot be committed', async () => {
		const created = await createRawCadastro(createTestName('photo-remove-rollback'));

		try {
			await photoModel.replace(created.idleitor, Uint8Array.of(1), Uint8Array.of(2), 'secretaria-actor');
			await expect(photoModel.remove(created.idleitor, 'x'.repeat(31))).rejects.toThrow();
			expect(await photoModel.getCard(created.idleitor)).toEqual(Uint8Array.of(2));
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});
});
