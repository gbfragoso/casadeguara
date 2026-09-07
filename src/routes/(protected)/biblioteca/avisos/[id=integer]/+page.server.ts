import { avisoModel } from '$lib/server/models/aviso';
import { createNoticeEditHandlers } from '$lib/server/biblioteca/avisos/edit-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createNoticeEditHandlers({ model: avisoModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;
