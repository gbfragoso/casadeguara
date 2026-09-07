import { createBibliotecaLivrosIdIntegerHandlers } from '$lib/server/biblioteca/livros/id-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createBibliotecaLivrosIdIntegerHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
