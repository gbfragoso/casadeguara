import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { lancamentos } from '#lib/server/database/schema.js';
import { LancamentoModel } from '#lib/server/tesouraria/lancamentos/model.js';
import type { LancamentoDatabase } from '#lib/server/tesouraria/lancamentos/types.js';
import { withProvisionedDatabase } from '../../database/migration-test-support';
import { createCounterpart, entryInput, exitInput } from './model-support';

const readLancamento = async (database: LancamentoDatabase, id: number) => {
	const [row] = await database.select().from(lancamentos).where(eq(lancamentos.idlancamento, id));
	return row;
};

describe('LancamentoModel description correction', () => {
	it('TI-06 changes only the description and records the author', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const counterpartId = await createCounterpart(database, 'descricao');
			const entry = await model.create(entryInput(counterpartId, 'Doação original'), 'actor');
			const before = await readLancamento(database, entry.id);

			const result = await model.updateDescription(entry.id, '  Doação corrigida  ', 'tesoureiro');

			expect(result).toEqual({ id: entry.id, descricao: 'Doação corrigida' });
			expect(await readLancamento(database, entry.id)).toEqual({
				...before,
				descricao: 'Doação corrigida',
				userAlteracao: 'tesoureiro',
			});
		});
	});

	it('TI-07 rejects a reversed launch and keeps its description', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const exit = await model.create(exitInput('Saída estornada'), 'actor');
			await model.reverse(exit.id, 'Duplicidade', 'admin');

			const correction = model.updateDescription(exit.id, 'Saída corrigida', 'tesoureiro');

			await expect(correction).rejects.toMatchObject({ code: 'LANCAMENTO_ALREADY_REVERSED' });
			expect(await readLancamento(database, exit.id)).toMatchObject({
				descricao: 'Saída estornada',
				userAlteracao: null,
			});
		});
	});

	it('TI-07 rejects a missing launch', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);

			const correction = model.updateDescription(999999999, 'Saída corrigida', 'tesoureiro');

			await expect(correction).rejects.toMatchObject({ code: 'LANCAMENTO_NOT_FOUND' });
		});
	});

	it.each([
		['an invalid description', '   ', 'tesoureiro'],
		['a blank author', 'Saída corrigida', '   '],
	])('TI-07 rejects %s before writing', async (_case, descricao, actorId) => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const exit = await model.create(exitInput('Saída original'), 'actor');

			const correction = model.updateDescription(exit.id, descricao, actorId);

			await expect(correction).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
			expect(await readLancamento(database, exit.id)).toMatchObject({ descricao: 'Saída original' });
		});
	});

	it('TI-08 writes nothing when the normalized description is unchanged', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const exit = await model.create(exitInput('Saída original'), 'actor');

			const result = await model.updateDescription(exit.id, '  Saída original  ', 'tesoureiro');

			expect(result).toEqual({ id: exit.id, descricao: 'Saída original' });
			expect(await readLancamento(database, exit.id)).toMatchObject({ userAlteracao: null });
		});
	});
});
