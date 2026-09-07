import { createBibliotecaCobrancasHandlers } from '$lib/server/biblioteca/cobrancas/page-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createBibliotecaCobrancasHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
