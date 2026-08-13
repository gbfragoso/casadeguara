import { describe, expect, it } from 'vitest';

import { createRawCadastro, createTestName, deleteCadastro, model, readCadastro } from './test-support';

describe('CadastroModel biblioteca updates', () => {
	it('preserves secretaria fields while replacing, preserving, and removing identifiers', async () => {
		const originalName = createTestName('biblioteca-original');
		const updatedName = createTestName('biblioteca-atualizado');
		const created = await createRawCadastro(originalName);

		try {
			const updated = await model.updateBiblioteca(
				created.idleitor,
				{
					nome: updatedName,
					rg: '987654321',
					cpf: '98765432100',
					email: null,
					celular: null,
					telefone: '71999999999',
					logradouro: null,
					bairro: null,
					complemento: null,
					cidade: null,
					cep: null,
					trab: false,
					status: false,
				},
				'biblioteca-actor',
			);
			const replaced = await readCadastro(created.idleitor);

			expect(updated).toBe(true);
			expect(replaced).toMatchObject({
				nome: updatedName,
				rg: '987654321',
				cpf: '98765432100',
				status: false,
				frequencia: true,
				desencarnado: true,
				incompleto: true,
				aniversario: new Date('2024-02-29'),
				userAlteracao: 'biblioteca-actor',
				dataAlteracao: expect.any(Date),
			});

			await model.updateBiblioteca(created.idleitor, { nome: updatedName }, 'biblioteca-actor');
			expect(await readCadastro(created.idleitor)).toMatchObject({ rg: '987654321', cpf: '98765432100' });

			await model.updateBiblioteca(
				created.idleitor,
				{ nome: updatedName, rg: null, cpf: null },
				'biblioteca-actor',
			);
			expect(await readCadastro(created.idleitor)).toMatchObject({ rg: null, cpf: null });
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('reports a missing biblioteca update', async () => {
		expect(await model.updateBiblioteca(-1, { nome: createTestName('ausente') }, 'biblioteca-actor')).toBe(false);
	});
});
