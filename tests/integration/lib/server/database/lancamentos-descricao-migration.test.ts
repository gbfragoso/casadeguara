import { drizzle } from 'drizzle-orm/postgres-js';
import { describe, expect, it } from 'vitest';

import * as schema from '#lib/server/database/schema.js';
import { LancamentoModel } from '#lib/server/tesouraria/lancamentos/model.js';
import {
	ACTIVE_ENTRY_ID,
	correctDescription,
	OUTPUT_ID,
	readEntry,
	readHistory,
	REVERSED_ENTRY_ID,
	withDescriptionMigration,
} from './lancamentos-migration-support';

describe('lancamento description correction migration', () => {
	it.each([
		['entry', ACTIVE_ENTRY_ID, 'Entrada'],
		['output', OUTPUT_ID, 'Saída 5'],
	])('TI-01 corrects only the description of an active %s and records its history', async (_kind, id, previous) => {
		await withDescriptionMigration(async (database) => {
			await correctDescription(database, id, 'Descrição corrigida', 'tesoureiro');

			const [history] = await readHistory(database);
			expect(await readEntry(database, id)).toMatchObject({
				descricao: 'Descrição corrigida',
				userAlteracao: 'tesoureiro',
			});
			expect(history).toMatchObject({
				idlancamento: id,
				descricaoAnterior: previous,
				descricaoNova: 'Descrição corrigida',
				userAlteracao: 'tesoureiro',
			});
			expect(history?.dataAlteracao).toBeInstanceOf(Date);
		});
	});

	it.each([
		['without the author', ACTIVE_ENTRY_ID, 'Descrição corrigida', null],
		['with a blank author', ACTIVE_ENTRY_ID, 'Descrição corrigida', '  '],
		['with a blank description', ACTIVE_ENTRY_ID, '   ', 'tesoureiro'],
		['on a reversed entry', REVERSED_ENTRY_ID, 'Descrição corrigida', 'tesoureiro'],
	])('TI-02 rejects a correction %s', async (_case, id, description, user) => {
		await withDescriptionMigration(async (database) => {
			const correction = correctDescription(database, id, description, user);

			await expect(correction).rejects.toThrow('immutable');
			expect(await readHistory(database)).toEqual([]);
		});
	});

	it.each([
		['value', `valor = 99`],
		['deposit status', `depositado = true`],
	])('TI-03 rejects a description correction combined with the %s', async (_column, assignment) => {
		await withDescriptionMigration(async (database) => {
			const correction = database.unsafe(
				`UPDATE lancamentos SET descricao = 'Corrigida', user_alteracao = 'tesoureiro', ${assignment}
				WHERE idlancamento = ${ACTIVE_ENTRY_ID}`,
			);

			await expect(correction).rejects.toThrow('immutable');
			expect(await readHistory(database)).toEqual([]);
		});
	});

	it('TI-03 keeps lancamentos undeletable', async () => {
		await withDescriptionMigration(async (database) => {
			const deletion = database`DELETE FROM lancamentos WHERE idlancamento = ${ACTIVE_ENTRY_ID}`;

			await expect(deletion).rejects.toThrow('immutable');
		});
	});

	it('TI-04 confirms a deposit without recording description history', async () => {
		await withDescriptionMigration(async (database) => {
			await database`UPDATE lancamentos SET depositado = true WHERE idlancamento = ${ACTIVE_ENTRY_ID}`;

			expect(await readEntry(database, ACTIVE_ENTRY_ID)).toMatchObject({
				descricao: 'Entrada',
				depositado: true,
			});
			expect(await readHistory(database)).toEqual([]);
		});
	});

	it('TI-04 still rejects reverting a confirmed deposit', async () => {
		await withDescriptionMigration(async (database) => {
			await database`UPDATE lancamentos SET depositado = true WHERE idlancamento = ${ACTIVE_ENTRY_ID}`;

			const reversion = database`UPDATE lancamentos SET depositado = false WHERE idlancamento = ${ACTIVE_ENTRY_ID}`;

			await expect(reversion).rejects.toThrow('immutable');
		});
	});

	it.each([
		['update', `UPDATE lancamento_descricoes SET descricao_nova = 'Adulterada'`],
		['delete', `DELETE FROM lancamento_descricoes`],
	])('TI-05 rejects a history %s', async (_operation, statement) => {
		await withDescriptionMigration(async (database) => {
			await correctDescription(database, ACTIVE_ENTRY_ID, 'Descrição corrigida', 'tesoureiro');

			const change = database.unsafe(statement);

			await expect(change).rejects.toThrow('description history is immutable');
			expect(await readHistory(database)).toHaveLength(1);
		});
	});

	it('TI-09 corrects a description through the application model under the trigger', async () => {
		await withDescriptionMigration(async (database) => {
			const model = new LancamentoModel(drizzle(database, { schema }));

			await model.updateDescription(OUTPUT_ID, 'Saída corrigida', 'tesoureiro');

			expect(await readHistory(database)).toEqual([
				expect.objectContaining({
					idlancamento: OUTPUT_ID,
					descricaoAnterior: 'Saída 5',
					descricaoNova: 'Saída corrigida',
					userAlteracao: 'tesoureiro',
				}),
			]);
		});
	});
});
