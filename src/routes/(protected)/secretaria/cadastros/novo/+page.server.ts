import { cadastroModel } from '$lib/server/models/cadastro';
import { createRegistrationCreateHandlers } from '$lib/server/secretaria/cadastros/create-handlers';

import type { Actions } from './$types';

const handlers = createRegistrationCreateHandlers({ model: cadastroModel });
export const actions: Actions = handlers.actions;
