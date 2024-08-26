import { db } from '$lib/database/connection';
import { ulike } from '$lib/database/functions';
import { entradas, leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, count, desc, eq, gte, lte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/');

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('contribuinte') || undefined;
	const dataInicio = url.searchParams.get('dataInicio') || undefined;
	const dataFim = url.searchParams.get('dataFim') || undefined;

	try {
		const dataInicioFilter = dataInicio ? gte(entradas.data_entrada, new Date(dataInicio)) : undefined;
		const dataFimFilter = dataFim ? lte(entradas.data_entrada, new Date(dataFim)) : undefined;
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
			.orderBy(desc(entradas.data_entrada))
			.offset((page - 1) * 5)
			.limit(5);

		const counter = await db
			.select({ count: count() })
			.from(entradas)
			.innerJoin(leitor, eq(leitor.idleitor, entradas.idcontribuinte))
			.where(where);

		const total = counter[0].count;

		return { resultados, total };
	} catch (err) {
		return error(500, {
			message: 'Falha ao carregar a listagem de doações',
		});
	}
};
