import { db } from '$lib/server/database/connection';
import { emprestimo } from '$lib/server/database/schema';
import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';
import { avisoModel, type Aviso } from '$lib/server/models/aviso';
import { error } from '@sveltejs/kit';
import { and, count, gte, isNotNull, lte, sum } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

type LoanIndicator = { counter: number; renovacoes: string | null };
type ReturnIndicator = { counter: number };

export type DashboardSources = {
	listRecent: () => Promise<Aviso[]>;
	listLoans: (firstDay: Date, lastDay: Date) => Promise<LoanIndicator[]>;
	listReturns: (firstDay: Date, lastDay: Date) => Promise<ReturnIndicator[]>;
	now: () => Date;
};

type DashboardLoadEvent = Pick<Parameters<PageServerLoad>[0], 'locals'>;

const getMonthBounds = (date: Date) => {
	const year = date.getFullYear();
	const month = date.getMonth();

	return { firstDay: new Date(year, month, 1), lastDay: new Date(year, month + 1, 0) };
};

export const _createLibraryDashboardLoad = (sources: DashboardSources) => {
	return async ({ locals }: DashboardLoadEvent) => {
		const user = requireLibraryAccess(locals.user);
		const { firstDay, lastDay } = getMonthBounds(sources.now());

		try {
			const [avisos, emprestimos, devolucoes] = await Promise.all([
				sources.listRecent(),
				sources.listLoans(firstDay, lastDay),
				sources.listReturns(firstDay, lastDay),
			]);

			return { avisos, emprestimos, devolucoes, username: user.name, userid: user.id };
		} catch (cause) {
			console.error('Falha ao carregar o painel da biblioteca', { cause });
			error(500, { message: 'Falha ao carregar as informações da biblioteca' });
		}
	};
};

const listLoans: DashboardSources['listLoans'] = (firstDay, lastDay) => {
	const dateFilter = and(gte(emprestimo.dataEmprestimo, firstDay), lte(emprestimo.dataEmprestimo, lastDay));

	return db
		.select({ counter: count(), renovacoes: sum(emprestimo.renovacoes) })
		.from(emprestimo)
		.where(dateFilter);
};

const listReturns: DashboardSources['listReturns'] = (firstDay, lastDay) => {
	const dateFilter = and(gte(emprestimo.dataEmprestimo, firstDay), lte(emprestimo.dataEmprestimo, lastDay));

	return db
		.select({ counter: count() })
		.from(emprestimo)
		.where(and(dateFilter, isNotNull(emprestimo.dataDevolvido)));
};

export const load: PageServerLoad = _createLibraryDashboardLoad({
	listRecent: () => avisoModel.listRecent(),
	listLoans,
	listReturns,
	now: () => new Date(),
});
