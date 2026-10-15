import { lancamentoModel } from '#lib/server/tesouraria/lancamentos/model.js';
import { createLancamentoListHandlers } from '#lib/server/tesouraria/lancamentos/list-handlers.js';
import type { Actions, PageServerLoad } from './$types';

const handlers = createLancamentoListHandlers({ model: lancamentoModel });

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
