import { createSecretariaHandlers } from '$lib/server/secretaria/root/page-handlers';

import type { PageServerLoad } from './$types';

const handlers = createSecretariaHandlers();
export const load: PageServerLoad = handlers.load;
