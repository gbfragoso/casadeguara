import { cadastroModel } from '#lib/server/models/cadastro.js';
import { createReaderCreateHandlers } from '#lib/server/biblioteca/leitores/create-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createReaderCreateHandlers({ model: cadastroModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
