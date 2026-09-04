import { lancamentoModel } from '$lib/server/tesouraria/lancamentos/model';
import { createLancamentoListHandlers } from '$lib/server/tesouraria/lancamentos/list-handlers';
import type { Actions, PageServerLoad } from './$types';

const handlers = createLancamentoListHandlers({ model: lancamentoModel });

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
