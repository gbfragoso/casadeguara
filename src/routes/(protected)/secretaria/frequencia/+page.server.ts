import { createSecretariaFrequenciaHandlers } from '$lib/server/secretaria/frequencia/page-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createSecretariaFrequenciaHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
