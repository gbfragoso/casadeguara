import { db } from '$lib/database/connection';
import { ulike } from '$lib/database/functions';
import { entradas, leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
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
		const dataRegistro = form.get('dataRegistro') as string;
		const depositados = form.get('depositados') as string;
		const trabalhadores = form.get('trabalhadores') as string;

		try {
			const dataRegistroFilter = dataRegistro ? eq(entradas.dataRegistro, new Date(dataRegistro)) : undefined;
			const dataInicioFilter = dataInicio ? gte(entradas.dataEntrada, new Date(dataInicio)) : undefined;
			const dataFimFilter = dataFim ? lte(entradas.dataEntrada, new Date(dataFim)) : undefined;
			const nameFilter = nome ? ulike(leitor.nome, nome.toUpperCase() + '%') : undefined;
			const depositadosFilter = depositados ? eq(entradas.depositado, true) : undefined;
			const trabalhadoresFilter = trabalhadores ? eq(leitor.trab, true) : undefined;
			const where = and(
				dataInicioFilter,
				dataFimFilter,
				dataRegistroFilter,
				nameFilter,
				depositadosFilter,
				trabalhadoresFilter,
			);

			const resultados = await db
				.select({
					identrada: entradas.identrada,
					descricao: entradas.descricao,
					dataEntrada: entradas.dataEntrada,
					valor: entradas.valor,
					depositado: entradas.depositado,
					uuid: entradas.uuid,
					contribuinte: leitor.nome,
					idcontribuinte: leitor.idleitor,
					trabalhador: leitor.trab,
					telefone: leitor.telefone,
					celular: leitor.celular,
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
