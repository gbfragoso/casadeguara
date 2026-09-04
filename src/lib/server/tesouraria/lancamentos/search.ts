import { and, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm';
import { activeLancamentoPredicate, cadastros, lancamentos } from '$lib/server/database/schema';
import { ulike } from '$lib/server/database/functions';
import type { LancamentoDatabase, LancamentoItem, LancamentoPage, LancamentoSearch } from './types';
import { formatDate, toDate } from './format';
import { lancamentoProjection } from './projections';

export const LANCAMENTO_PAGE_SIZE = 100;

const buildFilters = (input: LancamentoSearch) => {
	const filters = [activeLancamentoPredicate()];
	if (input.tipo !== 'todos') filters.push(eq(lancamentos.tipo, input.tipo));
	if (input.contraparte) filters.push(ulike(cadastros.nome, `${input.contraparte}%`));
	if (input.descricao) filters.push(ilike(lancamentos.descricao, `%${input.descricao}%`));
	if (input.dataInicio) filters.push(gte(lancamentos.dataLancamento, toDate(input.dataInicio)));
	if (input.dataFim) filters.push(lte(lancamentos.dataLancamento, toDate(input.dataFim)));
	if (input.dataRegistro) filters.push(eq(lancamentos.dataRegistro, toDate(input.dataRegistro)));
	if (input.depositado !== null) filters.push(eq(lancamentos.depositado, input.depositado));
	if (input.trabalhadores !== null) filters.push(eq(cadastros.trab, input.trabalhadores));
	return and(...filters);
};

type LancamentoRow = {
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
};

const mapItem = (row: LancamentoRow): LancamentoItem => ({
	id: row.id,
	tipo: row.tipo,
	descricao: row.descricao,
	valor: row.valor,
	dataLancamento: formatDate(row.dataLancamento) ?? '',
	contraparte: row.contraparteId && row.contraparteNome ? { id: row.contraparteId, nome: row.contraparteNome } : null,
	depositado: row.depositado,
	reciboUuid: row.reciboUuid,
	dataRegistro: formatDate(row.dataRegistro),
});

const selectVisibleRows = (database: LancamentoDatabase, input: LancamentoSearch) => {
	const visibleRows = database
		.select(lancamentoProjection)
		.from(lancamentos)
		.leftJoin(cadastros, eq(cadastros.idleitor, lancamentos.idcontraparte))
		.where(buildFilters(input))
		.orderBy(desc(lancamentos.dataLancamento), desc(lancamentos.idlancamento))
		.limit(LANCAMENTO_PAGE_SIZE)
		.as('visible_lancamentos');

	return database
		.select({
			id: visibleRows.id,
			tipo: visibleRows.tipo,
			descricao: visibleRows.descricao,
			valor: visibleRows.valor,
			dataLancamento: visibleRows.dataLancamento,
			depositado: visibleRows.depositado,
			reciboUuid: visibleRows.reciboUuid,
			dataRegistro: visibleRows.dataRegistro,
			contraparteId: visibleRows.contraparteId,
			contraparteNome: visibleRows.contraparteNome,
			entradasTotal: sql<string>`coalesce(sum(${visibleRows.valor}) filter (where ${visibleRows.tipo} = 'entrada') over (), '0')`,
			saidasTotal: sql<string>`coalesce(sum(${visibleRows.valor}) filter (where ${visibleRows.tipo} = 'saida') over (), '0')`,
		})
		.from(visibleRows)
		.orderBy(desc(visibleRows.dataLancamento), desc(visibleRows.id));
};

export const searchLancamentos = async (
	database: LancamentoDatabase,
	input: LancamentoSearch,
): Promise<LancamentoPage> => {
	const rows = await selectVisibleRows(database, input);
	const firstRow = rows[0];
	return {
		items: rows.map((row) => mapItem(row)),
		totais: {
			entradas: firstRow?.entradasTotal ?? '0',
			saidas: firstRow?.saidasTotal ?? '0',
		},
	};
};
