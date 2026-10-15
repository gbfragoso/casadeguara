import { cadastroModel } from '#lib/server/models/cadastro.js';
import { createReaderListHandlers } from '#lib/server/biblioteca/leitores/list-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createReaderListHandlers({ model: cadastroModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
