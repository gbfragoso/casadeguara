import { colecaoModel } from '$lib/server/models/colecao';
import { createCollectionCreateHandlers } from '$lib/server/biblioteca/colecoes/create-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createCollectionCreateHandlers({ model: colecaoModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
