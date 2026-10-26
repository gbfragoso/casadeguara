import { createComunicacaoUserCreateHandlers } from '#lib/server/comunicacao/usuarios/create-handlers.js';
import { userModel } from '#lib/server/models/user.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createComunicacaoUserCreateHandlers({ users: userModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
