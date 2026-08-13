import { describe, expect, it } from 'vitest';

import {
	DUPLICATE_CADASTRO_NAME_MESSAGE,
	DuplicateCadastroNameError,
	translateCadastroError,
} from '$lib/server/models/cadastro-error';

import { createTestName, model, withBibliotecaCadastros } from './test-support';

describe('CadastroModel database errors', () => {
	it('translates only a registration-name unique violation', async () => {
		const name = createTestName('duplicado');

		await withBibliotecaCadastros([{ nome: name }], async () => {
			let error: unknown = undefined;

			try {
				await model.createTesouraria({ nome: name }, 'error-actor');
			} catch (caught) {
				error = caught;
			}

			expect(error).toBeInstanceOf(DuplicateCadastroNameError);
			expect(error).toHaveProperty('message', DUPLICATE_CADASTRO_NAME_MESSAGE);
		});
	});

	it('rethrows an unknown database failure', async () => {
		await expect(model.createTesouraria({ nome: 'A'.repeat(61) }, 'error-actor')).rejects.toMatchObject({
			cause: { code: '22001' },
		});
	});

	it('rethrows a non-database error unchanged', () => {
		const error = new Error('erro inesperado');

		expect(() => translateCadastroError(error)).toThrow(error);
	});
});
