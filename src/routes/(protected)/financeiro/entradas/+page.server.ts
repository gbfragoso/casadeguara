import { db } from '$lib/database/connection';
import { ulike } from '$lib/database/functions';
import { entradas, leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const nome = form.get('contribuinte') as string;
		const dataInicio = form.get('dataInicio') as string;
		const dataFim = form.get('dataFim') as string;

		try {
			const dataInicioFilter = dataInicio ? gte(entradas.dataEntrada, new Date(dataInicio)) : undefined;
			const dataFimFilter = dataFim ? lte(entradas.dataEntrada, new Date(dataFim)) : undefined;
			const nameFilter = nome ? ulike(leitor.nome, nome.toUpperCase() + '%') : undefined;
			const where = and(dataInicioFilter, dataFimFilter, nameFilter);

			const resultados = await db
				.select({
					entradas,
					contribuinte: leitor.nome,
					idcontribuinte: leitor.idleitor,
					trabalhador: leitor.trab,
				})
				.from(entradas)
				.innerJoin(leitor, eq(leitor.idleitor, entradas.idcontribuinte))
				.where(where)
				.orderBy(desc(entradas.dataEntrada))
				.limit(50);

			return { resultados };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a listagem de doações',
			});
		}
	},
} satisfies Actions;
