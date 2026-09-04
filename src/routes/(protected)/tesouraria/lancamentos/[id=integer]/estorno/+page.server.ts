import { lancamentoModel } from '$lib/server/tesouraria/lancamentos/model';
import { createLancamentoReversalHandlers } from '$lib/server/tesouraria/lancamentos/reversal-handlers';
import type { Actions, PageServerLoad } from './$types';

const handlers = createLancamentoReversalHandlers({ model: lancamentoModel });

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
