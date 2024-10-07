import { db } from '$lib/database/connection';
import { ulike } from '$lib/database/functions';
import { saidas } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, desc, gte, lte } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const descricao = form.get('descricao') as string;
		const dataInicio = form.get('dataInicio') as string;
		const dataFim = form.get('dataFim') as string;

		try {
			const dataInicioFilter = dataInicio ? gte(saidas.dataSaida, new Date(dataInicio)) : undefined;
			const dataFimFilter = dataFim ? lte(saidas.dataSaida, new Date(dataFim)) : undefined;
			const descricaoFilter = descricao ? ulike(saidas.descricao, descricao + '%') : undefined;
			const where = and(dataInicioFilter, dataFimFilter, descricaoFilter);

			const resultados = await db.select().from(saidas).where(where).orderBy(desc(saidas.dataSaida)).limit(50);
			return { saidas: resultados };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao carregar a listagem de despesas',
			});
		}
	},
} satisfies Actions;
