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

	it('projects twelve ordered months with active decimal totals and zero gaps', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const counterpartId = await createCounterpart(database, 'monthly-totals');
			const activeEntry = await model.create(
				{ ...entryInput(counterpartId, 'Entrada setembro'), valor: '1234.567', dataLancamento: '2026-09-10' },
				'actor',
			);
			const reversedEntry = await model.create(
				{ ...entryInput(counterpartId, 'Entrada estornada'), valor: '90.12', dataLancamento: '2026-09-11' },
				'actor',
			);
			await model.create(
				{ ...exitInput('Saída dezembro'), valor: '4.005', dataLancamento: '2025-12-15' },
				'actor',
			);
			await model.create({ ...exitInput('Saída setembro'), valor: '8.9', dataLancamento: '2026-09-12' }, 'actor');
			await model.create(
				{ ...entryInput(counterpartId, 'Fora da janela'), valor: '700', dataLancamento: '2026-10-01' },
				'actor',
			);
			await model.reverse(reversedEntry.id, 'Duplicada', 'admin');

			const totals = await model.getMonthlyTotals(new Date('2026-09-15T12:00:00Z'));

			expect(activeEntry.id).not.toBe(reversedEntry.id);
			expect(totals).toHaveLength(12);
			expect(totals.map(({ competencia }) => competencia)).toEqual([
				'2025-10',
				'2025-11',
				'2025-12',
				'2026-01',
				'2026-02',
				'2026-03',
				'2026-04',
				'2026-05',
				'2026-06',
				'2026-07',
				'2026-08',
				'2026-09',
			]);
			expect(totals[0]).toEqual({ competencia: '2025-10', entradas: '0', saidas: '0' });
			expect(totals[2]).toEqual({ competencia: '2025-12', entradas: '0', saidas: '4.005' });
			expect(totals[11]).toEqual({ competencia: '2026-09', entradas: '1234.567', saidas: '8.9' });
		});
	});

	it('requeries monthly totals after creation and reversal without caching', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const counterpartId = await createCounterpart(database, 'monthly-refresh');
			const first = await model.create(
				{ ...entryInput(counterpartId, 'Primeira entrada'), valor: '10.00', dataLancamento: '2026-09-10' },
				'actor',
			);

			const initial = await model.getMonthlyTotals(new Date('2026-09-15T12:00:00Z'));
			expect(initial[11]).toMatchObject({ entradas: '10.00', saidas: '0' });

			const second = await model.create(
				{ ...entryInput(counterpartId, 'Segunda entrada'), valor: '0.1234', dataLancamento: '2026-09-11' },
				'actor',
			);
			const afterCreation = await model.getMonthlyTotals(new Date('2026-09-15T12:00:00Z'));
			expect(afterCreation[11]).toMatchObject({ entradas: '10.1234', saidas: '0' });

			await model.reverse(first.id, 'Duplicada', 'admin');
			const afterReversal = await model.getMonthlyTotals(new Date('2026-09-15T12:00:00Z'));
			expect(afterReversal[11]).toMatchObject({ entradas: '0.1234', saidas: '0' });
			expect(second.id).not.toBe(first.id);
		});
	});
});
