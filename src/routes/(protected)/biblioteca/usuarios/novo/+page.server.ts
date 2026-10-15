import { createBibliotecaUsuariosNovoHandlers } from '#lib/server/biblioteca/usuarios/novo-handlers.js';

import type { Actions, PageServerLoad } from '../$types';

const handlers = createBibliotecaUsuariosNovoHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
