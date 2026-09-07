import { cadastroModel } from '$lib/server/models/cadastro';
import { createReaderListHandlers } from '$lib/server/biblioteca/leitores/list-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createReaderListHandlers({ model: cadastroModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
