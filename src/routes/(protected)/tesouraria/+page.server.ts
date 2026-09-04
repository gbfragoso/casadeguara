import { requireTesourariaAccess } from '$lib/server/authorization/tesouraria';
import { lancamentoModel } from '$lib/server/tesouraria/lancamentos';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireTesourariaAccess(locals.user);
	const reference = new Date();
	try {
		const [dashboard, lancamentosMensais] = await Promise.all([
			lancamentoModel.getDashboard(reference),
			lancamentoModel.getMonthlyTotals(reference),
		]);

		return {
			entradaMesAtual: [dashboard.entradaMesAtual],
			saidaMesAtual: [dashboard.saidaMesAtual],
			lancamentosMensais,
		};
	} catch {
		console.error('treasury.launches.dashboard_failed');
		error(500, { message: 'Falha ao carregar o balanço da tesouraria.' });
	}
};
