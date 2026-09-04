import { and, count, eq, gte, lte, sql } from 'drizzle-orm';
import { activeLancamentoPredicate, lancamentos } from '$lib/server/database/schema';
import type { DashboardProjection, LancamentoDatabase } from './types';

type MonthRange = { start: Date; end: Date };

const currentMonthRange = (today = new Date()): MonthRange => {
	const year = today.getFullYear();
	const month = today.getMonth();
	return { start: new Date(year, month, 1), end: new Date(year, month + 1, 0) };
};

const readEntrySummary = (database: LancamentoDatabase, range: MonthRange) =>
	database
		.select({
			count: count(),
			median: sql<number>`coalesce(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${lancamentos.valor}), 0)`,
			value: sql<string>`coalesce(sum(${lancamentos.valor}), '0')`,
		})
		.from(lancamentos)
		.where(
			and(
				eq(lancamentos.tipo, 'entrada'),
				gte(lancamentos.dataLancamento, range.start),
				lte(lancamentos.dataLancamento, range.end),
				activeLancamentoPredicate(),
			),
		);

const readExitSummary = (database: LancamentoDatabase, range: MonthRange) =>
	database
		.select({ value: sql<string>`coalesce(sum(${lancamentos.valor}), '0')` })
		.from(lancamentos)
		.where(
			and(
				eq(lancamentos.tipo, 'saida'),
				gte(lancamentos.dataLancamento, range.start),
				lte(lancamentos.dataLancamento, range.end),
				activeLancamentoPredicate(),
			),
		);

export const getDashboardProjection = async (
	database: LancamentoDatabase,
	today = new Date(),
): Promise<DashboardProjection> => {
	const range = currentMonthRange(today);
	const [entries, exits] = await Promise.all([readEntrySummary(database, range), readExitSummary(database, range)]);
	const entry = entries[0];
	const exit = exits[0];
	return {
		entradaMesAtual: { count: entry.count, median: Number(entry.median), value: entry.value },
		saidaMesAtual: { value: exit.value },
	};
};
