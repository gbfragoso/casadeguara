import { and, eq } from 'drizzle-orm';
import { cadastros, estornos, lancamentos } from '$lib/server/database/schema';
import { estornoReasonSchema } from '$lib/validation/tesouraria/lancamentos';
import type { LancamentoDatabase, LancamentoDetail, LancamentoTransaction } from './types';
import { alreadyReversedError, mapPersistenceError, notFoundError, validationError } from './errors';
import { currentDate, formatDate } from './format';

const getLockedLancamento = async (transaction: LancamentoTransaction, id: number) => {
	const [row] = await transaction
		.select({ id: lancamentos.idlancamento, tipo: lancamentos.tipo })
		.from(lancamentos)
		.where(eq(lancamentos.idlancamento, id))
		.for('update');
	return row;
};

const reverseInTransaction = async (
	transaction: LancamentoTransaction,
	id: number,
	reason: string,
	actorId: string,
) => {
	const parsedReason = estornoReasonSchema.safeParse(reason);
	if (!parsedReason.success) throw validationError('Motivo do estorno é obrigatório.');
	if (!actorId.trim()) throw validationError('Usuário de estorno é obrigatório.');
	const lancamento = await getLockedLancamento(transaction, id);
	if (!lancamento) throw notFoundError();
	const [existing] = await transaction
		.select({ id: estornos.idlancamento })
		.from(estornos)
		.where(eq(estornos.idlancamento, id))
		.limit(1);
	if (existing) throw alreadyReversedError();
	await transaction
		.insert(estornos)
		.values({ idlancamento: id, motivo: parsedReason.data, userEstorno: actorId, dataEstorno: currentDate() });
};

export const reverseLancamento = async (
	database: LancamentoDatabase,
	id: number,
	reason: string,
	actorId: string,
): Promise<void> => {
	try {
		await database.transaction((transaction) => reverseInTransaction(transaction, id, reason, actorId));
	} catch (cause) {
		throw mapPersistenceError(cause);
	}
};

type LancamentoDetailRow = {
	id: number;
	tipo: 'entrada' | 'saida';
	descricao: string;
	valor: string;
	dataLancamento: Date;
	depositado: boolean | null;
	reciboUuid: string | null;
	dataRegistro: Date | null;
	contraparteId: number | null;
	contraparteNome: string | null;
	motivo: string | null;
	usuario: string | null;
	dataEstorno: Date | null;
};

const selectLancamentoDetail = (database: LancamentoDatabase, id: number) =>
	database
		.select({
			id: lancamentos.idlancamento,
			tipo: lancamentos.tipo,
			descricao: lancamentos.descricao,
			valor: lancamentos.valor,
			dataLancamento: lancamentos.dataLancamento,
			depositado: lancamentos.depositado,
			reciboUuid: lancamentos.uuidRecibo,
			dataRegistro: lancamentos.dataRegistro,
			contraparteId: cadastros.idleitor,
			contraparteNome: cadastros.nome,
			motivo: estornos.motivo,
			usuario: estornos.userEstorno,
			dataEstorno: estornos.dataEstorno,
		})
		.from(lancamentos)
		.leftJoin(cadastros, eq(cadastros.idleitor, lancamentos.idcontraparte))
		.leftJoin(estornos, eq(estornos.idlancamento, lancamentos.idlancamento))
		.where(and(eq(lancamentos.idlancamento, id)))
		.limit(1);

const mapLancamentoDetail = (row: LancamentoDetailRow): LancamentoDetail => ({
	id: row.id,
	tipo: row.tipo,
	descricao: row.descricao,
	valor: row.valor,
	dataLancamento: formatDate(row.dataLancamento) ?? '',
	contraparte: row.contraparteId && row.contraparteNome ? { id: row.contraparteId, nome: row.contraparteNome } : null,
	depositado: row.depositado,
	reciboUuid: row.reciboUuid,
	dataRegistro: formatDate(row.dataRegistro),
	estornado: row.motivo !== null,
	motivoEstorno: row.motivo,
	usuarioEstorno: row.usuario,
	dataEstorno: formatDate(row.dataEstorno),
});

export const getLancamentoForReversal = async (
	database: LancamentoDatabase,
	id: number,
): Promise<LancamentoDetail | null> => {
	const [row] = await selectLancamentoDetail(database, id);
	if (!row) return null;
	return {
		...mapLancamentoDetail(row),
	};
};
