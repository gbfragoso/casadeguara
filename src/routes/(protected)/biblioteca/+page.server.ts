import { db } from '$lib/database/connection';
import { aviso, emprestimo } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, count, desc, gte, isNotNull, lte, sum } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const date = new Date();
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const dateFilter = and(gte(emprestimo.dataEmprestimo, firstDay), lte(emprestimo.dataEmprestimo, lastDay));

		const avisos = await db.select().from(aviso).orderBy(desc(aviso.dataCadastro)).limit(5);
		const emprestimosMesAtual = await db
			.select({ counter: count(), sum: sum(emprestimo.renovacoes) })
			.from(emprestimo)
			.where(dateFilter);

		const devolucoesMesAtual = await db
			.select({ counter: count() })
			.from(emprestimo)
			.where(and(dateFilter, isNotNull(emprestimo.dataDevolvido)));

		return {
			avisos,
			emprestimos: emprestimosMesAtual[0].counter,
			devolucoes: devolucoesMesAtual[0].counter,
			renovacoes: emprestimosMesAtual[0].sum,
		};
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar as informações da biblioteca',
		});
	}
};
