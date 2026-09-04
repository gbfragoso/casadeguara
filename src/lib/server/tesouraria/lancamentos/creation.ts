import { v7 as uuidv7 } from 'uuid';
import { lancamentos } from '$lib/server/database/schema';
import type { CreateLancamento, CreatedLancamento, LancamentoDatabase, LancamentoTransaction } from './types';
import { assertCounterpart } from './counterparts';
import { currentDate, formatDate, toDate } from './format';
import { mapPersistenceError, validationError } from './errors';

const insertEntry = async (
	transaction: LancamentoTransaction,
	input: Extract<CreateLancamento, { tipo: 'entrada' }>,
	actorId: string,
) =>
	transaction
		.insert(lancamentos)
		.values({
			tipo: 'entrada',
			descricao: input.descricao,
			valor: input.valor,
			dataLancamento: toDate(input.dataLancamento),
			idcontraparte: input.contraparteId,
			depositado: input.depositado,
			uuidRecibo: uuidv7(),
			dataRegistro: currentDate(),
			userCadastro: actorId,
		})
		.returning({
			id: lancamentos.idlancamento,
			tipo: lancamentos.tipo,
			uuidRecibo: lancamentos.uuidRecibo,
			dataRegistro: lancamentos.dataRegistro,
		});

const insertExit = async (
	transaction: LancamentoTransaction,
	input: Extract<CreateLancamento, { tipo: 'saida' }>,
	actorId: string,
) =>
	transaction
		.insert(lancamentos)
		.values({
			tipo: 'saida',
			descricao: input.descricao,
			valor: input.valor,
			dataLancamento: toDate(input.dataLancamento),
			idcontraparte: input.contraparteId,
			depositado: null,
			uuidRecibo: null,
			dataRegistro: currentDate(),
			userCadastro: actorId,
		})
		.returning({
			id: lancamentos.idlancamento,
			tipo: lancamentos.tipo,
			uuidRecibo: lancamentos.uuidRecibo,
			dataRegistro: lancamentos.dataRegistro,
		});

const createInTransaction = async (
	transaction: LancamentoTransaction,
	input: CreateLancamento,
	actorId: string,
): Promise<CreatedLancamento> => {
	if (!actorId.trim()) throw validationError('Usuário de cadastro é obrigatório.');
	if (input.contraparteId !== null && input.contraparteId !== undefined)
		await assertCounterpart(transaction, input.contraparteId);
	const [created] =
		input.tipo === 'entrada'
			? await insertEntry(transaction, input, actorId)
			: await insertExit(transaction, input, actorId);
	if (!created) throw mapPersistenceError(new Error('insert returned no row'));
	return {
		id: created.id,
		tipo: created.tipo,
		uuidRecibo: created.uuidRecibo,
		dataRegistro: formatDate(created.dataRegistro),
	};
};

export const createLancamento = async (
	database: LancamentoDatabase,
	input: CreateLancamento,
	actorId: string,
): Promise<CreatedLancamento> => {
	try {
		return await database.transaction((transaction) => createInTransaction(transaction, input, actorId));
	} catch (cause) {
		throw mapPersistenceError(cause);
	}
};
