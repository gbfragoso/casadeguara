import { createBibliotecaLivrosIdIntegerExemplaresHandlers } from '$lib/server/biblioteca/livros/id-exemplares-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createBibliotecaLivrosIdIntegerExemplaresHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
