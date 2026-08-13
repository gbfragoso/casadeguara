import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { cadastros, entradas } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, avg, count, eq, gte, lte, max, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
	return { isAdmin: locals.user.roles.includes('tesouraria:admin') };
};

export const actions: Actions = {
	pesquisar: async ({ request }) => {
		const form = await request.formData();
		const nome = form.get('contribuinte') as string;
		const dataInicio = form.get('dataInicio') as string;
		const dataFim = form.get('dataFim') as string;
		const trabalhadores = form.get('trabalhadores') as string;
		const exercicio = form.get('exercicio') as string;

		try {
			const dataInicioFilter = dataInicio ? gte(entradas.dataEntrada, new Date(dataInicio)) : undefined;
			const dataFimFilter = dataFim ? lte(entradas.dataEntrada, new Date(dataFim)) : undefined;
			const nameFilter = nome ? ulike(cadastros.nome, nome.toUpperCase() + '%') : undefined;
			const trabalhadoresFilter = trabalhadores ? eq(cadastros.trab, true) : undefined;
			const exercicioFilter = exercicio ? eq(sql<string>`extract(year from data_entrada)`, exercicio) : undefined;
			const where = and(dataInicioFilter, dataFimFilter, nameFilter, exercicioFilter, trabalhadoresFilter);

			const resultados = await db
				.select({
					data: max(entradas.dataEntrada),
					valor: avg(entradas.valor),
					contribuicoes: count(),
					contribuinte: cadastros.nome,
				})
				.from(entradas)
				.innerJoin(cadastros, eq(cadastros.idleitor, entradas.idcontribuinte))
				.groupBy(entradas.idcontribuinte, cadastros.nome)
				.where(where)
				.orderBy(unaccent(cadastros.nome))
				.limit(50);

			return { resultados };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar o histórico de contribuições',
			});
		}
	},
} satisfies Actions;
