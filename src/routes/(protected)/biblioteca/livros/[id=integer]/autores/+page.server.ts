import { createBibliotecaLivrosIdIntegerAutoresHandlers } from '$lib/server/biblioteca/livros/id-autores-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createBibliotecaLivrosIdIntegerAutoresHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
