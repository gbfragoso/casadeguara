import { createSecretariaFrequenciaHandlers } from '#lib/server/secretaria/frequencia/page-handlers.js';

import type { PageServerLoad } from './$types';

const handlers = createSecretariaFrequenciaHandlers();
export const load: PageServerLoad = handlers.load;
