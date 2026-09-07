import { createBibliotecaUsuariosHandlers } from '$lib/server/biblioteca/usuarios/page-handlers';

import type { PageServerLoad } from './$types';

const handlers = createBibliotecaUsuariosHandlers();
export const load: PageServerLoad = handlers.load;
