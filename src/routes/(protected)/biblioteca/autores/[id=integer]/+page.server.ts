import { autorModel } from '#lib/server/models/autor.js';
import { createAuthorEditHandlers } from '#lib/server/biblioteca/autores/edit-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createAuthorEditHandlers({ model: autorModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
