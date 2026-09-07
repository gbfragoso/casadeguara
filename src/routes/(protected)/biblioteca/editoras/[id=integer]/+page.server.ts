import { editoraModel } from '$lib/server/models/editora';
import { createPublisherEditHandlers } from '$lib/server/biblioteca/editoras/edit-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createPublisherEditHandlers({ model: editoraModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
