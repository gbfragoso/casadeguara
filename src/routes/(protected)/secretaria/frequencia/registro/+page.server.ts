import { createSecretariaFrequenciaRegistroHandlers } from '#lib/server/secretaria/frequencia/registro-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createSecretariaFrequenciaRegistroHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
