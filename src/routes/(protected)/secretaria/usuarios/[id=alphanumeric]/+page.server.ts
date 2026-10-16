import { createSecretariaUsuariosIdAlphanumericHandlers } from '#lib/server/secretaria/usuarios/id-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createSecretariaUsuariosIdAlphanumericHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
