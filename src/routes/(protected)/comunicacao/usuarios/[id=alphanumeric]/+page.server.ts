import { createComunicacaoUserEditHandlers } from '#lib/server/comunicacao/usuarios/edit-handlers.js';
import { userModel } from '#lib/server/models/user.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createComunicacaoUserEditHandlers({ users: userModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
