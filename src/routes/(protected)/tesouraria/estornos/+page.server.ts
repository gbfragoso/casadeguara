import { db } from '$lib/server/database/connection';
import { ulike } from '$lib/server/database/functions';
import { cadastros, entradas } from '$lib/server/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq, gte, isNotNull, lte } from 'drizzle-orm';
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
		const dataRegistro = form.get('dataRegistro') as string;
		const depositados = form.get('depositados') as string;
		const trabalhadores = form.get('trabalhadores') as string;

		try {
			const dataRegistroFilter = dataRegistro ? eq(entradas.dataRegistro, new Date(dataRegistro)) : undefined;
			const dataInicioFilter = dataInicio ? gte(entradas.dataEntrada, new Date(dataInicio)) : undefined;
			const dataFimFilter = dataFim ? lte(entradas.dataEntrada, new Date(dataFim)) : undefined;
			const nameFilter = nome ? ulike(cadastros.nome, nome.toUpperCase() + '%') : undefined;
			const depositadosFilter = depositados ? eq(entradas.depositado, depositados === 'true') : undefined;
			const trabalhadoresFilter = trabalhadores ? eq(cadastros.trab, true) : undefined;
			const where = and(
				dataInicioFilter,
				dataFimFilter,
				dataRegistroFilter,
				nameFilter,
				depositadosFilter,
				trabalhadoresFilter,
				isNotNull(entradas.motivoEstorno),
			);

			const resultados = await db
				.select({
					identrada: entradas.identrada,
					valor: entradas.valor,
					contribuinte: cadastros.nome,
					idcontribuinte: cadastros.idleitor,
					motivoEstorno: entradas.motivoEstorno,
					dataEstorno: entradas.dataEstorno,
				})
				.from(entradas)
				.innerJoin(cadastros, eq(cadastros.idleitor, entradas.idcontribuinte))
				.where(where)
				.orderBy(desc(entradas.identrada))
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
