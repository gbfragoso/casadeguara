import { describe, expect, it } from 'vitest';

import { createRawCadastro, createTestName, deleteCadastro, model, readCadastro } from './test-support';

describe('CadastroModel secretaria updates', () => {
	it('preserves biblioteca fields while persisting its explicit fields', async () => {
		const originalName = createTestName('secretaria-original');
		const updatedName = createTestName('secretaria-atualizado');
		const created = await createRawCadastro(originalName);

		try {
			const updated = await model.updateSecretaria(
				created.idleitor,
				{
					nome: updatedName,
					rg: null,
					cpf: null,
					email: null,
					celular: null,
					telefone: '71999999999',
					logradouro: null,
					bairro: null,
					complemento: null,
					cidade: null,
					cep: null,
					aniversario: null,
					trab: false,
				},
				'secretaria-actor',
			);

			expect(updated).toBe(true);
			expect(await readCadastro(created.idleitor)).toMatchObject({
				nome: updatedName,
				rg: null,
				cpf: null,
				aniversario: null,
				trab: false,
				status: true,
				frequencia: true,
				desencarnado: true,
				incompleto: true,
				userAlteracao: 'secretaria-actor',
				dataAlteracao: expect.any(Date),
			});
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('reports a missing secretaria update', async () => {
		expect(await model.updateSecretaria(-1, { nome: createTestName('ausente') }, 'secretaria-actor')).toBe(false);
	});
});
