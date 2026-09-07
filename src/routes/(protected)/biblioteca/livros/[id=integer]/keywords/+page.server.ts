import { createBibliotecaLivrosIdIntegerKeywordsHandlers } from '$lib/server/biblioteca/livros/id-keywords-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createBibliotecaLivrosIdIntegerKeywordsHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
