import { requireTesourariaAccess } from '$lib/server/authorization/tesouraria';
import { lancamentoModel } from '$lib/server/tesouraria/lancamentos';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireTesourariaAccess(locals.user);
	try {
		const { entradaMesAtual, saidaMesAtual } = await lancamentoModel.getDashboard();
		return {
			entradaMesAtual: [entradaMesAtual],
			saidaMesAtual: [saidaMesAtual],
		};
	} catch {
		console.error('treasury.launches.dashboard_failed');
		error(500, { message: 'Falha ao carregar o balanço da tesouraria.' });
	}
};
