import { describe, expect, it } from 'vitest';

import { createTestName, deleteCadastro, model, readCadastro } from './test-support';

describe('CadastroModel creates', () => {
	it('persists each dashboard owned fields with the server audit actor', async () => {
		const actor = 'create-actor';
		const bibliotecaName = createTestName('biblioteca');
		const secretariaName = createTestName('secretaria');
		const tesourariaName = createTestName('tesouraria');
		const created = (
			await Promise.all([
				model.createBiblioteca({ nome: bibliotecaName, cpf: '12345678909', status: false }, actor),
				model.createSecretaria({ nome: secretariaName, aniversario: '2024-02-29', trab: false }, actor),
				model.createTesouraria({ nome: tesourariaName, telefone: '7133333333', trab: true }, actor),
			])
		).flat();

		try {
			const records = await Promise.all(created.map(({ idleitor }) => readCadastro(idleitor)));

			expect(records).toMatchObject([
				{ nome: bibliotecaName, cpf: '12345678909', status: false, userCadastro: actor },
				{ nome: secretariaName, aniversario: new Date('2024-02-29'), trab: false, userCadastro: actor },
				{ nome: tesourariaName, telefone: '7133333333', trab: true, userCadastro: actor },
			]);
		} finally {
			await Promise.all(created.map(({ idleitor }) => deleteCadastro(idleitor)));
		}
	});
});
