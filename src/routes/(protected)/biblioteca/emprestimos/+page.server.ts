import { createBibliotecaEmprestimosHandlers } from '$lib/server/biblioteca/emprestimos/page-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createBibliotecaEmprestimosHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
