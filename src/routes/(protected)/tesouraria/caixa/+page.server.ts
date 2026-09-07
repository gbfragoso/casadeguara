import { createTesourariaCaixaHandlers } from '$lib/server/tesouraria/caixa/page-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createTesourariaCaixaHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
