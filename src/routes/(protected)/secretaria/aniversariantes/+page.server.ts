import { createSecretariaAniversariantesHandlers } from '$lib/server/secretaria/aniversariantes/page-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createSecretariaAniversariantesHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
