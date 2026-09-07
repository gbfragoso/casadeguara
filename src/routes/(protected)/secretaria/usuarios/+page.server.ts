import { createSecretariaUsuariosHandlers } from '$lib/server/secretaria/usuarios/page-handlers';

import type { PageServerLoad } from './$types';

const handlers = createSecretariaUsuariosHandlers();
export const load: PageServerLoad = handlers.load;
