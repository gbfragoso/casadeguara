import { cadastroModel } from '#lib/server/models/cadastro.js';
import { createRegistrationListHandlers } from '#lib/server/secretaria/cadastros/list-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createRegistrationListHandlers({ model: cadastroModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
