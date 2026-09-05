import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { cadastros, lancamentos } from '$lib/server/database/schema';
import { LancamentoModel } from '$lib/server/tesouraria/lancamentos/model';
import { withProvisionedDatabase } from '../../database/migration-test-support';
import { lancamentoSearchSchema } from '$lib/validation/tesouraria/lancamentos';
import { createCounterpart, entryInput, exitInput } from './model-support';
import { currentDate, formatDate } from '$lib/server/tesouraria/lancamentos/format';

describe('LancamentoModel search and creation', () => {
	it('searches active entries and exits with independent totals and filters', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const counterpartId = await createCounterpart(database, 'lancamentos');
			const [counterpart] = await database
				.select({ nome: cadastros.nome })
				.from(cadastros)
				.where(eq(cadastros.idleitor, counterpartId));
			const entry = await model.create(entryInput(counterpartId, 'Entrada pesquisável'), 'actor');
			await model.create(exitInput('Saída pesquisável'), 'actor');
			const page = await model.search(lancamentoSearchSchema.parse({ descricao: 'pesquisável' }));
			const empty = await model.search(lancamentoSearchSchema.parse({ descricao: 'inexistente' }));
			const today = formatDate(currentDate());
			const filtered = await model.search(
				lancamentoSearchSchema.parse({
					tipo: 'entrada',
					contraparte: counterpart?.nome.slice(0, 8),
					dataInicio: '2026-09-01',
					dataFim: '2026-09-02',
					dataRegistro: today,
					depositado: false,
					trabalhadores: true,
				}),
			);
			const registered = await model.search(lancamentoSearchSchema.parse({ dataRegistro: today }));
			const notRegistered = await model.search(lancamentoSearchSchema.parse({ dataRegistro: '2026-09-03' }));

			expect(page.items.map((item) => item.tipo)).toEqual(['saida', 'entrada']);
			expect(page.totais).toEqual({ entradas: '150.00', saidas: '80.00' });
			expect(empty).toMatchObject({ items: [], totais: { entradas: '0', saidas: '0' } });
			expect(empty).not.toHaveProperty('nextCursor');
			expect(filtered.items.map((item) => item.id)).toEqual([entry.id]);
			expect(registered.items.map((item) => item.tipo)).toEqual(['saida', 'entrada']);
			expect(registered.totais).toEqual({ entradas: '150.00', saidas: '80.00' });
			expect(notRegistered).toMatchObject({ items: [], totais: { entradas: '0', saidas: '0' } });
		});
	});

	it('limits active records and totals to the visible 100 rows', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			await Promise.all(
				Array.from({ length: 101 }, (_, index) => model.create(exitInput(`Saída limite ${index}`), 'actor')),
			);
			const first = await model.search(lancamentoSearchSchema.parse({}));

			expect(first.items).toHaveLength(100);
			expect(first).not.toHaveProperty('nextCursor');
			expect(first.totais.saidas).toBe('8000.00');
		});
	});

	it('finds counterpart names by an accent-insensitive prefix', async () => {
		await withProvisionedDatabase(async (database) => {
			const name = `Árvore ${randomUUID()}`;
			const [counterpart] = await database
				.insert(cadastros)
				.values({ nome: name, trab: true })
				.returning({ id: cadastros.idleitor });
			if (!counterpart) throw new Error('counterpart not created');
			const model = new LancamentoModel(database);
			const entry = await model.create(entryInput(counterpart.id, 'Entrada por contraparte'), 'actor');
			const page = await model.search(lancamentoSearchSchema.parse({ contraparte: 'arvore' }));

			expect(page.items.map((item) => item.id)).toEqual([entry.id]);
		});
	});

	it('creates entries atomically with counterpart, audit and receipt UUID', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const counterpartId = await createCounterpart(database, 'entrada');
			const created = await model.create(entryInput(counterpartId, 'Entrada atômica'), 'actor');
			const [row] = await database.select().from(lancamentos).where(eq(lancamentos.idlancamento, created.id));
			const receipt = created.uuidRecibo ? await model.getReceipt(created.uuidRecibo) : null;
			const detail = await model.getForReversal(created.id);

			expect(row).toMatchObject({
				tipo: 'entrada',
				idcontraparte: counterpartId,
				userCadastro: 'actor',
				depositado: false,
			});
			expect(row?.uuidRecibo).toEqual(created.uuidRecibo);
			expect(created.uuidRecibo).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/i);
			expect(receipt).toMatchObject({ status: 'ativo', entrada: { id: created.id, valor: '150.00' } });
			expect(detail).toMatchObject({ id: created.id, estornado: false, contraparte: { id: counterpartId } });
		});
	});

	it('rejects a missing counterpart without creating a partial row', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);

			await expect(model.create(entryInput(999999999, 'Contraparte ausente'), 'actor')).rejects.toMatchObject({
				code: 'VALIDATION_ERROR',
			});
			const rows = await database.select({ id: lancamentos.idlancamento }).from(lancamentos);

			expect(rows).toEqual([]);
		});
	});

	it('creates exits without counterpart, deposit or receipt', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const created = await model.create(exitInput('Saída sem contraparte'), 'actor');
			const [row] = await database.select().from(lancamentos).where(eq(lancamentos.idlancamento, created.id));

			expect(row).toMatchObject({ tipo: 'saida', idcontraparte: null, depositado: null, uuidRecibo: null });
			expect(created.uuidRecibo).toBeNull();
		});
	});

	it('confirms entry deposits idempotently and exposes counterpart options', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const counterpartId = await createCounterpart(database, 'baixa');
			const entry = await model.create(entryInput(counterpartId, 'Entrada para baixa'), 'actor');

			await model.confirmDeposits([entry.id, entry.id], 'actor');
			await model.confirmDeposits([entry.id], 'actor');
			const [row] = await database.select({ depositado: lancamentos.depositado }).from(lancamentos);
			const options = await model.listCounterpartOptions();

			expect(row?.depositado).toBe(true);
			expect(options).toContainEqual({ id: counterpartId, nome: expect.any(String) });
		});
	});
});
