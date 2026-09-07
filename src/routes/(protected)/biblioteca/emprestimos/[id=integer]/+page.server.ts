import { createBibliotecaEmprestimosIdIntegerHandlers } from '$lib/server/biblioteca/emprestimos/id-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createBibliotecaEmprestimosIdIntegerHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
