import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';

import { cadastros } from '$lib/server/database/schema';
import { LancamentoModel } from '$lib/server/tesouraria/lancamentos/model';
import { withProvisionedDatabase } from '../../database/migration-test-support';
import { createCounterpart, entryInput, exitInput } from './model-support';

describe('LancamentoModel financial consumers', () => {
	it('projects dashboard totals from active entries and exits', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const workerId = await createCounterpart(database, 'financial-worker');
			const otherId = await createCounterpart(database, 'financial-other');
			await database.update(cadastros).set({ trab: false }).where(eq(cadastros.idleitor, otherId));
			const activeEntry = await model.create(entryInput(workerId, 'Entrada ativa'), 'actor');
			const reversedEntry = await model.create(entryInput(workerId, 'Entrada estornada'), 'actor');
			await model.create(exitInput('Saída ativa'), 'actor');
			const reversedExit = await model.create(exitInput('Saída estornada'), 'actor');
			await model.reverse(reversedEntry.id, 'Duplicada', 'admin');
			await model.reverse(reversedExit.id, 'Incorreta', 'admin');
			await model.create({ ...entryInput(otherId, 'Outra entrada'), valor: '40.00' }, 'actor');

			const dashboard = await model.getDashboard(new Date('2026-09-02T12:00:00Z'));
			expect(activeEntry.id).not.toBe(reversedEntry.id);
			expect(dashboard).toEqual({
				entradaMesAtual: { count: 2, median: 95, value: '190.00' },
				saidaMesAtual: { value: '80.00' },
			});
		});
	});

	it('lists only active pending entries for the cash projection', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const counterpartId = await createCounterpart(database, 'financial-cash');
			const pending = await model.create(entryInput(counterpartId, 'Pendente'), 'actor');
			const deposited = await model.create(entryInput(counterpartId, 'Depositada'), 'actor');
			const reversed = await model.create(entryInput(counterpartId, 'Estornada'), 'actor');
			await model.confirmDeposits([deposited.id], 'actor');
			await model.reverse(reversed.id, 'Incorreta', 'admin');

			const entries = await model.listPendingDeposits();

			expect(entries.map((entry) => entry.identrada)).toEqual([pending.id]);
			expect(entries[0]).toMatchObject({ depositado: false, contribuinte: expect.any(String) });
		});
	});
});
