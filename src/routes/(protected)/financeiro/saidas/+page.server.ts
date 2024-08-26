import { db } from '$lib/database/connection';
import { ulike } from '$lib/database/functions';
import { saidas } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, count, desc, gte, lte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/');

	const page = Number(url.searchParams.get('page') || 1);
	const descricao = url.searchParams.get('descricao') || undefined;
	const dataInicio = url.searchParams.get('dataInicio') || undefined;
	const dataFim = url.searchParams.get('dataFim') || undefined;

	try {
		const dataInicioFilter = dataInicio ? gte(saidas.data_saida, new Date(dataInicio)) : undefined;
		const dataFimFilter = dataFim ? lte(saidas.data_saida, new Date(dataFim)) : undefined;
		const descricaoFilter = descricao ? ulike(saidas.descricao, descricao + '%') : undefined;
		const where = and(dataInicioFilter, dataFimFilter, descricaoFilter);

		const resultados = await db
			.select()
			.from(saidas)
			.where(where)
			.orderBy(desc(saidas.data_saida))
			.offset((page - 1) * 5)
			.limit(5);

		const counter = await db.select({ count: count() }).from(saidas).where(where);
		const total = counter[0].count;

		return { saidas: resultados, total };
	} catch (err) {
		return error(500, {
			message: 'Falha ao carregar a listagem de despesas',
		});
	}
};
