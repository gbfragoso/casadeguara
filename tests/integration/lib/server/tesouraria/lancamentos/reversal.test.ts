import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { cadastros, estornos, lancamentos } from '$lib/server/database/schema';
import { LancamentoError } from '$lib/server/tesouraria/lancamentos';
import { LancamentoModel } from '$lib/server/tesouraria/lancamentos/model';
import { withProvisionedDatabase } from '../../database/migration-test-support';
import { estornoSearchSchema } from '$lib/validation/tesouraria/lancamentos';
import { createCounterpart, entryInput, exitInput } from './model-support';
import { currentDate, formatDate } from '$lib/server/tesouraria/lancamentos/format';

describe('LancamentoModel reversals', () => {
	it('rejects invalid reasons and missing or non-depositable records', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const entry = await model.create(
				entryInput(await createCounterpart(database, 'regras'), 'Entrada protegida'),
				'actor',
			);
			const exit = await model.create(exitInput('Saída não depositável'), 'actor');

			await expect(model.reverse(entry.id, '   ', 'admin')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
			await expect(model.reverse(entry.id, 'Motivo', '   ')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
			await expect(model.reverse(999999999, 'Motivo', 'admin')).rejects.toMatchObject({
				code: 'LANCAMENTO_NOT_FOUND',
			});
			await expect(model.confirmDeposits([999999999], 'actor')).rejects.toMatchObject({
				code: 'LANCAMENTO_NOT_FOUND',
			});
			await expect(model.confirmDeposits([exit.id], 'actor')).rejects.toMatchObject({
				code: 'LANCAMENTO_NOT_DEPOSITABLE',
			});
			await expect(model.confirmDeposits([], 'actor')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
			expect(await model.getForReversal(999999999)).toBeNull();
		});
	});

	it('serializes reversal races and rolls back an invalid deposit batch', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const counterpartId = await createCounterpart(database, 'estorno');
			const entry = await model.create(entryInput(counterpartId, 'Entrada para estorno'), 'actor');
			const exit = await model.create(exitInput('Saída bloqueadora'), 'actor');
			const results = await Promise.allSettled([
				model.reverse(entry.id, 'Motivo único', 'admin'),
				model.reverse(entry.id, 'Motivo concorrente', 'admin'),
			]);
			const fulfilled = results.filter((result) => result.status === 'fulfilled');
			const rejected = results.filter((result) => result.status === 'rejected');

			await expect(model.confirmDeposits([entry.id, exit.id], 'actor')).rejects.toMatchObject({
				code: 'LANCAMENTO_NOT_DEPOSITABLE',
			});
			const [entryState] = await database
				.select({ depositado: lancamentos.depositado })
				.from(lancamentos)
				.where(eq(lancamentos.idlancamento, entry.id));
			const [reversal] = await database.select().from(estornos).where(eq(estornos.idlancamento, entry.id));
			const active = await model.search({
				tipo: 'todos',
				contraparte: null,
				descricao: null,
				dataInicio: null,
				dataFim: null,
				dataRegistro: null,
				depositado: null,
				trabalhadores: null,
			});
			const audit = await model.searchReversals(estornoSearchSchema.parse({}));
			const receipt = entry.uuidRecibo ? await model.getReceipt(entry.uuidRecibo) : null;
			const reversedDetail = await model.getForReversal(entry.id);

			expect(fulfilled).toHaveLength(1);
			expect(rejected[0]).toMatchObject({ reason: expect.any(LancamentoError) });
			expect(entryState?.depositado).toBe(false);
			expect(reversal?.motivo).toBe('Motivo único');
			expect(active.items.map((item) => item.id)).not.toContain(entry.id);
			expect(audit.items.map((item) => item.id)).toContain(entry.id);
			expect(receipt).toEqual({ status: 'estornado', motivo: 'Motivo único' });
			expect(reversedDetail).toMatchObject({
				estornado: true,
				motivoEstorno: 'Motivo único',
				usuarioEstorno: 'admin',
			});
		});
	});

	it('returns missing receipts safely and filters both reversal types', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const counterpartId = await createCounterpart(database, 'auditoria');
			const entry = await model.create(entryInput(counterpartId, 'Auditoria entrada'), 'actor');
			const exit = await model.create(exitInput('Auditoria saída'), 'actor');
			await model.reverse(entry.id, 'Motivo entrada', 'admin');
			await model.reverse(exit.id, 'Motivo saída', 'admin');
			const [counterpart] = await database
				.select({ name: cadastros.nome })
				.from(cadastros)
				.where(eq(cadastros.idleitor, counterpartId));

			await expect(model.getReceipt('')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
			expect(await model.getReceipt('00000000-0000-7000-8000-000000000000')).toBeNull();
			const today = formatDate(currentDate());
			const filtered = await model.searchReversals(
				estornoSearchSchema.parse({
					tipo: 'entrada',
					contraparte: counterpart?.name.slice(0, 8),
					descricao: 'auditoria',
					lancamentoInicio: '2026-09-01',
					lancamentoFim: '2026-09-02',
					estornoInicio: today,
					estornoFim: today,
				}),
			);

			expect(filtered.items).toHaveLength(1);
			expect(filtered.items[0]).toMatchObject({ id: entry.id, tipo: 'entrada', motivo: 'Motivo entrada' });
		});
	});

	it('limits reversal audit records and filters counterpart by text prefix', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const counterpartName = `Auditoria Árvore ${randomUUID()}`;
			const [counterpart] = await database
				.insert(cadastros)
				.values({ nome: counterpartName, trab: true })
				.returning({ id: cadastros.idleitor });
			if (!counterpart) throw new Error('counterpart not created');
			const created = await database
				.insert(lancamentos)
				.values(
					Array.from({ length: 101 }, (_, index) => ({
						tipo: 'entrada' as const,
						descricao: `Auditoria ${index}`,
						valor: '1.00',
						dataLancamento: new Date('2026-09-02'),
						idcontraparte: counterpart.id,
						depositado: false,
						uuidRecibo: randomUUID(),
						dataRegistro: new Date('2026-09-02'),
						userCadastro: 'actor',
					})),
				)
				.returning({ id: lancamentos.idlancamento });
			await database
				.insert(estornos)
				.values(created.map(({ id }) => ({ idlancamento: id, motivo: 'Auditoria', userEstorno: 'admin' })));

			const result = await model.searchReversals(estornoSearchSchema.parse({ contraparte: 'AUDITORIA arvore' }));

			expect(result.items).toHaveLength(100);
			expect(result).not.toHaveProperty('nextCursor');
			expect(result.items[0]?.id).toBeGreaterThan(result.items.at(-1)?.id ?? 0);
			expect(result.items.every((item) => item.contraparte?.nome === counterpartName)).toBe(true);
		});
	});
});
