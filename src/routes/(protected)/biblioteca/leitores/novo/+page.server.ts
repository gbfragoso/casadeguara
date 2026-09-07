import { cadastroModel } from '$lib/server/models/cadastro';
import { createReaderCreateHandlers } from '$lib/server/biblioteca/leitores/create-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createReaderCreateHandlers({ model: cadastroModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
