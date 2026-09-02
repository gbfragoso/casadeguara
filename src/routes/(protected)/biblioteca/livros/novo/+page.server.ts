import { createBookCreateHandlers } from '$lib/server/biblioteca/books/create-handlers';
import { livroModel } from '$lib/server/models/livro';

import type { Actions, PageServerLoad } from './$types';

const handlers = createBookCreateHandlers({ model: livroModel });

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
