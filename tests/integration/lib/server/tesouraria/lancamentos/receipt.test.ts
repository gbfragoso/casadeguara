import { describe, expect, it } from 'vitest';

import { LancamentoModel } from '$lib/server/tesouraria/lancamentos/model';
import { withProvisionedDatabase } from '../../database/migration-test-support';
import { createCounterpart, entryInput, exitInput } from './model-support';

describe('LancamentoModel receipts', () => {
	it('resolves active receipts, minimizes reversed receipts, and ignores exits', async () => {
		await withProvisionedDatabase(async (database) => {
			const model = new LancamentoModel(database);
			const counterpartId = await createCounterpart(database, 'receipt-contract');
			const active = await model.create(entryInput(counterpartId, 'Conteúdo ativo'), 'actor');
			const reversed = await model.create(entryInput(counterpartId, 'Conteúdo privado'), 'actor');
			const exit = await model.create(exitInput('Sem recibo'), 'actor');
			await model.reverse(reversed.id, 'Lançamento duplicado', 'admin');

			const activeReceipt = active.uuidRecibo ? await model.getReceipt(active.uuidRecibo) : null;
			const reversedReceipt = reversed.uuidRecibo ? await model.getReceipt(reversed.uuidRecibo) : null;

			expect(activeReceipt).toMatchObject({
				status: 'ativo',
				entrada: { id: active.id, descricao: 'Conteúdo ativo' },
			});
			expect(reversedReceipt).toEqual({ status: 'estornado', motivo: 'Lançamento duplicado' });
			expect(exit.uuidRecibo).toBeNull();
			expect(await model.getReceipt('00000000-0000-7000-8000-000000000000')).toBeNull();
		});
	});
});
