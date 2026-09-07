import { colecaoModel } from '$lib/server/models/colecao';
import { createCollectionEditHandlers } from '$lib/server/biblioteca/colecoes/edit-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createCollectionEditHandlers({ model: colecaoModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
