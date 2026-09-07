import { avisoModel } from '$lib/server/models/aviso';
import { createNoticeListHandlers } from '$lib/server/biblioteca/avisos/list-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createNoticeListHandlers({ model: avisoModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
