import { lancamentoModel } from '#lib/server/tesouraria/lancamentos/model.js';
import { createLancamentoDescriptionHandlers } from '#lib/server/tesouraria/lancamentos/description-handlers.js';
import { createLancamentoListHandlers } from '#lib/server/tesouraria/lancamentos/list-handlers.js';
import type { Actions, PageServerLoad } from './$types';

const listHandlers = createLancamentoListHandlers({ model: lancamentoModel });
const descriptionHandlers = createLancamentoDescriptionHandlers({ model: lancamentoModel });

export const load: PageServerLoad = listHandlers.load;
export const actions: Actions = { ...listHandlers.actions, ...descriptionHandlers.actions };
