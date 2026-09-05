import { and, gte, lt, sql } from 'drizzle-orm';

import { activeLancamentoPredicate, lancamentos } from '$lib/server/database/schema';
import type { MonthlyLancamentoTotal } from '$lib/tesouraria/monthly-totals';
import { getBahiaMonthWindow, type MonthWindow } from './month-window';
import type { LancamentoDatabase } from './types';

const monthExpression = sql`date_trunc('month', ${lancamentos.dataLancamento})`;

export const buildMonthlyTotalsQuery = (database: LancamentoDatabase, window: MonthWindow) =>
	database
		.select({
			competencia: sql<string>`to_char(${monthExpression}, 'YYYY-MM')`.as('competencia'),
			entradas:
				sql<string>`coalesce(sum(${lancamentos.valor}) FILTER (WHERE ${lancamentos.tipo} = 'entrada'), 0)::text`.as(
					'entradas',
				),
			saidas: sql<string>`coalesce(sum(${lancamentos.valor}) FILTER (WHERE ${lancamentos.tipo} = 'saida'), 0)::text`.as(
				'saidas',
			),
		})
		.from(lancamentos)
		.where(
			and(
				gte(lancamentos.dataLancamento, window.start),
				lt(lancamentos.dataLancamento, window.endExclusive),
				activeLancamentoPredicate(),
			),
		)
		.groupBy(monthExpression)
		.orderBy(monthExpression);

export const getMonthlyTotals = async (
	database: LancamentoDatabase,
	reference = new Date(),
): Promise<MonthlyLancamentoTotal[]> => {
	const window = getBahiaMonthWindow(reference);
	const rows = await buildMonthlyTotalsQuery(database, window);
	const rowsByMonth = new Map(rows.map((row) => [row.competencia, row]));

	return window.keys.map((competencia) => {
		const row = rowsByMonth.get(competencia);
		return {
			competencia,
			entradas: row?.entradas ?? '0',
			saidas: row?.saidas ?? '0',
		};
	});
};
