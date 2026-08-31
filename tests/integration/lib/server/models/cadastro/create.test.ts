import { describe, expect, it } from 'vitest';

import { CadastroModel } from '$lib/server/models/cadastro';
import { cadastros } from '$lib/server/database/schema';
import { eq, sql } from 'drizzle-orm';

import { withProvisionedDatabase } from '../../database/migration-test-support';
import { createTestName, deleteCadastro, model, readCadastro } from './test-support';

const PREVIOUS_ID_LIMIT = 32767;

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

	it('persists a cadastro after the previous smallint identifier limit', async () => {
		await withProvisionedDatabase(async (database) => {
			await database.execute(
				sql`SELECT setval(pg_get_serial_sequence('cadastros', 'idleitor'), ${PREVIOUS_ID_LIMIT}, true)`,
			);
			const isolatedModel = new CadastroModel(database);
			const [created] = await isolatedModel.createBiblioteca(
				{ nome: createTestName('integer-id') },
				'limit-actor',
			);
			if (!created) throw new Error('Cadastro de teste não foi criado.');

			const [record] = await database.select().from(cadastros).where(eq(cadastros.idleitor, created.idleitor));
			expect(created.idleitor).toBeGreaterThan(PREVIOUS_ID_LIMIT);
			expect(record?.nome).toContain('integer-id');
		});
	});
});
