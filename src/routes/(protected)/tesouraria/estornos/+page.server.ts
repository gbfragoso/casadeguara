import { createLancamentoAuditHandlers } from '#lib/server/tesouraria/lancamentos/audit-handlers.js';
import { lancamentoModel } from '#lib/server/tesouraria/lancamentos/model.js';
import type { Actions, PageServerLoad } from './$types';

const handlers = createLancamentoAuditHandlers({ model: lancamentoModel });

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
