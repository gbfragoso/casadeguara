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

		const avisos = async () => {
			return db.select().from(aviso).orderBy(desc(aviso.dataCadastro)).limit(5);
		};

		const emprestimosMesAtual = async () => {
			return db
				.select({ counter: count(), renovacoes: sum(emprestimo.renovacoes) })
				.from(emprestimo)
				.where(dateFilter);
		};

		const devolucoesMesAtual = async () => {
			return db
				.select({ counter: count() })
				.from(emprestimo)
				.where(and(dateFilter, isNotNull(emprestimo.dataDevolvido)));
		};

		return {
			avisos: avisos(),
			emprestimos: emprestimosMesAtual(),
			devolucoes: devolucoesMesAtual(),
			username: locals.user.name,
			userid: locals.user.id,
		};
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar as informações da biblioteca',
		});
	}
};
