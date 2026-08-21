import { afterEach, describe, expect, it, vi } from 'vitest';

import { createRawCadastro, createTestName, deleteCadastro, model, readCadastro } from './test-support';

describe('CadastroModel secretaria photo updates', () => {
	afterEach(() => vi.restoreAllMocks());
	it('replaces, reads, and audits a photo without changing the participation flag', async () => {
		const created = await createRawCadastro(createTestName('photo-replace'));
		const photo = new Uint8Array([1, 2, 3]);

		try {
			expect(await model.replaceSecretariaPhoto(created.idleitor, photo, 'secretaria-actor')).toBe(true);
			expect(await model.getSecretariaPhoto(created.idleitor)).toEqual(photo);
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
			await model.replaceSecretariaPhoto(created.idleitor, new Uint8Array([1]), 'secretaria-actor');

			expect(await model.removeSecretariaPhoto(created.idleitor, 'secretaria-actor')).toBe(true);
			expect(await model.removeSecretariaPhoto(created.idleitor, 'secretaria-actor')).toBe(true);
			expect(await model.getSecretariaPhoto(created.idleitor)).toBeNull();
			expect(await model.getSecretaria(created.idleitor)).toMatchObject({ hasPhoto: false });
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('reports missing photo targets without writing a partial update', async () => {
		expect(await model.replaceSecretariaPhoto(-1, new Uint8Array([1]), 'secretaria-actor')).toBe(false);
		expect(await model.getSecretariaPhoto(-1)).toBeUndefined();
	});

	it('preserves the existing photo when its audit update fails', async () => {
		const created = await createRawCadastro(createTestName('photo-rollback'));
		const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		try {
			await expect(model.replaceSecretariaPhoto(created.idleitor, new Uint8Array([1]), 'x'.repeat(31))).rejects.toThrow();
			expect(await model.getSecretariaPhoto(created.idleitor)).toBeNull();
			expect(errorLog).toHaveBeenCalledWith(
				'amigo_fraterno.photo_persistence_failed',
				expect.objectContaining({ cadastroId: created.idleitor }),
			);
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});
});
