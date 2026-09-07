import { createSecretariaUsuariosNovoHandlers } from '$lib/server/secretaria/usuarios/novo-handlers';

import type { Actions, PageServerLoad } from '../$types';

const handlers = createSecretariaUsuariosNovoHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
