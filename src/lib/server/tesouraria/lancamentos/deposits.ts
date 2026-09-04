import { and, eq } from 'drizzle-orm';
import { estornos, lancamentos } from '$lib/server/database/schema';
import type { LancamentoDatabase, LancamentoTransaction } from './types';
import { mapPersistenceError, notDepositableError, notFoundError, validationError } from './errors';

const lockLancamento = async (transaction: LancamentoTransaction, id: number) => {
	const [row] = await transaction
		.select({ id: lancamentos.idlancamento, tipo: lancamentos.tipo, depositado: lancamentos.depositado })
		.from(lancamentos)
		.where(eq(lancamentos.idlancamento, id))
		.for('update');
	return row;
};

const assertActive = async (transaction: LancamentoTransaction, id: number) => {
	const [reversal] = await transaction
		.select({ id: estornos.idlancamento })
		.from(estornos)
		.where(eq(estornos.idlancamento, id))
		.limit(1);
	if (reversal) throw notDepositableError();
};

const confirmInTransaction = async (transaction: LancamentoTransaction, ids: number[], actorId: string) => {
	if (!actorId.trim()) throw validationError('Usuário de baixa é obrigatório.');
	const pendingIds: number[] = [];
	for (const id of [...new Set(ids)].sort((left, right) => left - right)) {
		const row = await lockLancamento(transaction, id);
		if (!row) throw notFoundError();
		if (row.tipo !== 'entrada') throw notDepositableError();
		await assertActive(transaction, id);
		if (!row.depositado) pendingIds.push(id);
	}
	await Promise.all(
		pendingIds.map((id) =>
			transaction
				.update(lancamentos)
				.set({ depositado: true })
				.where(and(eq(lancamentos.idlancamento, id), eq(lancamentos.depositado, false))),
		),
	);
};

export const confirmLancamentoDeposits = async (
	database: LancamentoDatabase,
	ids: number[],
	actorId: string,
): Promise<void> => {
	if (!ids.length) throw validationError('Selecione ao menos um lançamento.');
	try {
		await database.transaction((transaction) => confirmInTransaction(transaction, ids, actorId));
	} catch (cause) {
		throw mapPersistenceError(cause);
	}
};
