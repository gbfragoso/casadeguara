import { createSecretariaAmigofraternoHandlers } from '$lib/server/secretaria/amigofraterno/page-handlers';

import type { PageServerLoad } from './$types';

const handlers = createSecretariaAmigofraternoHandlers();
export const load: PageServerLoad = handlers.load;
