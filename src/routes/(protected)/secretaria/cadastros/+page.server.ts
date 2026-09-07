import { cadastroModel } from '$lib/server/models/cadastro';
import { createRegistrationListHandlers } from '$lib/server/secretaria/cadastros/list-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createRegistrationListHandlers({ model: cadastroModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
