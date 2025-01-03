import { db } from '$lib/database/connection';
import { ulike, unaccent } from '$lib/database/functions';
import { entradas, leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, avg, count, eq, gte, lte, max, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
	return { isAdmin: locals.user.roles.includes(':admin') };
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
			const nameFilter = nome ? ulike(leitor.nome, nome.toUpperCase() + '%') : undefined;
			const trabalhadoresFilter = trabalhadores ? eq(leitor.trab, true) : undefined;
			const exercicioFilter = exercicio ? eq(sql<string>`extract(year from data_entrada)`, exercicio) : undefined;
			const where = and(dataInicioFilter, dataFimFilter, nameFilter, exercicioFilter, trabalhadoresFilter);

			const resultados = await db
				.select({
					data: max(entradas.dataEntrada),
					valor: avg(entradas.valor),
					contribuicoes: count(),
					contribuinte: leitor.nome,
				})
				.from(entradas)
				.innerJoin(leitor, eq(leitor.idleitor, entradas.idcontribuinte))
				.groupBy(entradas.idcontribuinte, leitor.nome)
				.where(where)
				.orderBy(unaccent(leitor.nome))
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
