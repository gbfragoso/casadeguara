import { colecaoModel } from '$lib/server/models/colecao';
import { createCollectionListHandlers } from '$lib/server/biblioteca/colecoes/list-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createCollectionListHandlers({ model: colecaoModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
