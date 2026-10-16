import { colecaoModel } from '#lib/server/models/colecao.js';
import { createCollectionListHandlers } from '#lib/server/biblioteca/colecoes/list-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createCollectionListHandlers({ model: colecaoModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
