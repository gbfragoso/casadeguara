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

		const ultimasEntradas = await db
			.select({
				valor: entradas.valor,
				descricao: entradas.descricao,
				data: entradas.data_entrada,
				contribuinte: leitor.nome,
			})
			.from(entradas)
			.innerJoin(leitor, eq(leitor.idleitor, entradas.idcontribuinte))
			.orderBy(desc(entradas.data_entrada))
			.limit(5);

		const ultimasSaidas = await db.select().from(saidas).orderBy(desc(saidas.data_saida)).limit(5);

		const entradaMesAtual = await db
			.select({ value: sum(entradas.valor) })
			.from(entradas)
			.where(and(gte(entradas.data_entrada, firstDay), lte(entradas.data_entrada, lastDay)));

		const saidaMesAtual = await db
			.select({ value: sum(saidas.valor) })
			.from(saidas)
			.where(and(gte(saidas.data_saida, firstDay), lte(saidas.data_saida, lastDay)));

		return {
			entradas: ultimasEntradas,
			saidas: ultimasSaidas,
			entradaMesAtual: entradaMesAtual[0].value,
			saidaMesAtual: saidaMesAtual[0].value,
		};
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de contribuintes',
		});
	}
};
