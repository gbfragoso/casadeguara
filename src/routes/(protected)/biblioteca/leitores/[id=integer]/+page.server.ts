import { cadastroModel } from '$lib/server/models/cadastro';
import { createReaderEditHandlers } from '$lib/server/biblioteca/leitores/edit-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createReaderEditHandlers({ model: cadastroModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
