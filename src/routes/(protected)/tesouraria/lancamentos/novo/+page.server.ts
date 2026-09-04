import { lancamentoModel } from '$lib/server/tesouraria/lancamentos/model';
import { createLancamentoCreateHandlers } from '$lib/server/tesouraria/lancamentos/create-handlers';
import type { Actions, PageServerLoad } from './$types';

const handlers = createLancamentoCreateHandlers({ model: lancamentoModel });

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
