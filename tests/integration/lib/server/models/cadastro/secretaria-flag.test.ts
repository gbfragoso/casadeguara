import { describe, expect, it } from 'vitest';

import type { SecretariaFlagData } from '$lib/server/models/cadastro-inputs';

import { createRawCadastro, createTestName, deleteCadastro, model, readCadastro } from './test-support';

describe('CadastroModel secretaria flag updates', () => {
	const flags = [{ field: 'trab' }, { field: 'frequencia' }, { field: 'desencarnado' }] satisfies Pick<
		SecretariaFlagData,
		'field'
	>[];

	it.each(flags)('changes only the $field flag', async ({ field }) => {
		const created = await createRawCadastro(createTestName(`flag-${field}`));

		try {
			const updated = await model.updateSecretariaFlag(
				created.idleitor,
				{ field, value: false },
				'secretaria-actor',
			);

			expect(updated).toBe(true);
			expect(await readCadastro(created.idleitor)).toMatchObject({
				[field]: false,
				trab: field === 'trab' ? false : true,
				frequencia: field === 'frequencia' ? false : true,
				desencarnado: field === 'desencarnado' ? false : true,
				userAlteracao: 'secretaria-actor',
				dataAlteracao: expect.any(Date),
			});
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('reports a missing secretaria flag update', async () => {
		expect(await model.updateSecretariaFlag(-1, { field: 'trab', value: false }, 'secretaria-actor')).toBe(false);
	});
});
