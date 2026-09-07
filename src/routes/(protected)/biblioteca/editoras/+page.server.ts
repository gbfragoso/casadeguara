import { editoraModel } from '$lib/server/models/editora';
import { createPublisherListHandlers } from '$lib/server/biblioteca/editoras/list-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createPublisherListHandlers({ model: editoraModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
