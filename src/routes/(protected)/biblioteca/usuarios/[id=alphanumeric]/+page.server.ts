import { createBibliotecaUsuariosIdAlphanumericHandlers } from '$lib/server/biblioteca/usuarios/id-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createBibliotecaUsuariosIdAlphanumericHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
