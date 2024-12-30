import { db } from '$lib/database/connection';
import { entradas, leitor, saidas } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq, gte, lte, sum } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const date = new Date();
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);

		const ultimasEntradas = async () => {
			return db
				.select({
					valor: entradas.valor,
					descricao: entradas.descricao,
					data: entradas.dataEntrada,
					contribuinte: leitor.nome,
				})
				.from(entradas)
				.innerJoin(leitor, eq(leitor.idleitor, entradas.idcontribuinte))
				.orderBy(desc(entradas.identrada))
				.limit(5);
		};

		const ultimasSaidas = async () => {
			return db.select().from(saidas).orderBy(desc(saidas.dataSaida)).limit(5);
		};

		const entradaMesAtual = async () => {
			return db
				.select({ value: sum(entradas.valor) })
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
			entradas: ultimasEntradas(),
			saidas: ultimasSaidas(),
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
