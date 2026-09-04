import { and, desc, eq, gte, ilike, lte } from 'drizzle-orm';
import { cadastros, estornos, lancamentos, user } from '$lib/server/database/schema';
import { ulike } from '$lib/server/database/functions';
import type { EstornoItem, EstornoPage, EstornoSearch, LancamentoDatabase } from './types';
import { formatDate, toDate } from './format';

const REVERSAL_PAGE_SIZE = 100;

const buildFilters = (input: EstornoSearch) => {
	const filters = [];
	if (input.tipo !== 'todos') filters.push(eq(lancamentos.tipo, input.tipo));
	if (input.contraparte) filters.push(ulike(cadastros.nome, `${input.contraparte}%`));
	if (input.descricao) filters.push(ilike(lancamentos.descricao, `%${input.descricao}%`));
	if (input.lancamentoInicio) filters.push(gte(lancamentos.dataLancamento, toDate(input.lancamentoInicio)));
	if (input.lancamentoFim) filters.push(lte(lancamentos.dataLancamento, toDate(input.lancamentoFim)));
	if (input.estornoInicio) filters.push(gte(estornos.dataEstorno, toDate(input.estornoInicio)));
	if (input.estornoFim) filters.push(lte(estornos.dataEstorno, toDate(input.estornoFim)));
	return filters.length ? and(...filters) : undefined;
};

const mapReversal = (row: {
	id: number;
	tipo: 'entrada' | 'saida';
	contraparteId: number | null;
	contraparteNome: string | null;
	descricao: string;
	valor: string;
	dataLancamento: Date;
	motivo: string;
	usuarioId: string;
	usuarioNome: string | null;
	dataEstorno: Date;
}): EstornoItem => ({
	id: row.id,
	tipo: row.tipo,
	contraparte: row.contraparteId && row.contraparteNome ? { id: row.contraparteId, nome: row.contraparteNome } : null,
	descricao: row.descricao,
	valor: row.valor,
	dataLancamento: formatDate(row.dataLancamento) ?? '',
	motivo: row.motivo,
	usuario: row.usuarioNome ?? row.usuarioId,
	dataEstorno: formatDate(row.dataEstorno) ?? '',
});

export const searchReversals = async (database: LancamentoDatabase, input: EstornoSearch): Promise<EstornoPage> => {
	const rows = await database
		.select({
			id: lancamentos.idlancamento,
			tipo: lancamentos.tipo,
			contraparteId: cadastros.idleitor,
			contraparteNome: cadastros.nome,
			descricao: lancamentos.descricao,
			valor: lancamentos.valor,
			dataLancamento: lancamentos.dataLancamento,
			motivo: estornos.motivo,
			usuarioId: estornos.userEstorno,
			usuarioNome: user.name,
			dataEstorno: estornos.dataEstorno,
		})
		.from(estornos)
		.innerJoin(lancamentos, eq(lancamentos.idlancamento, estornos.idlancamento))
		.leftJoin(user, eq(estornos.userEstorno, user.id))
		.leftJoin(cadastros, eq(cadastros.idleitor, lancamentos.idcontraparte))
		.where(buildFilters(input))
		.orderBy(desc(estornos.dataEstorno), desc(estornos.idlancamento))
		.limit(REVERSAL_PAGE_SIZE);
	return { items: rows.map(mapReversal) };
};
