import { eq } from 'drizzle-orm';
import { estornos, lancamentos } from '#lib/server/database/schema.js';
import { lancamentoDescriptionSchema } from '#lib/validation/tesouraria/lancamentos.js';
import type { LancamentoDatabase, LancamentoTransaction, UpdatedDescription } from './types';
import { alreadyReversedError, mapPersistenceError, notFoundError, validationError } from './errors';

const getLockedDescription = async (transaction: LancamentoTransaction, id: number) => {
	const [row] = await transaction
		.select({ descricao: lancamentos.descricao, estornoId: estornos.idlancamento })
		.from(lancamentos)
		.leftJoin(estornos, eq(estornos.idlancamento, lancamentos.idlancamento))
		.where(eq(lancamentos.idlancamento, id))
		.for('update', { of: lancamentos });
	return row;
};

const updateInTransaction = async (
	transaction: LancamentoTransaction,
	id: number,
	descricao: string,
	actorId: string,
): Promise<UpdatedDescription> => {
	const current = await getLockedDescription(transaction, id);
	if (!current) throw notFoundError();
	if (current.estornoId !== null) throw alreadyReversedError();
	if (current.descricao === descricao) return { id, descricao };
	await transaction
		.update(lancamentos)
		.set({ descricao, userAlteracao: actorId })
		.where(eq(lancamentos.idlancamento, id));
	return { id, descricao };
};

const parseDescription = (descricao: string) => {
	const result = lancamentoDescriptionSchema.shape.descricao.safeParse(descricao);
	if (!result.success) throw validationError(result.error.issues[0]?.message ?? 'Descrição inválida.');
	return result.data;
};

export const updateLancamentoDescription = async (
	database: LancamentoDatabase,
	id: number,
	descricao: string,
	actorId: string,
): Promise<UpdatedDescription> => {
	const normalized = parseDescription(descricao);
	if (!actorId.trim()) throw validationError('Usuário da alteração é obrigatório.');
	try {
		return await database.transaction((transaction) => updateInTransaction(transaction, id, normalized, actorId));
	} catch (cause) {
		throw mapPersistenceError(cause);
	}
};
