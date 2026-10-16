import { autorModel } from '#lib/server/models/autor.js';
import { createAuthorListHandlers } from '#lib/server/biblioteca/autores/list-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createAuthorListHandlers({ model: autorModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
