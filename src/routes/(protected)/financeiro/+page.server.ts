import { db } from '$lib/database/connection';
import { entradas, saidas } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, avg, count, gte, lte, sql, sum } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const date = new Date();
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);

		const visaoGeral = async () => {
			return db
				.select({
					year: sql<number>`extract(year from data_entrada) as year`,
					count: count(),
					avg: avg(entradas.valor),
					median: sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY valor)`,
					value: sum(entradas.valor),
				})
				.from(entradas)
				.groupBy(sql`year`);
		};

		const entradaMesAtual = async () => {
			return db
				.select({
					count: count(),
					avg: avg(entradas.valor),
					median: sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY valor)`,
					value: sum(entradas.valor),
				})
				.from(entradas)
				.where(and(gte(entradas.dataEntrada, firstDay), lte(entradas.dataEntrada, lastDay)));
		};

		const saidaMesAtual = async () => {
			return db
				.select({ value: sum(saidas.valor) })
				.from(saidas)
				.where(and(gte(saidas.dataSaida, firstDay), lte(saidas.dataSaida, lastDay)));
		};

		return {
			visaoGeral: visaoGeral(),
			entradaMesAtual: entradaMesAtual(),
			saidaMesAtual: saidaMesAtual(),
		};
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de contribuintes',
		});
	}
};
