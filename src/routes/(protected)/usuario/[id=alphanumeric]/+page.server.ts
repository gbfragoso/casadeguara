import { createUsuarioDetailHandlers } from '$lib/server/usuario/detail-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createUsuarioDetailHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
