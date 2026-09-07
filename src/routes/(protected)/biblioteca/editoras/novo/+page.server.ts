import { editoraModel } from '$lib/server/models/editora';
import { createPublisherCreateHandlers } from '$lib/server/biblioteca/editoras/create-handlers';

import type { Actions } from './$types';

const handlers = createPublisherCreateHandlers({ model: editoraModel });
export const actions: Actions = handlers.actions;
