import { autorModel } from '#lib/server/models/autor.js';
import { createAuthorCreateHandlers } from '#lib/server/biblioteca/autores/create-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createAuthorCreateHandlers({ model: autorModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
