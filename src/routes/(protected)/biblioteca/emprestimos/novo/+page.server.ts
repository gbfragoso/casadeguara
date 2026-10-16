import { createBibliotecaEmprestimosNovoHandlers } from '#lib/server/biblioteca/emprestimos/novo-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createBibliotecaEmprestimosNovoHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
