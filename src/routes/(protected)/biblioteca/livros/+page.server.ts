import { createBookListHandlers } from '#lib/server/biblioteca/books/list-handlers.js';
import { livroModel } from '#lib/server/models/livro.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createBookListHandlers({ model: livroModel });

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
