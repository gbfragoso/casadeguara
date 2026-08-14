import { describe, expect, it } from 'vitest';

import { createRawCadastro, createTestName, deleteCadastro, model, readCadastro } from './test-support';

describe('CadastroModel tesouraria updates', () => {
	it('preserves every non-owned field while persisting an explicit false worker value', async () => {
		const originalName = createTestName('tesouraria-original');
		const updatedName = createTestName('tesouraria-atualizado');
		const created = await createRawCadastro(originalName);

		try {
			const updated = await model.updateTesouraria(
				created.idleitor,
				{ nome: updatedName, telefone: null, trab: false },
				'tesouraria-actor',
			);

			expect(updated).toBe(true);
			expect(await readCadastro(created.idleitor)).toMatchObject({
				nome: updatedName,
				telefone: null,
				trab: false,
				rg: '123456789',
				cpf: '12345678909',
				email: 'original@example.com',
				celular: '71999999999',
				logradouro: 'Rua Original',
				bairro: 'Centro',
				complemento: 'Casa 1',
				cidade: 'Salvador',
				cep: '40000000',
				aniversario: new Date('2024-02-29'),
				status: true,
				frequencia: true,
				desencarnado: true,
				incompleto: true,
				userAlteracao: 'tesouraria-actor',
				dataAlteracao: expect.any(Date),
			});
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('reports a missing tesouraria update', async () => {
		expect(await model.updateTesouraria(-1, { nome: createTestName('ausente') }, 'tesouraria-actor')).toBe(false);
	});
});
