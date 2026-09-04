import { eq } from 'drizzle-orm';
import { cadastros, estornos, lancamentos } from '$lib/server/database/schema';
import type { LancamentoDatabase, ReceiptData, ReceiptState } from './types';
import { formatDate } from './format';
import { validationError } from './errors';

type ReceiptDataRow = {
	id: number;
	valor: string;
	descricao: string;
	dataLancamento: Date;
	dataRegistro: Date | null;
	nome: string;
};

export const toReceiptState = (row: ReceiptDataRow): ReceiptState => {
	const entrada: ReceiptData = {
		id: row.id,
		valor: row.valor,
		descricao: row.descricao,
		contribuinte: row.nome,
		dataEntrada: formatDate(row.dataLancamento) ?? '',
		dataRegistro: formatDate(row.dataRegistro),
	};
	return { status: 'ativo', entrada };
};

export const getReceipt = async (database: LancamentoDatabase, uuid: string): Promise<ReceiptState | null> => {
	if (!uuid) throw validationError('UUID de recibo inválido.');
	const [status] = await database
		.select({ tipo: lancamentos.tipo, motivo: estornos.motivo })
		.from(lancamentos)
		.leftJoin(estornos, eq(estornos.idlancamento, lancamentos.idlancamento))
		.where(eq(lancamentos.uuidRecibo, uuid))
		.limit(1);
	if (!status || status.tipo !== 'entrada') return null;
	if (status.motivo !== null) return { status: 'estornado', motivo: status.motivo };
	const [row] = await database
		.select({
			id: lancamentos.idlancamento,
			valor: lancamentos.valor,
			descricao: lancamentos.descricao,
			dataLancamento: lancamentos.dataLancamento,
			dataRegistro: lancamentos.dataRegistro,
			nome: cadastros.nome,
		})
		.from(lancamentos)
		.innerJoin(cadastros, eq(cadastros.idleitor, lancamentos.idcontraparte))
		.where(eq(lancamentos.uuidRecibo, uuid))
		.limit(1);
	return row ? toReceiptState(row) : null;
};
