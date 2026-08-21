import { describe, expect, it } from 'vitest';

import type { SecretariaFlagData } from '$lib/server/models/cadastro-inputs';

import { createRawCadastro, createTestName, deleteCadastro, model, readCadastro } from './test-support';

describe('CadastroModel secretaria flag updates', () => {
	const flags = [
		{ field: 'trab', value: false },
		{ field: 'frequencia', value: false },
		{ field: 'desencarnado', value: false },
		{ field: 'amigoFraterno', value: true },
	] satisfies SecretariaFlagData[];

	it.each(flags)('changes only the $field flag', async ({ field, value }) => {
		const created = await createRawCadastro(createTestName(`flag-${field}`));

		try {
			const updated = await model.updateSecretariaFlag(created.idleitor, { field, value }, 'secretaria-actor');

			expect(updated).toBe(true);
			expect(await readCadastro(created.idleitor)).toMatchObject({
				[field]: value,
				trab: field === 'trab' ? value : true,
				frequencia: field === 'frequencia' ? value : true,
				desencarnado: field === 'desencarnado' ? value : true,
				amigoFraterno: field === 'amigoFraterno' ? value : false,
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
