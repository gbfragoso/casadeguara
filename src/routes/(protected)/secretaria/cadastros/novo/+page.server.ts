import { cadastroModel } from '#lib/server/models/cadastro.js';
import { createRegistrationCreateHandlers } from '#lib/server/secretaria/cadastros/create-handlers.js';

import type { Actions } from './$types';

const handlers = createRegistrationCreateHandlers({ model: cadastroModel });
export const actions: Actions = handlers.actions;
