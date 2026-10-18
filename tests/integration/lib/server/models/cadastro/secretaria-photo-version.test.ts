import { describe, expect, it } from 'vitest';

import { db } from '#lib/server/database/connection.js';
import { SecretariaPhotoModel } from '#lib/server/models/secretaria-photo.js';

import { createRawCadastro, createTestName, deleteCadastro, model } from './test-support';

const photoModel = new SecretariaPhotoModel(db);
const MD5_HEX_PATTERN = /^[0-9a-f]{32}$/;

const readPhotoVersion = async (id: number) => (await model.getSecretaria(id))?.photoVersion;

describe('CadastroModel secretaria photo version', () => {
	it('changes the photo version when the photo is replaced', async () => {
		const created = await createRawCadastro(createTestName('photo-version-replace'));

		try {
			await photoModel.replace(created.idleitor, Uint8Array.of(1), Uint8Array.of(2), 'secretaria-actor');
			const firstVersion = await readPhotoVersion(created.idleitor);

			await photoModel.replace(created.idleitor, Uint8Array.of(3), Uint8Array.of(4), 'secretaria-actor');

			expect(firstVersion).toMatch(MD5_HEX_PATTERN);
			expect(await readPhotoVersion(created.idleitor)).not.toBe(firstVersion);
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('changes the photo version when the photo is reframed', async () => {
		const created = await createRawCadastro(createTestName('photo-version-reframe'));
		const source = Uint8Array.of(1, 2);

		try {
			await photoModel.replace(created.idleitor, source, Uint8Array.of(3), 'secretaria-actor');
			const firstVersion = await readPhotoVersion(created.idleitor);

			await photoModel.reframe(created.idleitor, source, Uint8Array.of(4), 'secretaria-actor');

			expect(firstVersion).toMatch(MD5_HEX_PATTERN);
			expect(await readPhotoVersion(created.idleitor)).not.toBe(firstVersion);
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});
});
